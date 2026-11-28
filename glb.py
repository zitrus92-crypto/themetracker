"""Green Line Breakout (GLB) nach Dr. Eric Wish (wishingwealthblog.com).

Reine Logik ohne Netzwerk/Dateizugriff. Spezifikation:
docs/superpowers/specs/2026-11-28-glb-subtab-design.md (Abschnitt "Regeln").

- Green Line: Allzeithoch (Intraday-High der Monatsbalken), gueltig, wenn danach
  3 volle Monatsbalken es nicht ueberschreiten. Waehrend der Entstehung setzt
  jedes hoehere High die Uhr zurueck; eine gueltige Line bleibt bis zum ersten
  Schluss darueber (= GLB).
- Monatsphase: Monatsbalken vor dem ersten vollen Tagesmonat (Monatsschluss als
  Naeherung fuer historische GLBs). Tagesphase: 2y-Tagesbalken (Tagesschluss).
- Status: glb_today / glb_holds / near / glb_failed (oder None).
- Qualitaet: RWB und Stage 2 auf abgeschlossenen Wochen, Blue Dot (Stoch 10.1).
"""
import datetime as _dt
import math

GLB_CFG = {
    "LINE_MONTHS": 3,
    "HOLD_DAYS": 63,
    "NEAR_PCT": 5.0,
    "VOL_WEEKS": 10,
    "RWB_SHORT": [3, 5, 8, 10, 12, 15],
    "RWB_LONG": [30, 35, 40, 45, 50, 60],
    "SMA_WEEKS": 30,
    "SMA_SLOPE_WEEKS": 4,
    "STOCH_N": 10,
    "BLUE_LEVEL": 20,
    "BLUE_DAYS": 3,
}


def _num(x):
    """float oder None (NaN/None/nicht numerisch -> None)."""
    if x is None:
        return None
    try:
        f = float(x)
    except (TypeError, ValueError):
        return None
    return None if math.isnan(f) else f


def months_between(a: str, b: str) -> int:
    """Monate von a nach b (YYYY-MM): months_between("2026-03","2026-07") = 4."""
    return (int(b[:4]) * 12 + int(b[5:7])) - (int(a[:4]) * 12 + int(a[5:7]))


def monthly_from_df(df) -> list:
    """[(YYYY-MM, high, close)] aus einem yfinance-Monats-DataFrame (NaN -> None)."""
    if df is None or len(df) == 0:
        return []
    out = []
    for ts, hi, cl in zip(df.index, df["High"], df["Close"]):
        out.append((ts.strftime("%Y-%m"), _num(hi), _num(cl)))
    return out


def _next_month(ym: str) -> str:
    y, m = int(ym[:4]), int(ym[5:7]) + 1
    if m == 13:
        y, m = y + 1, 1
    return f"{y:04d}-{m:02d}"


def scan_green_line(monthly, dates, h, c, cfg=GLB_CFG) -> dict:
    """Green Line ueber Monats- und Tagesphase verfolgen, GLB-Ereignisse sammeln."""
    need = cfg["LINE_MONTHS"] + 1
    first_full = _next_month(dates[0][:7]) if dates else None
    ath = ath_ym = line = line_since = None
    events = []

    # Monatsphase
    for ym, H, C in monthly:
        if first_full is not None and ym >= first_full:
            break
        if H is None:
            continue
        if line is None and ath is not None and months_between(ath_ym, ym) >= need:
            line, line_since = ath, ath_ym
        if line is not None and C is not None and C > line:
            line = None
            if H >= ath:
                ath, ath_ym = H, ym
        elif ath is None or H > ath:
            ath, ath_ym = H, ym

    # Tagesphase
    for i, d in enumerate(dates):
        ym = d[:7]
        if ym < first_full:
            continue
        hi, cl = h[i], c[i]
        if hi is None or cl is None:
            continue
        if line is None and ath is not None and months_between(ath_ym, ym) >= need:
            line, line_since = ath, ath_ym
        if line is not None and cl > line:
            events.append({"i": i, "line": line, "line_since": line_since})
            line = None
        if ath is None or hi > ath:
            ath, ath_ym = hi, ym

    return {"line": line, "line_since": line_since, "ath": ath,
            "ath_ym": ath_ym, "events": events}


def _week_groups(dates, c, v):
    """[(iso_key, last_close, vol_sum, last_date)] je ISO-Woche mit gueltigem Close."""
    groups = []
    for i, d in enumerate(dates):
        if c[i] is None:
            continue
        key = _dt.date.fromisoformat(d).isocalendar()[:2]
        vol = v[i] if v is not None and v[i] is not None else 0.0
        if groups and groups[-1][0] == key:
            k, _, vs, _ = groups[-1]
            groups[-1] = (k, c[i], vs + vol, d)
        else:
            groups.append((key, c[i], vol, d))
    return groups


def weekly(dates, c, v):
    """(Wochenschluesse, Wochenvolumen, letzte Woche abgeschlossen?)."""
    groups = _week_groups(dates, c, v)
    if not groups:
        return [], [], False
    last_key = _dt.date.fromisoformat(dates[-1]).isocalendar()[:2]
    if groups[-1][0] == last_key:
        done = _dt.date.fromisoformat(dates[-1]).weekday() == 4
    else:
        done = True   # Ticker ohne Daten in der laufenden Woche
    return [g[1] for g in groups], [g[2] for g in groups], done


def ema_series(x, n):
    """EMA mit alpha = 2/(n+1), Seed = erster Wert."""
    if not x:
        return []
    a = 2.0 / (n + 1)
    out = [x[0]]
    for val in x[1:]:
        out.append(a * val + (1 - a) * out[-1])
    return out


def rwb(wk_close, cfg=GLB_CFG):
    """RWB: alle kurzen EMAs ueber allen langen und alle kurzen steigend."""
    if len(wk_close) < max(cfg["RWB_LONG"]) + 1:
        return None
    short = [ema_series(wk_close, n) for n in cfg["RWB_SHORT"]]
    long_ = [ema_series(wk_close, n) for n in cfg["RWB_LONG"]]
    if min(e[-1] for e in short) <= max(e[-1] for e in long_):
        return False
    return all(e[-1] > e[-2] for e in short)


def stage2(wk_close, cfg=GLB_CFG):
    """Stage 2: Wochenschluss ueber steigender 30-Wochen-SMA (heute > vor 4 Wochen)."""
    n, s = cfg["SMA_WEEKS"], cfg["SMA_SLOPE_WEEKS"]
    if len(wk_close) < n + s:
        return None
    now = sum(wk_close[-n:]) / n
    prev = sum(wk_close[-n - s:-s]) / n
    return wk_close[-1] > now and now > prev


def analyze_weeks(dates, c, v, cfg=GLB_CFG) -> dict:
    """RWB/Stage 2 auf abgeschlossenen Wochen (angebrochene Woche ignoriert)."""
    wc, _, done = weekly(dates, c, v)
    if not done:
        wc = wc[:-1]
    return {"rwb": rwb(wc, cfg), "stage2": stage2(wc, cfg)}


def blue_dot_recent(h, l, c, cfg=GLB_CFG) -> bool:
    """Blue Dot (Stoch 10.1 kreuzt 20 von unten) in den letzten BLUE_DAYS Tagen."""
    n, lvl = cfg["STOCH_N"], cfg["BLUE_LEVEL"]
    bars = [(hh, ll, cc) for hh, ll, cc in zip(h, l, c)
            if hh is not None and ll is not None and cc is not None]
    k = []
    for i in range(len(bars)):
        if i < n - 1:
            k.append(None)
            continue
        win = bars[i - n + 1:i + 1]
        hh, ll = max(b[0] for b in win), min(b[1] for b in win)
        k.append(None if hh == ll else (bars[i][2] - ll) / (hh - ll) * 100.0)
    for i in range(max(1, len(k) - cfg["BLUE_DAYS"]), len(k)):
        if k[i] is not None and k[i - 1] is not None and k[i] > lvl and k[i - 1] < lvl:
            return True
    return False


def _week_volx(dates, c, v, idx, cfg):
    """Wochenvolumen der GLB-Woche / Mittel der VOL_WEEKS Vorwochen."""
    key = _dt.date.fromisoformat(dates[idx]).isocalendar()[:2]
    groups = [g for g in _week_groups(dates, c, v) if g[2] > 0]
    pos = next((j for j, g in enumerate(groups) if g[0] == key), None)
    if pos is None or pos < 1:
        return None
    prior = groups[max(0, pos - cfg["VOL_WEEKS"]):pos]
    avg = sum(g[2] for g in prior) / len(prior)
    return groups[pos][2] / avg if avg > 0 else None


def _r(x, nd):
    return None if x is None else round(x, nd)


def analyze(monthly, dates, h, l, c, v, cfg=GLB_CFG):
    """Zeile fuer glb.json oder None (kein relevanter Status)."""
    if not monthly or not dates:
        return None
    last = next((i for i in range(len(dates) - 1, -1, -1)
                 if c[i] is not None and h[i] is not None), None)
    if last is None:
        return None
    close = c[last]
    scan = scan_green_line(monthly, dates, h, c, cfg)
    recent = [e for e in scan["events"] if e["i"] >= len(dates) - cfg["HOLD_DAYS"]]

    glb_date = glb_volx = None
    if recent:
        ev = recent[-1]
        gl, since = ev["line"], ev["line_since"]
        if ev["i"] == last:
            status = "glb_today"
        elif close > gl:
            status = "glb_holds"
        else:
            status = "glb_failed"
        glb_date = dates[ev["i"]]
        glb_volx = _week_volx(dates, c, v, ev["i"], cfg)
    elif scan["line"] is not None and close >= scan["line"] * (1 - cfg["NEAR_PCT"] / 100.0):
        gl, since, status = scan["line"], scan["line_since"], "near"
    else:
        return None

    weeks = analyze_weeks(dates, c, v, cfg)
    return {
        "gl": _r(gl, 2),
        "gl_since": since,
        "close": _r(close, 2),
        "dist_pct": _r((close / gl - 1) * 100.0, 1),
        "status": status,
        "glb_date": glb_date,
        "glb_volx": _r(glb_volx, 2),
        "rwb": weeks["rwb"],
        "stage2": weeks["stage2"],
        "blue_dot": blue_dot_recent(h, l, c, cfg),
    }
