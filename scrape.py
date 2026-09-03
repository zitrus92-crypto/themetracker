"""
Daily scrape script — run by GitHub Actions.
Fetches Finviz industry data AND Finviz thematic map data in parallel, writes:
  docs/data.json        — industry snapshot (Heatmap, Picks, Top 10 tabs)
  docs/etf_data.json    — thematic map snapshot (ETF Themes tab)
  docs/etf_perf.json    — ETF performance snapshot (ETFs tab)
  docs/history.json     — compact daily history (Movers tab)
  docs/regime.json      — daily Regime-Gate states (header badge)
  docs/setups.json      — Einzelaktien-Setups der stärksten Gruppen (Experimental-Tab)
  docs/position_thesis.json — LLM-These je qualifiziertem Position-Trend-Theme
"""
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from datetime import date, datetime, timedelta, timezone

import position_thesis
import scraper
import setups
from market_calendar import is_trading_day
from scores import compute_scores
from snapshots import write_snapshot

DOCS = Path(__file__).parent / "docs"
MAX_HISTORY = 95  # ~4.5 months of trading days


def fetch_industries():
    print("Fetching Finviz industry data...")
    raw = scraper.fetch_all()
    print(f"  {len(raw)} industries fetched.")
    scored = compute_scores(raw)
    scraper.fetch_industry_tickers(scored)  # attaches "tickers" per industry (in-place)
    return scored


def fetch_themes():
    print("Fetching Finviz thematic map data...")
    return scraper.fetch_themes_data()


def fetch_etf_perf():
    print("Fetching Finviz ETF performance data...")
    result = scraper._fetch_etf_perf()
    print(f"  {len(result)} ETFs fetched.")
    return result


def fetch_regime():
    print("Fetching regime inputs (QQQ/IWM quote + Stockbee T2108)...")
    return scraper.fetch_regime_inputs()


def _trading_days_between(d1: str, d2: str) -> int:
    """Approximation: Wochentage (Mo–Fr) zwischen d1 (exkl.) und d2 (inkl.)."""
    a = datetime.strptime(d1, "%Y-%m-%d").date()
    b = datetime.strptime(d2, "%Y-%m-%d").date()
    days = 0
    while a < b:
        a += timedelta(days=1)
        if a.weekday() < 5:
            days += 1
    return days


B1_STALE_TRADING_DAYS = 3  # ältere Breadth-Zeile ⇒ Badge "DATEN VERALTET"

# ── Setup-Screener: einmal pro Handelstag nach US-Close ───────────────────────
# Der Workflow feuert alle 30 Minuten von 14:09 bis 22:39 UTC. Der
# Experimental-Tab braucht settled Tageskerzen, deshalb rechnet nur der
# Post-Close-Lauf. 21:30 UTC liegt in BEIDEN Zeitzonen nach dem Close
# (EDT 17:30, EST 16:30) und wird von den Slots 21:39/22:09/22:39 getroffen,
# auch wenn GitHub einzelne davon verwirft oder verspätet startet.
# Wall-Clock allein reicht nicht — verspätete Läufe können mehrfach nach 21:30
# landen —, deshalb zusätzlich die Idempotenz über das Datum in setups.json.
SETUPS_AFTER_UTC_MINUTE = 21 * 60 + 30


def setups_due(now_utc: datetime, today: str, trading_day: bool, existing: dict | None):
    """Soll setups.json in diesem Lauf neu gerechnet werden? (bool, Grund)."""
    if not trading_day:
        return False, "kein Handelstag"
    if (existing or {}).get("date") == today:
        return False, "heute bereits gerechnet"
    if now_utc.hour * 60 + now_utc.minute < SETUPS_AFTER_UTC_MINUTE:
        return False, "vor US-Close"
    return True, ""


def _load_existing_setups() -> dict | None:
    """Letzten setups.json-Stand lesen; unlesbar = wie nicht vorhanden."""
    path = DOCS / "setups.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"  WARNING: setups.json nicht lesbar ({e}) — wird neu gerechnet.")
        return None


def write_regime(regime_inputs: dict, today: str) -> dict:
    """Regime-Zustand aus den Inputs berechnen und in docs/regime.json anhängen.

    Idempotent pro Datum (Re-Runs überschreiben den Tageseintrag, wie
    history.json). Hysterese läuft über die Vortages-Einträge.
    Returns the entry written (for logging/tests).
    """
    regime_path = DOCS / "regime.json"
    history = json.loads(regime_path.read_text()) if regime_path.exists() else []
    history = [e for e in history if e["date"] != today]
    prev = history[-1] if history else {}

    trend = regime_inputs.get("trend") or {}
    info  = regime_inputs.get("info") or {}
    b1row = regime_inputs.get("b1") or {}

    sma20, sma50 = trend.get("SMA20"), trend.get("SMA50")
    t1 = (sma20 > 0) if sma20 is not None else None
    t2 = (sma50 > 0) if sma50 is not None else None
    b1 = b1row.get("value")
    b1_date = b1row.get("date")
    b1_stale = (
        b1_date is None
        or _trading_days_between(b1_date, today) > B1_STALE_TRADING_DAYS
    )

    raw = scraper.compute_regime_state(t1, t2, b1)
    state = scraper.apply_regime_hysteresis(raw, prev.get("raw"), prev.get("state"))

    # Situational-Awareness-Ampel (Stockbee) — eigener Block, eigener Zustand.
    # Spec: docs/superpowers/specs/2026-07-12-situational-awareness-design.md
    sa_in = b1row.get("sa") or {}
    sa = {
        "state": scraper.compute_situational_state(
            sa_in.get("ratio5d"), sa_in.get("ratio10d"), b1, sa_in.get("t2108_avg5")
        ),
        "ratio5d": sa_in.get("ratio5d"), "ratio10d": sa_in.get("ratio10d"),
        "t2108": b1, "t2108_avg5": sa_in.get("t2108_avg5"),
        "up4": sa_in.get("up4"), "down4": sa_in.get("down4"),
        "date": b1_date,
    }

    entry = {
        "date": today,
        "t1": t1, "t2": t2,
        "b1": b1, "b1_date": b1_date, "b1_stale": b1_stale,
        "qqq_sma20": sma20, "qqq_sma50": sma50,
        "iwm_sma20": info.get("SMA20"), "iwm_sma50": info.get("SMA50"),
        "raw": raw, "state": state,
        "sa": sa,
    }
    history.append(entry)
    history = history[-MAX_HISTORY:]
    regime_path.write_text(
        json.dumps(history, ensure_ascii=False, separators=(",", ":"))
    )
    print(f"  Saved regime.json (state: {state}, raw: {raw}, b1: {b1} @ {b1_date})")
    return entry


def main():
    DOCS.mkdir(exist_ok=True)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    # An Nicht-Handelstagen keine Zeitreihen fortschreiben: Finviz liefert dann
    # die Vortagswerte unter neuem Datum, und history/regime/snapshots zählten
    # Phantom-Tage (belegt: 25.05., 19.06., 03.07.2026 in history.json).
    trading_day = is_trading_day(date.fromisoformat(today))
    if not trading_day:
        print(f"{today} ist kein US-Handelstag — history/regime/snapshots werden nicht fortgeschrieben.")

    # ── Parallel fetch ────────────────────────────────────────────────────────
    scored = None
    etf_payload = None
    etf_perf_payload = None
    regime_inputs = None

    with ThreadPoolExecutor(max_workers=4) as pool:
        fut_ind      = pool.submit(fetch_industries)
        fut_etf      = pool.submit(fetch_themes)
        fut_etf_perf = pool.submit(fetch_etf_perf)
        fut_regime   = pool.submit(fetch_regime)

        for fut in as_completed([fut_ind, fut_etf, fut_etf_perf, fut_regime]):
            try:
                result = fut.result()
                if fut is fut_ind:
                    scored = result
                elif fut is fut_etf:
                    etf_payload = result
                elif fut is fut_etf_perf:
                    etf_perf_payload = result
                else:
                    regime_inputs = result
            except Exception as e:
                if fut is fut_ind:
                    print(f"  ERROR: Industry fetch failed: {e}")
                elif fut is fut_etf:
                    print(f"  WARNING: ETF themes fetch failed: {e}")
                elif fut is fut_etf_perf:
                    print(f"  WARNING: ETF perf fetch failed: {e}")
                else:
                    print(f"  WARNING: Regime fetch failed: {e}")

    # ── Write data.json ───────────────────────────────────────────────────────
    if scored:
        payload = {
            "industries": scored,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }
        (DOCS / "data.json").write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved data.json")
    else:
        print("  SKIPPED data.json (fetch failed)")

    # ── Write etf_data.json ───────────────────────────────────────────────────
    if etf_payload:
        (DOCS / "etf_data.json").write_text(
            json.dumps(etf_payload, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved etf_data.json ({len(etf_payload['themes'])} themes, {len(etf_payload['subnodes'])} sub-nodes)")
    else:
        print("  SKIPPED etf_data.json (fetch failed)")

    # ── Write etf_perf.json ───────────────────────────────────────────────────
    if etf_perf_payload:
        payload_out = {
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "etfs": etf_perf_payload,
        }
        (DOCS / "etf_perf.json").write_text(
            json.dumps(payload_out, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved etf_perf.json ({len(etf_perf_payload)} ETFs)")
    else:
        print("  SKIPPED etf_perf.json (fetch failed)")

    # ── Write setups.json (Experimental — Stufe 1) ────────────────────────────
    # Universum sind die stärksten Themes (Top 5 je 1W/1M/3M), deshalb erst hier.
    # Scheitert der Lauf, bleibt die letzte gute Datei liegen — der Tab zeigt
    # dann den alten Stand mit seinem eigenen Zeitstempel.
    due, why = setups_due(
        datetime.now(timezone.utc), today, trading_day, _load_existing_setups()
    )
    if not (etf_payload and etf_payload.get("themes")):
        print("  SKIPPED setups.json (Theme-Daten fehlen)")
    elif not due:
        print(f"  SKIPPED setups.json ({why}) — letzter Stand bleibt liegen")
    else:
        try:
            setups_payload = setups.build_setups(etf_payload["themes"])
            # encoding explizit: ensure_ascii=False schreibt Umlaute/Gedankenstriche
            # als UTF-8-Bytes, write_text nimmt sonst das Locale (auf Windows cp1252).
            (DOCS / "setups.json").write_text(
                json.dumps(setups_payload, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
            c = setups_payload["counts"]
            print(f"  Saved setups.json (READY {c['READY']} · BREAKOUT {c['BREAKOUT']} · "
                  f"WATCH {c['WATCH']} · EXTENDED {c['EXTENDED']})")
        except Exception as e:
            print(f"  WARNING: setups.json nicht aktualisiert ({e}) — alte Datei bleibt.")

    # ── Write position_thesis.json (Position-Trend-Tab: LLM-These) ───────────
    # Qualifikation ist extrem selten (0-2 Themes) — ein API-Fehlschlag hier
    # darf nie die restliche Pipeline mitreissen, deshalb eigenes try/except
    # wie beim Setup-Screener oben.
    if not (etf_payload and etf_payload.get("themes")):
        print("  SKIPPED position_thesis.json (Theme-Daten fehlen)")
    else:
        try:
            position_thesis.update_position_thesis(etf_payload["themes"], DOCS)
        except Exception as e:
            print(f"  WARNING: position_thesis.json nicht aktualisiert ({e}) — alte Datei bleibt.")

    # ── Write regime.json ─────────────────────────────────────────────────────
    if not trading_day:
        print("  SKIPPED regime.json (kein Handelstag)")
    elif regime_inputs is not None:
        write_regime(regime_inputs, today)
    else:
        print("  SKIPPED regime.json (fetch failed)")

    # ── Append to history.json ────────────────────────────────────────────────
    if scored and trading_day:
        history_path = DOCS / "history.json"
        history = json.loads(history_path.read_text()) if history_path.exists() else []

        # Remove any existing entry for today (idempotent re-runs)
        history = [e for e in history if e["date"] != today]

        history.append({
            "date": today,
            "scores": {
                name: {
                    "c": row["composite"],
                    "a": row["acceleration"],
                    "t": row["ticker"],
                }
                for name, row in scored.items()
            },
        })

        history = history[-MAX_HISTORY:]
        history_path.write_text(
            json.dumps(history, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved history.json ({len(history)} entries)")

    # ── Snapshot-Shards (Rohwerte beider Universen, docs/snapshots/) ─────────
    write_snapshot(
        scored or {},
        (etf_payload or {}).get("themes") or {},
        today,
        datetime.now(timezone.utc),
    )


if __name__ == "__main__":
    main()
