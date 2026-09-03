"""
Position-Trend-Kennzahlen — Python-Port von docs/static/themeMetrics.js
(Segmente, Stage-Klassifikation, Position-Score, Persistenz-Filter).

MUSS SYNCHRON BLEIBEN mit docs/static/themeMetrics.js. Zwei Implementierungen
sind hier absichtlich, kein Versehen: die Frage "welches Theme bekommt eine
LLM-These spendiert?" muss serverseitig im Scraper beantwortet werden (der
Anthropic-API-Key darf nicht im Browser landen), waehrend dieselbe Frage fuer
die Tab-Anzeige client-seitig in app.js/themeMetrics.js beantwortet wird.
Aenderungen an Schwellen oder Formeln IMMER in beiden Dateien nachziehen —
tests/test_position_metrics.py nutzt bewusst dieselben Fixtures wie
docs/static/themeMetrics.test.js, damit ein Auseinanderlaufen auffaellt.

Ebene-2-Kriterien (Dichte/Breite/Konzentration) fehlen hier bewusst: der
Scraper hat wie das Frontend keine Per-Stock-Daten, sie waeren ueberall "n/v"
und damit nie blockierend (siehe docs/superpowers/plans/2026-07-02-...).
"""

THRESHOLDS = {
    "bounce_damage": -15,       # m4_6 + m2_3 <= -15 -> BOUNCE (harte Sperre)
    "pullback_run": 10,         # m4_6 >= 10
    "pullback_dip_min": -20,    # m2_3 > -20
    "base_flat_band": 8,        # |m4_6| <= 8 und |m2_3| <= 8
    "base_break_min": 8,        # m1 >= 8
    "trend_accel_floor": -5,    # TREND nur solange accel > -5
    "position_m4_6_min": 15,    # Mindestlauf Monate 4-6, in %. DEFAULT — unvalidiert.
    "position_persist_top_pct": 0.20,  # Persistenz-Filter: Top-Anteil ueber 3M/6M/YTD.
}

STAGE_UNKNOWN = "UNKNOWN"
STAGE_BOUNCE = "BOUNCE"
STAGE_PULLBACK = "PULLBACK"
STAGE_BASE_BREAK = "BASE_BREAK"
STAGE_EXTENDED = "EXTENDED"
STAGE_TREND = "TREND"
STAGE_NEUTRAL = "NEUTRAL"


def chain_segment(short_win, long_win):
    """Entschachtelt zwei kumulative Fenster zum dazwischenliegenden Segment."""
    if short_win is None or long_win is None:
        return None
    base = 1 + short_win / 100
    if abs(base) < 1e-9:
        return None
    return ((1 + long_win / 100) / base - 1) * 100


def segments(perfs: dict) -> dict:
    """Zerlegt perfs in NICHT ueberlappende Segmente (1W steckt in 1M in 3M in 6M)."""
    perfs = perfs or {}
    return {
        "m1": perfs.get("1M"),
        "m2_3": chain_segment(perfs.get("1M"), perfs.get("3M")),
        "m4_6": chain_segment(perfs.get("3M"), perfs.get("6M")),
    }


def classify_stage(seg: dict, accel) -> str:
    """Struktur-Klasse. Reihenfolge ist bindend: BOUNCE zuerst (Sicherheits-Veto)."""
    m1, m2_3, m4_6 = seg["m1"], seg["m2_3"], seg["m4_6"]
    if m1 is None or m2_3 is None or m4_6 is None:
        return STAGE_UNKNOWN
    t = THRESHOLDS
    dmg = m2_3 + m4_6
    a = accel if accel is not None else 0

    if dmg <= t["bounce_damage"] and m1 > 0:
        return STAGE_BOUNCE
    if m4_6 >= t["pullback_run"] and t["pullback_dip_min"] < m2_3 < 0 and m1 > 0:
        return STAGE_PULLBACK
    if (abs(m4_6) <= t["base_flat_band"] and abs(m2_3) <= t["base_flat_band"]
            and m1 >= t["base_break_min"] and m1 > max(abs(m4_6), abs(m2_3))):
        return STAGE_BASE_BREAK
    if m4_6 > 0 and m2_3 > 0 and a <= 0 and m1 < m2_3:
        return STAGE_EXTENDED
    if m4_6 > 0 and m2_3 > -t["base_flat_band"] and m1 > 0 and a > t["trend_accel_floor"]:
        return STAGE_TREND
    return STAGE_NEUTRAL


def _rank_by(entries: list, tf: str) -> dict:
    """entries: [(name, perfs_dict), ...]. Rang 1 = staerkste Performance im tf."""
    ranked = sorted(entries, key=lambda kv: (kv[1].get(tf) if kv[1].get(tf) is not None else -999),
                     reverse=True)
    return {name: i + 1 for i, (name, _) in enumerate(ranked)}


def compute_accel(perfs_by_name: dict) -> dict:
    """Accel = Rang(3M) - Rang(1M). Hoch positiv = frisches Momentum."""
    entries = list(perfs_by_name.items())
    n = len(entries)
    r1 = _rank_by(entries, "1M")
    r3 = _rank_by(entries, "3M")
    return {name: (r3.get(name, n) - r1.get(name, n)) for name in perfs_by_name}


def compute_position_metrics(perfs_by_name: dict):
    """Pos-Score = Rang(6M)*50% + Rang(3M)*35% + Rang(1M)*15% (niedriger = staerker).
    Persistenz = gleichzeitig Top-persistTopPct-Rang in 3M, 6M UND YTD — der
    automatisierte These-Ersatz statt eines manuellen Katalysator-Feldes.
    Returns (pos_score: dict, persistent: dict).
    """
    entries = list(perfs_by_name.items())
    n = len(entries)
    r1m = _rank_by(entries, "1M")
    r3m = _rank_by(entries, "3M")
    r6m = _rank_by(entries, "6M")
    rytd = _rank_by(entries, "YTD")
    top_n = max(1, int(n * THRESHOLDS["position_persist_top_pct"] + 0.5))

    pos_score, persistent = {}, {}
    for name in perfs_by_name:
        p1, p3, p6 = r1m.get(name, n), r3m.get(name, n), r6m.get(name, n)
        pos_score[name] = p6 * 0.50 + p3 * 0.35 + p1 * 0.15
        persistent[name] = (
            r3m.get(name, n + 1) <= top_n
            and r6m.get(name, n + 1) <= top_n
            and rytd.get(name, n + 1) <= top_n
        )
    return pos_score, persistent


def qualified_position_themes(themes: dict) -> dict:
    """themes: etf_data.json['themes']-Form ({name: {perfs, tickers, ...}}).

    Kriterien (siehe themeMetrics.js criteriaFor(TAB.POSITION_TREND)):
      Stage = TREND  UND  Lauf Monate 4-6 >= position_m4_6_min  UND  persistent.

    Returns {name: {stage, segments, accel, pos_score, tickers}} — nur die
    aktuell qualifizierten Themen, mit den Feldern, die der These-Prompt braucht.
    """
    perfs_by_name = {name: (row.get("perfs") or {}) for name, row in themes.items()}
    accel = compute_accel(perfs_by_name)
    pos_score, persistent = compute_position_metrics(perfs_by_name)

    out = {}
    for name, row in themes.items():
        seg = segments(row.get("perfs") or {})
        stage = classify_stage(seg, accel.get(name))
        trend_run_ok = seg["m4_6"] is not None and seg["m4_6"] >= THRESHOLDS["position_m4_6_min"]
        if stage == STAGE_TREND and trend_run_ok and persistent.get(name, False):
            out[name] = {
                "stage": stage,
                "segments": seg,
                "accel": accel.get(name),
                "pos_score": pos_score.get(name),
                "tickers": row.get("tickers") or [],
            }
    return out
