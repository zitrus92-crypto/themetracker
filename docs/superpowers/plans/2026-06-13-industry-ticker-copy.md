# Industry Ticker Copy — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user copy industry stock tickers to the clipboard — full checkbox multi-select on the Heatmap table (Themes analog), and single 📋 copy buttons on Setup Picks and Top 10.

**Architecture:** The scraper fetches a ticker list per industry via the existing Finviz `ind_<slug>` path and stores it in `data.json`. The frontend reuses the proven Themes multi-select machinery for the Heatmap table, and a shared lightweight per-item copy-button helper for the card/bar views.

**Tech Stack:** Python 3.11 · `requests` · vanilla JS/HTML/CSS · GitHub Actions · GitHub Pages

**Spec:** `docs/superpowers/specs/2026-06-13-industry-ticker-copy-design.md`

---

## Files Changed

| File | What changes |
|------|-------------|
| `scraper.py` | Add `fetch_industry_tickers(scored)` — attaches `tickers` per industry via `_fetch_tickers_for_slug(slug, "ind")` |
| `scrape.py` | Call `fetch_industry_tickers()` inside `fetch_industries()` |
| `docs/index.html` | Heatmap: add `#ind-selection-bar` + checkbox `<th>` |
| `docs/static/style.css` | Add `.ind-copy-btn` styles |
| `docs/static/app.js` | Heatmap multi-select; `wireIndCopyButtons()` helper; 📋 in `renderPicks`, `renderCards`, `renderBarChart` |

---

## Chunk 1: Backend

### Task 1: scraper.py — fetch_industry_tickers()

**Files:**
- Modify: `scraper.py`

**Context:** `_fetch_tickers_for_slug(slug, filter_prefix="theme")` already exists (line ~450) and works with any prefix — `filter_prefix="ind"` builds `f=ind_<slug>`, verified to return tickers. `compute_scores()` output is `{industry_name: {..., "ticker": slug}}`. We add a parallel fetch that attaches `tickers` to each entry. `ThreadPoolExecutor`, `as_completed`, `time` are already imported.

- [ ] **Step 1: Add `fetch_industry_tickers()` to scraper.py**

Append at the end of `scraper.py`:

```python
# ── Industry ticker lists ─────────────────────────────────────────────────

def fetch_industry_tickers(scored: dict) -> dict:
    """Attach a `tickers` list to each scored industry via the Finviz ind_ filter.

    scored: output of compute_scores() — {industry_name: {..., "ticker": slug}}.
    Fetches in parallel (same proven path as themes). On failure for an industry,
    that industry gets tickers: [] and the run continues.
    Returns the same dict, each entry gaining a "tickers": [...] key.
    """
    names = list(scored.keys())
    print(f"    Fetching ticker lists for {len(names)} industries…")

    def _one(name: str) -> tuple[str, list[str]]:
        slug = scored[name].get("ticker", "")
        if not slug:
            return name, []
        try:
            return name, _fetch_tickers_for_slug(slug, filter_prefix="ind")
        except Exception as e:
            print(f"      WARNING: ticker fetch failed for industry {name}: {e}")
            return name, []

    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {pool.submit(_one, n): n for n in names}
        for fut in as_completed(futures):
            name, tickers = fut.result()
            scored[name]["tickers"] = tickers

    total = sum(len(scored[n].get("tickers", [])) for n in names)
    print(f"    Industry tickers: {total} across {len(names)} industries")
    return scored
```

- [ ] **Step 2: Smoke-test on a small slice**

```bash
cd "C:\Users\Christoph Baer\claude space\themetracker-web"
python -c "
import scraper
from scores import compute_scores
raw = scraper.fetch_all()
scored = compute_scores(raw)
# Test on just 3 industries to keep it fast
small = {k: scored[k] for k in list(scored)[:3]}
out = scraper.fetch_industry_tickers(small)
for n, r in out.items():
    print(n, '->', len(r.get('tickers', [])), 'tickers:', r.get('tickers', [])[:5])
"
```

Expected: each of the 3 industries prints a ticker count > 0 and a sample list. No exceptions.

- [ ] **Step 3: Commit**

```bash
git add scraper.py
git commit -m "feat: fetch per-industry ticker lists via Finviz ind_ filter"
```

---

### Task 2: scrape.py — Wire industry tickers into fetch_industries()

**Files:**
- Modify: `scrape.py`

**Context:** `fetch_industries()` (lines 22–26) currently returns `compute_scores(raw)`. We insert the ticker fetch before returning. No change to `main()` — the `tickers` ride along inside the `scored` dict that is already written to `data.json`.

- [ ] **Step 1: Update `fetch_industries()`**

Find:
```python
def fetch_industries():
    print("Fetching Finviz industry data...")
    raw = scraper.fetch_all()
    print(f"  {len(raw)} industries fetched.")
    return compute_scores(raw)
```

Replace with:
```python
def fetch_industries():
    print("Fetching Finviz industry data...")
    raw = scraper.fetch_all()
    print(f"  {len(raw)} industries fetched.")
    scored = compute_scores(raw)
    scraper.fetch_industry_tickers(scored)  # attaches "tickers" per industry (in-place)
    return scored
```

- [ ] **Step 2: Smoke-test the full write path**

```bash
cd "C:\Users\Christoph Baer\claude space\themetracker-web"
python scrape.py
```
Then verify `data.json` now carries tickers:
```bash
python -c "
import json
d = json.load(open('docs/data.json'))
inds = d['industries']
name = next(iter(inds))
print(name, 'has tickers:', 'tickers' in inds[name], '->', inds[name].get('tickers', [])[:5])
withtk = sum(1 for v in inds.values() if v.get('tickers'))
print(f'{withtk}/{len(inds)} industries have tickers')
"
```
Expected: most/all industries have non-empty ticker lists.

- [ ] **Step 3: Commit**

```bash
git add scrape.py docs/data.json
git commit -m "feat: attach industry tickers in scrape pipeline, refresh data.json"
```

---

## Chunk 2: Frontend

### Task 3: index.html — Heatmap selection bar + checkbox header

**Files:**
- Modify: `docs/index.html`

**Context:** The Heatmap table is `<table id="heatmap-table">` inside `<section ... data-panel="heatmap">`, wrapped by `<div class="table-scroll">`. The `.selection-bar` and `.col-check` CSS already exist (from Themes). The heatmap `<thead>` first column is `<th>#</th>`.

- [ ] **Step 1: Add the selection bar before the heatmap `.table-scroll`**

Find the heatmap block (it contains `<div id="loading"`, `<div id="error-msg"`, then `<div class="table-scroll">` with `<table id="heatmap-table">`). Immediately before `<div class="table-scroll">`, insert:

```html
      <div id="ind-selection-bar" class="selection-bar hidden">
        <span class="selection-bar__info"></span>
        <div class="selection-bar__actions">
          <button class="selection-bar__copy-btn">📋 Kopieren</button>
          <button class="selection-bar__clear-btn">✕</button>
        </div>
      </div>
```

- [ ] **Step 2: Add the checkbox header column**

In `<table id="heatmap-table">`'s `<thead>`, find the first header row:
```html
            <tr>
              <th>#</th>
              <th data-col="industry" data-label="Industry" data-i18n="colIndustry">Industry</th>
```
Insert a new first `<th>` before `<th>#</th>`:
```html
              <th class="col-check"><input type="checkbox" id="ind-select-all" title="Alle auswählen"></th>
```

- [ ] **Step 3: Commit**

```bash
git add docs/index.html
git commit -m "feat: add selection bar + checkbox header to Industry heatmap"
```

---

### Task 4: style.css — Per-item copy button

**Files:**
- Modify: `docs/static/style.css` (append at end)

- [ ] **Step 1: Append `.ind-copy-btn` styles**

```css
/* ── Industry single-copy button (Setup Picks + Top 10) ──────────────────── */
.ind-copy-btn {
  background: transparent; border: 1px solid var(--border);
  color: var(--text-dim); border-radius: 4px;
  padding: 1px 6px; font-size: 0.78rem; cursor: pointer;
  line-height: 1.4; margin-left: 6px; vertical-align: middle;
}
.ind-copy-btn:hover  { color: var(--text); border-color: #8b949e; }
.ind-copy-btn--done  { color: #4ade80; border-color: #4ade80; }
.ind-copy-btn--inline { padding: 0 4px; font-size: 0.72rem; margin-left: 4px; }
```

- [ ] **Step 2: Commit**

```bash
git add docs/static/style.css
git commit -m "feat: add .ind-copy-btn styles"
```

---

### Task 5: app.js — Heatmap multi-select

**Files:**
- Modify: `docs/static/app.js`

**Context:** Mirror the existing Themes multi-select exactly. `renderHeatmap(industries)` builds `#heatmap-body`. `_lastIndustries` holds the full industries dict (set at the top of `renderHeatmap`). `esc()`, `showToast()`, `_lang` exist. The existing `updateThemeSelectionBar()` (search for it) is the template to copy.

- [ ] **Step 1: Add `updateIndSelectionBar()` helper**

Insert immediately before `function renderHeatmap(industries) {`:

```javascript
// ── Industry heatmap multi-select ─────────────────────────────────────────
function updateIndSelectionBar() {
  const bar    = document.getElementById("ind-selection-bar");
  const checks = [...document.querySelectorAll("#heatmap-body .row-check:checked")];
  if (!checks.length) { bar.classList.add("hidden"); return; }

  const allTickers = checks.flatMap(cb => _lastIndustries?.[cb.dataset.key]?.tickers ?? []);
  const deduped    = [...new Set(allTickers)];
  bar.__deduped = deduped;

  const n = checks.length;
  bar.querySelector(".selection-bar__info").textContent = _lang === "de"
    ? `${n} Industr${n === 1 ? "y" : "ies"} ausgewählt · ${deduped.length} Ticker (dedupliziert)`
    : `${n} industr${n === 1 ? "y" : "ies"} selected · ${deduped.length} tickers (deduplicated)`;
  bar.classList.remove("hidden");
}
```

- [ ] **Step 2: Add the checkbox `<td>` to each heatmap row**

In `renderHeatmap`, find the row template:
```javascript
    return `<tr>
      <td>${idx + 1}</td>
      <td title="${name}">${nameCell}${instMark}</td>
```
Add a leading checkbox cell (compute `hasTickers` just above the `return`):
```javascript
    const hasTickers = row.tickers && row.tickers.length > 0;
    return `<tr>
      <td class="col-check"><input type="checkbox" class="row-check"${hasTickers ? '' : ' disabled'} data-key="${esc(name)}"></td>
      <td>${idx + 1}</td>
      <td title="${name}">${nameCell}${instMark}</td>
```

- [ ] **Step 3: Update the empty-state colspan**

Find:
```javascript
  tbody.innerHTML = rows.join("") || `<tr><td colspan="10" class="empty-msg">${t("noData")}</td></tr>`;
```
Change `colspan="10"` → `colspan="11"`.

- [ ] **Step 4: Attach multi-select wiring after rows are set**

Immediately after the `tbody.innerHTML = ...` line in `renderHeatmap`, add:

```javascript
  // ── Multi-select wiring ───────────────────────────────────────────────────
  const indHeaderCheck = document.getElementById("ind-select-all");
  const indRowChecks   = [...tbody.querySelectorAll(".row-check:not([disabled])")];

  function syncIndHeader() {
    const c = indRowChecks.filter(x => x.checked).length;
    indHeaderCheck.indeterminate = c > 0 && c < indRowChecks.length;
    indHeaderCheck.checked = c > 0 && c === indRowChecks.length;
  }

  indRowChecks.forEach(cb => cb.addEventListener("change", () => {
    syncIndHeader();
    updateIndSelectionBar();
  }));

  indHeaderCheck.onchange = () => {
    indRowChecks.forEach(cb => cb.checked = indHeaderCheck.checked);
    indHeaderCheck.indeterminate = false;
    updateIndSelectionBar();
  };

  const indBar = document.getElementById("ind-selection-bar");
  indBar.querySelector(".selection-bar__copy-btn").onclick = () => {
    const deduped = indBar.__deduped;
    if (!deduped || !deduped.length) return;
    navigator.clipboard.writeText(deduped.join(",")).then(() => {
      showToast(_lang === "de" ? `${deduped.length} Ticker kopiert!` : `${deduped.length} tickers copied!`);
    });
  };
  indBar.querySelector(".selection-bar__clear-btn").onclick = () => {
    indRowChecks.forEach(cb => cb.checked = false);
    indHeaderCheck.checked = false;
    indHeaderCheck.indeterminate = false;
    updateIndSelectionBar();
  };
```

**Important:** use `indHeaderCheck.onchange = ...` (assignment), NOT `addEventListener` — `#ind-select-all` lives in the static `<thead>` and persists across re-renders; assignment overwrites instead of stacking listeners (same fix applied to Themes).

- [ ] **Step 5: Verify in browser**

Open the live site (after Chunk 1 ran, or with the refreshed local data.json). Industry → Heatmap:
- ✅ Checkbox column appears leftmost; header checkbox present
- ✅ Select 2–3 industries → blue bar shows count + deduplicated ticker total
- ✅ "📋 Kopieren" copies comma-separated tickers + toast
- ✅ Header checkbox selects/clears all; partial = indeterminate
- ✅ "✕" clears selection, hides bar
- ✅ Sorting a column or toggling INST resets selection (acceptable)

- [ ] **Step 6: Commit**

```bash
git add docs/static/app.js
git commit -m "feat: Industry heatmap multi-select ticker copy"
```

---

### Task 6: app.js — Shared copy helper + Setup Picks button

**Files:**
- Modify: `docs/static/app.js`

**Context:** `renderPicks(industries)` builds cards into `#picks-container`. Each card's `nameEl` shows the industry name. We add a 📋 button per card and a shared wiring helper used here and in Task 7.

- [ ] **Step 1: Add the `wireIndCopyButtons()` helper**

Insert before `function renderPicks(industries) {`:

```javascript
// Wire all .ind-copy-btn inside a container to copy that industry's tickers.
function wireIndCopyButtons(container) {
  container.querySelectorAll(".ind-copy-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      e.preventDefault();
      const name = btn.dataset.key;
      const tickers = _lastIndustries?.[name]?.tickers;
      if (!tickers || !tickers.length) return;
      navigator.clipboard.writeText(tickers.join(",")).then(() => {
        const orig = btn.textContent;
        btn.textContent = "✓";
        btn.classList.add("ind-copy-btn--done");
        setTimeout(() => { btn.textContent = orig; btn.classList.remove("ind-copy-btn--done"); }, 2000);
        showToast(_lang === "de" ? `${tickers.length} Ticker kopiert!` : `${tickers.length} tickers copied!`);
      });
    });
  });
}
```

- [ ] **Step 2: Add the 📋 button to each pick card**

In `renderPicks`, find the `nameEl` definition:
```javascript
    const nameEl = url
      ? `<a class="pick-name pick-link" href="${url}" target="_blank" rel="noopener">${name} ↗</a>`
      : `<div class="pick-name">${name}</div>`;
```
Add a copy-button variable right after it:
```javascript
    const hasTk = row.tickers && row.tickers.length > 0;
    const copyBtn = hasTk
      ? `<button class="ind-copy-btn" data-key="${esc(name)}" title="${_lang === 'de' ? 'Ticker dieser Industry kopieren' : "Copy this industry's tickers"}">📋</button>`
      : '';
```
Then in the returned card template, place `${copyBtn}` right after `${nameEl}`:
```javascript
    return `<div class="pick-card">
      ${nameEl}${copyBtn}
      ${stat("1D")}${stat("1W")}${stat("1M")}${stat("3M")}
```

- [ ] **Step 3: Wire the buttons after render**

Find the end of `renderPicks`:
```javascript
  container.innerHTML = `<div class="picks-grid">${header}${cards}</div>`;
}
```
Add the wiring call before the closing brace:
```javascript
  container.innerHTML = `<div class="picks-grid">${header}${cards}</div>`;
  wireIndCopyButtons(container);
}
```

- [ ] **Step 4: Verify + commit**

Browser: Industry → Setup Picks → each card has a 📋 → click copies that industry's tickers + toast.

```bash
git add docs/static/app.js
git commit -m "feat: per-industry copy button on Setup Picks"
```

---

### Task 7: app.js — Top 10 cards + bars copy buttons

**Files:**
- Modify: `docs/static/app.js`

**Context:** `renderCards(industries)` builds `#cards-row` (5 timeframe cards, each top-10 industries). `renderBarChart(industries)` builds `#bars-view` (1M/3M panels). Both list industries by `nameEl`. Reuse `wireIndCopyButtons()` from Task 6. The same industry appears in multiple cards — each button is independent (copies that industry's full list), no shared state.

- [ ] **Step 1: Add 📋 to `renderCards`**

Find the card-row template:
```javascript
      return `<div class="card-row">
        <span class="card-rank">${i + 1}</span>
        ${nameEl}${instMark}
        <span class="badge ${v >= 0 ? "badge-pos" : "badge-neg"}">${fmtPct(v)}</span>
      </div>`;
```
Add a copy button (compute `hasTk` from `row.tickers`):
```javascript
      const hasTk = row.tickers && row.tickers.length > 0;
      const copyBtn = hasTk
        ? `<button class="ind-copy-btn ind-copy-btn--inline" data-key="${esc(name)}" title="${_lang === 'de' ? 'Ticker dieser Industry kopieren' : "Copy this industry's tickers"}">📋</button>`
        : '';
      return `<div class="card-row">
        <span class="card-rank">${i + 1}</span>
        ${nameEl}${instMark}${copyBtn}
        <span class="badge ${v >= 0 ? "badge-pos" : "badge-neg"}">${fmtPct(v)}</span>
      </div>`;
```

- [ ] **Step 2: Wire buttons after `renderCards` sets innerHTML**

Find:
```javascript
  container.innerHTML = cards.join("");
}
```
Change to:
```javascript
  container.innerHTML = cards.join("");
  wireIndCopyButtons(container);
}
```

- [ ] **Step 3: Add 📋 to `renderBarChart`**

Find the bar-row template:
```javascript
      return `<div class="bar-row">
        <span class="bar-name-wrap">${nameEl}${instMark}</span>
        <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="bar-value ${v >= 0 ? "accel-pos" : "accel-neg"}">${fmtPct(v)}</span>
      </div>`;
```
Add the copy button inside the name wrap:
```javascript
      const hasTk = row.tickers && row.tickers.length > 0;
      const copyBtn = hasTk
        ? `<button class="ind-copy-btn ind-copy-btn--inline" data-key="${esc(name)}" title="${_lang === 'de' ? 'Ticker dieser Industry kopieren' : "Copy this industry's tickers"}">📋</button>`
        : '';
      return `<div class="bar-row">
        <span class="bar-name-wrap">${nameEl}${instMark}${copyBtn}</span>
        <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="bar-value ${v >= 0 ? "accel-pos" : "accel-neg"}">${fmtPct(v)}</span>
      </div>`;
```

- [ ] **Step 4: Wire buttons after `renderBarChart` sets innerHTML**

Find:
```javascript
  container.innerHTML = panels.join("");
}
```
Change to:
```javascript
  container.innerHTML = panels.join("");
  wireIndCopyButtons(container);
}
```

- [ ] **Step 5: Verify in browser**

Industry → Top 10:
- ✅ Cards view: each industry row has an inline 📋 → copies that industry's tickers + toast
- ✅ Bars view (toggle 📈 Balken): each bar row has an inline 📋 → copies + toast
- ✅ Switching views/timeframes keeps buttons working

- [ ] **Step 6: Final commit + push**

```bash
git add docs/static/app.js
git commit -m "feat: per-industry copy buttons on Top 10 cards and bars"
git push origin main
```
