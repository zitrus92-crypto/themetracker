# 52W Green-Line Breakout Screener — Design Spec

**Goal:** Add a "🟢 52WH" top-level tab to ThemeTracker that shows stocks making a 52-week Green-Line Breakout today, with a historical chart of daily signal counts and a detailed table with one-click clipboard copy for TradingView watchlists.

**User story:** Christoph wants to identify stocks that make a new 52-week high today after the old 52-week high was untouched for at least 3 months — the GLB (Green-Line Breakout) concept applied to the 52W timeframe. He wants to see how many such signals occur per day historically, and copy any day's ticker list into TradingView.

---

## GLB Signal Definition

A stock qualifies on a given day if **all** of the following are true:

1. **New 52W high today**: Today's intraday high > all highs of the prior 51 weeks + current week (Finviz pre-filters this).
2. **Former high is old**: The last trading day where price reached or came within 0.1% of the former 52W high is **≥ 90 calendar days** before today.
3. **Stock, not ETF**: Finviz `ind_` filter excludes exchange-traded products; residual ETF tickers filtered in Python.

The 0.1% tolerance on "reaching the former high" handles floating-point precision in OHLC data and prevents false negatives when a stock brushed the old high repeatedly.

---

## Data Flow

```
GitHub Actions (daily, after US close)
  └─ scrape.py
       └─ scraper._fetch_glb_signals()
            ├─ 1. Finviz screener: new 52W high, price > $1, stock-only
            │        URL: finviz.com/screener.ashx?v=111&f=sh_price_o1,ta_highlow52w_nh&ft=4
            │        Paginate r=1,21,41,… until no more rows
            │        Parse FinvizInitScreener → extract ticker symbols
            │        Filter: remove tickers that contain "." or are known ETF-like (len>5)
            ├─ 2. yfinance: for each candidate ticker
            │        yf.download(ticker, period="1y", auto_adjust=True, progress=False)
            │        former_high = hist['High'][:-1].max()
            │        last_touch = last index where hist['High'][:-1] >= former_high * 0.999
            │        glb = (today - last_touch).days >= 90
            └─ 3. Return list of qualifying tickers
       └─ scrape.py appends entry to docs/glb_history.json
            {"date": "YYYY-MM-DD", "count": N, "tickers": [...]}
            Rolls to MAX_HISTORY = 95 entries (same as history.json)

GitHub Pages (static)
  └─ app.js loadData()
       ├─ fetch glb_history.json → _glbData
       └─ on "52WH" tab activation: renderGlbTab(_glbData)
            ├─ renderGlbChart()  — SVG bar chart, click = highlight day
            └─ renderGlbTable() — date-desc table with copy buttons
```

---

## Files Changed

| File | Change |
|------|--------|
| `requirements.txt` | Add `yfinance` |
| `scraper.py` | Add `_fetch_glb_signals()` |
| `scrape.py` | Call `_fetch_glb_signals()`, manage `docs/glb_history.json` |
| `.github/workflows/scrape.yml` | Add `docs/glb_history.json` to `git add` line |
| `docs/glb_history.json` | New output file (created on first scraper run) |
| `docs/index.html` | Add "🟢 52WH" `<button>` to top-nav; add `<section data-panel="glb">` with chart div + table skeleton |
| `docs/static/app.js` | Add i18n keys, `_glbData`, `_glbSelectedDate`, `renderGlbTab()`, `renderGlbChart()`, `renderGlbTable()`; extend `loadData()` and `initTabs()`; extend `applyTranslations()` |
| `docs/static/style.css` | GLB tab styles: `.glb-chart`, `.glb-bar`, `.glb-bar--today`, `.glb-bar--selected`, `.glb-ticker-chip` |

---

## glb_history.json Schema

```json
[
  {
    "date": "2026-05-21",
    "count": 14,
    "tickers": ["NVDA", "AAPL", "CRWD", "META", "PANW", "XOM", "GS", "UNH", "COST", "JPM", "V", "MA", "MSFT", "AMD"]
  },
  {
    "date": "2026-05-20",
    "count": 7,
    "tickers": ["META", "PANW", "GS", "UNH", "COST", "JPM", "V"]
  }
]
```

- Array ordered oldest→newest (append new entries at end)
- `count` == `len(tickers)` always
- Maximum 95 entries (rolling window)
- Empty tickers list is valid (market holiday, zero signals)

---

## Scraper: `_fetch_glb_signals()`

```python
import yfinance as yf
from datetime import date, timedelta

FINVIZ_SCREENER_URL = (
    "https://finviz.com/screener.ashx?v=111"
    "&f=sh_price_o1,ta_highlow52w_nh&ft=4&o=-volume&r={r}"
)
GLB_MIN_DAYS = 90  # Former high must be untouched for at least this many calendar days
GLB_TOLERANCE = 0.999  # A high within 0.1% of former_high counts as "touching" it

def _fetch_glb_candidates() -> list[str]:
    """Fetch tickers with new 52W high from Finviz screener (paginated)."""
    tickers = []
    r = 1
    while True:
        url = FINVIZ_SCREENER_URL.format(r=r)
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        # Parse FinvizInitScreener([columns], [rows])
        match = re.search(r"FinvizInitScreener\((\[.*?\]),\s*(\[.*?\])\)", resp.text, re.DOTALL)
        if not match:
            break
        cols = json.loads(match.group(1))
        rows = json.loads(match.group(2))
        if not rows:
            break
        try:
            ticker_idx = cols.index("Ticker")
        except ValueError:
            break
        for row in rows:
            t = row[ticker_idx]
            # Exclude obvious ETF-like tickers (contain ".", length > 5, or known fund suffixes)
            if "." not in t and len(t) <= 5:
                tickers.append(t)
        if len(rows) < 20:  # Last page
            break
        r += 20
        time.sleep(0.5)
    return tickers

def _check_glb(ticker: str, today: date) -> bool:
    """Return True if ticker meets the 52W GLB condition."""
    try:
        hist = yf.download(ticker, period="1y", auto_adjust=True, progress=False)
        if hist.empty or len(hist) < 20:
            return False
        highs = hist["High"]
        if len(highs) < 2:
            return False
        # All days except today
        past_highs = highs.iloc[:-1]
        former_high = past_highs.max()
        # Last day that touched (within tolerance) the former high
        touched = past_highs[past_highs >= former_high * GLB_TOLERANCE]
        if touched.empty:
            return False
        last_touch_date = touched.index[-1].date()
        days_since = (today - last_touch_date).days
        return days_since >= GLB_MIN_DAYS
    except Exception as e:
        print(f"  WARNING: GLB check failed for {ticker}: {e}")
        return False

def _fetch_glb_signals() -> list[str]:
    """Return list of tickers meeting the 52W GLB condition today."""
    today = date.today()
    candidates = _fetch_glb_candidates()
    print(f"  GLB candidates from Finviz: {len(candidates)}")
    signals = []
    for ticker in candidates:
        if _check_glb(ticker, today):
            signals.append(ticker)
        time.sleep(0.1)  # Rate limit yfinance
    print(f"  GLB signals after 90-day filter: {len(signals)}")
    return signals
```

---

## scrape.py Changes

Add a `fetch_glb()` wrapper and extend `main()`:

```python
def fetch_glb():
    print("Fetching GLB signals...")
    return scraper._fetch_glb_signals()
```

In `main()`, add to the `ThreadPoolExecutor` as a 4th worker (alongside industries, themes, ETF perf):

```python
fut_glb = pool.submit(fetch_glb)
```

After futures complete, write `glb_history.json`:

```python
if glb_payload is not None:  # empty list is valid (zero signals)
    glb_path = DOCS / "glb_history.json"
    history = json.loads(glb_path.read_text()) if glb_path.exists() else []
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    history = [e for e in history if e["date"] != today]  # idempotent
    history.append({"date": today, "count": len(glb_payload), "tickers": glb_payload})
    history = history[-MAX_HISTORY:]
    glb_path.write_text(json.dumps(history, ensure_ascii=False, separators=(",", ":")))
    print(f"  Saved glb_history.json ({len(history)} entries, {len(glb_payload)} signals today)")
```

Also update the module docstring to include `docs/glb_history.json`.

---

## Frontend: Tab Structure

**index.html nav button** (after ETFs button):
```html
<button class="top-btn" data-top="glb" data-i18n="topGlb">🟢 52WH</button>
```

**index.html panel** (after ETF Perf section):
```html
<section class="section-glb tab-panel hidden" data-panel="glb">
  <div class="glb-header">
    <div class="heading-group">
      <h2 data-i18n="glbTitle">🟢 52W Breakout Screener</h2>
      <span class="section-hint" data-hint-key="hintGlb">i</span>
    </div>
  </div>
  <div id="glb-error" class="error hidden"></div>
  <div id="glb-chart" class="glb-chart"></div>
  <div class="table-scroll">
    <table id="glb-table">
      <thead>
        <tr>
          <th data-i18n="glbColDate">Datum</th>
          <th data-i18n="glbColCount" style="text-align:center">Signale</th>
          <th data-i18n="glbColTickers" style="text-align:left">Ticker</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="glb-body"></tbody>
    </table>
  </div>
</section>
```

---

## Frontend: i18n Keys

```javascript
// DE
topGlb:       "🟢 52WH",
glbTitle:     "52W Breakout Screener",
glbColDate:   "Datum",
glbColCount:  "Signale",
glbColTickers:"Ticker",
glbNoData:    "GLB-Daten werden geladen oder sind noch nicht verfügbar.",
hintGlb:      "52W Green-Line Breakout: Aktie macht heute neues 52-Wochen-Hoch, nachdem das vorherige Hoch mindestens 90 Tage lang nicht erreicht wurde.\nUniverse: Finviz (Preis > $1, kein ETF).\nKlick auf Balken = Tages-Detail · 📋 = Tickerliste für TradingView.",

// EN
topGlb:       "🟢 52WH",
glbTitle:     "52W Breakout Screener",
glbColDate:   "Date",
glbColCount:  "Signals",
glbColTickers:"Tickers",
glbNoData:    "GLB data is loading or not yet available.",
hintGlb:      "52W Green-Line Breakout: stock makes a new 52-week high today after the former high was untouched for at least 90 days.\nUniverse: Finviz (price > $1, no ETFs).\nClick a bar = day detail · 📋 = ticker list for TradingView.",
```

---

## Frontend: Chart (`renderGlbChart`)

Pure SVG bar chart, no external libraries:

- One `<rect>` per day in the history, width proportional to container, height proportional to count
- Green fill: `#22c55e` for normal days, `#4ade80` with border for today
- Selected day (from click): brighter fill + bottom-border highlight
- Click handler: sets `_glbSelectedDate` → re-renders table to highlight that row and scroll it into view
- X-axis: show approximate month labels from available dates
- Y-axis: max signal count shown as reference line
- Tooltip on hover: `"YYYY-MM-DD: N Signale"`
- Empty state: if `_glbData` is empty/null, show centered `glbNoData` message

---

## Frontend: Table (`renderGlbTable`)

- Rows sorted date descending
- **Selected row** (matches `_glbSelectedDate`): highlighted background `#0d2a0d`
- **Date cell**: `YYYY-MM-DD`, bold + green if today; bold if selected
- **Count cell**: centered, bold green if > 0
- **Tickers cell**: up to 5 chips shown inline; remainder shown as "+N" muted badge; each chip is `<a href="finviz.com/quote.ashx?t=TICKER">` opening in new tab
- **Copy button**: `📋` — copies full comma-separated ticker list to clipboard + toast message

Copy handler reuses existing `showToast()` + `navigator.clipboard.writeText()`.

---

## CSS

```css
/* GLB Chart */
.glb-chart { margin: 16px 0 20px; position: relative; }
.glb-chart svg { width: 100%; height: 100px; display: block; }

/* GLB Table */
.glb-ticker-chip {
  display: inline-block; background: #0d2a0d; color: #4ade80;
  padding: 2px 7px; border-radius: 4px; font-size: 0.8rem;
  font-weight: 600; margin: 1px 2px; text-decoration: none;
}
.glb-ticker-chip:hover { background: #14532d; }
.glb-row--selected { background: #0d2a0d !important; }
.glb-copy-btn {
  background: transparent; border: 1px solid var(--border);
  color: var(--text-dim); border-radius: 4px;
  padding: 3px 8px; font-size: 0.8rem; cursor: pointer;
}
.glb-copy-btn:hover { color: var(--text); border-color: #8b949e; }
```

---

## Error Handling

- If `glb_history.json` fetch fails: `_glbData` stays `null`; panel shows `glbNoData`
- If a day has `count: 0`: renders as a zero-height bar (1px stub for visibility); table row shows "—" in tickers column and disabled copy button
- If yfinance fails for a ticker: skip it with a warning print; don't crash the scraper
- If Finviz screener returns no results (holiday/weekend): `_fetch_glb_signals()` returns `[]`, which is a valid entry for that day

---

## Out of Scope

- No sub-navigation or filtering within the GLB tab
- No "former high" price display (just count + tickers)
- No sorting in the table (always date descending)
- No minimum volume filter (Finviz already orders by `-volume`)
- No backtesting or performance tracking of GLB signals
