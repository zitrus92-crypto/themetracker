"""
Stufe-1-Setup-Screener (Experimental-Tab).

Rechnet die drei Chart-Kriterien der Tages-Routine (docs/workflows/swing-routinen.md,
Schritt 3) aus Tages-OHLCV, statt sie am Finviz-Mini-Chart abzulesen:

  1. Base/Konsolidierung  -> Verengung (ATR5/ATR20) + Basis-Laenge in Tagen
  2. Nicht extended       -> Abstand zum Pivot (Basis-Hoch) in %
  3. Volumen              -> Dry-Up in der Base + RVOL am Ausbruchstag

Universum: die Ticker der staerksten Industries + Themes aus demselben Scrape-Lauf.
Kein manueller Input, keine Pflegeliste - die Gruppen-Auswahl ist rein mechanisch.

ALLE SCHWELLEN: DEFAULT - UNVALIDIERT (Momentum-Konvention, nicht backgetestet).
Sie stehen bewusst gesammelt in SETUP_CONFIG, damit ein spaeterer Backtest genau
eine Stelle aendern muss.
"""
from datetime import datetime, timezone

SETUP_CONFIG = {
    # -- Universum ------------------------------------------------------------
    "N_INDUSTRIES":   10,      # staerkste Industries nach composite (niedrig = stark)
    "N_THEMES":        5,      # staerkste Themes nach score
    "MAX_TICKERS":   800,      # harte Obergrenze fuer den yfinance-Lauf
    "CHUNK":         150,      # Ticker pro yfinance-Bulk-Request
    "PERIOD":      "6mo",
    "MIN_BARS":       60,      # weniger Bars -> Ticker wird uebersprungen

    # -- Liquiditaets-/Preisfilter (entspricht dem Finviz-Vorfilter) ----------
    "MIN_PRICE":     5.0,      # $ - UNVALIDIERT
    "MIN_DOLLAR_VOL": 3_000_000,   # 50-Tage-Schnitt Preis x Volumen - UNVALIDIERT
    # Grundbedingung des Experimental-Tabs: genug Bewegungsbreite, damit ein
    # Ausbruch ueberhaupt traegt. Im Finviz-Link ist das ta_volatility_mo3
    # ("Month - Over 3%"), hier die selbst gerechnete ADR. Beide messen
    # Tagesspanne in %, sind aber NICHT dieselbe Formel - Finviz mittelt
    # Tagesveraenderungen, ADR mittelt (High-Low)/Close ueber 20 Tage.
    "MIN_ADR":       3.0,      # % - UNVALIDIERT

    # -- Pivot ---------------------------------------------------------------
    "PIVOT_WINDOW":   25,      # Fenster fuer das Basis-Hoch
    "PIVOT_EXCLUDE":   3,      # letzte N Tage ausklammern: ein frischer Ausbruch
                               # soll nicht sein eigener Pivot werden

    # -- Verdict-Leiter (Abstand zum Pivot in %) -----------------------------
    "READY_LOW":    -5.0,      # ab hier "am Pivot" - deckt sich mit dem
    "READY_HIGH":    2.0,      # gespeicherten Screener (<=5 % unter 20-T-Hoch)
    "BREAKOUT_HIGH": 8.0,      # darueber = zu weit gelaufen
    "WATCH_LOW":   -12.0,      # darunter = Base noch nicht am Hoch
    "EXT_SMA20_MAX": 15.0,     # % ueber SMA20 -> parabolisch, raus - UNVALIDIERT

    # -- Base-Qualitaet ------------------------------------------------------
    "MIN_BASE_DAYS":   5,      # Tage seit dem Pivot-Hoch - UNVALIDIERT
    "TIGHT_MAX":     1.0,      # ATR5/ATR20 < 1 = Verengung - UNVALIDIERT

    # -- Ausgabe -------------------------------------------------------------
    "MAX_WATCH_ROWS": 60,      # WATCH-Zeilen im JSON (READY/BREAKOUT immer alle)
}

VERDICTS = ("READY", "BREAKOUT", "WATCH", "EXTENDED", "OUT")


# -- Universum ----------------------------------------------------------------

def build_universe(scored: dict, themes: dict, cfg: dict = SETUP_CONFIG):
    """Ticker der staerksten Gruppen einsammeln.

    "Staerkste Gruppe" heisst hier AUSSCHLIESSLICH: bester Score der App, also
    dieselbe Zahl, die in Heatmap und Themes-Tabelle steht.

      Industry: composite = Rang1W x 0,20 + Rang1M x 0,70 + Rang3M x 0,10
                Raenge laufen ueber alle Industries (1 = staerkste). Quelle:
                scores.py/compute_scores. Aufsteigend sortiert, die N kleinsten.
      Theme:    score = Mittelwert der Sub-Node-Scores des Themes, je Sub-Node
                Rang1M x 0,70 + Rang1W x 0,20 + Rang3M x 0,10 ueber alle
                Sub-Nodes. Quelle: scraper.py/fetch_themes_data. Aufsteigend,
                die N kleinsten.

    BEWUSST NICHT verwendet: Accel, INST-Badge, Regime-Gate, Weekend-Prep-Stage.
    Die Auswahl ist damit reine Momentan-Staerke ueber 1W/1M/3M und NICHT
    identisch mit der Aufnahme-Formel der Wochenend-Routine (die zusaetzlich
    Accel >= +10 und 1M > 0 % verlangt).

    scored: {industry: {composite, tickers, ...}} - niedriger composite = staerker.
    themes: {theme:   {score, tickers, ...}}      - niedriger score = staerker.
    Returns (tickers, groups, meta):
      tickers = eindeutige Symbole (gekappt auf MAX_TICKERS)
      groups  = {ticker: [{"name":..., "type":"industry"|"theme"}, ...]}
      meta    = {"industries": [{name, score, ...}], "themes": [...]}
                je Gruppe die Zahlen, die zur Aufnahme gefuehrt haben, damit
                die Auswahl im Tab nachvollziehbar ist.
    """
    top_ind = sorted(
        (kv for kv in scored.items() if kv[1].get("composite") is not None),
        key=lambda kv: kv[1]["composite"],
    )[: cfg["N_INDUSTRIES"]]
    top_thm = sorted(
        (kv for kv in themes.items() if kv[1].get("score") is not None),
        key=lambda kv: kv[1]["score"],
    )[: cfg["N_THEMES"]]

    groups: dict = {}
    order: list = []

    def _add(name, row, kind):
        for tk in row.get("tickers") or []:
            if tk not in groups:
                groups[tk] = []
                order.append(tk)
            groups[tk].append({"name": name, "type": kind})

    for name, row in top_ind:
        _add(name, row, "industry")
    for name, row in top_thm:
        _add(name, row, "theme")

    tickers = order[: cfg["MAX_TICKERS"]]
    meta = {
        "industries": [{
            "name":    n,
            "score":   r.get("composite"),
            "accel":   r.get("acceleration"),
            "ranks":   r.get("ranks") or {},
            "perf1m":  (r.get("perfs") or {}).get("1M"),
            "tickers": len(r.get("tickers") or []),
        } for n, r in top_ind],
        "themes": [{
            "name":    n,
            "score":   r.get("score"),
            "rank":    r.get("rank"),
            "perf1m":  (r.get("perfs") or {}).get("1M"),
            "tickers": len(r.get("tickers") or []),
        } for n, r in top_thm],
        "pool": {"industries": len(scored), "themes": len(themes)},
    }
    return tickers, {tk: groups[tk] for tk in tickers}, meta


# -- Kennzahlen (reine Mathematik, keine Abhaengigkeiten) ---------------------

def _mean(xs):
    xs = [x for x in xs if x is not None]
    return sum(xs) / len(xs) if xs else None


def _sma(closes, n):
    return _mean(closes[-n:]) if len(closes) >= n else None


def _true_ranges(highs, lows, closes):
    tr = []
    for i in range(1, len(closes)):
        pc = closes[i - 1]
        tr.append(max(highs[i] - lows[i], abs(highs[i] - pc), abs(lows[i] - pc)))
    return tr


def analyze_series(highs, lows, closes, volumes, cfg: dict = SETUP_CONFIG):
    """Alle Setup-Kennzahlen fuer eine Kursreihe. None, wenn zu wenig Bars.

    Erwartet chronologische Listen gleicher Laenge (aelteste zuerst).
    """
    n = len(closes)
    if n < cfg["MIN_BARS"] or not (len(highs) == len(lows) == len(volumes) == n):
        return None

    close = closes[-1]
    if not close or close <= 0:
        return None

    sma20  = _sma(closes, 20)
    sma50  = _sma(closes, 50)
    sma200 = _sma(closes, 200)

    # Pivot = hoechstes Hoch im Basis-Fenster, ohne die letzten PIVOT_EXCLUDE Tage.
    end   = n - cfg["PIVOT_EXCLUDE"]
    start = max(0, end - cfg["PIVOT_WINDOW"])
    window = highs[start:end]
    if not window:
        return None
    pivot = max(window)
    if pivot <= 0:
        return None
    pivot_idx = start + window.index(pivot)
    # Tage seit dem Pivot-Hoch = Laenge der Konsolidierung darunter.
    base_days = (n - 1) - pivot_idx

    trs   = _true_ranges(highs, lows, closes)
    atr5  = _mean(trs[-5:])  if len(trs) >= 5  else None
    atr20 = _mean(trs[-20:]) if len(trs) >= 20 else None
    tight = (atr5 / atr20) if (atr5 and atr20) else None

    vol50 = _mean(volumes[-50:]) or 0
    dryup = (_mean(volumes[-5:]) / vol50) if vol50 else None
    rvol  = (volumes[-1] / vol50) if vol50 else None

    dollar_vol = None
    if vol50:
        dollar_vol = _mean([closes[i] * volumes[i] for i in range(n - 50, n)])

    adr = _mean([
        (highs[i] - lows[i]) / closes[i] * 100
        for i in range(n - 20, n) if closes[i]
    ])

    return {
        "price":      round(close, 2),
        "pivot":      round(pivot, 2),
        "dist":       round((close / pivot - 1) * 100, 2),
        "base_days":  base_days,
        "tight":      round(tight, 2) if tight else None,
        "dryup":      round(dryup, 2) if dryup else None,
        "rvol":       round(rvol, 2) if rvol else None,
        "ext20":      round((close / sma20 - 1) * 100, 2) if sma20 else None,
        "sma50pct":   round((close / sma50 - 1) * 100, 2) if sma50 else None,
        "above50":    bool(sma50 and close > sma50),
        "above200":   bool(sma200 and close > sma200),
        "sma20_up":   bool(sma20 and sma50 and sma20 > sma50),
        "adr":        round(adr, 2) if adr else None,
        "perf1m":     round((close / closes[-22] - 1) * 100, 2) if n >= 22 and closes[-22] else None,
        "dvol":       round(dollar_vol) if dollar_vol else None,
    }


def verdict_for(m: dict, cfg: dict = SETUP_CONFIG):
    """Verdict + Begruendung. Die Leiter ist bewusst mechanisch und lueckenlos."""
    if m["price"] < cfg["MIN_PRICE"]:
        return "OUT", "price"
    if (m["dvol"] or 0) < cfg["MIN_DOLLAR_VOL"]:
        return "OUT", "liquidity"
    if (m["adr"] or 0) < cfg["MIN_ADR"]:
        return "OUT", "low_adr"
    if not m["above50"]:
        return "OUT", "below_sma50"

    dist = m["dist"]
    if dist > cfg["BREAKOUT_HIGH"]:
        return "EXTENDED", "far_above_pivot"
    if m["ext20"] is not None and m["ext20"] > cfg["EXT_SMA20_MAX"]:
        return "EXTENDED", "parabolic"

    if cfg["READY_LOW"] <= dist <= cfg["READY_HIGH"]:
        if m["base_days"] < cfg["MIN_BASE_DAYS"]:
            return "WATCH", "base_too_short"
        if m["tight"] is None or m["tight"] > cfg["TIGHT_MAX"]:
            return "WATCH", "no_contraction"
        return "READY", "at_pivot"
    if dist > cfg["READY_HIGH"]:
        return "BREAKOUT", "running"
    if dist >= cfg["WATCH_LOW"]:
        return "WATCH", "below_pivot"
    return "OUT", "far_below_pivot"


def _clamp01(x):
    return 0.0 if x < 0 else (1.0 if x > 1 else x)


def setup_score(m: dict) -> int:
    """0-100, hoeher = sauberer. Gewichte sind explizit und UNVALIDIERT.

    Pivot-Naehe 40 - Verengung 25 - Volumen-Dry-Up 15 - Basis-Laenge 10 - Trend 10.
    """
    prox  = 40 * _clamp01(1 - abs(m["dist"]) / 8)
    tight = 25 * _clamp01((1.3 - m["tight"]) / 0.6) if m["tight"] is not None else 0
    dry   = 15 * _clamp01((1.1 - m["dryup"]) / 0.6) if m["dryup"] is not None else 0
    base  = 10 * _clamp01(m["base_days"] / 15)
    trend = (5 if m["above50"] else 0) + (5 if m["sma20_up"] else 0)
    return round(prox + tight + dry + base + trend)


# -- Kursdaten ----------------------------------------------------------------

def fetch_bars(tickers: list, cfg: dict = SETUP_CONFIG) -> dict:
    """Tages-OHLCV via yfinance, in Bloecken. {ticker: {high, low, close, volume}}.

    Die Bloecke laufen bewusst SEQUENZIELL: yf.download parallelisiert intern
    bereits, und mehrere gleichzeitige Bulk-Requests liefern messbar Luecken
    (belegt: 152/618 Ticker bei 3 parallelen Bloecken vs. 150/150 pro Block
    einzeln). Fehlschlaege einzelner Bloecke werden geloggt und uebersprungen -
    der Lauf bricht nie am Kursdaten-Teil ab.
    """
    import yfinance as yf  # lokal: die Mathematik oben bleibt abhaengigkeitsfrei

    out: dict = {}
    chunks = [tickers[i:i + cfg["CHUNK"]] for i in range(0, len(tickers), cfg["CHUNK"])]

    def _one(chunk):
        df = yf.download(
            chunk, period=cfg["PERIOD"], interval="1d", group_by="ticker",
            auto_adjust=False, threads=True, progress=False,
        )
        res = {}
        for tk in chunk:
            try:
                sub = df[tk].dropna() if len(chunk) > 1 else df.dropna()
            except (KeyError, TypeError):
                continue
            if sub.empty:
                continue
            res[tk] = {
                "high":   [float(x) for x in sub["High"]],
                "low":    [float(x) for x in sub["Low"]],
                "close":  [float(x) for x in sub["Close"]],
                "volume": [float(x) for x in sub["Volume"]],
            }
        return res

    for i, chunk in enumerate(chunks, 1):
        try:
            got = _one(chunk)
            out.update(got)
            print(f"      Block {i}/{len(chunks)}: {len(got)}/{len(chunk)} Ticker")
        except Exception as e:
            print(f"      WARNING: bar fetch chunk {i} failed: {e}")
    return out


# -- Payload ------------------------------------------------------------------

def build_setups(scored: dict, themes: dict, cfg: dict = SETUP_CONFIG) -> dict:
    """Kompletter Stufe-1-Lauf -> Payload fuer docs/setups.json."""
    tickers, groups, meta = build_universe(scored, themes, cfg)
    print(f"    Setup-Screener: {len(tickers)} Ticker aus "
          f"{len(meta['industries'])} Industries + {len(meta['themes'])} Themes...")

    bars = fetch_bars(tickers, cfg)
    print(f"    Kursdaten: {len(bars)}/{len(tickers)} Ticker geliefert.")

    rows, counts = [], {v: 0 for v in VERDICTS}
    for tk in tickers:
        b = bars.get(tk)
        if not b:
            continue
        m = analyze_series(b["high"], b["low"], b["close"], b["volume"], cfg)
        if not m:
            continue
        verdict, reason = verdict_for(m, cfg)
        counts[verdict] += 1
        if verdict in ("OUT", "EXTENDED"):
            continue
        row = {"t": tk, "verdict": verdict, "reason": reason,
               "score": setup_score(m), "groups": groups.get(tk, [])}
        row.update(m)
        rows.append(row)

    rows.sort(key=lambda r: -r["score"])
    ready = [r for r in rows if r["verdict"] in ("READY", "BREAKOUT")]
    watch = [r for r in rows if r["verdict"] == "WATCH"][: cfg["MAX_WATCH_ROWS"]]
    keep = ready + watch
    keep.sort(key=lambda r: -r["score"])

    return {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "config": cfg,
        "universe": {**meta, "tickers": len(tickers), "with_bars": len(bars)},
        "counts": counts,
        "rows": keep,
    }
