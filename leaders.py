"""
Leading-Stocks-Tab: Konstituenten je Theme + kompakte Kursreihen.

Python liefert hier bewusst NUR Rohdaten - alle Kennzahlen (RS, Breadth,
Leader-Watchlist, Trigger ...) rechnet docs/static/leadersMetrics.js, alle
Schwellen/Gewichte stehen in docs/static/config.js. Gleiche Teilung wie bei
themeMetrics.js: eine einzige Implementierung der Mathematik, im Client.

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
      Dazu "rs_universe": je Aktie des breiten Finviz-Industry-Universums
      (~5.600 Ticker) die vier Renditen ROC 63/126/189/252 und das
      Ø Dollarvolumen 50 Tage. Daraus bildet der Client das RS-Perzentil wie
      in der Performer Study (dort: Russell 3000) - die Gewichte und die
      Universums-Groesse stehen in config.js, nicht hier.
"""
import json
import math
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR = Path(__file__).parent / "docs" / "data"
CONSTITUENTS_PATH = DATA_DIR / "theme_constituents.json"
BARS_PATH = DATA_DIR / "leaders_bars.json"

SCHEMA_VERSION = 2   # v2: o/l/v ueber SHORT_BARS=57, rs_universe

LEADERS_CONFIG = {
    # -- Konstituenten -------------------------------------------------------
    # Keine Auswahl, keine Kappung: Konstituenten = Finviz-Mitglieder 1:1.
    "MIN_CONSTITUENTS": 5,     # darunter: Theme wird mit "thin": true markiert

    # -- Kursdaten -----------------------------------------------------------
    "BENCHMARK": "SPY",
    "PERIOD": "2y",
    # Close + High: 378 Bars (~1,5 Jahre). 252 fuer das 52W-Hoch, der Rest ist
    # das Fenster, in dem first_to_high ein Theme-Tief samt neuem Hoch suchen
    # kann (126 Tage).
    "LONG_BARS": 378,
    # Open/Low/Volumen: 57 Bars. RVOL und EP-Gap messen gegen den Ø der
    # 50 Vortage (Performer Study: "≥ 3× Volumen (SMA50)"), und das EP-Fenster
    # umfasst 6 Tage -> der aelteste braucht selbst 50 Vortage: 50 + 6 + 1.
    # RMV = ATR5/ATR50 braucht 50 True Ranges + Vortages-Close.
    "SHORT_BARS": 57,
    "CHUNK": 150,
    "EXCHANGE_WORKERS": 8,

    # -- RS-Universum --------------------------------------------------------
    "RS_ROCS": [63, 126, 189, 252],
    "RS_DVOL_BARS": 50,
    "RS_MIN_PRICE": 1.0,       # wie die Studie: unadjustierter Kurs >= 1 $
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


def rs_summary(c: list, v: list, cfg: dict = LEADERS_CONFIG):
    """[ROC63, ROC126, ROC189, ROC252, Ø$-Vol50] fuer das RS-Universum.

    None, sobald ein Wert fehlt (zu kurze Historie, Luecke am Stichtag,
    Kurs unter RS_MIN_PRICE) - solche Aktien zaehlen nicht ins Perzentil.
    Rohwerte, keine Gewichtung: die steht in config.js.
    """
    last = c[-1] if c else None
    if last is None or last < cfg["RS_MIN_PRICE"]:
        return None
    rocs = []
    for n in cfg["RS_ROCS"]:
        if len(c) <= n or c[-1 - n] is None or c[-1 - n] <= 0:
            return None
        rocs.append(round((last / c[-1 - n] - 1) * 100, 2))
    k = cfg["RS_DVOL_BARS"]
    pairs = list(zip(c[-k:], v[-k:]))
    if len(pairs) < k or any(a is None or b is None for a, b in pairs):
        return None
    dvol = sum(a * b for a, b in pairs) / k
    return rocs + [round(dvol)]


def fetch_bars_and_universe(keep: list, broad: list, cfg: dict = LEADERS_CONFIG):
    """(master_dates, bars, rs_universe).

    keep  = Theme-Konstituenten: volle Reihen (c/h/o/l/v), fehlende werden
            einzeln nachgeholt.
    broad = RS-Universum: nur rs_summary() je Ticker, Rohreihen werden sofort
            verworfen (5.600 x 500 Tage voll im Speicher waeren ~0,5 GB).
    Gleiche Blocklogik wie setups.fetch_bars (sequenzielle Bulk-Bloecke), aber
    mit erhaltenem Datumsindex statt dropna(), damit Luecken None bleiben.
    """
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
            res[tk] = {"dates": ds, "c": col("Close"), "h": col("High"), "o": col("Open"),
                       "l": col("Low"), "v": col("Volume")}
        return res

    # Benchmark mit Wiederholung: ohne SPY gibt es keine Datumsachse, und ein
    # einzelner leerer Yahoo-Response (lokal am 03.10.2026 direkt nach einem
    # grossen Abruf beobachtet) wuerde sonst den ganzen Tageslauf kosten.
    import time
    bench = cfg["BENCHMARK"]
    got_bench = {}
    for attempt in range(3):
        try:
            got_bench = _download([bench])
        except Exception as e:
            print(f"      WARNING: {bench}-Abruf fehlgeschlagen ({e})")
        if bench in got_bench:
            break
        time.sleep(20 * (attempt + 1))
    if bench not in got_bench:
        raise RuntimeError(f"Benchmark {bench} ohne Kursdaten (3 Versuche)")
    master = got_bench[bench]["dates"]

    def _aligned(r):
        return {k: align(master, r["dates"], r[k]) for k in ("c", "h", "o", "l", "v")}

    keep_set = set(keep)
    bars = {bench: _aligned(got_bench[bench])}
    universe = {}

    def _absorb(got):
        for tk, r in got.items():
            a = _aligned(r)
            if tk in keep_set:
                bars[tk] = a
            if tk in broad_set:
                s = rs_summary(a["c"], a["v"], cfg)
                if s is not None:
                    universe[tk] = s

    broad_set = set(broad)
    order = [tk for tk in dict.fromkeys(list(keep) + list(broad)) if tk != bench]
    chunks = [order[i:i + cfg["CHUNK"]] for i in range(0, len(order), cfg["CHUNK"])]
    for i, chunk in enumerate(chunks, 1):
        try:
            got = _download(chunk)
            _absorb(got)
            if i % 5 == 0 or i == len(chunks):
                print(f"      Block {i}/{len(chunks)}: {len(bars) - 1} Konstituenten, "
                      f"{len(universe)} RS-Universum")
        except Exception as e:
            print(f"      WARNING: leaders bar chunk {i} failed: {e}")

    # Nur Konstituenten einzeln nachholen - im breiten Universum sind
    # Ausfaelle (Delistings, Sonderfaelle) normal und kosten nur Laufzeit.
    missing = [tk for tk in keep if tk not in bars and tk != bench]
    if missing:
        before = len(bars)
        for tk in missing:
            try:
                _absorb(_download([tk]))
            except Exception as e:
                print(f"      WARNING: retry failed for {tk}: {e}")
        print(f"      Retry: {len(bars) - before}/{len(missing)} nachgeholt.")
    return master, bars, universe


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
    """Kurze Feldnamen + Kappung: c/h ueber LONG_BARS, o/l/v ueber SHORT_BARS."""
    L, S = cfg["LONG_BARS"], cfg["SHORT_BARS"]
    return {
        "c": [_round_px(x) for x in b["c"][-L:]],
        "h": [_round_px(x) for x in b["h"][-L:]],
        "o": [_round_px(x) for x in b["o"][-S:]],
        "l": [_round_px(x) for x in b["l"][-S:]],
        "v": [None if x is None else int(x) for x in b["v"][-S:]],
    }


def _read_json(path: Path):
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"  WARNING: {path.name} nicht lesbar ({e})")
        return None


def build_leaders(themes: dict, industries: dict | None = None, cfg: dict = LEADERS_CONFIG):
    """Kompletter Lauf -> (constituents_payload, bars_payload).

    industries: data.json-Industries mit "tickers" - das breite RS-Universum.
    Fehlt es, faellt das RS-Universum auf die Theme-Mitglieder zurueck (und
    die Datei sagt das in rs_universe.source).
    """
    prev_const = _read_json(CONSTITUENTS_PATH) or {}
    prev_bars = _read_json(BARS_PATH) or {}
    overrides = prev_const.get("overrides") or {}
    known_ex = {tk: row.get("x") for tk, row in (prev_bars.get("tickers") or {}).items()}

    keep = []
    seen = set()
    for row in themes.values():
        for tk in row.get("tickers") or []:
            if tk not in seen:
                seen.add(tk)
                keep.append(tk)
    for ov in overrides.values():
        for s in ov.get("tickers") or []:
            tk = s.split(":")[-1]
            if tk not in seen:
                seen.add(tk)
                keep.append(tk)

    broad = list(dict.fromkeys(
        tk for row in (industries or {}).values() for tk in (row.get("tickers") or [])))
    rs_source = "finviz_industries"
    if not broad:
        broad, rs_source = list(keep), "theme_members"
    print(f"    Leading Stocks: {len(keep)} Theme-Mitglieder + RS-Universum "
          f"{len(broad)} Ticker ({rs_source}), lade {cfg['PERIOD']} Kursdaten…")

    master, bars, universe = fetch_bars_and_universe(keep, broad, cfg)
    print(f"    Kursdaten: {len(bars) - 1}/{len(keep)} Konstituenten, "
          f"RS-Universum {len(universe)}/{len(broad)} mit vollstaendiger Historie.")

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
        "rs_universe": {
            "source": rs_source,
            "fields": [f"roc{n}" for n in cfg["RS_ROCS"]] + [f"dvol{cfg['RS_DVOL_BARS']}"],
            "min_price": cfg["RS_MIN_PRICE"],
            "rows": universe,
        },
    }
    return const_out, bars_out


def write_leaders(themes: dict, industries: dict | None = None, cfg: dict = LEADERS_CONFIG) -> dict:
    const_out, bars_out = build_leaders(themes, industries, cfg)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CONSTITUENTS_PATH.write_text(
        json.dumps(const_out, ensure_ascii=False, indent=1), encoding="utf-8")
    BARS_PATH.write_text(
        json.dumps(bars_out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return bars_out


def load_existing_bars() -> dict | None:
    return _read_json(BARS_PATH)
