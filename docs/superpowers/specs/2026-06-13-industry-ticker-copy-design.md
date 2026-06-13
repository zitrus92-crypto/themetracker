# Industry Ticker Copy — Design Spec

**Goal:** Let the user copy the stock tickers of an industry to the clipboard for TradingView, across all three Industry sub-views — full multi-select on the Heatmap (analogous to Themes), and single-industry copy buttons on Setup Picks and Top 10.

**User story:** Christoph already copies Theme ticker lists via multi-select. He wants the same capability for industries: select several industries in the Heatmap and copy their combined deduplicated tickers, plus a quick one-click copy for any single industry in the Setup Picks and Top 10 views.

---

## Data Layer (shared by all three views)

Industries currently have no ticker lists in `data.json`. We add them once in the scraper; all three views consume the same data.

### Scraper

Each industry maps to a Finviz industry filter `ind_<slug>`, where `<slug>` is the existing `ticker` field (e.g. `advertisingagencies`). Tickers are fetched with the **existing** `_fetch_tickers_for_slug(slug, filter_prefix="ind")` helper (v=410 bubble view, `data-boxover-ticker` extraction) — the same proven path used for Themes and the GLB screener.

New function in `scraper.py`:

```python
def fetch_industry_tickers(scored: dict) -> dict:
    """Attach a `tickers` list to each scored industry (in-place) via Finviz ind_ filter.

    scored: output of compute_scores() — {industry_name: {..., "ticker": slug}}
    Fetches tickers in parallel (ThreadPoolExecutor), same pattern as themes.
    Returns the same dict with each entry gaining a "tickers": [...] key.
    """
```

- Parallel fetch with `ThreadPoolExecutor(max_workers=5)` (same as themes)
- ~144 industries × one request each; on failure for an industry, store `tickers: []` and continue (never crash the run)
- Called from `fetch_industries()` in `scrape.py`, after `compute_scores()`, before returning

### data.json schema change

Each industry entry gains a `tickers` array:

```json
{
  "Advertising Agencies": {
    "composite": 58.9,
    "acceleration": -74,
    "ranks": { "1D": 5, "1W": 144, ... },
    "perfs": { "1D": 3.03, ... },
    "ticker": "advertisingagencies",
    "tickers": ["ACCS", "ADV", "APP", "BAOS", ...]
  }
}
```

Backward compatible: a missing/empty `tickers` array degrades gracefully (copy disabled).

---

## View 1: Heatmap — Multi-Select (Themes analog)

Exact mirror of the existing Themes multi-select. Reuses the existing `.selection-bar`, `.col-check`, `.row-check` CSS — no new styles.

### index.html (`#heatmap-table`)

- Add `<div id="ind-selection-bar" class="selection-bar hidden">` immediately before the `.table-scroll` that wraps `#heatmap-table`. Same inner structure as Themes: `.selection-bar__info` + actions with `.selection-bar__copy-btn` ("📋 Kopieren") and `.selection-bar__clear-btn` ("✕").
- Add a leading `<th class="col-check"><input type="checkbox" id="ind-select-all"></th>` as the first column header.

### app.js (`renderHeatmap`)

- Add a leading `<td class="col-check"><input type="checkbox" class="row-check"${hasTickers ? '' : ' disabled'} data-key="${esc(name)}"></td>` to each row. `hasTickers` = `row.tickers && row.tickers.length > 0`.
- `data-key` is the **industry display name** (the key into `industries`), escaped.
- Update the empty-state `colspan="10"` → `colspan="11"` (one new column).
- After building rows, attach multi-select wiring:
  - `updateIndSelectionBar()` — collects checked `.row-check` in `#heatmap-body`, flattens `_lastIndustries[name].tickers`, dedups with `new Set`, updates `#ind-selection-bar` info text + stores `bar.__deduped`, toggles `.hidden`.
  - Header checkbox `#ind-select-all` via `.onchange` (assignment, not addEventListener — prevents listener accumulation across re-renders, same fix as Themes), with indeterminate state.
  - Per-row checkbox `change` listeners (safe: tbody.innerHTML replaces them each render).
  - Copy button `.onclick` → `navigator.clipboard.writeText(deduped.join(","))` + `showToast`.
  - Clear button `.onclick` → uncheck all, hide bar.

Info text (i18n):
- DE: `"3 Industries ausgewählt · 87 Ticker (dedupliziert)"`
- EN: `"3 industries selected · 87 tickers (deduplicated)"`

**Note on re-render:** `renderHeatmap` runs on every sort click and INST-filter toggle, so checkbox selections reset on re-render — acceptable, identical to Themes behavior.

---

## View 2: Setup Picks — Single Copy Button

Each pick card gets a small 📋 button that copies that one industry's tickers.

### app.js (`renderPicks`)

- For each pick, after looking up the industry's `tickers`, render a `<button class="ind-copy-btn" data-key="${esc(name)}" title="...">📋</button>` in the card header area (next to the industry name). Omit/disable when the industry has no tickers.
- After rendering, attach click handlers: copy `_lastIndustries[name].tickers.join(",")` → clipboard, flash "✓", `showToast`.

The pick objects already reference an industry; map back to `_lastIndustries[name].tickers` using the pick's industry name.

---

## View 3: Top 10 (Cards + Bars) — Single Copy Button

Both the cards view (`renderCards`) and bar view (`renderBarChart`) list industries by name. Each industry name gets an inline 📋 affordance copying that industry's tickers.

### app.js (`renderCards` and `renderBarChart`)

- Next to each industry `nameEl`, render `<button class="ind-copy-btn ind-copy-btn--inline" data-key="${esc(name)}" title="...">📋</button>` (disabled/omitted when no tickers).
- Attach the same click handler pattern after `container.innerHTML = ...`.
- The same industry appearing across multiple timeframe cards each gets its own button — each copies that industry's full ticker list (no shared state, so duplicates are harmless).

---

## Shared copy helper

To avoid three near-identical click handlers, add one helper in app.js:

```javascript
// Wire all .ind-copy-btn buttons inside a container to copy that industry's tickers.
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

`renderPicks`, `renderCards`, `renderBarChart` each call `wireIndCopyButtons(container)` after setting innerHTML.

The Heatmap multi-select wiring is separate (its own functions), since it is the full checkbox pattern, not the single-button pattern.

---

## i18n Keys (add to both I18N.de and I18N.en)

```javascript
// DE
indSelInfo: (n, t) => `${n} Industr${n === 1 ? "y" : "ies"} ausgewählt · ${t} Ticker (dedupliziert)`,
indCopyTitle: "Ticker dieser Industry kopieren",
// EN
indSelInfo: (n, t) => `${n} industr${n === 1 ? "y" : "ies"} selected · ${t} tickers (deduplicated)`,
indCopyTitle: "Copy this industry's tickers",
```

(The selection-bar copy/clear button labels reuse the existing translated `.selection-bar__copy-btn` handling in `applyTranslations` — already covers Themes; the heatmap bar's button gets the same treatment since the existing code selects ALL `.selection-bar__copy-btn` elements.)

---

## CSS (new)

Reuse existing `.selection-bar*` and `.col-check` for the Heatmap (no changes). Add a small per-item copy button:

```css
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

---

## Error Handling

- Industry with no fetched tickers: checkbox disabled (Heatmap); copy button omitted or disabled (Picks/Top 10).
- Scraper failure for one industry: `tickers: []`, run continues.
- `navigator.clipboard` unavailable: `.then()` simply never fires (consistent with existing copy handlers); no crash.

---

## Out of Scope

- No multi-select on Setup Picks or Top 10 (explicit user decision — single 📋 there).
- No "copy all shown" aggregate button.
- No ticker count badges on industries.
- No change to the existing Themes/GLB copy features.
