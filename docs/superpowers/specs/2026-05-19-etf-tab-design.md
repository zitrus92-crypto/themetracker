# ETF Tab — Design Spec

**Goal:** Add a new "ETFs" top-level tab showing 32 key ETFs (US Sectors, Commodities, Crypto, Broad Market) with the same columns as Industry/Themes: timeframes (1D, 1W, 1M, 3M, YTD), Score, Accel, and Trend sparkline.

**User story:** Christoph wants a flat, sortable ETF overview to see sector rotation, commodity momentum, and crypto trends at a glance — comparable to the Industry Heatmap but for ETF-level instruments.

---

## Architecture

### Data flow

```
GitHub Actions (daily)
  └─ scrape.py
       └─ scraper.py: _fetch_etf_perf()
            ├─ 5× GET finviz.com/map.ashx?t=etf&st={d1,w1,w4,w13,ytd}
            ├─ extract FinvizInitCanvas → initialPerf → nodes
            ├─ filter to ETF_UNIVERSE tickers
            └─ write docs/etf_perf.json

GitHub Pages (static)
  └─ app.js: loadData()
       ├─ fetch etf_perf.json → _etfPerfData
       └─ on "ETFs" tab activation: renderEtfPerfTab(_etfPerfData)
            ├─ computeAccel(Object.entries(data.etfs))  ← existing helper
            ├─ renderSparkline()                         ← existing helper
            └─ perfClass() / fmtPct()                   ← existing helpers
```

### Files changed

| File | Change |
|------|--------|
| `scraper.py` | Add `ETF_UNIVERSE` list + `_fetch_etf_perf()` function |
| `scrape.py` | Call `_fetch_etf_perf()` and write `docs/etf_perf.json` |
| `docs/etf_perf.json` | New output file (alongside existing `etf_data.json` — do NOT touch that file) |
| `.github/workflows/scrape.yml` | Add `docs/etf_perf.json` to the `git add` line |
| `docs/index.html` | Add "ETFs" button (`data-top="etfperf"`) to top-nav; add `<section class="tab-panel hidden" data-panel="etfperf">` with table skeleton |
| `docs/static/app.js` | Add `renderEtfPerfTab()`, `_etfPerfData` state, `loadData()` fetch, i18n keys, extend `initTabs()` for `etfperf` |
| `docs/static/style.css` | Category badge colors for the 4 ETF categories |

**Important:** `docs/etf_perf.json` is a new, separate file. The existing `docs/etf_data.json` (used by the Themes tab) must not be renamed or touched.

---

## ETF Universe (32 tickers)

Hardcoded in `scraper.py` as `ETF_UNIVERSE`:

```python
ETF_UNIVERSE = [
    # Broad Market (5)
    {"ticker": "SPY",  "name": "SPDR S&P 500 ETF",              "category": "Broad Market"},
    {"ticker": "QQQ",  "name": "Invesco Nasdaq 100 ETF",         "category": "Broad Market"},
    {"ticker": "IWM",  "name": "iShares Russell 2000 ETF",       "category": "Broad Market"},
    {"ticker": "RSP",  "name": "Invesco S&P 500 Equal Weight",   "category": "Broad Market"},
    {"ticker": "QQQE", "name": "Direxion Nasdaq 100 Equal Wt",   "category": "Broad Market"},
    # US Sectors — SPDR Select Sector ETFs (11)
    {"ticker": "XLK",  "name": "Technology Select Sector",       "category": "US Sectors"},
    {"ticker": "XLV",  "name": "Health Care Select Sector",      "category": "US Sectors"},
    {"ticker": "XLF",  "name": "Financial Select Sector",        "category": "US Sectors"},
    {"ticker": "XLI",  "name": "Industrial Select Sector",       "category": "US Sectors"},
    {"ticker": "XLY",  "name": "Consumer Discret Select Sector", "category": "US Sectors"},
    {"ticker": "XLP",  "name": "Consumer Staples Select Sector", "category": "US Sectors"},
    {"ticker": "XLE",  "name": "Energy Select Sector",           "category": "US Sectors"},
    {"ticker": "XLU",  "name": "Utilities Select Sector",        "category": "US Sectors"},
    {"ticker": "XLB",  "name": "Materials Select Sector",        "category": "US Sectors"},
    {"ticker": "XLC",  "name": "Communication Svcs Select Sect", "category": "US Sectors"},
    {"ticker": "XLRE", "name": "Real Estate Select Sector",      "category": "US Sectors"},
    # Commodities (9)
    {"ticker": "GLD",  "name": "SPDR Gold Shares",               "category": "Commodities"},
    {"ticker": "SLV",  "name": "iShares Silver Trust",           "category": "Commodities"},
    {"ticker": "GDX",  "name": "VanEck Gold Miners ETF",         "category": "Commodities"},
    {"ticker": "GDXJ", "name": "VanEck Junior Gold Miners",      "category": "Commodities"},
    {"ticker": "USO",  "name": "United States Oil Fund",         "category": "Commodities"},
    {"ticker": "UNG",  "name": "United States Natural Gas Fund", "category": "Commodities"},
    {"ticker": "PDBC", "name": "Invesco Optimum Yield Cmdty",    "category": "Commodities"},
    {"ticker": "DBA",  "name": "Invesco DB Agriculture Fund",    "category": "Commodities"},
    {"ticker": "CPER", "name": "United States Copper Index Fund","category": "Commodities"},
    # Crypto (7)
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

Score and Accel are **not** stored in JSON — computed in the frontend:
- **Score** = weighted rank `1M×70% + 1W×20% + 3M×10%` across all 32 ETFs (lower = better, rank 1 = strongest)
- **Accel** = `rank_3M − rank_1M` via `computeAccel(Object.entries(data.etfs))` — positive = fresh momentum (First Flag zone)

---

## Scraper: `_fetch_etf_perf()`

**Verified:** `finviz.com/map.ashx?t=etf&st=w4` returns HTML containing `FinvizInitCanvas(...)` with `initialPerf: {"nodes": {"SPY": 3.41, ...}}`. The `"nodes"` wrapper is present for ETFs (differs from Themes which has a flat `{"SPY": 3.41}` structure).

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
        # Same FinvizInitCanvas pattern as _fetch_theme_map(), but nodes are wrapped
        canvas_match = re.search(r"FinvizInitCanvas\((.*?)\);", resp.text, re.DOTALL)
        if not canvas_match:
            print(f"  WARNING: FinvizInitCanvas not found for ETF tf={tf_label}")
            continue
        args = canvas_match.group(1)
        perf_match = re.search(r'initialPerf\s*:\s*\{"nodes":\{([^}]+)\}', args)
        if not perf_match:
            print(f"  WARNING: initialPerf nodes not found for ETF tf={tf_label}")
            continue
        nodes = json.loads("{" + perf_match.group(1) + "}")
        for ticker in KNOWN_TICKERS:
            val = nodes.get(ticker)
            if val is not None:
                perfs_by_ticker[ticker][tf_label] = round(float(val), 2)
        time.sleep(0.5)

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

**Columns:** `#` · `ETF` (ticker link + name + category badge) · `1D` · `1W` · `1M` · `3M` · `YTD` · `Score ▲` · `Accel` · `Trend`

**Sorting:** click any column header — same pattern as `renderEtfThemes()`.

**ETF cell layout:**
```
[SPY]  SPDR S&P 500 ETF  [Broad Market]
```
- Ticker is `<a href="https://finviz.com/quote.ashx?t=SPY" target="_blank">SPY</a>` (bold)
- Name in subdued text
- Category badge: colored pill using `ETF_CATEGORY_COLORS`

**ETF_CATEGORY_COLORS** (define in `app.js` alongside `THEME_COLORS`):
```javascript
const ETF_CATEGORY_COLORS = {
  "Broad Market": { bg: "#0d1f3a", fg: "#60a5fa" },  // blue
  "US Sectors":   { bg: "#1a1f0d", fg: "#a3e635" },  // lime
  "Commodities":  { bg: "#2d1a00", fg: "#fb923c" },  // orange
  "Crypto":       { bg: "#1a0d2d", fg: "#c084fc" },  // purple
};
```

**Accel tooltip:** same DE/EN i18n as Themes tab — reuse `hintThemeAccel` key.

**Sparkline:** `renderSparkline(row.perfs, accel)` — no changes to the function needed.

**Empty state:** if `data.etfs` is empty or `etf_perf.json` fails to load, show same pattern as Themes: `<tr><td colspan="11">...</td></tr>`.

---

## Navigation

Top-nav becomes **three buttons**:
```html
<button class="top-btn active" data-top="industry">Industry</button>
<button class="top-btn" data-top="themes">📈 Themes</button>
<button class="top-btn" data-top="etfperf">📊 ETFs</button>
```

Panel: `<section class="tab-panel hidden" data-panel="etfperf">...</section>`

`initTabs()` extension — add `etfperf` case to the existing top-btn click handler:
```javascript
} else if (btn.dataset.top === "etfperf") {
  subNav.classList.add("hidden");
  showPanel("etfperf");
  if (_etfPerfData) renderEtfPerfTab(_etfPerfData);
}
```

`renderEtfPerfTab()` is called **lazily** on first activation (same as `renderEtfTab()` pattern). `_etfPerfData` is populated in `loadData()` by fetching `etf_perf.json`.

---

## i18n Keys (add to both I18N.de and I18N.en)

```javascript
// DE
topEtfs:          "📊 ETFs",
etfPerfTitle:     "ETF Performance",
etfPerfColEtf:    "ETF",
etfPerfNoData:    "ETF-Daten werden geladen oder sind noch nicht verfügbar.",
hintEtfPerf:      "32 ETFs in 4 Kategorien: Broad Market, US Sectors, Commodities, Crypto.\nScore = gewichteter Rang (1M×70%+1W×20%+3M×10%). Accel = 3M-Rang minus 1M-Rang.\nKlick auf Ticker öffnet Finviz-Chart.",

// EN
topEtfs:          "📊 ETFs",
etfPerfTitle:     "ETF Performance",
etfPerfColEtf:    "ETF",
etfPerfNoData:    "ETF data is loading or not yet available.",
hintEtfPerf:      "32 ETFs in 4 categories: Broad Market, US Sectors, Commodities, Crypto.\nScore = weighted rank (1M×70%+1W×20%+3M×10%). Accel = 3M rank minus 1M rank.\nClick any ticker to open Finviz chart.",
```

---

## GitHub Actions

In `.github/workflows/scrape.yml`, update the `git add` line from:
```yaml
git add docs/data.json docs/etf_data.json docs/history.json
```
to:
```yaml
git add docs/data.json docs/etf_data.json docs/etf_perf.json docs/history.json
```

---

## Error Handling

- If `etf_perf.json` fetch fails: `_etfPerfData` stays `null`; tab shows empty state with `etfPerfNoData` message
- If a ticker's perf value is `null` in Finviz data: store as `null`, display as `—`
- If a ticker is entirely absent from Finviz map (e.g. QQQE has thin coverage): store empty `perfs: {}`, display all `—`
- If `FinvizInitCanvas` not found for a timeframe: log warning, skip that timeframe for all tickers

---

## Out of Scope

- No ticker count badge (ETFs are individual instruments)
- No copy-ticker-list button
- No Bubble Chart / Matrix view (can be added later)
- No sub-navigation
