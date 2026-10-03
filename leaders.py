"""
Leading-Stocks-Tab: Konstituenten je Theme + kompakte Kursreihen.

Python liefert hier bewusst NUR Rohdaten - alle Kennzahlen (RS, Breadth,
first_to_high, Down-Day-Staerke ...) rechnet docs/static/leadersMetrics.js,
alle Schwellen/Gewichte stehen in docs/static/config.js. Gleiche Teilung wie
bei themeMetrics.js: eine einzige Implementierung der Mathematik, im Client.

Zwei Dateien unter docs/data/ (GitHub Pages serviert nur docs/):

  theme_constituents.json - je Theme ALLE Finviz-Mitglieder als
      EXCHANGE:SYMBOL, 1:1 wie Finviz sie zuordnet (auch Mehrfach-
      Zuordnungen), "source": "finviz_theme". "memberships" zaehlt je Ticker,
      in wie vielen Themes Finviz ihn fuehrt. Optionaler Abschnitt "overrides"
      ({theme: {"tickers": [...]}}) ersetzt die Auto-Liste eines Themes,
      "source": "manual". Er bleibt bei jedem Lauf erhalten - Notausstieg,
      keine Pflegepflicht.

  leaders_bars.json - Tages-Kursreihen der Konstituenten + SPY, alle auf
      die SPY-Handelstage ausgerichtet. Fehlt ein Tag fuer einen Ticker,
      steht dort null - es wird nie interpoliert.
"""
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR = Path(__file__).parent / "docs" / "data"
CONSTITUENTS_PATH = DATA_DIR / "theme_constituents.json"
BARS_PATH = DATA_DIR / "leaders_bars.json"

SCHEMA_VERSION = 1

LEADERS_CONFIG = {
    # -- Konstituenten -------------------------------------------------------
    # Keine Auswahl, keine Kappung: Konstituenten = Finviz-Mitglieder 1:1.
    "MIN_CONSTITUENTS": 5,     # darunter: Theme wird mit "thin": true markiert

    # -- Kursdaten -----------------------------------------------------------
    "BENCHMARK": "SPY",
    "PERIOD": "2y",
    # Close + High: 378 Bars (~1,5 Jahre). 252 fuer das 52W-Hoch, der Rest ist
    # das Fenster, in dem first_to_high ein Theme-Tief samt neuem Hoch suchen
    # kann (126 Tage). Low + Volumen braucht nur ADR/ATR/RVOL/$-Vol (<= 21 Tage).
    "LONG_BARS": 378,
    "SHORT_BARS": 22,
    "CHUNK": 150,
    "EXCHANGE_WORKERS": 8,
}

# yfinance fast_info.exchange -> TradingView-Praefix
EXCHANGE_MAP = {
    "NMS": "NASDAQ", "NGM": "NASDAQ", "NCM": "NASDAQ", "NAS": "NASDAQ",
    "NYQ": "NYSE", "NYS": "NYSE",
    "ASE": "AMEX", "AMEX": "AMEX", "PCX": "AMEX",   # NYSE Arca fuehrt TV als AMEX
    "BTS": "CBOE", "CBO": "CBOE",
    "PNK": "OTC", "OQB": "OTC", "OQX": "OTC",
}


def tv_exchange(code):
    """yfinance-Boersencode -> TradingView-Praefix, None wenn unbekannt."""
    return EXCHANGE_MAP.get((code or "").upper())


def tv_symbol(symbol, exchange):
    """EXCHANGE:SYMBOL; ohne bekannte Boerse nur das Symbol (nie geraten)."""
    tv = symbol.replace("-", ".")   # yfinance BRK-B -> TradingView BRK.B
    return f"{exchange}:{tv}" if exchange else tv


def _round_px(x):
    if x is None:
        return None
    return round(x, 2) if abs(x) >= 1 else round(x, 4)


def membership_counts(themes: dict) -> dict:
    """{ticker: Anzahl Themes, in denen Finviz ihn fuehrt}."""
    counts: dict = {}
    for row in themes.values():
        for tk in set(row.get("tickers") or []):
            counts[tk] = counts.get(tk, 0) + 1
    return counts


def select_constituents(themes: dict, overrides: dict, cfg: dict = LEADERS_CONFIG):
    """{theme: {"source", "tickers": [symbol...], "members_total", "thin"}}.

    Auto: alle Finviz-Mitglieder in Finviz-Reihenfolge, 1:1 - auch Ticker,
    die Finviz mehreren Themes zuordnet, und Ticker ohne Kursdaten (die
    erscheinen im Tab als n/a statt still zu verschwinden). Overrides gewinnen.
    """
    out = {}
    for name, row in themes.items():
        members = list(dict.fromkeys(row.get("tickers") or []))
        ov = (overrides or {}).get(name)
        if ov and ov.get("tickers"):
            picked = [s.split(":")[-1] for s in ov["tickers"]]
            source = "manual"
        else:
            picked = members
            source = "finviz_theme"
        out[name] = {
            "source": source,
            "tickers": picked,
            "members_total": len(members),
            "thin": len(picked) < cfg["MIN_CONSTITUENTS"],
        }
    return out


def align(dates_master: list, dates: list, values: list):
    """Werte auf die Master-Daten legen; fehlende Tage -> None (keine Interpolation)."""
    m = dict(zip(dates, values))
    return [m.get(d) for d in dates_master]


def fetch_aligned_bars(tickers: list, cfg: dict = LEADERS_CONFIG):
    """(master_dates, {ticker: {c, h, l, v_full}}) - auf die Benchmark-Tage ausgerichtet.

    Gleiche Blocklogik wie setups.fetch_bars (sequenzielle Bulk-Bloecke,
    fehlende Ticker einzeln nachholen), aber mit erhaltenem Datumsindex statt
    dropna(), damit Luecken als None sichtbar bleiben.
    """
    import math
    import yfinance as yf

    def _download(chunk):
        df = yf.download(
            chunk, period=cfg["PERIOD"], interval="1d", group_by="ticker",
            auto_adjust=False, threads=True, progress=False,
        )
        res = {}
        for tk in chunk:
            try:
                sub = df[tk] if len(chunk) > 1 else df
                if hasattr(sub.columns, "nlevels") and sub.columns.nlevels > 1:
                    sub = sub.droplevel(0, axis=1)
                sub = sub.dropna(how="all")
            except (KeyError, TypeError):
                continue
            if sub.empty or sub["Close"].dropna().empty:
                continue
            ds = [d.strftime("%Y-%m-%d") for d in sub.index]

            def col(name):
                return [None if (x is None or (isinstance(x, float) and math.isnan(x))) else float(x)
                        for x in sub[name]]
            res[tk] = {"dates": ds, "c": col("Close"), "h": col("High"),
                       "l": col("Low"), "v": col("Volume")}
        return res

    bench = cfg["BENCHMARK"]
    got_bench = _download([bench])
    if bench not in got_bench:
        raise RuntimeError(f"Benchmark {bench} ohne Kursdaten")
    master = got_bench[bench]["dates"]

    raw = {bench: got_bench[bench]}
    rest = [tk for tk in tickers if tk != bench]
    chunks = [rest[i:i + cfg["CHUNK"]] for i in range(0, len(rest), cfg["CHUNK"])]
    for i, chunk in enumerate(chunks, 1):
        try:
            got = _download(chunk)
            raw.update(got)
            print(f"      Block {i}/{len(chunks)}: {len(got)}/{len(chunk)} Ticker")
        except Exception as e:
            print(f"      WARNING: leaders bar chunk {i} failed: {e}")
    missing = [tk for tk in rest if tk not in raw]
    if missing:
        recovered = 0
        for tk in missing:
            try:
                got = _download([tk])
                if tk in got:
                    raw[tk] = got[tk]
                    recovered += 1
            except Exception as e:
                print(f"      WARNING: retry failed for {tk}: {e}")
        print(f"      Retry: {recovered}/{len(missing)} nachgeholt.")

    out = {}
    for tk, r in raw.items():
        out[tk] = {
            "c": align(master, r["dates"], r["c"]),
            "h": align(master, r["dates"], r["h"]),
            "l": align(master, r["dates"], r["l"]),
            "v_full": align(master, r["dates"], r["v"]),
        }
    return master, out


def fetch_exchanges(tickers: list, known: dict, cfg: dict = LEADERS_CONFIG) -> dict:
    """{ticker: TV-Praefix|None}. Bekannte Zuordnungen aus dem Vorlauf werden
    wiederverwendet - Boersenwechsel sind selten, Einzelabfragen teuer."""
    import yfinance as yf

    out = {tk: known[tk] for tk in tickers if known.get(tk)}
    todo = [tk for tk in tickers if tk not in out]

    def _one(tk):
        try:
            return tk, tv_exchange(yf.Ticker(tk).fast_info["exchange"])
        except Exception:
            return tk, None

    with ThreadPoolExecutor(max_workers=cfg["EXCHANGE_WORKERS"]) as pool:
        for fut in as_completed([pool.submit(_one, tk) for tk in todo]):
            tk, ex = fut.result()
            out[tk] = ex
    return out


def compact_series(b: dict, cfg: dict = LEADERS_CONFIG) -> dict:
    """Kurze Feldnamen + Kappung: c/h ueber LONG_BARS, l/v ueber SHORT_BARS."""
    L, S = cfg["LONG_BARS"], cfg["SHORT_BARS"]
    return {
        "c": [_round_px(x) for x in b["c"][-L:]],
        "h": [_round_px(x) for x in b["h"][-L:]],
        "l": [_round_px(x) for x in b["l"][-S:]],
        "v": [None if x is None else int(x) for x in b["v_full"][-S:]],
    }


def _read_json(path: Path):
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"  WARNING: {path.name} nicht lesbar ({e})")
        return None


def build_leaders(themes: dict, cfg: dict = LEADERS_CONFIG):
    """Kompletter Lauf -> (constituents_payload, bars_payload)."""
    prev_const = _read_json(CONSTITUENTS_PATH) or {}
    prev_bars = _read_json(BARS_PATH) or {}
    overrides = prev_const.get("overrides") or {}
    known_ex = {tk: row.get("x") for tk, row in (prev_bars.get("tickers") or {}).items()}

    universe = []
    seen = set()
    for row in themes.values():
        for tk in row.get("tickers") or []:
            if tk not in seen:
                seen.add(tk)
                universe.append(tk)
    for ov in overrides.values():
        for s in ov.get("tickers") or []:
            tk = s.split(":")[-1]
            if tk not in seen:
                seen.add(tk)
                universe.append(tk)
    print(f"    Leading Stocks: {len(universe)} Theme-Mitglieder, lade {cfg['PERIOD']} Kursdaten…")

    master, bars = fetch_aligned_bars(universe, cfg)
    print(f"    Kursdaten: {len(bars) - 1}/{len(universe)} Ticker + {cfg['BENCHMARK']}.")

    const = select_constituents(themes, overrides, cfg)
    picked = sorted({tk for c in const.values() for tk in c["tickers"]})
    exchanges = fetch_exchanges([tk for tk in picked if tk in bars], known_ex, cfg)
    counts = membership_counts(themes)
    print(f"    Konstituenten: {len(picked)} eindeutige Ticker, "
          f"Boerse bekannt fuer {sum(1 for v in exchanges.values() if v)}.")

    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")

    const_out = {
        "schema_version": SCHEMA_VERSION,
        "date": today,
        "generated_at": now.isoformat(),
        "selection": {
            "rule": "alle Finviz-Theme-Mitglieder 1:1 (inkl. Mehrfach-Zuordnungen)",
            "min": cfg["MIN_CONSTITUENTS"],
        },
        "themes": {
            name: {
                "source": c["source"],
                "members_total": c["members_total"],
                "thin": c["thin"],
                "tickers": [tv_symbol(tk, exchanges.get(tk)) for tk in c["tickers"]],
            }
            for name, c in const.items()
        },
        # Anzahl Themes je Ticker laut Finviz (1 = exklusiv)
        "memberships": {tv_symbol(tk, exchanges.get(tk)): counts.get(tk, 0) for tk in picked},
        "overrides": overrides,
    }

    L = cfg["LONG_BARS"]
    bars_out = {
        "schema_version": SCHEMA_VERSION,
        "date": today,
        "fetched_at": now.isoformat(),
        "benchmark": cfg["BENCHMARK"],
        "long_bars": L,
        "short_bars": cfg["SHORT_BARS"],
        "dates": master[-L:],
        "bench": compact_series(bars[cfg["BENCHMARK"]], cfg),
        "tickers": {
            tk: {"x": exchanges.get(tk), **compact_series(bars[tk], cfg)}
            for tk in picked if tk in bars
        },
    }
    return const_out, bars_out


def write_leaders(themes: dict, cfg: dict = LEADERS_CONFIG) -> dict:
    const_out, bars_out = build_leaders(themes, cfg)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CONSTITUENTS_PATH.write_text(
        json.dumps(const_out, ensure_ascii=False, indent=1), encoding="utf-8")
    BARS_PATH.write_text(
        json.dumps(bars_out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return bars_out


def load_existing_bars() -> dict | None:
    return _read_json(BARS_PATH)
