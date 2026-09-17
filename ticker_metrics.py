"""
Tickers-Tab: Bubble-Chart-Datengrundlage fuer Einzelaktien.

Universum: die Ticker der Top-20%-Schnittmenge (1W UND 1M) aus Industries
ODER Themes, identische Logik zum "★ 1W∩1M"-Button im Frontend (siehe
topIntersectionKeys() in docs/static/app.js), hier serverseitig fuer die
Ticker-Ebene und ueber BEIDE Gruppentypen vereinigt.

Danach zwei automatische Filter, keine Pflegeliste - wie bei setups.py:
  - Market Cap > 1 Mrd. $
  - ATR% (20-Tage, aus taeglichem OHLCV) > 4 %

Volatility (Monthly) ist bei Finviz ein separates, selbst nicht offengelegtes
Mittel der taeglichen Kursbewegung; ATR% (High-Low)/Close ueber N Tage misst
dieselbe Grundfrage ("genug Bewegungsbreite?") und ist bereits in setups.py
validiert im Einsatz - deshalb hier wiederverwendet statt zusaetzlich neu
implementiert.
"""
import math
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

from setups import fetch_bars, _mean, _true_ranges

TICKER_CONFIG = {
    # -- Universum: 1W∩1M Top-20%, Industries UND Themes -----------------------
    "PCT": 0.20,
    "TFS": ["1W", "1M"],
    "MAX_TICKERS": 1500,     # Reissleine, kein Filter - greift im Normalfall nicht
    "CHUNK": 150,            # Ticker pro yfinance-Bulk-Request (siehe setups.fetch_bars)
    "PERIOD": "6mo",
    "MIN_BARS": 30,

    # -- Filter ------------------------------------------------------------
    "MIN_MARKET_CAP": 1_000_000_000,   # $ - UNVALIDIERT
    "ATR_WINDOW": 20,                  # Tage
    "MIN_ATR_PCT": 4.0,                # % - UNVALIDIERT

    # -- Market Cap ----------------------------------------------------------
    "CAP_WORKERS": 8,
}


def top_intersection_keys(entries, tfs, pct):
    """Schnittmenge der Top-`pct` je Zeitfenster. entries: [(name, row)], row["perfs"].

    Bewusst dupliziert aus topIntersectionKeys() in app.js (Python/JS-Grenze,
    keine gemeinsame Laufzeit) - bei Aenderung an der Auswahlregel BEIDE Seiten
    synchron halten.
    """
    if not entries:
        return set()
    cutoff = max(1, math.ceil(len(entries) * pct))
    top_sets = []
    for tf in tfs:
        valid = [(k, r) for k, r in entries if (r.get("perfs") or {}).get(tf) is not None]
        valid.sort(key=lambda kv: kv[1]["perfs"][tf], reverse=True)
        top_sets.append(set(k for k, _ in valid[:cutoff]))
    inter = top_sets[0]
    for s in top_sets[1:]:
        inter &= s
    return inter


def build_universe(industries: dict, themes: dict, cfg: dict = TICKER_CONFIG):
    """Ticker der 1W∩1M-Top-Industries UND -Themes, vereinigt und dedupliziert.

    Returns (tickers, groups, meta):
      tickers = eindeutige Symbole (gekappt auf MAX_TICKERS)
      groups  = {ticker: [{"name":..., "type": "industry"|"theme"}, ...]}
      meta    = {"industries": [...Namen...], "themes": [...Namen...]}
    """
    ind_keys = top_intersection_keys(list(industries.items()), cfg["TFS"], cfg["PCT"])
    theme_keys = top_intersection_keys(list(themes.items()), cfg["TFS"], cfg["PCT"])

    groups: dict = {}
    order: list = []

    def _add(name, row, kind):
        for tk in row.get("tickers") or []:
            if tk not in groups:
                groups[tk] = []
                order.append(tk)
            groups[tk].append({"name": name, "type": kind})

    for name in sorted(ind_keys):
        _add(name, industries[name], "industry")
    for name in sorted(theme_keys):
        _add(name, themes[name], "theme")

    tickers = order[: cfg["MAX_TICKERS"]]
    if len(order) > len(tickers):
        print(f"    WARNUNG: Tickers-Universum auf {len(tickers)} von {len(order)} "
              f"Tickern gekappt (MAX_TICKERS) — der Rest faellt weg.")

    meta = {"industries": sorted(ind_keys), "themes": sorted(theme_keys)}
    return tickers, {tk: groups[tk] for tk in tickers}, meta


def fetch_market_caps(tickers: list, cfg: dict = TICKER_CONFIG) -> dict:
    """Market Cap je Ticker via yfinance fast_info, parallel (analog _fetch_sma_distances).

    Einzelabfragen (kein Bulk-Endpunkt fuer Market Cap in yfinance), deshalb
    ThreadPoolExecutor mit wenigen Workern - wie bei den SMA-Distanzen im
    Regime-Gate. Fehlschlaege einzelner Ticker liefern None, der Lauf bricht nie ab.
    """
    import yfinance as yf

    def _one(tk):
        try:
            fi = yf.Ticker(tk).fast_info
            cap = fi.get("marketCap") if hasattr(fi, "get") else getattr(fi, "market_cap", None)
            return tk, float(cap) if cap else None
        except Exception:
            return tk, None

    out = {}
    with ThreadPoolExecutor(max_workers=cfg["CAP_WORKERS"]) as pool:
        futures = {pool.submit(_one, tk): tk for tk in tickers}
        for fut in as_completed(futures):
            tk, cap = fut.result()
            out[tk] = cap
    return out


def _perf(closes: list, back: int):
    """Performance in % ueber `back` Handelstage, None wenn zu wenig Historie."""
    if len(closes) <= back or not closes[-back - 1]:
        return None
    return round((closes[-1] / closes[-back - 1] - 1) * 100, 2)


def _atr_pct(highs: list, lows: list, closes: list, window: int):
    """Mittlere True Range der letzten `window` Tage, in % vom aktuellen Close."""
    if len(closes) < window + 1:
        return None
    trs = _true_ranges(highs, lows, closes)
    atr = _mean(trs[-window:])
    close = closes[-1]
    return round(atr / close * 100, 2) if (atr and close) else None


def build_ticker_metrics(industries: dict, themes: dict, cfg: dict = TICKER_CONFIG) -> dict:
    """Kompletter Lauf -> Payload fuer docs/tickers.json."""
    tickers, groups, universe_meta = build_universe(industries, themes, cfg)
    print(f"    Tickers-Tab: {len(tickers)} Kandidaten aus "
          f"{len(universe_meta['industries'])} Industries + {len(universe_meta['themes'])} Themes (1W∩1M)…")

    bars = fetch_bars(tickers, cfg)
    print(f"    Kursdaten: {len(bars)}/{len(tickers)} Ticker geliefert.")
    caps = fetch_market_caps(list(bars.keys()), cfg)
    print(f"    Market Cap: {sum(1 for v in caps.values() if v)}/{len(bars)} Ticker geliefert.")

    rows = []
    for tk in tickers:
        b = bars.get(tk)
        if not b or len(b["close"]) < cfg["MIN_BARS"]:
            continue
        cap = caps.get(tk)
        if not cap or cap < cfg["MIN_MARKET_CAP"]:
            continue
        atr_pct = _atr_pct(b["high"], b["low"], b["close"], cfg["ATR_WINDOW"])
        if atr_pct is None or atr_pct < cfg["MIN_ATR_PCT"]:
            continue
        perfs = {
            "1W": _perf(b["close"], 5),
            "1M": _perf(b["close"], 21),
            "3M": _perf(b["close"], 63),
        }
        if perfs["1W"] is None or perfs["1M"] is None:
            continue
        rows.append({
            "t":          tk,
            "perfs":      perfs,
            "market_cap": round(cap),
            "atr_pct":    atr_pct,
            "groups":     groups.get(tk, []),
        })

    rows.sort(key=lambda r: -(r["market_cap"] or 0))

    now = datetime.now(timezone.utc)
    return {
        "fetched_at": now.isoformat(),
        # Handelstag, fuer den gerechnet wurde - scrape.py nutzt das Feld, um
        # pro Tag genau einen Lauf zuzulassen (Post-Close statt stuendlich),
        # analog setups.json.
        "date": now.strftime("%Y-%m-%d"),
        "config": cfg,
        "universe": {**universe_meta, "candidates": len(tickers), "with_bars": len(bars)},
        "count": len(rows),
        "rows": rows,
    }
