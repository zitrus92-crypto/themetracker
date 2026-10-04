"""Laedt Norgate-Daten (TR-adjustiert, daily) und cached sie als Parquet.

Ergebnis in data/norgate_cache/: close.parquet (Datum x Symbol), member.parquet
(Datum x Symbol, bool Russell-3000-Mitglied), missing_theme_tickers.json, symbol_map.json.
"""
import json
import sys
from concurrent.futures import ThreadPoolExecutor

import norgatedata as ng
import pandas as pd

from common import CACHE, INDEX_NAME, START, UNIVERSE_WL, load_themes

CACHE.mkdir(parents=True, exist_ok=True)
if (CACHE / "close.parquet").exists() and "--refresh" not in sys.argv:
    print("Cache vorhanden (--refresh zum Neuladen)")
    sys.exit(0)

wl = ng.watchlist_symbols(UNIVERSE_WL)
themes = load_themes()
theme_syms = sorted({t for v in themes.values() for t in v})

# Theme-Ticker auf Norgate-Symbole mappen (z.B. BRK-B -> BRK.B)
smap, missing = {}, []
for t in theme_syms:
    for cand in (t, t.replace("-", "."), t.replace(".", "-")):
        try:
            if ng.security_name(cand):
                smap[t] = cand
                break
        except Exception:
            pass
    else:
        missing.append(t)
(CACHE / "symbol_map.json").write_text(json.dumps(smap))
(CACHE / "missing_theme_tickers.json").write_text(json.dumps(missing))
print(f"Theme-Ticker: {len(theme_syms)}, unbekannt bei Norgate: {len(missing)}", missing)


def members(sym):
    try:
        c = ng.index_constituent_timeseries(sym, INDEX_NAME, padding_setting=ng.PaddingType.NONE,
                                            start_date=START, timeseriesformat="pandas-dataframe")
        s = c["Index Constituent"].astype("int8") if c is not None and len(c) else None
        return sym, s
    except Exception:
        return sym, None


def px(sym):
    try:
        d = ng.price_timeseries(sym, stock_price_adjustment_setting=ng.StockPriceAdjustmentType.TOTALRETURN,
                                padding_setting=ng.PaddingType.NONE, start_date=START,
                                timeseriesformat="pandas-dataframe")
        return sym, (d["Close"] if d is not None and len(d) else None)
    except Exception:
        return sym, None


mem = {}
for i, s in enumerate(wl):
    sym, m = members(s)
    if m is not None and m.sum() > 0:
        mem[sym] = m
    if i % 1000 == 0:
        print("members", i, len(mem), flush=True)
need = sorted(set(mem) | set(smap.values()))
print("Preisreihen laden:", len(need), flush=True)
cl = {}
for i, s in enumerate(need):
    sym, c = px(s)
    if c is not None:
        cl[sym] = c
    if i % 500 == 0:
        print("px", i, len(cl), flush=True)
close = pd.DataFrame(cl).sort_index()
member = pd.DataFrame(mem).reindex(close.index).fillna(0).astype(bool)
close.to_parquet(CACHE / "close.parquet")
member.to_parquet(CACHE / "member.parquet")
print("fertig", close.shape, member.shape)
