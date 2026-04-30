import json
import re
import requests
from datetime import datetime, timezone

import yfinance as yf
import pandas as pd

from etf_universe import THEMATIC_ETFS, ETF_BY_TICKER, ALL_TICKERS, ALL_THEMES

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

URL = "https://finviz.com/groups.ashx?g=industry&v=210&o=name&st=d1"

TIMEFRAMES = ["1D", "1W", "1M", "3M", "YTD"]

PERF_FIELDS = {
    "1D":  "perfT",
    "1W":  "perfW",
    "1M":  "perfM",
    "3M":  "perfQ",
    "YTD": "perfYtd",
}

# Trading days per period (approximate)
_PERIOD_DAYS = {"1D": 1, "1W": 5, "1M": 21, "3M": 63}


def fetch_all() -> dict:
    response = requests.get(URL, headers=HEADERS, timeout=15)
    response.raise_for_status()
    return parse_js_rows(response.text)


def parse_js_rows(html: str) -> dict:
    match = re.search(r"var rows\s*=\s*(\[.*?\]);", html, re.DOTALL)
    if not match:
        raise ValueError("Could not find data table on Finviz page")
    rows = json.loads(match.group(1).replace("\\u0026", "&"))
    data = {}
    for row in rows:
        name = row.get("label", "").strip()
        if not name:
            continue
        data[name] = {
            "ticker": row.get("ticker", ""),
            **{tf: row.get(field) for tf, field in PERF_FIELDS.items()},
        }
    return data


# ── ETF Data ─────────────────────────────────────────────────────────────────

def _pct(series: pd.Series, offset: int) -> float | None:
    """Return % change from `offset` bars ago to last bar. None if not enough data."""
    if len(series) <= offset:
        return None
    past = series.iloc[-(offset + 1)]
    now  = series.iloc[-1]
    if pd.isna(past) or pd.isna(now) or past == 0:
        return None
    return round((now / past - 1) * 100, 2)


def _ytd_pct(series: pd.Series) -> float | None:
    """YTD: last close vs. last close of previous year."""
    if series.empty:
        return None
    today_year = series.index[-1].year
    prev_year_end = series[series.index.year < today_year]
    if prev_year_end.empty:
        return None
    past = prev_year_end.iloc[-1]
    now  = series.iloc[-1]
    if pd.isna(past) or pd.isna(now) or past == 0:
        return None
    return round((now / past - 1) * 100, 2)


def fetch_etf_data() -> dict:
    """
    Download 1 year of daily close prices for all thematic ETFs via yfinance.
    Returns a dict ready to be serialised as etf_data.json.
    """
    print(f"  Fetching {len(ALL_TICKERS)} ETF prices via yfinance…")
    raw = yf.download(
        ALL_TICKERS,
        period="1y",
        auto_adjust=True,
        progress=False,
        threads=True,
    )

    # Close prices: MultiIndex → simple ticker→Series mapping
    if isinstance(raw.columns, pd.MultiIndex):
        close = raw["Close"]
    else:
        close = raw[["Close"]].rename(columns={"Close": ALL_TICKERS[0]})

    # ── Per-ETF performance ───────────────────────────────────────────────────
    etf_rows = {}
    for meta in THEMATIC_ETFS:
        tk = meta["ticker"]
        if tk not in close.columns:
            continue
        s = close[tk].dropna()
        if len(s) < 5:
            continue
        perfs = {
            "1D":  _pct(s, _PERIOD_DAYS["1D"]),
            "1W":  _pct(s, _PERIOD_DAYS["1W"]),
            "1M":  _pct(s, _PERIOD_DAYS["1M"]),
            "3M":  _pct(s, _PERIOD_DAYS["3M"]),
            "YTD": _ytd_pct(s),
        }
        etf_rows[tk] = {
            "name":     meta["name"],
            "theme":    meta["theme"],
            "priority": meta["priority"],
            "perfs":    perfs,
        }

    # ── Score: rank across ALL ETFs, same formula as industries ──────────────
    # Score = rank_1M*0.70 + rank_1W*0.20 + rank_3M*0.10  (lower = better)
    def rank_col(field):
        vals = {tk: row["perfs"][field] for tk, row in etf_rows.items()
                if row["perfs"].get(field) is not None}
        sorted_tks = sorted(vals, key=lambda t: vals[t], reverse=True)
        return {tk: (i + 1) for i, tk in enumerate(sorted_tks)}

    ranks_1m = rank_col("1M")
    ranks_1w = rank_col("1W")
    ranks_3m = rank_col("3M")
    n = len(etf_rows)

    for tk, row in etf_rows.items():
        r1m = ranks_1m.get(tk, n)
        r1w = ranks_1w.get(tk, n)
        r3m = ranks_3m.get(tk, n)
        score = r1m * 0.70 + r1w * 0.20 + r3m * 0.10
        row["score"] = round(score, 2)
        row["ranks"] = {"1M": r1m, "1W": r1w, "3M": r3m}

    # ── Theme aggregation (Priority-1 ETFs only) ──────────────────────────────
    themes_out = {}
    for theme in ALL_THEMES:
        p1 = [tk for tk, row in etf_rows.items()
              if row["theme"] == theme and row["priority"] == 1]
        all_in_theme = [tk for tk, row in etf_rows.items() if row["theme"] == theme]
        if not p1:
            continue

        # Average performance of P1 ETFs
        def avg_perf(field):
            vals = [etf_rows[tk]["perfs"].get(field)
                    for tk in p1 if etf_rows[tk]["perfs"].get(field) is not None]
            if not vals:
                return None
            return round(sum(vals) / len(vals), 2)

        avg_score = sum(etf_rows[tk]["score"] for tk in p1) / len(p1)

        themes_out[theme] = {
            "perfs": {tf: avg_perf(tf) for tf in ["1D", "1W", "1M", "3M", "YTD"]},
            "score": round(avg_score, 2),
            "etfs_p1": p1,
            "etfs_all": all_in_theme,
            "count": len(all_in_theme),
        }

    # ── Theme-level score rank ────────────────────────────────────────────────
    theme_scores = {th: v["score"] for th, v in themes_out.items()}
    sorted_themes = sorted(theme_scores, key=theme_scores.get)
    for rank, th in enumerate(sorted_themes, 1):
        themes_out[th]["rank"] = rank

    return {
        "etfs":       etf_rows,
        "themes":     themes_out,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }
