# Top 20% Quick-Select — Design Spec

**Goal:** Add a one-click "Top 20%" button to the Industry Heatmap and the Themes overview table that auto-selects (checks) the top 20% of rows in the current sort order, so the user can immediately copy those tickers into a TradingView watchlist.

**User story:** Christoph sorts the Heatmap (or Themes table) by a timeframe (e.g. 1M descending = strongest first), clicks "Top 20%", and the strongest 20% are checked. The existing selection bar appears with the deduplicated ticker total; he clicks "📋 Kopieren" and pastes into TradingView.

---

## Approach

Reuse the existing multi-select machinery (checkbox column, `.row-check`, header checkbox, selection bar, copy button). The new button only *programmatically checks* the top 20% of currently-displayed rows, then triggers the existing selection-bar update. No change to the copy logic.

"Top 20% of the selected timeframe" = the top 20% of rows **as currently sorted** (approach A, user-confirmed). The user sorts by the timeframe column they care about; the button selects the top slice of that order.

---

## Behaviour

On click:
1. Collect `.row-check` checkboxes in DOM order (= current sort order) from the table body.
2. `cutoff = Math.ceil(total_rows * 0.20)` (at least 1 when rows exist).
3. **Replace** the current selection: uncheck all, then check the first `cutoff` rows whose checkbox is **enabled** (rows without tickers are disabled and simply skipped — they still occupy a rank slot, so the count stays "top 20% of all rows").
4. Recompute the header checkbox state (indeterminate / checked).
5. Call the existing `updateIndSelectionBar()` / `updateThemeSelectionBar()` so the selection bar shows count + deduplicated ticker total.

Because it queries the live DOM at click time, it automatically respects:
- the current sort column **and** direction,
- the Heatmap INST filter (filtered rows aren't in the DOM),
- the current row set.

Edge cases:
- No rows yet (data not loaded / bubble or matrix view active for themes) → no-op.
- All top-20% rows lack tickers → nothing checked, bar stays hidden (harmless).

---

## Scope

- **In:** Industry Heatmap (`#heatmap-body`), Themes overview table (`#etf-themes-body`).
- **Out:** Sub-Themes table, ETF Perf tab, Top 10 / Setup Picks (those use single-copy, not multi-select), Bubble/Matrix views.

---

## Files Changed

| File | Change |
|------|--------|
| `docs/index.html` | Add a `Top 20%` button to `.heatmap-header` and to the Themes `#theme-viz-toggle` row |
| `docs/static/style.css` | Add `.top20-btn` styling |
| `docs/static/app.js` | Add shared `selectTopPercent()` helper + `initTop20Buttons()` wiring + i18n label/tooltip |

---

## Shared Helper (app.js)

```javascript
// Check the top `pct` fraction of rows (current sort order) in a multi-select
// table body, replacing any existing selection, then refresh its selection bar.
function selectTopPercent(tbodyId, headerCheckId, updateFn, pct = 0.20) {
  const checks = [...document.querySelectorAll(`#${tbodyId} .row-check`)];
  if (!checks.length) return;
  const cutoff = Math.max(1, Math.ceil(checks.length * pct));
  checks.forEach((cb, i) => { cb.checked = i < cutoff && !cb.disabled; });

  const header  = document.getElementById(headerCheckId);
  const enabled = checks.filter(cb => !cb.disabled);
  const checked = enabled.filter(cb => cb.checked).length;
  if (header) {
    header.indeterminate = checked > 0 && checked < enabled.length;
    header.checked       = checked > 0 && checked === enabled.length;
  }
  updateFn();
}
```

`updateIndSelectionBar` and `updateThemeSelectionBar` are already top-level functions — callable directly.

Wiring (added to the existing init sequence near the bottom of app.js):

```javascript
function initTop20Buttons() {
  const indBtn = document.getElementById("ind-top20-btn");
  if (indBtn) indBtn.onclick = () =>
    selectTopPercent("heatmap-body", "ind-select-all", updateIndSelectionBar);

  const themeBtn = document.getElementById("theme-top20-btn");
  if (themeBtn) themeBtn.onclick = () =>
    selectTopPercent("etf-themes-body", "theme-select-all", updateThemeSelectionBar);
}
```

Called once alongside `initInstToggle()` etc. The buttons live in static HTML (not re-rendered), so wiring once is correct; the handler reads live DOM each click.

---

## HTML

Heatmap header (next to the INST toggle):
```html
<button id="ind-top20-btn" class="top20-btn" data-i18n="top20Btn" title="...">★ Top 20%</button>
```

Themes viz-toggle row (`#theme-viz-toggle`):
```html
<button id="theme-top20-btn" class="top20-btn" data-i18n="top20Btn" title="...">★ Top 20%</button>
```

Label + tooltip via i18n keys `top20Btn` / `top20Title` (DE/EN). `applyTranslations()` already updates `[data-i18n]` text and titles for such buttons; the title is set through a new small line in `applyTranslations` (or a `data-i18n-title` pattern — match the existing approach).

---

## i18n

```javascript
// DE
top20Btn:   "★ Top 20%",
top20Title: "Top 20% der aktuellen Sortierung markieren (zum Kopieren)",
// EN
top20Btn:   "★ Top 20%",
top20Title: "Select the top 20% of the current sort (for copying)",
```

---

## CSS

```css
.top20-btn {
  background: #1f2937; color: #fbbf24;
  border: 1px solid #3b4252; border-radius: 6px;
  padding: 5px 12px; font-size: 0.82rem; cursor: pointer;
  white-space: nowrap;
}
.top20-btn:hover { background: #2b3648; border-color: #fbbf24; }
```

---

## Out of Scope

- No configurable percentage (fixed 20%).
- No auto-copy (user still clicks the existing "📋 Kopieren").
- No change to Sub-Themes / Top 10 / Setup Picks.
