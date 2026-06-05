# GLB 52W Screener — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "🟢 52WH" tab to ThemeTracker that shows 52-week Green-Line Breakout signals (new 52W high today after former high untouched for ≥90 days), with a bar chart of historical daily counts and a table with one-click clipboard copy.

**Architecture:** Python scraper fetches Finviz new-52W-high candidates daily, verifies the 90-day condition via yfinance, and appends results to `docs/glb_history.json` (rolling 95-day window). The frontend fetches this file at load time and renders an SVG bar chart plus a sortable table with per-row copy buttons — no external chart libraries, consistent with the rest of the codebase.

**Tech Stack:** Python 3.11 · `requests` · `yfinance` · vanilla JS/HTML/CSS · GitHub Actions · GitHub Pages

**Spec:** `docs/superpowers/specs/2026-05-21-glb-screener-design.md`

---

## Files Changed

| File | What changes |
|------|-------------|
| `requirements.txt` | Add `yfinance` |
| `scraper.py` | Add `_fetch_glb_candidates()` + `_fetch_glb_signals()` |
| `scrape.py` | Add `fetch_glb()` wrapper; extend `main()` to write `glb_history.json` |
| `.github/workflows/scrape.yml` | Add `docs/glb_history.json` to `git add` line |
| `docs/glb_history.json` | New file — fixture for frontend dev, overwritten by scraper |
| `docs/index.html` | Add "🟢 52WH" top-nav button + `<section data-panel="glb">` with chart + table |
| `docs/static/style.css` | GLB styles: `.glb-chart`, `.glb-ticker-chip`, `.glb-copy-btn`, `.glb-row--selected` |
| `docs/static/app.js` | i18n keys, `_glbData`, `_glbSelectedDate`, `renderGlbTab()`, `renderGlbChart()`, `renderGlbTable()`; extend `loadData()`, `initTabs()`, `applyTranslations()` |

---

## Chunk 1: Backend — scraper, scrape.py, yml, fixture

### Task 1: requirements.txt + scraper.py — GLB signal fetching

**Files:**
- Modify: `requirements.txt`
- Modify: `scraper.py` (append at end)

**Context:** `scraper.py` already imports `json`, `re`, `time`, `requests`. The new functions live at the end of the file. `yfinance` must be added to `requirements.txt` so GitHub Actions installs it.

- [ ] **Step 1: Add yfinance to requirements.txt**

Open `requirements.txt`. It currently contains only `requests`. Add a new line:

```
requests
yfinance
```

- [ ] **Step 2: Add imports to scraper.py**

At the top of `scraper.py`, add two imports after the existing ones:

```python
from datetime import date, timedelta
import yfinance as yf
```

- [ ] **Step 3: Add `_fetch_glb_candidates()` at end of scraper.py**

Append after the last function in the file:

```python
# ── GLB 52W Breakout Screener ─────────────────────────────────────────────

_GLB_SCREENER_URL = (
    "https://finviz.com/screener.ashx?v=111"
    "&f=sh_price_o1,ta_highlow52w_nh&ft=4&o=-volume&r={r}"
)

def _fetch_glb_candidates() -> list[str]:
    """Fetch tickers with new 52W high today from Finviz screener (paginated).

    Uses the standard screener view (v=111) with filters:
      sh_price_o1    — price above $1
      ta_highlow52w_nh — new 52-week high today
    ft=4 restricts to stocks (excludes ETFs on Finviz side).
    Tickers are extracted from quote.ashx links in the HTML.
    """
    tickers = []
    seen = set()
    r = 1
    while True:
        url = _GLB_SCREENER_URL.format(r=r)
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code == 429:
                print(f"  GLB: 429 rate-limit at r={r}, waiting 10s")
                time.sleep(10)
                continue
            resp.raise_for_status()
        except Exception as e:
            print(f"  WARNING: GLB screener fetch failed at r={r}: {e}")
            break

        # Tickers appear in anchors: href="quote.ashx?t=TICKER&..." or "quote.ashx?t=TICKER"
        # Use lookahead for & or " to handle both cases
        found = re.findall(r'quote\.ashx\?t=([A-Z]{1,6})(?=&|")', resp.text)
        # Deduplicate and filter obvious non-stock tickers
        new_on_page = []
        for t in found:
            if t not in seen and "." not in t and len(t) <= 5:
                seen.add(t)
                new_on_page.append(t)
        tickers.extend(new_on_page)

        # Stop when last page (< 20 new) or safety guard reached
        if len(new_on_page) < 20 or r > 500:
            break
        r += 20
        time.sleep(0.5)

    return tickers
```

- [ ] **Step 4: Add `_check_glb()` at end of scraper.py**

Note on yfinance: `yf.Ticker(ticker).history(period="1y")` returns a DataFrame with a
timezone-aware DatetimeIndex. Use `.normalize().date` (or `.tz_localize(None)`) when
comparing to `date.today()`. The `.date()` accessor on a timezone-aware Timestamp works
correctly in pandas — `.index[-1].date()` returns a `datetime.date` object.

```python
_GLB_MIN_DAYS = 90       # Former high must be untouched for at least this many calendar days
_GLB_TOLERANCE = 0.999   # Price within 0.1% of former_high counts as "touching" it


def _check_glb(ticker: str, today: date) -> bool:
    """Return True if ticker satisfies the 52W GLB condition.

    Condition: today is a new 52W high AND the former 52W high was last
    touched (within 0.1% tolerance) at least 90 calendar days ago.

    Uses yf.Ticker.history() which returns a timezone-aware DatetimeIndex.
    .date() on a timezone-aware Timestamp correctly strips tz and returns date.
    """
    try:
        hist = yf.Ticker(ticker).history(period="1y")
        if hist.empty or len(hist) < 20:
            return False

        highs = hist["High"].dropna()
        if len(highs) < 2:
            return False

        # All days except the last bar (today's intraday)
        past_highs = highs.iloc[:-1]
        former_high = float(past_highs.max())
        if former_high <= 0:
            return False

        # Last date where price was at or within 0.1% of the former high
        touched = past_highs[past_highs >= former_high * _GLB_TOLERANCE]
        if touched.empty:
            return False

        # .date() works on both tz-aware and tz-naive pandas Timestamps
        last_touch_date = touched.index[-1].date()
        days_since = (today - last_touch_date).days
        return days_since >= _GLB_MIN_DAYS

    except Exception as e:
        print(f"  WARNING: GLB check failed for {ticker}: {e}")
        return False
```

- [ ] **Step 5: Add `_fetch_glb_signals()` at end of scraper.py**

```python
def _fetch_glb_signals() -> list[str]:
    """Fetch all tickers meeting the 52W GLB condition today.

    Returns a (possibly empty) list of qualifying ticker symbols.
    """
    today = date.today()
    candidates = _fetch_glb_candidates()
    print(f"  GLB candidates from Finviz: {len(candidates)}")

    signals = []
    for ticker in candidates:
        if _check_glb(ticker, today):
            signals.append(ticker)
        time.sleep(0.1)  # Gentle rate-limit for yfinance

    print(f"  GLB signals after {_GLB_MIN_DAYS}-day filter: {len(signals)}")
    return signals
```

- [ ] **Step 6: Smoke-test locally**

```bash
cd "C:\Users\Christoph Baer\claude space\themetracker-web"
python -c "
import scraper
sigs = scraper._fetch_glb_signals()
print('Signals:', sigs)
"
```

Expected: prints a list of 0–50 ticker symbols (exact count depends on market). No exceptions. If market is closed, may return `[]` — that's fine.

- [ ] **Step 7: Commit**

```bash
git add requirements.txt scraper.py
git commit -m "feat: add GLB 52W screener to scraper (yfinance + Finviz candidates)"
```

---

### Task 2: scrape.py — Wire up GLB and write glb_history.json

**Files:**
- Modify: `scrape.py`

**Context:** `scrape.py` already uses `ThreadPoolExecutor(max_workers=3)`. The GLB fetch runs as a 4th parallel task. The history file follows the exact same rolling-append pattern as `history.json` (lines 106–130 of `scrape.py`).

- [ ] **Step 1: Update the module docstring**

Find the docstring at the top of `scrape.py`:
```python
"""
Daily scrape script — run by GitHub Actions.
Fetches Finviz industry data AND Finviz thematic map data in parallel, writes:
  docs/data.json     — industry snapshot (Heatmap, Picks, Top 10 tabs)
  docs/etf_data.json — thematic map snapshot (ETF Themes tab)
  docs/etf_perf.json — ETF performance snapshot (ETFs tab)
  docs/history.json  — compact daily history (Movers tab)
"""
```

Replace with:
```python
"""
Daily scrape script — run by GitHub Actions.
Fetches Finviz industry data AND Finviz thematic map data in parallel, writes:
  docs/data.json       — industry snapshot (Heatmap, Picks, Top 10 tabs)
  docs/etf_data.json   — thematic map snapshot (ETF Themes tab)
  docs/etf_perf.json   — ETF performance snapshot (ETFs tab)
  docs/history.json    — compact daily history (Movers tab)
  docs/glb_history.json — 52W GLB signal history (52WH tab)
"""
```

- [ ] **Step 2: Add `fetch_glb()` wrapper function**

After the existing `fetch_etf_perf()` function, add:

```python
def fetch_glb():
    print("Fetching GLB signals (52W Green-Line Breakout)...")
    return scraper._fetch_glb_signals()
```

- [ ] **Step 3: Add GLB to parallel fetch in `main()`**

Find this block in `main()`:
```python
    scored = None
    etf_payload = None
    etf_perf_payload = None

    with ThreadPoolExecutor(max_workers=3) as pool:
        fut_ind      = pool.submit(fetch_industries)
        fut_etf      = pool.submit(fetch_themes)
        fut_etf_perf = pool.submit(fetch_etf_perf)

        for fut in as_completed([fut_ind, fut_etf, fut_etf_perf]):
            try:
                result = fut.result()
                if fut is fut_ind:
                    scored = result
                elif fut is fut_etf:
                    etf_payload = result
                else:
                    etf_perf_payload = result
            except Exception as e:
                if fut is fut_ind:
                    print(f"  ERROR: Industry fetch failed: {e}")
                elif fut is fut_etf:
                    print(f"  WARNING: ETF themes fetch failed: {e}")
                else:
                    print(f"  WARNING: ETF perf fetch failed: {e}")
```

Replace with:
```python
    scored = None
    etf_payload = None
    etf_perf_payload = None
    glb_payload = None

    with ThreadPoolExecutor(max_workers=4) as pool:
        fut_ind      = pool.submit(fetch_industries)
        fut_etf      = pool.submit(fetch_themes)
        fut_etf_perf = pool.submit(fetch_etf_perf)
        fut_glb      = pool.submit(fetch_glb)

        for fut in as_completed([fut_ind, fut_etf, fut_etf_perf, fut_glb]):
            try:
                result = fut.result()
                if fut is fut_ind:
                    scored = result
                elif fut is fut_etf:
                    etf_payload = result
                elif fut is fut_etf_perf:
                    etf_perf_payload = result
                else:
                    glb_payload = result
            except Exception as e:
                if fut is fut_ind:
                    print(f"  ERROR: Industry fetch failed: {e}")
                elif fut is fut_etf:
                    print(f"  WARNING: ETF themes fetch failed: {e}")
                elif fut is fut_etf_perf:
                    print(f"  WARNING: ETF perf fetch failed: {e}")
                else:
                    print(f"  WARNING: GLB fetch failed: {e}")
```

- [ ] **Step 4: Add glb_history.json write block**

After the `# ── Append to history.json ─` block (after line 130), add:

```python
    # ── Write glb_history.json ────────────────────────────────────────────────
    if glb_payload is not None:  # empty list [] is valid (zero signals today)
        glb_path = DOCS / "glb_history.json"
        glb_history = json.loads(glb_path.read_text()) if glb_path.exists() else []

        # Remove any existing entry for today (idempotent re-runs)
        glb_history = [e for e in glb_history if e["date"] != today]

        glb_history.append({
            "date": today,
            "count": len(glb_payload),
            "tickers": glb_payload,
        })

        glb_history = glb_history[-MAX_HISTORY:]
        glb_path.write_text(
            json.dumps(glb_history, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved glb_history.json ({len(glb_history)} entries, {len(glb_payload)} signals today)")
    else:
        print("  SKIPPED glb_history.json (fetch failed)")
```

- [ ] **Step 5: Smoke-test locally**

```bash
cd "C:\Users\Christoph Baer\claude space\themetracker-web"
python scrape.py
```

Expected output includes:
```
Fetching GLB signals (52W Green-Line Breakout)...
  GLB candidates from Finviz: N
  GLB signals after 90-day filter: M
  Saved glb_history.json (1 entries, M signals today)
```

Also verify `docs/glb_history.json` was created:
```bash
python -c "import json; d=json.load(open('docs/glb_history.json')); print(d)"
```

- [ ] **Step 6: Commit**

```bash
git add scrape.py
git commit -m "feat: wire GLB fetch into scrape.py, write glb_history.json"
```

---

### Task 3: scrape.yml — Add glb_history.json to git add

**Files:**
- Modify: `.github/workflows/scrape.yml`

- [ ] **Step 1: Update the git add line**

Find in `.github/workflows/scrape.yml`:
```yaml
          git add docs/data.json docs/etf_data.json docs/etf_perf.json docs/history.json
```

Replace with:
```yaml
          git add docs/data.json docs/etf_data.json docs/etf_perf.json docs/history.json docs/glb_history.json
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/scrape.yml
git commit -m "ci: add glb_history.json to daily git commit"
```

---

### Task 4: docs/glb_history.json — Create frontend fixture

**Files:**
- Create: `docs/glb_history.json`

**Context:** The frontend needs real-looking data to develop and test against. This fixture will be overwritten by the first real scraper run. Use realistic values — some days with 0 signals, some with 5–20, a few spikes.

- [ ] **Step 1: Create the fixture file**

Create `docs/glb_history.json` with this content (30 entries covering ~6 weeks):

```json
[
{"date":"2026-04-07","count":0,"tickers":[]},
{"date":"2026-04-08","count":3,"tickers":["COST","UNH","TMO"]},
{"date":"2026-04-09","count":1,"tickers":["GS"]},
{"date":"2026-04-10","count":0,"tickers":[]},
{"date":"2026-04-13","count":5,"tickers":["NVDA","MSFT","AAPL","META","GOOGL"]},
{"date":"2026-04-14","count":2,"tickers":["AMZN","V"]},
{"date":"2026-04-15","count":0,"tickers":[]},
{"date":"2026-04-16","count":4,"tickers":["JPM","BAC","WFC","C"]},
{"date":"2026-04-17","count":1,"tickers":["TSLA"]},
{"date":"2026-04-20","count":0,"tickers":[]},
{"date":"2026-04-21","count":7,"tickers":["CRWD","PANW","ZS","FTNT","OKTA","NET","S"]},
{"date":"2026-04-22","count":3,"tickers":["XOM","CVX","COP"]},
{"date":"2026-04-23","count":2,"tickers":["LLY","NVO"]},
{"date":"2026-04-24","count":0,"tickers":[]},
{"date":"2026-04-27","count":6,"tickers":["AMD","AVGO","QCOM","AMAT","LRCX","KLAC"]},
{"date":"2026-04-28","count":1,"tickers":["NFLX"]},
{"date":"2026-04-29","count":4,"tickers":["MA","V","PYPL","SQ"]},
{"date":"2026-04-30","count":0,"tickers":[]},
{"date":"2026-05-01","count":2,"tickers":["ISRG","DXCM"]},
{"date":"2026-05-04","count":8,"tickers":["NVDA","TSM","ASML","MU","ON","MRVL","SMCI","ARM"]},
{"date":"2026-05-05","count":3,"tickers":["UBER","LYFT","DASH"]},
{"date":"2026-05-06","count":0,"tickers":[]},
{"date":"2026-05-07","count":5,"tickers":["COST","TGT","WMT","AMZN","BABA"]},
{"date":"2026-05-08","count":1,"tickers":["FICO"]},
{"date":"2026-05-11","count":0,"tickers":[]},
{"date":"2026-05-12","count":12,"tickers":["NVDA","AAPL","MSFT","GOOGL","META","AMZN","TSLA","CRWD","PANW","AMD","AVGO","TSM"]},
{"date":"2026-05-13","count":4,"tickers":["GLD","SLV","GDX","NEM"]},
{"date":"2026-05-14","count":2,"tickers":["CELH","MNST"]},
{"date":"2026-05-19","count":7,"tickers":["NVDA","CRWD","PANW","META","XOM","GS","UNH"]},
{"date":"2026-05-21","count":14,"tickers":["NVDA","AAPL","CRWD","META","PANW","XOM","GS","UNH","COST","JPM","V","MA","MSFT","AMD"]}
]
```

- [ ] **Step 2: Commit**

```bash
git add docs/glb_history.json
git commit -m "data: add GLB history fixture for frontend development"
```

---

## Chunk 2: Frontend — HTML, CSS, JS

### Task 5: index.html — 52WH nav button + panel skeleton

**Files:**
- Modify: `docs/index.html`

**Context:** The top-nav currently has 3 buttons (Industry, Themes, ETFs). The new button goes last. The panel goes after the `<section class="section-etfperf ...">` block, before `</main>`.

- [ ] **Step 1: Add "🟢 52WH" button to top-nav**

Find the top-nav section:
```html
    <button class="top-btn" data-top="etfperf" data-i18n="topEtfs">&#128202; ETFs</button>
```

Add immediately after it:
```html
    <button class="top-btn" data-top="glb" data-i18n="topGlb">🟢 52WH</button>
```

- [ ] **Step 2: Add GLB panel before `</main>`**

Find `  </main>` at the end of the file. Insert immediately before it:

```html
    <!-- GLB 52W Screener tab -->
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

- [ ] **Step 3: Commit**

```bash
git add docs/index.html
git commit -m "feat: add 52WH nav button and panel skeleton to index.html"
```

---

### Task 6: style.css — GLB styles

**Files:**
- Modify: `docs/static/style.css` (append at end)

- [ ] **Step 1: Append GLB styles at end of style.css**

```css
/* ── GLB 52W Breakout Screener ───────────────────────────────────────────── */
.glb-header { margin-bottom: 12px; }
.glb-chart  { margin: 4px 0 20px; position: relative; }
.glb-chart svg { width: 100%; height: 110px; display: block; overflow: visible; }

.glb-bar       { fill: #1a3a1a; cursor: pointer; transition: fill 0.1s; }
.glb-bar:hover { fill: #22c55e; }
.glb-bar--today    { fill: #16a34a; }
.glb-bar--selected { fill: #4ade80; }
.glb-bar--zero  { fill: #111; cursor: default; }

.glb-chart-tooltip {
  position: absolute; pointer-events: none;
  background: #1e2a1e; border: 1px solid #22c55e;
  color: #4ade80; font-size: 0.78rem; padding: 4px 8px;
  border-radius: 4px; white-space: nowrap; display: none;
}

.glb-ticker-chip {
  display: inline-block; background: #0d2a0d; color: #4ade80;
  padding: 2px 7px; border-radius: 4px; font-size: 0.8rem;
  font-weight: 600; margin: 1px 2px; text-decoration: none;
  transition: background 0.1s;
}
.glb-ticker-chip:hover { background: #14532d; }
.glb-ticker-more {
  display: inline-block; color: var(--text-dim);
  font-size: 0.78rem; padding: 2px 4px;
}

.glb-copy-btn {
  background: transparent; border: 1px solid var(--border);
  color: var(--text-dim); border-radius: 4px;
  padding: 3px 8px; font-size: 0.8rem; cursor: pointer;
}
.glb-copy-btn:hover  { color: var(--text); border-color: #8b949e; }
.glb-copy-btn--done  { color: #4ade80; border-color: #4ade80; }
.glb-copy-btn--empty { opacity: 0.3; cursor: default; }

.glb-row--selected { background: #0a1f0a !important; }
.glb-row--today td:first-child { color: #4ade80; font-weight: 700; }
```

- [ ] **Step 2: Commit**

```bash
git add docs/static/style.css
git commit -m "feat: add GLB screener CSS"
```

---

### Task 7: app.js — Complete GLB frontend

**Files:**
- Modify: `docs/static/app.js`

**Context:** This is the largest task. All additions follow existing patterns in the file. Key patterns to follow:
- i18n keys go in both `I18N.de` and `I18N.en` objects (at the top of the file)
- State variables are declared alongside `_etfPerfData` (search for `let _etfPerfData = null;`)
- `renderGlbTab()` is called lazily in `initTabs()` (same as `renderEtfPerfTab`)
- `loadData()` adds `glb_history.json` to the `Promise.all` fetch
- `applyTranslations()` re-renders if data is loaded
- **`esc()` already exists in app.js** (added in a previous feature) — do NOT add it again

---

- [ ] **Step 1: Add i18n keys to I18N.de**

Find the end of the `I18N.de` block (look for `hintEtfPerf:` key). Add after it:

```javascript
    topGlb:       "🟢 52WH",
    glbTitle:     "52W Breakout Screener",
    glbColDate:   "Datum",
    glbColCount:  "Signale",
    glbColTickers:"Ticker",
    glbNoData:    "GLB-Daten werden geladen oder sind noch nicht verfügbar.",
    hintGlb:      "52W Green-Line Breakout: Aktie macht heute neues 52-Wochen-Hoch, nachdem das vorherige Hoch mindestens 90 Tage lang nicht erreicht wurde.\nUniverse: Finviz (Preis > $1, kein ETF).\nKlick auf Balken = Tages-Detail · 📋 = Tickerliste für TradingView.",
```

- [ ] **Step 2: Add i18n keys to I18N.en**

Find the end of the `I18N.en` block (look for `hintEtfPerf:` key). Add after it:

```javascript
    topGlb:       "🟢 52WH",
    glbTitle:     "52W Breakout Screener",
    glbColDate:   "Date",
    glbColCount:  "Signals",
    glbColTickers:"Tickers",
    glbNoData:    "GLB data is loading or not yet available.",
    hintGlb:      "52W Green-Line Breakout: stock makes a new 52-week high today after the former high was untouched for at least 90 days.\nUniverse: Finviz (price > $1, no ETFs).\nClick a bar = day detail · 📋 = ticker list for TradingView.",
```

- [ ] **Step 3: Add state variables**

Find the line `let _etfPerfData = null;` and add after it:

```javascript
let _glbData         = null;   // Array of {date, count, tickers} from glb_history.json
let _glbSelectedDate = null;   // Date string of bar/row the user clicked
```

- [ ] **Step 4: Add `renderGlbChart()` function**

Find the line `function renderEtfPerfTab(data) {` by searching for that exact string. Insert the entire `renderGlbChart` block and the `// ── GLB` comment **immediately before** that line:

```javascript
// ── GLB 52W Screener ─────────────────────────────────────────────────────

function renderGlbChart(data) {
  const container = document.getElementById("glb-chart");
  if (!container) return;
  if (!data || !data.length) {
    container.innerHTML = `<p class="empty-msg">${t("glbNoData")}</p>`;
    return;
  }

  const W = 800, H = 90, PAD_L = 4, PAD_R = 4, PAD_TOP = 8;
  const n = data.length;
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barW = Math.max(1, Math.floor((W - PAD_L - PAD_R) / n) - 1);
  const gap  = Math.max(1, Math.floor((W - PAD_L - PAD_R - barW * n) / Math.max(n - 1, 1)));

  let bars = "";
  data.forEach((entry, i) => {
    const x = PAD_L + i * (barW + gap);
    const barH = entry.count > 0 ? Math.max(2, Math.round((entry.count / maxCount) * (H - PAD_TOP))) : 1;
    const y = H - barH;
    const today = new Date().toISOString().slice(0, 10);
    const cls = entry.count === 0 ? "glb-bar glb-bar--zero"
              : entry.date === today ? "glb-bar glb-bar--today"
              : entry.date === _glbSelectedDate ? "glb-bar glb-bar--selected"
              : "glb-bar";
    bars += `<rect class="${cls}" x="${x}" y="${y}" width="${barW}" height="${barH}"
      data-date="${entry.date}" data-count="${entry.count}"/>`;
  });

  // Month label lines
  let labels = "";
  let lastMonth = "";
  data.forEach((entry, i) => {
    const month = entry.date.slice(0, 7); // "YYYY-MM"
    if (month !== lastMonth) {
      lastMonth = month;
      const x = PAD_L + i * (barW + gap);
      const label = new Date(entry.date + "T12:00:00Z")
        .toLocaleString(_lang === "de" ? "de-DE" : "en-US", { month: "short" });
      labels += `<text x="${x}" y="${H + 14}" font-size="9" fill="#8b949e">${label}</text>`;
    }
  });

  container.innerHTML = `
    <div class="glb-chart-tooltip" id="glb-tooltip"></div>
    <svg viewBox="0 0 ${W} ${H + 18}" preserveAspectRatio="none">
      <line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#30363d" stroke-width="1"/>
      ${bars}
      ${labels}
    </svg>`;

  // Bar interaction
  const tooltip = document.getElementById("glb-tooltip");
  container.querySelectorAll(".glb-bar").forEach(rect => {
    rect.addEventListener("click", () => {
      _glbSelectedDate = rect.dataset.date;
      renderGlbChart(data);
      renderGlbTable(data);
      // Scroll selected row into view
      const sel = document.querySelector(".glb-row--selected");
      if (sel) sel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    rect.addEventListener("mouseenter", e => {
      const count = rect.dataset.count;
      const label = _lang === "de" ? `${rect.dataset.date}: ${count} Signal${count != 1 ? "e" : ""}` : `${rect.dataset.date}: ${count} signal${count != 1 ? "s" : ""}`;
      tooltip.textContent = label;
      tooltip.style.display = "block";
    });
    rect.addEventListener("mousemove", e => {
      const r = container.getBoundingClientRect();
      tooltip.style.left = (e.clientX - r.left + 8) + "px";
      tooltip.style.top  = (e.clientY - r.top  - 28) + "px";
    });
    rect.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  });
}
```

- [ ] **Step 5: Add `renderGlbTable()` function**

Insert immediately after `renderGlbChart()` (before `function renderEtfPerfTab`):

```javascript
function renderGlbTable(data) {
  const tbody = document.getElementById("glb-body");
  if (!tbody) return;
  if (!data || !data.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-msg">${t("glbNoData")}</td></tr>`;
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  // Sort descending by date
  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));

  const rows = sorted.map(entry => {
    const isToday    = entry.date === today;
    const isSelected = entry.date === _glbSelectedDate;
    const rowCls = [
      isSelected ? "glb-row--selected" : "",
      isToday    ? "glb-row--today"    : "",
    ].filter(Boolean).join(" ");

    // Ticker chips — show first 5, then "+N"
    let tickerHtml = "—";
    if (entry.tickers && entry.tickers.length > 0) {
      const MAX_SHOW = 5;
      const shown = entry.tickers.slice(0, MAX_SHOW);
      const rest  = entry.tickers.length - MAX_SHOW;
      tickerHtml = shown.map(t =>
        `<a class="glb-ticker-chip" href="https://finviz.com/quote.ashx?t=${esc(t)}" target="_blank" rel="noopener">${esc(t)}</a>`
      ).join("") + (rest > 0 ? `<span class="glb-ticker-more">+${rest}</span>` : "");
    }

    const hasTickrs = entry.tickers && entry.tickers.length > 0;
    const copyBtnCls = "glb-copy-btn" + (hasTickrs ? "" : " glb-copy-btn--empty");
    const copyTitle = _lang === "de" ? "Tickerliste in Zwischenablage kopieren" : "Copy ticker list to clipboard";

    return `<tr class="${rowCls}" data-date="${esc(entry.date)}">
      <td>${esc(entry.date)}</td>
      <td style="text-align:center;font-weight:${entry.count > 0 ? "700" : "400"};color:${entry.count > 0 ? "#4ade80" : "var(--text-dim)"}">${entry.count}</td>
      <td style="text-align:left">${tickerHtml}</td>
      <td style="text-align:center"><button class="${copyBtnCls}" data-date="${esc(entry.date)}" title="${copyTitle}"${hasTickrs ? "" : " disabled"}>📋</button></td>
    </tr>`;
  });

  tbody.innerHTML = rows.join("");

  // Copy button handlers
  tbody.querySelectorAll(".glb-copy-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const entryDate = btn.dataset.date;
      const entry = data.find(d => d.date === entryDate);
      if (!entry || !entry.tickers.length) return;
      navigator.clipboard.writeText(entry.tickers.join(",")).then(() => {
        btn.textContent = "✓";
        btn.classList.add("glb-copy-btn--done");
        setTimeout(() => { btn.textContent = "📋"; btn.classList.remove("glb-copy-btn--done"); }, 2000);
        showToast(_lang === "de" ? `${entry.tickers.length} Ticker kopiert!` : `${entry.tickers.length} tickers copied!`);
      });
    });
  });
}
```

- [ ] **Step 6: Add `renderGlbTab()` orchestrator**

Insert immediately after `renderGlbTable()`:

```javascript
function renderGlbTab(data) {
  const errEl = document.getElementById("glb-error");
  if (!data || !data.length) {
    if (errEl) { errEl.textContent = t("glbNoData"); errEl.classList.remove("hidden"); }
    return;
  }
  if (errEl) errEl.classList.add("hidden");
  renderGlbChart(data);
  renderGlbTable(data);
}
```

- [ ] **Step 7: Extend `initTabs()` to handle the glb button**

Find the `initTabs()` function. It has a top-btn click handler with `if/else if` branches for `industry`, `themes`, `etfperf`. Find the `else if` branch for `etfperf`:

```javascript
      } else if (btn.dataset.top === "etfperf") {
        subNav.classList.add("hidden");
        showPanel("etfperf");
        if (_etfPerfData) renderEtfPerfTab(_etfPerfData);
      }
```

Add a new `else if` branch immediately after it:

```javascript
      } else if (btn.dataset.top === "glb") {
        subNav.classList.add("hidden");
        showPanel("glb");
        if (_glbData) renderGlbTab(_glbData);
      }
```

- [ ] **Step 8: Extend `applyTranslations()` to re-render GLB on language switch**

Find in `applyTranslations()` the line:
```javascript
  if (_etfPerfData) renderEtfPerfTab(_etfPerfData);
```

Add immediately after it:
```javascript
  if (_glbData) renderGlbTab(_glbData);
```

- [ ] **Step 9: Extend `loadData()` to fetch glb_history.json**

Find the `Promise.all` block in `loadData()` by searching for the string `fetch("etf_perf.json"`. Replace the entire destructuring + Promise.all block — the array order in destructuring MUST match the array order in Promise.all exactly:

```javascript
    const [dataRes, histRes, etfRes, etfPerfRes, glbRes] = await Promise.all([
      fetch("data.json" + bust),        // → dataRes    (index 0)
      fetch("history.json" + bust),     // → histRes    (index 1)
      fetch("etf_data.json" + bust),    // → etfRes     (index 2)
      fetch("etf_perf.json" + bust),    // → etfPerfRes (index 3)
      fetch("glb_history.json" + bust), // → glbRes     (index 4) ← new
    ]);
```

Then find the end of the `try` block (after the `etfPerfRes` handling). Add before the `catch`:

```javascript
    if (glbRes.ok) {
      _glbData = await glbRes.json();
      if (document.querySelector(".top-btn[data-top='glb']")?.classList.contains("active")) {
        renderGlbTab(_glbData);
      }
    } else {
      const errEl = document.getElementById("glb-error");
      if (errEl) { errEl.textContent = t("glbNoData"); errEl.classList.remove("hidden"); }
    }
```

- [ ] **Step 10: Verify in browser**

Open the live site (after push) or serve locally. 
- ✅ "🟢 52WH" button appears in top nav
- ✅ Clicking it shows the chart (bars, green) and the table (30 rows from fixture)
- ✅ Chart bar click highlights bar + scrolls to row in table
- ✅ Hover on bar shows tooltip with date + count
- ✅ 📋 button copies tickers + shows toast
- ✅ Language switch (DE↔EN) updates column headers and tooltip text
- ✅ Today's row has green date (if fixture includes today's date)

- [ ] **Step 11: Final commit + push**

```bash
git add docs/static/app.js
git commit -m "feat: GLB screener frontend — chart, table, i18n, loadData"
git push origin main
```
