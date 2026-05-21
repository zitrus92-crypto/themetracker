# Multi-Select Themes — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add checkbox multi-select to the Themes and Sub-Themes tables so multiple ticker lists can be combined and copied to the clipboard in one click.

**Architecture:** Pure vanilla-JS frontend change across 3 files. No backend or data changes. Each table (Themes, Sub-Themes) gets its own independent selection state maintained via DOM checkboxes. A selection bar div (hidden by default) appears above each table when ≥ 1 row is checked. The existing per-row 📋 copy buttons are removed.

**Tech Stack:** Vanilla JS, HTML, CSS — static GitHub Pages site. No build step, no test runner. Manual browser verification after each task.

**Spec:** `docs/superpowers/specs/2026-05-21-multi-select-themes-design.md`

---

## Files Changed

| File | What changes |
|------|-------------|
| `docs/index.html` | Add `#theme-selection-bar` + `#sub-selection-bar` divs; add `<th class="col-check">` to both table heads |
| `docs/static/style.css` | Add `.selection-bar` block + `.col-check`; remove `.ticker-copy-btn` block |
| `docs/static/app.js` | `renderEtfThemes`: remove 📋 HTML + handler, add checkbox `<td>`, update colspan, wire selection bar. `renderEtfList`: same. Add `updateThemeSelectionBar()` + `updateSubSelectionBar()` helpers. |

---

## Column counts (important for colspan)

- **Themes table** before this feature: 11 columns (`#`, Theme, 1D, 1W, 1M, 3M, YTD, Score, Accel, Top Sub-Themes, Trend). After adding checkbox column → **12**.
- **Sub-Themes table** before this feature: 11 columns (`#`, Sub-Theme, Theme, 1D, 1W, 1M, 3M, YTD, Score, Accel, Trend). After adding checkbox column → **12**.

---

## Task 1: index.html — Selection bars + checkbox column headers

**Files:**
- Modify: `docs/index.html`

**Context:** Locate sections by their id attributes, not line numbers. The Themes view is `<div id="etf-themes-view">` and Sub-Themes view is `<div id="etf-etfs-view">`. We insert a `<div class="selection-bar hidden">` immediately before each `.table-scroll`, and a `<th class="col-check">` as the first `<th>` in both table heads.

- [ ] **Step 1: Add selection bar + checkbox `<th>` to Themes table**

Inside `<div id="etf-themes-view">`, find the `<div class="table-scroll">` that contains `<table id="etf-themes-table">`. Replace the entire block from `<div class="table-scroll">` through its closing `</div>` with:

```html
        <div id="theme-selection-bar" class="selection-bar hidden">
          <span class="selection-bar__info"></span>
          <div class="selection-bar__actions">
            <button class="selection-bar__copy-btn">📋 Kopieren</button>
            <button class="selection-bar__clear-btn">✕</button>
          </div>
        </div>
        <div class="table-scroll">
          <table id="etf-themes-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" id="theme-select-all" title="Alle auswählen"></th>
                <th>#</th>
                <th data-etfcol="theme">Theme</th>
                <th data-etfcol="1D">1D</th>
                <th data-etfcol="1W">1W</th>
                <th data-etfcol="1M">1M</th>
                <th data-etfcol="3M">3M</th>
                <th data-etfcol="YTD">YTD</th>
                <th data-etfcol="score" data-i18n="colScore">Score ▲</th>
                <th data-etfcol="accel" data-i18n="etfColAccel">Accel</th>
                <th data-i18n="etfColEtfs" style="text-align:left">Top Sub-Themes</th>
                <th data-i18n="colTrend">Trend</th>
              </tr>
            </thead>
            <tbody id="etf-themes-body"></tbody>
          </table>
        </div>
```

- [ ] **Step 2: Add selection bar + checkbox `<th>` to Sub-Themes table**

Find `<div id="etf-etfs-view" class="hidden">`. Replace its entire contents (the inner `<div class="table-scroll">…</div>`) with:

```html
      <!-- Individual ETFs view -->
      <div id="etf-etfs-view" class="hidden">
        <div id="sub-selection-bar" class="selection-bar hidden">
          <span class="selection-bar__info"></span>
          <div class="selection-bar__actions">
            <button class="selection-bar__copy-btn">📋 Kopieren</button>
            <button class="selection-bar__clear-btn">✕</button>
          </div>
        </div>
        <div class="table-scroll">
          <table id="etf-list-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" id="sub-select-all" title="Alle auswählen"></th>
                <th>#</th>
                <th data-etflistcol="label" style="text-align:left">Sub-Theme</th>
                <th data-etflistcol="theme">Theme</th>
                <th data-etflistcol="1D">1D</th>
                <th data-etflistcol="1W">1W</th>
                <th data-etflistcol="1M">1M</th>
                <th data-etflistcol="3M">3M</th>
                <th data-etflistcol="YTD">YTD</th>
                <th data-etflistcol="score" data-i18n="colScore">Score ▲</th>
                <th data-etflistcol="accel" data-i18n="colAccel">Accel</th>
                <th data-i18n="colTrend">Trend</th>
              </tr>
            </thead>
            <tbody id="etf-list-body"></tbody>
          </table>
        </div>
      </div>
```

- [ ] **Step 3: Commit**

```bash
git add docs/index.html
git commit -m "feat: add selection bar and checkbox headers to Themes tables"
```

---

## Task 2: style.css — Selection bar styles, remove ticker-copy-btn

**Files:**
- Modify: `docs/static/style.css`

- [ ] **Step 1: Remove `.ticker-copy-btn` block**

Find and delete the three consecutive rules starting with `.ticker-copy-btn {` — they look like:

```css
.ticker-copy-btn { … }
.ticker-copy-btn:hover { … }
.ticker-copy-btn--done { … }
```

Delete all three rules (the block exists, search for `.ticker-copy-btn` to find them).

- [ ] **Step 2: Add selection bar + checkbox column CSS**

Append the following block at the very end of `docs/static/style.css`:

```css
/* ── Multi-select: selection bar ─────────────────────────────────────────── */
.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #0f2236;
  border: 1px solid #3b82f6;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  gap: 12px;
}
.selection-bar.hidden { display: none; }
.selection-bar__info  { color: #93c5fd; font-size: 0.85rem; flex: 1; }
.selection-bar__actions { display: flex; gap: 8px; flex-shrink: 0; }
.selection-bar__copy-btn {
  background: #3b82f6; color: white; border: none;
  border-radius: 5px; padding: 5px 14px; font-size: 0.82rem; cursor: pointer;
}
.selection-bar__copy-btn:hover { background: #2563eb; }
.selection-bar__clear-btn {
  background: transparent; color: #8b949e;
  border: 1px solid var(--border); border-radius: 5px;
  padding: 5px 10px; font-size: 0.82rem; cursor: pointer;
}
.selection-bar__clear-btn:hover { color: var(--text); border-color: #8b949e; }

/* Checkbox column */
.col-check { width: 36px; text-align: center !important; padding: 4px !important; }
.col-check input[type="checkbox"] { accent-color: #3b82f6; cursor: pointer; }
```

- [ ] **Step 3: Verify no `.ticker-copy-btn` references remain**

```bash
grep "ticker-copy-btn" docs/static/style.css
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add docs/static/style.css
git commit -m "feat: add selection-bar CSS, remove ticker-copy-btn styles"
```

---

## Task 3: app.js — Themes table multi-select

**Files:**
- Modify: `docs/static/app.js`

**Context:** Work in `renderEtfThemes(data)` (find via `function renderEtfThemes`). All code locations below are identified by content, not line numbers, since earlier edits shift lines.

- [ ] **Step 1: Add `updateThemeSelectionBar()` helper**

Insert this new function **immediately before** the line `function renderEtfThemes(data) {`:

```javascript
// ── Multi-select: Themes ──────────────────────────────────────────────────
function updateThemeSelectionBar() {
  const bar    = document.getElementById("theme-selection-bar");
  const checks = [...document.querySelectorAll("#etf-themes-body .row-check:checked")];
  if (!checks.length) { bar.classList.add("hidden"); return; }

  const allTickers = checks.flatMap(cb => _etfData?.themes?.[cb.dataset.key]?.tickers ?? []);
  const deduped    = [...new Set(allTickers)];
  bar.__deduped = deduped;

  const n = checks.length;
  bar.querySelector(".selection-bar__info").textContent = _lang === "de"
    ? `${n} Theme${n > 1 ? "s" : ""} ausgewählt · ${deduped.length} Ticker (dedupliziert)`
    : `${n} theme${n > 1 ? "s" : ""} selected · ${deduped.length} tickers (deduplicated)`;
  bar.classList.remove("hidden");
}
```

- [ ] **Step 2: Remove `copyBtn` variable from `renderEtfThemes` row builder**

Inside `renderEtfThemes`, find this block and delete it entirely (both the variable declaration and the reference to `${copyBtn}` in the template):

```javascript
    const copyBtn = hasTickers
      ? `<button class="ticker-copy-btn" data-theme="${theme.replace(/"/g, '&quot;')}" title="${_lang === 'de' ? 'Ticker in Zwischenablage kopieren' : 'Copy tickers to clipboard'}">📋</button>`
      : '';
```

Also delete `${copyBtn}` from the row `<td>` that contains the theme badge.

- [ ] **Step 3: Add checkbox `<td>` as first cell in each Themes row**

In the `return \`<tr>` template inside `renderEtfThemes`, add a new first `<td>` **before** `<td>${idx + 1}</td>`:

```javascript
      <td class="col-check"><input type="checkbox" class="row-check"${hasTickers ? '' : ' disabled'} data-key="${esc(theme)}"></td>
```

The full row template should now be:

```javascript
    return `<tr>
      <td class="col-check"><input type="checkbox" class="row-check"${hasTickers ? '' : ' disabled'} data-key="${esc(theme)}"></td>
      <td>${idx + 1}</td>
      <td style="text-align:left">
        ${themeBadge(theme)}
        ${tickerBadge}
      </td>
      ${perfCells}
      <td>${row.score.toFixed(1)}</td>
      <td class="${accelClass}" title="${accelTooltip}" style="cursor:help;font-weight:700">${accelSign}${accel}</td>
      <td style="text-align:left">${chips}</td>
      <td>${renderSparkline(row.perfs, themeAccel[theme] ?? 0)}</td>
    </tr>`;
```

- [ ] **Step 4: Update empty-state colspan in `renderEtfThemes`**

Find the empty-state fallback row inside `renderEtfThemes`. It currently reads:

```javascript
  tbody.innerHTML = rows.join("") || `<tr><td colspan="11" class="empty-msg">${t("etfNoData")}</td></tr>`;
```

Change `colspan="11"` → `colspan="12"` (one extra column for the checkbox).

- [ ] **Step 5: Replace old `ticker-copy-btn` handler block with multi-select wiring**

Find the comment `// Attach copy-button handlers` inside `renderEtfThemes` and delete everything from that comment down through the closing `});` of the `.forEach` block. Replace it with:

```javascript
  // ── Multi-select wiring ───────────────────────────────────────────────────
  const themeHeaderCheck = document.getElementById("theme-select-all");
  const themeRowChecks   = [...tbody.querySelectorAll(".row-check:not([disabled])")];

  function syncThemeHeader() {
    const n = themeRowChecks.filter(c => c.checked).length;
    themeHeaderCheck.indeterminate = n > 0 && n < themeRowChecks.length;
    themeHeaderCheck.checked = n > 0 && n === themeRowChecks.length;
  }

  themeRowChecks.forEach(cb => cb.addEventListener("change", () => {
    syncThemeHeader();
    updateThemeSelectionBar();
  }));

  themeHeaderCheck.addEventListener("change", () => {
    themeRowChecks.forEach(cb => cb.checked = themeHeaderCheck.checked);
    themeHeaderCheck.indeterminate = false;
    updateThemeSelectionBar();
  });

  const themeBar = document.getElementById("theme-selection-bar");
  themeBar.querySelector(".selection-bar__copy-btn").onclick = () => {
    const deduped = themeBar.__deduped;
    if (!deduped || !deduped.length) return;
    navigator.clipboard.writeText(deduped.join(",")).then(() => {
      showToast(_lang === "de" ? `${deduped.length} Ticker kopiert!` : `${deduped.length} tickers copied!`);
    });
  };
  themeBar.querySelector(".selection-bar__clear-btn").onclick = () => {
    themeRowChecks.forEach(cb => cb.checked = false);
    themeHeaderCheck.checked = false;
    themeHeaderCheck.indeterminate = false;
    updateThemeSelectionBar();
  };
```

- [ ] **Step 6: Manually test Themes table in browser**

Open the live site. Go to Themes tab → Tabelle view.
- ✅ No 📋 buttons visible in rows
- ✅ Checkbox column is leftmost; header checkbox present
- ✅ Click 2 checkboxes → blue bar appears with correct deduplicated ticker count
- ✅ „Kopieren" → toast shows, clipboard contains comma-separated tickers
- ✅ Header checkbox selects all; click again → deselects all
- ✅ Partial selection → header checkbox shows indeterminate state (`−`)
- ✅ Themes with 0 tickers have a disabled (greyed) checkbox

- [ ] **Step 7: Commit**

```bash
git add docs/static/app.js
git commit -m "feat: multi-select Themes table — checkboxes + selection bar"
```

---

## Task 4: app.js — Sub-Themes table multi-select

**Files:**
- Modify: `docs/static/app.js`

**Context:** Work in `renderEtfList(data)` (find via `function renderEtfList`). Mirrors Task 3 exactly, using `#etf-list-body`, `#sub-selection-bar`, `#sub-select-all`, and `_etfData?.subnodes?.[key]?.tickers`.

- [ ] **Step 1: Add `updateSubSelectionBar()` helper**

Insert immediately before the line `function renderEtfList(data) {`:

```javascript
// ── Multi-select: Sub-Themes ──────────────────────────────────────────────
function updateSubSelectionBar() {
  const bar    = document.getElementById("sub-selection-bar");
  const checks = [...document.querySelectorAll("#etf-list-body .row-check:checked")];
  if (!checks.length) { bar.classList.add("hidden"); return; }

  const allTickers = checks.flatMap(cb => _etfData?.subnodes?.[cb.dataset.key]?.tickers ?? []);
  const deduped    = [...new Set(allTickers)];
  bar.__deduped = deduped;

  const n = checks.length;
  bar.querySelector(".selection-bar__info").textContent = _lang === "de"
    ? `${n} Sub-Theme${n > 1 ? "s" : ""} ausgewählt · ${deduped.length} Ticker (dedupliziert)`
    : `${n} sub-theme${n > 1 ? "s" : ""} selected · ${deduped.length} tickers (deduplicated)`;
  bar.classList.remove("hidden");
}
```

- [ ] **Step 2: Remove `copyBtn` variable from `renderEtfList` row builder**

Inside `renderEtfList`, find and delete:

```javascript
    const copyBtn = hasTickers
      ? `<button class="ticker-copy-btn" data-subkey="${key}" title="${_lang === 'de' ? 'Ticker in Zwischenablage kopieren' : 'Copy tickers to clipboard'}">📋</button>`
      : '';
```

Also delete `${copyBtn}` from the row template.

- [ ] **Step 3: Add checkbox `<td>` as first cell in each Sub-Themes row**

In the `return \`<tr>` template inside `renderEtfList`, add before `<td>${idx + 1}</td>`:

```javascript
      <td class="col-check"><input type="checkbox" class="row-check"${hasTickers ? '' : ' disabled'} data-key="${esc(key)}"></td>
```

Full row template:

```javascript
    return `<tr>
      <td class="col-check"><input type="checkbox" class="row-check"${hasTickers ? '' : ' disabled'} data-key="${esc(key)}"></td>
      <td>${idx + 1}</td>
      <td style="text-align:left;font-weight:600">
        <a href="${subUrl}" target="_blank" rel="noopener" class="sub-theme-link">${row.label}</a>
        ${tickerBadge}
      </td>
      <td style="text-align:left">${themeBadge(row.theme)}</td>
      ${perfCells}
      <td>${row.score.toFixed(1)}</td>
      <td class="${accelClass}" title="${accelTooltip}" style="cursor:help;font-weight:700">${accelSign}${accel}</td>
      <td>${renderSparkline(row.perfs, subAccel[key] ?? 0)}</td>
    </tr>`;
```

- [ ] **Step 4: Update empty-state colspan in `renderEtfList`**

Inside `renderEtfList`, find the two empty-state fallback rows:

```javascript
    tbody.innerHTML = `<tr><td colspan="10" class="empty-msg">${t("etfNoData")}</td></tr>`;
```

and

```javascript
  tbody.innerHTML = rows.join("") || `<tr><td colspan="11" class="empty-msg">${t("etfNoData")}</td></tr>`;
```

Change the first to `colspan="11"` and the second to `colspan="12"` (each gains one checkbox column).

- [ ] **Step 5: Replace old `ticker-copy-btn[data-subkey]` handler block with multi-select wiring**

Find the comment `// Attach copy-button handlers` inside `renderEtfList` and delete everything from that comment through the closing `});`. Replace with:

```javascript
  // ── Multi-select wiring ───────────────────────────────────────────────────
  const subHeaderCheck = document.getElementById("sub-select-all");
  const subRowChecks   = [...tbody.querySelectorAll(".row-check:not([disabled])")];

  function syncSubHeader() {
    const n = subRowChecks.filter(c => c.checked).length;
    subHeaderCheck.indeterminate = n > 0 && n < subRowChecks.length;
    subHeaderCheck.checked = n > 0 && n === subRowChecks.length;
  }

  subRowChecks.forEach(cb => cb.addEventListener("change", () => {
    syncSubHeader();
    updateSubSelectionBar();
  }));

  subHeaderCheck.addEventListener("change", () => {
    subRowChecks.forEach(cb => cb.checked = subHeaderCheck.checked);
    subHeaderCheck.indeterminate = false;
    updateSubSelectionBar();
  });

  const subBar = document.getElementById("sub-selection-bar");
  subBar.querySelector(".selection-bar__copy-btn").onclick = () => {
    const deduped = subBar.__deduped;
    if (!deduped || !deduped.length) return;
    navigator.clipboard.writeText(deduped.join(",")).then(() => {
      showToast(_lang === "de" ? `${deduped.length} Ticker kopiert!` : `${deduped.length} tickers copied!`);
    });
  };
  subBar.querySelector(".selection-bar__clear-btn").onclick = () => {
    subRowChecks.forEach(cb => cb.checked = false);
    subHeaderCheck.checked = false;
    subHeaderCheck.indeterminate = false;
    updateSubSelectionBar();
  };
```

- [ ] **Step 6: Verify no remaining `ticker-copy-btn` references in app.js**

```bash
grep "ticker-copy-btn" docs/static/app.js
```
Expected: no output.

- [ ] **Step 7: Manually test Sub-Themes in browser**

Switch to Sub-Themes view (toggle top-right in Themes tab).
- ✅ Checkbox column present, no 📋 buttons
- ✅ Select 3 sub-themes → bar shows combined + deduplicated ticker count
- ✅ Copy → clipboard, toast
- ✅ `✕` clears selection, bar hides
- ✅ Header checkbox selects/deselects all

- [ ] **Step 8: Final commit + push**

```bash
git add docs/static/app.js
git commit -m "feat: multi-select Sub-Themes table — checkboxes + selection bar"
git push origin main
```
