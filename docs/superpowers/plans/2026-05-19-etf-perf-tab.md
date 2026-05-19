# ETF Perf Tab Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third top-level "📊 ETFs" tab displaying 32 key ETFs (Broad Market, US Sectors, Commodities, Crypto) with performance data across 5 timeframes, Score, Accel, and Trend sparkline — sortable by any column.

**Architecture:** The scraper fetches ETF performance data from Finviz's `map.ashx?t=etf` endpoint (5 sequential timeframe requests), writes `docs/etf_perf.json`. The frontend fetches it alongside existing JSON files in `loadData()`, computes Score (weighted rank) and Accel client-side reusing existing helpers `computeAccel()` and `renderSparkline()`, and renders `renderEtfPerfTab()` lazily on first tab activation. Score and Accel are intentionally not stored in the JSON — they are computed live in the browser.

**Tech Stack:** Python (requests, re, json, time) for scraper; vanilla JavaScript, HTML, CSS for frontend; GitHub Actions for scheduling.

---

## File Structure

| File | Change |
|------|--------|
| `scraper.py` | Append `ETF_UNIVERSE`, `ETF_TF_MAP`, `KNOWN_TICKERS`, `_fetch_etf_perf()` |
| `scrape.py` | Add `fetch_etf_perf()` wrapper + `etf_perf_payload` var + write `docs/etf_perf.json` |
| `.github/workflows/scrape.yml` | Add `docs/etf_perf.json` to the `git add` line |
| `docs/index.html` | Add ETFs top-btn (`data-top="etfperf"`) + `<section data-panel="etfperf">` with table skeleton |
| `docs/static/style.css` | Add `.etf-cat-badge`, `.etf-ticker-link`, `.etf-cell-name` CSS classes |
| `docs/static/app.js` | Add i18n keys, `ETF_CATEGORY_COLORS`, `_etfPerfData`/`_etfPerfSort` state, `computeEtfPerfScore()`, `renderEtfPerfTab()`, `initEtfPerfSortHeaders()`, extend `initTabs()` / `applyTranslations()` / `loadData()` |

**Critical:** `docs/etf_perf.json` is a new file. The existing `docs/etf_data.json` (Themes tab) must not be touched.

---

## Chunk 1: Backend

### Task 1: scraper.py — ETF Universe and _fetch_etf_perf()

**Files:**
- Modify: `scraper.py` (append to end)

**Context:** `scraper.py` already imports `json`, `re`, `time`, `requests` and defines `HEADERS`. The existing `_fetch_one_timeframe()` scrapes `map?t=themes` with a flat `initialPerf: {node: value}` structure. For ETFs via `map.ashx?t=etf`, the structure has an extra wrapper: `initialPerf: {"nodes": {ticker: value}}`. The URL also differs: `map.ashx` (not `map`).

- [ ] **Step 1: Append ETF constants and _fetch_etf_perf() to scraper.py**

Add the following at the very end of `scraper.py`:

```python
# ── ETF Performance Tab ───────────────────────────────────────────────────────

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

ETF_TF_MAP = {"1D": "d1", "1W": "w1", "1M": "w4", "3M": "w13", "YTD": "ytd"}
KNOWN_TICKERS = {e["ticker"] for e in ETF_UNIVERSE}


def _fetch_etf_perf() -> dict:
    """Fetch ETF performance across 5 timeframes from Finviz map.ashx.

    URL pattern:  https://finviz.com/map.ashx?t=etf&st={d1,w1,w4,w13,ytd}
    Data pattern: FinvizInitCanvas(..., initialPerf: {"nodes": {"SPY": 3.41, ...}}, ...)
    Note: the "nodes" wrapper is unique to ETF maps (themes map has flat initialPerf).
    """
    perfs_by_ticker: dict[str, dict] = {e["ticker"]: {} for e in ETF_UNIVERSE}

    for tf_label, st_param in ETF_TF_MAP.items():
        url = f"https://finviz.com/map.ashx?t=etf&st={st_param}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
        except Exception as e:
            print(f"  WARNING: ETF fetch failed for tf={tf_label}: {e}")
            continue

        canvas_match = re.search(r"FinvizInitCanvas\((.*?)\);", resp.text, re.DOTALL)
        if not canvas_match:
            print(f"  WARNING: FinvizInitCanvas not found for ETF tf={tf_label}")
            continue
        args = canvas_match.group(1)
        # Key difference from themes: wrapped in {"nodes": {...}}
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
            "name":     etf["name"],
            "category": etf["category"],
            "perfs":    perfs_by_ticker.get(t, {}),
        }
    return result
```

- [ ] **Step 2: Verify the import is clean and all constants are defined**

```bash
python -c "from scraper import _fetch_etf_perf, ETF_UNIVERSE, ETF_TF_MAP, KNOWN_TICKERS; print(f'{len(ETF_UNIVERSE)} ETFs defined, {len(KNOWN_TICKERS)} known tickers, {len(ETF_TF_MAP)} timeframes'); assert len(ETF_UNIVERSE) == 32 and len(KNOWN_TICKERS) == 32 and len(ETF_TF_MAP) == 5"
```

Expected output: `32 ETFs defined, 32 known tickers, 5 timeframes` (no errors)

- [ ] **Step 3: Commit**

```bash
git add scraper.py
git commit -m "feat: add ETF_UNIVERSE and _fetch_etf_perf() to scraper"
```

---

### Task 2: scrape.py — Wire up ETF perf fetch and write etf_perf.json

**Files:**
- Modify: `scrape.py`

**Context:** `scrape.py` currently runs `fetch_industries` and `fetch_themes` in parallel with a 2-worker pool. Add `fetch_etf_perf` as a third parallel task. The output schema for `etf_perf.json` is `{"fetched_at": "...", "etfs": {ticker: {name, category, perfs: {1D,1W,1M,3M,YTD}}}}`. Do NOT touch `etf_data.json` write logic.

- [ ] **Step 1: Add fetch_etf_perf() wrapper function in scrape.py**

After the `fetch_themes()` function (around line 29), add:

```python
def fetch_etf_perf():
    print("Fetching Finviz ETF performance data...")
    result = scraper._fetch_etf_perf()
    print(f"  {len(result)} ETFs fetched.")
    return result
```

- [ ] **Step 2: Add etf_perf_payload variable and third future to the parallel fetch block**

Find the parallel fetch block in `main()`:
```python
    scored = None
    etf_payload = None

    with ThreadPoolExecutor(max_workers=2) as pool:
        fut_ind = pool.submit(fetch_industries)
        fut_etf = pool.submit(fetch_themes)

        for fut in as_completed([fut_ind, fut_etf]):
            try:
                result = fut.result()
                if fut is fut_ind:
                    scored = result
                else:
                    etf_payload = result
            except Exception as e:
                if fut is fut_ind:
                    print(f"  ERROR: Industry fetch failed: {e}")
                else:
                    print(f"  WARNING: ETF fetch failed: {e}")
```

Replace it with:

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

- [ ] **Step 3: Add write block for etf_perf.json after the etf_data.json write block**

`scrape.py` already has `from datetime import datetime, timezone` at the top — these are already imported.

Find the end of the `# ── Write etf_data.json` section. It ends with:
```python
    else:
        print("  SKIPPED etf_data.json (fetch failed)")
```
Add the following block immediately after that line:

```python
    # ── Write etf_perf.json ───────────────────────────────────────────────────
    if etf_perf_payload:
        payload_out = {
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "etfs": etf_perf_payload,
        }
        (DOCS / "etf_perf.json").write_text(
            json.dumps(payload_out, ensure_ascii=False, separators=(",", ":"))
        )
        print(f"  Saved etf_perf.json ({len(etf_perf_payload)} ETFs)")
    else:
        print("  SKIPPED etf_perf.json (fetch failed)")
```

- [ ] **Step 4: Verify scrape.py parses without syntax errors**

```bash
python -c "import scrape; print('OK')"
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add scrape.py
git commit -m "feat: fetch ETF perf and write docs/etf_perf.json in scrape.py"
```

---

### Task 3: GitHub Actions — add etf_perf.json to git add

**Files:**
- Modify: `.github/workflows/scrape.yml`

**Context:** The daily workflow commits updated data files. Without adding `docs/etf_perf.json` to the `git add` line, the file written by `scrape.py` will never be committed to the repo and the frontend will never receive real data.

- [ ] **Step 1: Update the git add line**

Find in `.github/workflows/scrape.yml`:
```yaml
          git add docs/data.json docs/etf_data.json docs/history.json
```

Replace with:
```yaml
          git add docs/data.json docs/etf_data.json docs/etf_perf.json docs/history.json
```

- [ ] **Step 2: Verify the replacement succeeded**

```bash
grep "etf_perf.json" .github/workflows/scrape.yml
```

Expected output: a line containing `git add docs/data.json docs/etf_data.json docs/etf_perf.json docs/history.json`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/scrape.yml
git commit -m "ci: add etf_perf.json to daily git add in scrape.yml"
```

---

## Chunk 2: Frontend HTML + CSS

### Task 4: index.html — ETFs nav button and panel skeleton

**Files:**
- Modify: `docs/index.html`

**Context:** The `<nav class="top-nav">` currently has two buttons: `data-top="industry"` and `data-top="themes"`. The new button uses `data-top="etfperf"` and `data-i18n="topEtfs"`.

The panel table has 10 columns: `#` · `ETF` · `1D` · `1W` · `1M` · `3M` · `YTD` · `Score ▲` · `Accel` · `Trend`. Column headers use `data-etfperfcol` attributes for sort detection (same pattern as `data-etfcol` on the Themes table). The Trend column has no `data-etfperfcol` because sparklines are not sortable.

- [ ] **Step 1: Add ETFs button to top-nav**

Find in `docs/index.html`:
```html
    <button class="top-btn" data-top="themes" data-i18n="tabEtfs">&#128200; Themes</button>
```

Add after it (on a new line):
```html
    <button class="top-btn" data-top="etfperf" data-i18n="topEtfs">&#128202; ETFs</button>
```

- [ ] **Step 2: Add etfperf section panel**

Find the closing `</main>` tag. Add just before it:

```html
    <!-- ETF Perf tab -->
    <section class="section-etfperf tab-panel hidden" data-panel="etfperf">
      <div class="etf-header">
        <div class="heading-group">
          <h2 data-i18n="etfPerfTitle">ETF Performance</h2>
          <span class="section-hint" data-hint-key="hintEtfPerf">i</span>
        </div>
      </div>
      <div id="etfperf-error" class="error hidden"></div>
      <div class="table-scroll">
        <table id="etfperf-table">
          <thead>
            <tr>
              <th>#</th>
              <th data-etfperfcol="etf" data-i18n="etfPerfColEtf" style="text-align:left">ETF</th>
              <th data-etfperfcol="1D">1D</th>
              <th data-etfperfcol="1W">1W</th>
              <th data-etfperfcol="1M">1M</th>
              <th data-etfperfcol="3M">3M</th>
              <th data-etfperfcol="YTD">YTD</th>
              <th data-etfperfcol="score" data-i18n="colScore">Score ▲</th>
              <th data-etfperfcol="accel" data-i18n="colAccel">Accel</th>
              <th data-i18n="colTrend">Trend</th>
            </tr>
          </thead>
          <tbody id="etfperf-body"></tbody>
        </table>
      </div>
    </section>
```

- [ ] **Step 3: Visual check**

Open `docs/index.html` in a browser (file:// or local server). The top nav should show three buttons: "Industry" | "📈 Themes" | "📊 ETFs". The ETFs button should be clickable (panel is empty until JS is wired up in Task 6).

- [ ] **Step 4: Commit**

```bash
git add docs/index.html
git commit -m "feat: add ETFs top-btn and etfperf panel skeleton to index.html"
```

---

### Task 5: style.css — ETF category badge and cell styles

**Files:**
- Modify: `docs/static/style.css`

**Context:** The existing `.etf-theme-badge` class is a clickable pill used for theme links. The new `.etf-cat-badge` is a non-clickable pill for the category column. Background and foreground colors are applied inline via JS using `ETF_CATEGORY_COLORS`. We also need `.etf-ticker-link` for the bold ticker `<a>` and `.etf-cell-name` for the muted name text beneath the ticker.

- [ ] **Step 1: Add styles after the .etf-theme-badge block**

Find in `docs/static/style.css`:
```css
.etf-theme-badge {
  display: inline-block; font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 4px; white-space: nowrap;
  cursor: pointer; transition: filter 0.15s;
}
a.etf-theme-badge:hover { filter: brightness(1.25); }
```

After that block, add:

```css
/* ETF Perf tab — category pill badge (non-clickable) */
.etf-cat-badge {
  display: inline-block; font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 10px; white-space: nowrap;
  vertical-align: middle; margin-left: 6px;
}

/* ETF Perf tab — bold ticker link */
.etf-ticker-link {
  font-weight: 700; color: var(--accent); text-decoration: none;
}
.etf-ticker-link:hover { text-decoration: underline; }

/* ETF Perf tab — muted name line below ticker */
.etf-cell-name {
  font-size: 11px; color: var(--text-dim); display: block; margin-top: 1px;
}
```

- [ ] **Step 2: Visual verification (optional but recommended)**

Open the browser DevTools (F12 → Elements). Search for `.etf-cat-badge`, `.etf-ticker-link`, `.etf-cell-name` in the Styles panel — they should appear after the `.etf-theme-badge` block. (The tab itself won't render the badges until Chunk 3 JS is wired up.)

- [ ] **Step 3: Commit**

```bash
git add docs/static/style.css
git commit -m "feat: add etf-cat-badge, etf-ticker-link, etf-cell-name styles"
```

---

## Chunk 3: Frontend JavaScript

### Task 6: app.js — Complete ETF Perf Tab

**Files:**
- Modify: `docs/static/app.js`

**Context for this task:**
- This is a static vanilla-JS file — no build step, no test runner. "Testing" = open browser, check console, verify visually.
- **Existing helpers to reuse (do not rewrite):**
  - `computeAccel(entries)` — takes `[[key, {perfs:{1M,3M,...}}], ...]`, returns `{key: number}` where positive = fresh momentum
  - `renderSparkline(perfs, accel)` — takes `{1D,1W,1M,3M,YTD}` and accel number, returns SVG string
  - `perfClass(pct)` / `fmtPct(v)` — color class and formatted percentage string
  - `showPanel(panelId)` / `initTabs()` — existing navigation system
- **Sort pattern:** `data-etfperfcol` attribute on `<th>` (same as `data-etfcol` on Themes table). Default sort: `score` ascending (lower = better). Timeframe columns default to descending (highest first). `etf` (ticker name) defaults to ascending.
- **Score formula:** `rank_1M × 70% + rank_1W × 20% + rank_3M × 10%` — lower = better, rank 1 = strongest ETF.
- **Accel formula:** `computeAccel()` already handles this — `rank_3M - rank_1M`.
- **`data-i18n` on `<th>` works correctly** — only `<button>` elements had issues. Use it freely on table headers.

#### Step A — i18n keys

- [ ] **Step 1: Add i18n keys to I18N.de**

Find the last key in `I18N.de` (currently `vizMatrix: "⊞ Matrix",`). Add after it, before the closing `},` of the `de:` block:

```javascript
    topEtfs:          "📊 ETFs",
    etfPerfTitle:     "ETF Performance",
    etfPerfColEtf:    "ETF",
    etfPerfNoData:    "ETF-Daten werden geladen oder sind noch nicht verfügbar.",
    hintEtfPerf:      "32 ETFs in 4 Kategorien: Broad Market, US Sectors, Commodities, Crypto.\nScore = gewichteter Rang (1M×70%+1W×20%+3M×10%). Accel = 3M-Rang minus 1M-Rang.\nKlick auf Ticker öffnet Finviz-Chart.",
```

- [ ] **Step 2: Add i18n keys to I18N.en**

Find the last key in `I18N.en` (currently `vizMatrix: "⊞ Matrix",`). Add after it, before the closing `},` of the `en:` block:

```javascript
    topEtfs:          "📊 ETFs",
    etfPerfTitle:     "ETF Performance",
    etfPerfColEtf:    "ETF",
    etfPerfNoData:    "ETF data is loading or not yet available.",
    hintEtfPerf:      "32 ETFs in 4 categories: Broad Market, US Sectors, Commodities, Crypto.\nScore = weighted rank (1M×70%+1W×20%+3M×10%). Accel = 3M rank minus 1M rank.\nClick any ticker to open Finviz chart.",
```

#### Step B — ETF_CATEGORY_COLORS and state variables

- [ ] **Step 3: Add ETF_CATEGORY_COLORS constant**

Find the comment `// Theme badge colours for all 40 Finviz themes` above `const THEME_COLORS`. Add before it:

```javascript
// ETF Perf tab — category badge colors
const ETF_CATEGORY_COLORS = {
  "Broad Market": { bg: "#0d1f3a", fg: "#60a5fa" },  // blue
  "US Sectors":   { bg: "#1a1f0d", fg: "#a3e635" },  // lime
  "Commodities":  { bg: "#2d1a00", fg: "#fb923c" },  // orange
  "Crypto":       { bg: "#1a0d2d", fg: "#c084fc" },  // purple
};

```

- [ ] **Step 4: Add _etfPerfData and _etfPerfSort state variables**

Find:
```javascript
// ── ETF Themes Tab ────────────────────────────────────────────────────────────

let _etfData       = null;
```

Add after the existing ETF Themes state block (after `let _themeVizView  = "table"; // "table" | "bubble" | "matrix"`):

```javascript
// ── ETF Perf Tab ──────────────────────────────────────────────────────────────
let _etfPerfData = null;
let _etfPerfSort = { col: "score", dir: 1 };
```

#### Step C — Extend initTabs()

- [ ] **Step 5: Add etfperf case to initTabs()**

Find the else branch in `initTabs()` that handles Themes:
```javascript
      } else {
        subNav.classList.add("hidden");
        showPanel("etfs");
        if (_etfData) renderEtfTab();
      }
```

Replace with (note: this converts the catch-all `else` into two explicit `else if` branches — correct and intentional):
```javascript
      } else if (btn.dataset.top === "themes") {
        subNav.classList.add("hidden");
        showPanel("etfs");
        if (_etfData) renderEtfTab();
      } else if (btn.dataset.top === "etfperf") {
        subNav.classList.add("hidden");
        showPanel("etfperf");
        if (_etfPerfData) renderEtfPerfTab(_etfPerfData);
      }
```

#### Step D — Add renderEtfPerfTab() and helpers

- [ ] **Step 6: Add computeEtfPerfScore(), renderEtfPerfTab(), and initEtfPerfSortHeaders()**

Find the comment `// ── ETF Themes Tab ───`. Add the following block immediately before it (so it sits between the existing code and the ETF Themes section):

```javascript
// ── ETF Perf Tab ──────────────────────────────────────────────────────────────

// Score = rank_1M×70% + rank_1W×20% + rank_3M×10% (lower = better, rank 1 = strongest)
function computeEtfPerfScore(entries) {
  const n = entries.length;
  const sorted1M = [...entries].sort(([,a],[,b]) => (b.perfs["1M"] ?? -999) - (a.perfs["1M"] ?? -999));
  const sorted1W = [...entries].sort(([,a],[,b]) => (b.perfs["1W"] ?? -999) - (a.perfs["1W"] ?? -999));
  const sorted3M = [...entries].sort(([,a],[,b]) => (b.perfs["3M"] ?? -999) - (a.perfs["3M"] ?? -999));
  const rank1M = {}, rank1W = {}, rank3M = {};
  sorted1M.forEach(([k], i) => rank1M[k] = i + 1);
  sorted1W.forEach(([k], i) => rank1W[k] = i + 1);
  sorted3M.forEach(([k], i) => rank3M[k] = i + 1);
  const scores = {};
  entries.forEach(([k]) => {
    scores[k] = +(( (rank1M[k] ?? n) * 0.70 + (rank1W[k] ?? n) * 0.20 + (rank3M[k] ?? n) * 0.10 ).toFixed(2));
  });
  return scores;
}

function renderEtfPerfTab(data) {
  if (!data || !data.etfs) return;
  const tbody = document.getElementById("etfperf-body");
  if (!tbody) return;

  const entries = Object.entries(data.etfs);
  if (!entries.length) {
    // Note: spec says colspan="11" but that is a spec error — the table has 10 columns
    tbody.innerHTML = `<tr><td colspan="10" class="empty-msg">${t("etfPerfNoData")}</td></tr>`;
    return;
  }

  const accelMap = computeAccel(entries);
  const scoreMap = computeEtfPerfScore(entries);

  // Sort rows
  const { col, dir } = _etfPerfSort;
  const sorted = [...entries].sort(([ka, a], [kb, b]) => {
    if (col === "etf")   return dir * ka.localeCompare(kb);
    if (col === "score") return dir * (scoreMap[ka] - scoreMap[kb]);
    if (col === "accel") return dir * (accelMap[ka] - accelMap[kb]);
    const va = a.perfs[col] ?? -Infinity;
    const vb = b.perfs[col] ?? -Infinity;
    return dir * (va - vb);
  });

  const rows = sorted.map(([ticker, row], idx) => {
    const accel     = accelMap[ticker] ?? 0;
    const score     = scoreMap[ticker] ?? 0;
    const accelSign = accel > 0 ? "+" : "";
    const accelClass = accel >= 10 ? "accel-fresh"
                     : accel <= -10 ? "accel-fading"
                     : "accel-neutral";
    const accelTooltip = t("hintThemeAccel");

    const catColors = ETF_CATEGORY_COLORS[row.category] || { bg: "#1a1a2a", fg: "#8b949e" };
    const catBadge  = `<span class="etf-cat-badge" style="background:${catColors.bg};color:${catColors.fg}">${row.category}</span>`;
    const tickerUrl = `https://finviz.com/quote.ashx?t=${ticker}`;
    const tickerLink = `<a href="${tickerUrl}" target="_blank" rel="noopener" class="etf-ticker-link">${ticker}</a>`;
    const etfCell   = `${tickerLink}${catBadge}<span class="etf-cell-name">${row.name}</span>`;

    const perfCells = ["1D","1W","1M","3M","YTD"].map(tf => {
      const v = row.perfs[tf] ?? null;
      return `<td class="${perfClass(v)}">${fmtPct(v)}</td>`;
    }).join("");

    return `<tr>
      <td class="rank-num">${idx + 1}</td>
      <td style="min-width:220px;text-align:left">${etfCell}</td>
      ${perfCells}
      <td>${score.toFixed(1)}</td>
      <td class="${accelClass}" title="${accelTooltip}" style="cursor:help;font-weight:700">${accelSign}${accel}</td>
      <td>${renderSparkline(row.perfs, accel)}</td>
    </tr>`;
  });

  tbody.innerHTML = rows.join("");

  // Update sort arrows on column headers
  document.querySelectorAll("#etfperf-table th[data-etfperfcol]").forEach(th => {
    const c = th.dataset.etfperfcol;
    const isActive = _etfPerfSort.col === c;
    const arrow = isActive ? (_etfPerfSort.dir === 1 ? " ▲" : " ▼") : "";
    if (c === "score") th.innerHTML = t("colScore") + arrow;
    else if (c === "accel") th.innerHTML = t("colAccel") + arrow;
    else if (c === "etf") th.textContent = t("etfPerfColEtf");
    else th.textContent = c + arrow;
  });
}

function initEtfPerfSortHeaders() {
  document.querySelectorAll("#etfperf-table th[data-etfperfcol]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const c = th.dataset.etfperfcol;
      if (_etfPerfSort.col === c) {
        _etfPerfSort.dir = -_etfPerfSort.dir;
      } else {
        _etfPerfSort.col = c;
        // score and etf: ascending by default; timeframes and accel: descending
        _etfPerfSort.dir = (c === "score" || c === "etf") ? 1 : -1;
      }
      if (_etfPerfData) renderEtfPerfTab(_etfPerfData);
    });
  });
}

```

#### Step E — Wire translations, loadData, and init

- [ ] **Step 7: Add _etfPerfData re-render hook to applyTranslations()**

Find in `applyTranslations()`:
```javascript
  if (_etfData) renderEtfTab();
```

Add on the next line:
```javascript
  if (_etfPerfData) renderEtfPerfTab(_etfPerfData);
```

- [ ] **Step 8: Add etf_perf.json to the loadData() fetch**

Find in `loadData()`:
```javascript
    const [dataRes, histRes, etfRes] = await Promise.all([
      fetch("data.json" + bust),
      fetch("history.json" + bust),
      fetch("etf_data.json" + bust),
    ]);
```

Replace with:
```javascript
    const [dataRes, histRes, etfRes, etfPerfRes] = await Promise.all([
      fetch("data.json" + bust),
      fetch("history.json" + bust),
      fetch("etf_data.json" + bust),
      fetch("etf_perf.json" + bust),
    ]);
```

- [ ] **Step 9: Add etf_perf.json response handler in loadData()**

Find the closing `}` of the `if (etfRes.ok) { ... } else { ... }` block in `loadData()`. Add after it:

```javascript

    if (etfPerfRes.ok) {
      _etfPerfData = await etfPerfRes.json();
      // Render only if the ETFs tab is currently active
      if (document.querySelector(".top-btn[data-top='etfperf']")?.classList.contains("active")) {
        renderEtfPerfTab(_etfPerfData);
      }
    } else {
      const errEl = document.getElementById("etfperf-error");
      if (errEl) {
        errEl.textContent = t("etfPerfNoData");
        errEl.classList.remove("hidden");
      }
    }
```

- [ ] **Step 10: Add initEtfPerfSortHeaders() call to the init block**

Find the init call block (around line 1243):
```javascript
initTabs();
initSortHeaders();
```

Find `initThemeVizToggle();` (the last init call before `loadData()`). Add after it:
```javascript
initEtfPerfSortHeaders();
```

#### Step F — Verify

- [ ] **Step 11: Create a local etf_perf.json test fixture**

Since `etf_perf.json` doesn't exist yet (GitHub Actions hasn't run), create it manually so the tab can be tested immediately. Save this as `docs/etf_perf.json`:

```json
{"fetched_at":"2026-05-19T12:00:00Z","etfs":{"SPY":{"name":"SPDR S&P 500 ETF","category":"Broad Market","perfs":{"1D":0.54,"1W":1.23,"1M":3.41,"3M":8.91,"YTD":12.10}},"QQQ":{"name":"Invesco Nasdaq 100 ETF","category":"Broad Market","perfs":{"1D":0.72,"1W":1.85,"1M":4.12,"3M":10.23,"YTD":14.50}},"IWM":{"name":"iShares Russell 2000 ETF","category":"Broad Market","perfs":{"1D":-0.12,"1W":0.45,"1M":1.23,"3M":3.45,"YTD":5.67}},"RSP":{"name":"Invesco S&P 500 Equal Weight","category":"Broad Market","perfs":{"1D":0.31,"1W":0.89,"1M":2.34,"3M":6.78,"YTD":9.12}},"QQQE":{"name":"Direxion Nasdaq 100 Equal Wt","category":"Broad Market","perfs":{"1D":0.55,"1W":1.10,"1M":3.20,"3M":7.89,"YTD":11.23}},"XLK":{"name":"Technology Select Sector","category":"US Sectors","perfs":{"1D":0.91,"1W":2.12,"1M":5.34,"3M":12.45,"YTD":18.90}},"XLV":{"name":"Health Care Select Sector","category":"US Sectors","perfs":{"1D":-0.23,"1W":0.12,"1M":0.89,"3M":2.34,"YTD":4.56}},"XLF":{"name":"Financial Select Sector","category":"US Sectors","perfs":{"1D":0.45,"1W":1.23,"1M":3.45,"3M":9.12,"YTD":13.45}},"XLI":{"name":"Industrial Select Sector","category":"US Sectors","perfs":{"1D":0.32,"1W":0.98,"1M":2.67,"3M":7.23,"YTD":10.12}},"XLY":{"name":"Consumer Discret Select Sector","category":"US Sectors","perfs":{"1D":0.67,"1W":1.56,"1M":4.23,"3M":9.87,"YTD":14.23}},"XLP":{"name":"Consumer Staples Select Sector","category":"US Sectors","perfs":{"1D":-0.15,"1W":0.23,"1M":1.12,"3M":3.45,"YTD":5.67}},"XLE":{"name":"Energy Select Sector","category":"US Sectors","perfs":{"1D":-0.89,"1W":-1.23,"1M":-2.34,"3M":1.23,"YTD":-3.45}},"XLU":{"name":"Utilities Select Sector","category":"US Sectors","perfs":{"1D":-0.45,"1W":0.12,"1M":1.23,"3M":4.56,"YTD":6.78}},"XLB":{"name":"Materials Select Sector","category":"US Sectors","perfs":{"1D":0.23,"1W":0.78,"1M":2.12,"3M":5.67,"YTD":7.89}},"XLC":{"name":"Communication Svcs Select Sect","category":"US Sectors","perfs":{"1D":0.56,"1W":1.34,"1M":3.78,"3M":8.90,"YTD":12.34}},"XLRE":{"name":"Real Estate Select Sector","category":"US Sectors","perfs":{"1D":-0.34,"1W":0.45,"1M":1.56,"3M":4.23,"YTD":5.12}},"GLD":{"name":"SPDR Gold Shares","category":"Commodities","perfs":{"1D":0.78,"1W":2.34,"1M":6.78,"3M":15.67,"YTD":22.34}},"SLV":{"name":"iShares Silver Trust","category":"Commodities","perfs":{"1D":1.23,"1W":3.45,"1M":8.90,"3M":18.90,"YTD":28.90}},"GDX":{"name":"VanEck Gold Miners ETF","category":"Commodities","perfs":{"1D":1.45,"1W":4.56,"1M":11.23,"3M":23.45,"YTD":34.56}},"GDXJ":{"name":"VanEck Junior Gold Miners","category":"Commodities","perfs":{"1D":1.89,"1W":5.67,"1M":13.45,"3M":28.90,"YTD":42.34}},"USO":{"name":"United States Oil Fund","category":"Commodities","perfs":{"1D":-1.23,"1W":-2.34,"1M":-4.56,"3M":-2.34,"YTD":-8.90}},"UNG":{"name":"United States Natural Gas Fund","category":"Commodities","perfs":{"1D":-0.89,"1W":-1.56,"1M":-3.45,"3M":1.23,"YTD":-5.67}},"PDBC":{"name":"Invesco Optimum Yield Cmdty","category":"Commodities","perfs":{"1D":-0.34,"1W":0.12,"1M":0.56,"3M":3.45,"YTD":2.34}},"DBA":{"name":"Invesco DB Agriculture Fund","category":"Commodities","perfs":{"1D":0.12,"1W":0.45,"1M":1.23,"3M":4.56,"YTD":6.78}},"CPER":{"name":"United States Copper Index Fund","category":"Commodities","perfs":{"1D":0.89,"1W":2.34,"1M":5.67,"3M":12.34,"YTD":18.90}},"IBIT":{"name":"iShares Bitcoin Trust","category":"Crypto","perfs":{"1D":2.34,"1W":5.67,"1M":12.34,"3M":23.45,"YTD":34.56}},"FBTC":{"name":"Fidelity Wise Origin Bitcoin","category":"Crypto","perfs":{"1D":2.31,"1W":5.62,"1M":12.28,"3M":23.38,"YTD":34.48}},"GBTC":{"name":"Grayscale Bitcoin Trust","category":"Crypto","perfs":{"1D":2.29,"1W":5.58,"1M":12.20,"3M":23.29,"YTD":34.39}},"ARKB":{"name":"ARK 21Shares Bitcoin ETF","category":"Crypto","perfs":{"1D":2.35,"1W":5.69,"1M":12.37,"3M":23.48,"YTD":34.59}},"BITB":{"name":"Bitwise Bitcoin ETF","category":"Crypto","perfs":{"1D":2.32,"1W":5.63,"1M":12.30,"3M":23.41,"YTD":34.50}},"ETHA":{"name":"iShares Ethereum Trust","category":"Crypto","perfs":{"1D":1.56,"1W":4.12,"1M":8.90,"3M":15.67,"YTD":22.34}},"BITO":{"name":"ProShares Bitcoin Strategy ETF","category":"Crypto","perfs":{"1D":2.12,"1W":5.23,"1M":11.67,"3M":22.34,"YTD":32.45}}}}
```

**Note:** This fixture file will be overwritten by real data the next time GitHub Actions runs. It is safe to commit it — the scraper will replace it.

- [ ] **Step 12: Open browser and verify the ETFs tab**

Serve `docs/` locally (e.g., `python -m http.server 8080 --directory docs`) and open `http://localhost:8080`. Verify:

1. Three top-nav buttons: "Industry" | "📈 Themes" | "📊 ETFs"
2. Clicking "📊 ETFs" shows the ETF perf table with 32 rows
3. Default sort: Score ▲ (ascending, rank 1 = strongest ETF at top)
4. Category badges show correct pill colors: Broad Market = blue, US Sectors = lime, Commodities = orange, Crypto = purple
5. Ticker links open `https://finviz.com/quote.ashx?t=TICKER` in new tab
6. Clicking any column header sorts the table; clicking again reverses
7. Sparklines render with color (green for high accel, red for negative accel)
8. Language toggle (EN/DE) updates all column header text correctly
9. "i" hint shows tooltip with hintEtfPerf content
10. Console shows no JS errors

- [ ] **Step 13: Commit**

```bash
git add docs/static/app.js docs/etf_perf.json
git commit -m "feat: add ETF perf tab — renderEtfPerfTab, i18n, loadData, sort, category badges"
```

---

## Final push

- [ ] **Push all commits to GitHub**

```bash
git push
```

GitHub Pages will deploy within ~1 minute. Verify the live site shows the ETFs tab. The next GitHub Actions run (21:00 UTC on a weekday) will overwrite `docs/etf_perf.json` with real Finviz data.
