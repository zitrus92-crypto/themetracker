# ETF Tab — Design Spec

**Goal:** Add a new "ETFs" top-level tab showing ~34 key ETFs (US Sectors, Commodities, Crypto, Broad Market) with the same columns as Industry/Themes: timeframes (1D, 1W, 1M, 3M, YTD), Score, Accel, and Trend sparkline.

**User story:** Christoph wants a flat, sortable ETF overview to see sector rotation, commodity momentum, and crypto trends at a glance — comparable to the Industry Heatmap but for ETF-level instruments.

---

## Architecture

### Data flow

```
GitHub Actions (daily)
  └─ scrape.py
       └─ scraper.py: _fetch_etf_perf()
            ├─ 5× GET finviz.com/map.ashx?t=etf&st={d1,w1,w4,w13,ytd}
            ├─ extract initialPerf JSON from <script> tag
            ├─ filter to ETF_UNIVERSE tickers
            └─ write docs/etf_perf.json

GitHub Pages (static)
  └─ app.js: loadData()
       └─ fetch etf_perf.json
            └─ renderEtfPerfTab(data)
                 ├─ computeAccel(entries)   ← existing helper
                 ├─ renderSparkline()       ← existing helper
                 └─ perfClass() / fmtPct()  ← existing helpers
```

### Files changed

| File | Change |
|------|--------|
| `scraper.py` | Add `ETF_UNIVERSE` list + `_fetch_etf_perf()` function |
| `scrape.py` | Call `_fetch_etf_perf()` and write `docs/etf_perf.json` |
| `docs/etf_perf.json` | New output file (committed by Actions) |
| `docs/index.html` | Add "ETFs" button to top-nav; add `<section data-panel="etfperf">` with table skeleton |
| `docs/static/app.js` | Add `renderEtfPerfTab()`, update `loadData()`, add i18n keys |
| `docs/static/style.css` | Category badge styles (reuse existing `.etf-theme-badge` pattern) |

---

## ETF Universe (~34 tickers)

Hardcoded in `scraper.py` as `ETF_UNIVERSE`:

```python
ETF_UNIVERSE = [
    # Broad Market
    {"ticker": "SPY",  "name": "SPDR S&P 500 ETF",              "category": "Broad Market"},
    {"ticker": "QQQ",  "name": "Invesco Nasdaq 100 ETF",         "category": "Broad Market"},
    {"ticker": "IWM",  "name": "iShares Russell 2000 ETF",       "category": "Broad Market"},
    {"ticker": "RSP",  "name": "Invesco S&P 500 Equal Weight",   "category": "Broad Market"},
    {"ticker": "QQQE", "name": "Direxion Nasdaq 100 Equal Wt",   "category": "Broad Market"},
    # US Sectors (SPDR)
    {"ticker": "XLK",  "name": "Technology",                     "category": "US Sectors"},
    {"ticker": "XLV",  "name": "Health Care",                    "category": "US Sectors"},
    {"ticker": "XLF",  "name": "Financials",                     "category": "US Sectors"},
    {"ticker": "XLI",  "name": "Industrials",                    "category": "US Sectors"},
    {"ticker": "XLY",  "name": "Consumer Discretionary",         "category": "US Sectors"},
    {"ticker": "XLP",  "name": "Consumer Staples",               "category": "US Sectors"},
    {"ticker": "XLE",  "name": "Energy",                         "category": "US Sectors"},
    {"ticker": "XLU",  "name": "Utilities",                      "category": "US Sectors"},
    {"ticker": "XLB",  "name": "Materials",                      "category": "US Sectors"},
    {"ticker": "XLC",  "name": "Communication Services",         "category": "US Sectors"},
    {"ticker": "XLRE", "name": "Real Estate",                    "category": "US Sectors"},
    # Commodities
    {"ticker": "GLD",  "name": "SPDR Gold Shares",               "category": "Commodities"},
    {"ticker": "SLV",  "name": "iShares Silver Trust",           "category": "Commodities"},
    {"ticker": "GDX",  "name": "VanEck Gold Miners ETF",         "category": "Commodities"},
    {"ticker": "GDXJ", "name": "VanEck Junior Gold Miners",      "category": "Commodities"},
    {"ticker": "USO",  "name": "United States Oil Fund",         "category": "Commodities"},
    {"ticker": "UNG",  "name": "United States Natural Gas Fund", "category": "Commodities"},
    {"ticker": "PDBC", "name": "Invesco Optimum Yield Cmdty",    "category": "Commodities"},
    {"ticker": "DBA",  "name": "Invesco DB Agriculture Fund",    "category": "Commodities"},
    {"ticker": "CPER", "name": "United States Copper Index Fund","category": "Commodities"},
    # Crypto
    {"ticker": "IBIT", "name": "iShares Bitcoin Trust",          "category": "Crypto"},
    {"ticker": "FBTC", "name": "Fidelity Wise Origin Bitcoin",   "category": "Crypto"},
    {"ticker": "GBTC", "name": "Grayscale Bitcoin Trust",        "category": "Crypto"},
    {"ticker": "ARKB", "name": "ARK 21Shares Bitcoin ETF",       "category": "Crypto"},
    {"ticker": "BITB", "name": "Bitwise Bitcoin ETF",            "category": "Crypto"},
    {"ticker": "ETHA", "name": "iShares Ethereum Trust",         "category": "Crypto"},
    {"ticker": "BITO", "name": "ProShares Bitcoin Strategy ETF", "category": "Crypto"},
]
```

---

## etf_perf.json Schema

```json
{
  "fetched_at": "2026-05-19T12:00:00Z",
  "etfs": {
    "SPY": {
      "name": "SPDR S&P 500 ETF",
      "category": "Broad Market",
      "perfs": {
        "1D":  0.54,
        "1W":  1.23,
        "1M":  3.41,
        "3M":  8.91,
        "YTD": 12.10
      }
    }
  }
}
```

Score and Accel are **not** stored in JSON — they are computed in the frontend from the perfs data, identical to the Themes tab:
- **Score** = weighted rank `1M×70% + 1W×20% + 3M×10%` across all ETFs in the list (lower = better, rank 1 = strongest)
- **Accel** = `rank_3M − rank_1M` (positive = fresh momentum, First Flag zone)

---

## Scraper: `_fetch_etf_perf()`

```python
ETF_TF_MAP = {"1D": "d1", "1W": "w1", "1M": "w4", "3M": "w13", "YTD": "ytd"}
KNOWN_TICKERS = {e["ticker"] for e in ETF_UNIVERSE}

def _fetch_etf_perf() -> dict:
    """Fetch ETF performance across 5 timeframes from Finviz map.ashx."""
    perfs_by_ticker: dict[str, dict] = {e["ticker"]: {} for e in ETF_UNIVERSE}

    for tf_label, st_param in ETF_TF_MAP.items():
        url = f"https://finviz.com/map.ashx?t=etf&st={st_param}"
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        # Extract initialPerf JSON from script tag
        m = re.search(r'initialPerf\s*:\s*(\{"nodes":\{[^}]+\})', resp.text)
        if not m:
            continue
        nodes = json.loads(m.group(1))["nodes"]
        for ticker in KNOWN_TICKERS:
            if ticker in nodes and nodes[ticker] is not None:
                perfs_by_ticker[ticker][tf_label] = round(nodes[ticker], 2)
        time.sleep(0.5)

    # Build output
    result = {}
    for etf in ETF_UNIVERSE:
        t = etf["ticker"]
        result[t] = {
            "name": etf["name"],
            "category": etf["category"],
            "perfs": perfs_by_ticker.get(t, {}),
        }
    return result
```

---

## Frontend: Table

**Columns:** `#` · `ETF` (ticker link + name + category badge) · `1D` · `1W` · `1M` · `3M` · `YTD` · `Score` · `Accel` · `Trend`

**Sorting:** click any column header — same pattern as `renderEtfThemes()` (ascending/descending toggle, active column highlighted).

**ETF cell:**
```
[SPY]  SPDR S&P 500 ETF  [Broad Market]
```
- Ticker is a link → `https://finviz.com/quote.ashx?t=SPY`
- Category badge uses same color palette as THEME_COLORS but new `ETF_CATEGORY_COLORS` map for the 4 categories

**Performance cells:** same `perfClass()` / `fmtPct()` as rest of app.

**Accel tooltip:** same DE/EN i18n tooltip as Themes tab.

**Sparkline:** `renderSparkline(row.perfs, accel)` — no changes needed.

---

## Navigation

Top-nav becomes three buttons:
```
[ Industry ]  [ 📈 Themes ]  [ 📊 ETFs ]
```

When "ETFs" is active: sub-nav is hidden (no sub-tabs needed).

---

## i18n Keys (DE + EN)

```javascript
topEtfs:       "📊 ETFs",            // nav button label (same in both)
etfPerfTitle:  "ETF Performance",    // section heading
etfPerfCatBroadMarket: "Broad Market",
etfPerfCatSectors:     "US Sectors",
etfPerfCatCommodities: "Commodities",
etfPerfCatCrypto:      "Crypto",
```

---

## Error Handling

- If `etf_perf.json` fails to load: show same "not yet loaded" empty state as other tabs
- If a ticker's perf value is `null` in initialPerf: store as `null`, display as `—` (same as other tabs)
- If a ticker is entirely missing from Finviz map data: skip that timeframe, display `—`

---

## Out of Scope

- No ticker count badge (ETFs are individual instruments)
- No copy-ticker-list button
- No Bubble Chart / Matrix view (can be added later)
- No sub-theme chips equivalent
