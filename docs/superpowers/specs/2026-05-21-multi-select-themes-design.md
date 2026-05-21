# Multi-Select Themes — Design Spec

**Goal:** Allow the user to select multiple Themes (or Sub-Themes) via checkboxes and copy their combined, deduplicated ticker list to the clipboard in one click — for pasting into TradingView.

**User story:** Christoph sees e.g. Cybersecurity #1 and Cloud Computing #5 in the Themes table, wants to combine their tickers into one watchlist without switching back and forth.

---

## Scope

Applies to **both** views inside the Themes top-level tab:
- `#etf-themes-table` — the Themes table (renderEtfThemes)
- `#etf-list-table` — the Sub-Themes table (renderEtfList)

The two tables have independent selection state (selecting in one does not affect the other).

---

## What Changes

### Replaced: per-row 📋 buttons

`ticker-copy-btn` buttons (one per row) are **removed entirely** from both tables.
The selection bar + multi-copy replaces their function — including single-theme copy (just select one checkbox).

### Added: checkbox column

A new leftmost column is inserted into both tables:

```html
<!-- <thead> -->
<th class="col-check">
  <input type="checkbox" class="select-all-check" title="Alle auswählen / alle abwählen">
</th>

<!-- each <tbody> row -->
<td class="col-check">
  <input type="checkbox" class="row-check" data-key="Cybersecurity">
</td>
```

- `data-key` = theme name (for Themes table) or sub-node key (for Sub-Themes table)
- Themes with no tickers (`hasTickers === false`) still get a checkbox but it is `disabled`

### Added: selection bar

A `<div>` that sits **above the `.table-scroll`** wrapper for each table. Hidden by default (`display:none`), shown when ≥ 1 checkbox with tickers is checked.

```html
<!-- in index.html, before each .table-scroll -->
<div id="theme-selection-bar" class="selection-bar hidden">
  <span class="selection-bar__info"></span>
  <div class="selection-bar__actions">
    <button class="selection-bar__copy-btn">📋 Kopieren</button>
    <button class="selection-bar__clear-btn">✕</button>
  </div>
</div>

<div id="sub-selection-bar" class="selection-bar hidden">
  <!-- same structure -->
</div>
```

Info text format (i18n):
- DE: `„2 Themes ausgewählt · 46 Ticker (dedupliziert)"`
- EN: `"2 themes selected · 46 tickers (deduplicated)"`

---

## Behaviour

### Checkbox interaction

| Action | Result |
|--------|--------|
| Click row checkbox | Toggle that row; update bar |
| Click header checkbox (all unchecked) | Check all enabled rows; update bar |
| Click header checkbox (all checked) | Uncheck all; hide bar |
| Header checkbox with mixed state | Show **indeterminate** (`el.indeterminate = true`) |
| Sort column header click | Re-render table → clears all selections |

### Copy button

1. Collect `tickers` arrays from all checked rows via `_etfData`
2. Flatten + deduplicate: `[...new Set(allTickers)]`
3. `navigator.clipboard.writeText(deduped.join(","))`
4. Toast: DE `"X Ticker kopiert!"` / EN `"X tickers copied!"`
5. Selection stays active (no auto-clear)

### Clear button (`✕`)

Unchecks all checkboxes in that table, hides bar.

### Language switch

`applyTranslations()` already calls `renderEtfThemes()` and `renderEtfList()`, so the bar text auto-updates on re-render (bar is cleared because checkboxes reset on re-render — acceptable).

---

## Files Changed

| File | Change |
|------|--------|
| `docs/index.html` | Add `#theme-selection-bar` + `#sub-selection-bar` divs; add `<th class="col-check">` to both table heads |
| `docs/static/app.js` | Remove `ticker-copy-btn` HTML + handlers from both renderers; add checkbox `<td>` per row; add `updateThemeSelectionBar()` + `updateSubSelectionBar()`; attach checkbox listeners after render; header checkbox logic with indeterminate state |
| `docs/static/style.css` | `.selection-bar`, `.selection-bar.hidden`, `.col-check`, `.row-check` styling |

---

## JS Architecture

Two symmetric helper functions (one per table):

```javascript
function updateThemeSelectionBar() {
  const checks = [...document.querySelectorAll("#etf-themes-body .row-check:checked")];
  const bar    = document.getElementById("theme-selection-bar");
  if (!checks.length) { bar.classList.add("hidden"); return; }

  const allTickers = checks.flatMap(cb => {
    const theme = cb.dataset.key;
    return _etfData?.themes?.[theme]?.tickers ?? [];
  });
  const deduped = [...new Set(allTickers)];

  bar.querySelector(".selection-bar__info").textContent =
    _lang === "de"
      ? `${checks.length} Theme${checks.length > 1 ? "s" : ""} ausgewählt · ${deduped.length} Ticker (dedupliziert)`
      : `${checks.length} theme${checks.length > 1 ? "s" : ""} selected · ${deduped.length} tickers (deduplicated)`;

  bar.classList.remove("hidden");
  bar.__deduped = deduped; // stash for copy handler
}
```

`updateSubSelectionBar()` is identical, using `#etf-list-body`, `#sub-selection-bar`, and `_etfData?.subnodes?.[key]?.tickers`.

Header checkbox logic (attached once per render):

```javascript
const headerCheck = thead.querySelector(".select-all-check");
const rowChecks   = [...tbody.querySelectorAll(".row-check:not([disabled])")];

rowChecks.forEach(cb => cb.addEventListener("change", () => {
  updateHeaderCheckState(headerCheck, rowChecks);
  updateThemeSelectionBar();
}));

headerCheck.addEventListener("change", () => {
  rowChecks.forEach(cb => cb.checked = headerCheck.checked);
  updateThemeSelectionBar();
});

function updateHeaderCheckState(headerCheck, rowChecks) {
  const checkedCount = rowChecks.filter(c => c.checked).length;
  headerCheck.indeterminate = checkedCount > 0 && checkedCount < rowChecks.length;
  headerCheck.checked = checkedCount === rowChecks.length;
}
```

---

## CSS

```css
/* Selection bar */
.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #0f2236;
  border-bottom: 1px solid #3b82f6;
  border-radius: 6px 6px 0 0;
  gap: 12px;
}
.selection-bar.hidden { display: none; }
.selection-bar__info  { color: #93c5fd; font-size: 0.85rem; }
.selection-bar__actions { display: flex; gap: 8px; flex-shrink: 0; }
.selection-bar__copy-btn {
  background: #3b82f6; color: white; border: none;
  border-radius: 5px; padding: 5px 14px; font-size: 0.82rem; cursor: pointer;
}
.selection-bar__copy-btn:hover { background: #2563eb; }
.selection-bar__clear-btn {
  background: transparent; color: #8b949e;
  border: 1px solid #30363d; border-radius: 5px;
  padding: 5px 10px; font-size: 0.82rem; cursor: pointer;
}
.col-check { width: 36px; text-align: center; padding: 4px; }
```

---

## Out of Scope

- No multi-select on the ETF Perf tab (those are ETF tickers, not stock tickers)
- No persistent selection across tab switches
- No "copy as JSON" or other formats — comma-separated only (TradingView compatible)
