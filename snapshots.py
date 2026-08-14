"""Snapshot-Persistenz (Task 5) — Rohwerte aller Gruppen als Monats-Shards.

Design (DECISIONS.md §3–4 + Grilling 14.08.2026):
- NUR Rohwerte. stage/daysInStage werden client-seitig (und im Report) aus
  themeMetrics.js abgeleitet — die Wahrheit sind die perfs, eine einzige
  Implementierung der Klassifikation.
- Monats-Shards docs/snapshots/YYYY-MM.json; alte Shards werden nie mehr
  angefasst. Retention unbegrenzt.
- Idempotent pro Datum: jeder Lauf überschreibt den Tageseintrag; der letzte
  Lauf des Tages (settled, >= 21:00 UTC) gewinnt.
- gap-Flag: fehlt der vorherige Handelstag in der Historie, wird das Loch
  markiert statt weitergezählt. None = Beginn der Aufzeichnung.
- Plausibilitätsprüfung VOR dem Überschreiben: Zeilenzahl weicht > 20 % vom
  Vorhandelstag ab oder > 50 % der perfs sind null -> verwerfen, damit ein halb
  geladener Finviz-Response keine gute Zeile zerstört.

Shard-Format:
  { "YYYY-MM-DD": { "fetched_at": iso, "settled": bool, "gap": bool|null,
                    "rows": [ { type, name, score, accel, rank, members,
                                ticker_hash, perfs {1W,1M,3M,6M,YTD} } ] } }
"""

import hashlib
import json
from datetime import date, datetime
from pathlib import Path

from market_calendar import is_trading_day, previous_trading_day

SNAP_DIR = Path(__file__).parent / "docs" / "snapshots"
PERF_KEYS = ["1W", "1M", "3M", "6M", "YTD"]
SETTLED_UTC_HOUR = 21          # letzter RTH-Slot vorbei -> Daten gelten als settled
MAX_ROWCOUNT_DEVIATION = 0.20  # vs. Vorhandelstag
MAX_NULL_PERF_SHARE = 0.50


def _ticker_hash(tickers) -> str | None:
    """Hash über die sortierte Mitgliederliste. Bricht der Hash, ist die
    Perf-Zeitreihe an dieser Stelle gebrochen (Finviz-Umsortierung) und darf
    für Forward-Returns nicht über den Bruch hinweg verkettet werden."""
    if not tickers:
        return None
    joined = ",".join(sorted(tickers))
    return hashlib.sha1(joined.encode()).hexdigest()[:12]


def _theme_accel(themes: dict) -> dict:
    """Rang(3M) − Rang(1M) über alle Themes — identisch zu computeAccel in app.js."""
    names = list(themes.keys())
    n = len(names)

    def ranks(tf):
        s = sorted(names, key=lambda k: themes[k]["perfs"].get(tf) if themes[k]["perfs"].get(tf) is not None else -999, reverse=True)
        return {k: i + 1 for i, k in enumerate(s)}

    r1m, r3m = ranks("1M"), ranks("3M")
    return {k: (r3m.get(k, n)) - (r1m.get(k, n)) for k in names}


def build_rows(scored: dict, themes: dict) -> list[dict]:
    rows = []

    accel = _theme_accel(themes)
    for name, t in themes.items():
        rows.append({
            "type": "theme",
            "name": name,
            "score": t.get("score"),
            "accel": accel.get(name),
            "rank": t.get("rank"),
            "members": len(t.get("tickers") or []),
            "ticker_hash": _ticker_hash(t.get("tickers")),
            "perfs": {k: t.get("perfs", {}).get(k) for k in PERF_KEYS},
        })

    # Industries: accel ist hier die native Definition Rang(3M)−Rang(1W)
    # (scores.py) — andere Skala und anderes Fenster als bei Themes, deshalb
    # laufen die Typen als getrennte Zeitreihen und teilen keine Schwellen.
    by_composite = sorted(scored, key=lambda k: scored[k]["composite"])
    comp_rank = {name: i + 1 for i, name in enumerate(by_composite)}
    for name, r in scored.items():
        rows.append({
            "type": "industry",
            "name": name,
            "score": r.get("composite"),
            "accel": r.get("acceleration"),
            "rank": comp_rank[name],
            "members": len(r.get("tickers") or []),
            "ticker_hash": _ticker_hash(r.get("tickers")),
            "perfs": {k: r.get("perfs", {}).get(k) for k in PERF_KEYS},
        })

    return rows


def _shard_path(d: date, snap_dir: Path) -> Path:
    return snap_dir / f"{d.strftime('%Y-%m')}.json"


def _load_shard(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def _find_day_entry(d: date, snap_dir: Path) -> dict | None:
    return _load_shard(_shard_path(d, snap_dir)).get(d.isoformat())


def _has_any_history(snap_dir: Path) -> bool:
    return snap_dir.exists() and any(snap_dir.glob("*.json"))


def _plausible(rows: list[dict], prev_entry: dict | None) -> tuple[bool, str]:
    if not rows:
        return False, "keine Zeilen"
    perf_vals = [v for r in rows for v in r["perfs"].values()]
    null_share = sum(1 for v in perf_vals if v is None) / len(perf_vals)
    if null_share > MAX_NULL_PERF_SHARE:
        return False, f"{null_share:.0%} der perfs sind null"
    if prev_entry:
        n_prev = len(prev_entry["rows"])
        if n_prev and abs(len(rows) - n_prev) / n_prev > MAX_ROWCOUNT_DEVIATION:
            return False, f"Zeilenzahl {len(rows)} weicht > 20 % vom Vorhandelstag ({n_prev}) ab"
    return True, ""


def write_snapshot(scored: dict, themes: dict, today: str, now_utc: datetime,
                   snap_dir: Path | None = None) -> dict | None:
    """Schreibt den Tages-Snapshot. Returns den Eintrag oder None (übersprungen)."""
    snap_dir = snap_dir or SNAP_DIR
    d = date.fromisoformat(today)

    if not is_trading_day(d):
        print(f"  Snapshot übersprungen: {today} ist kein US-Handelstag")
        return None
    if not scored or not themes:
        print("  Snapshot übersprungen: unvollständige Daten (Industries oder Themes fehlen)")
        return None

    rows = build_rows(scored, themes)

    prev_day = previous_trading_day(d)
    prev_entry = _find_day_entry(prev_day, snap_dir)

    ok, reason = _plausible(rows, prev_entry)
    if not ok:
        print(f"  Snapshot VERWORFEN ({reason}) — bestehender Tageseintrag bleibt unangetastet")
        return None

    if prev_entry is not None:
        gap = False
    elif _has_any_history(snap_dir):
        gap = True       # Historie existiert, aber der Vorhandelstag fehlt
    else:
        gap = None       # Beginn der Aufzeichnung

    entry = {
        "fetched_at": now_utc.isoformat(),
        "settled": now_utc.hour >= SETTLED_UTC_HOUR,
        "gap": gap,
        "rows": rows,
    }

    snap_dir.mkdir(parents=True, exist_ok=True)
    path = _shard_path(d, snap_dir)
    shard = _load_shard(path)
    shard[d.isoformat()] = entry
    shard = dict(sorted(shard.items()))
    path.write_text(json.dumps(shard, ensure_ascii=False, separators=(",", ":")),
                    encoding="utf-8")
    print(f"  Saved snapshot {path.name} ({today}: {len(rows)} Zeilen, "
          f"settled={entry['settled']}, gap={gap})")
    return entry
