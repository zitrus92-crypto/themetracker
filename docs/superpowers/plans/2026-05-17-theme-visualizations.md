# Theme Visualizations Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add sparkline Trend column to both Themes and Sub-Themes tables, plus optional Bubble Chart and Momentum Matrix views for the Themes tab.

**Architecture:** Pure vanilla JS + SVG — no external libraries. Sparklines are inline SVGs rendered per row. Bubble chart and Matrix are full SVG/HTML rendered into dedicated containers toggled via a new viz-toggle button group. A shared `computeAccel()` helper extracts the currently duplicated accel logic. `_themeVizView` state variable ("table" | "bubble" | "matrix") controls which view is shown when in the Themes tab.

**Tech Stack:** Vanilla JS, inline SVG, existing CSS variables, no new dependencies.

---

## File Map

| File | Changes |
|------|---------|
| `docs/index.html` | Add Trend th to both tables; add viz-toggle buttons; add `#etf-bubble-view` and `#etf-matrix-view` containers |
| `docs/static/app.js` | Add `computeAccel()`, `renderSparkline()`, `renderBubbleChart()`, `renderMomentumMatrix()`, `initThemeVizToggle()`; update both render functions; add i18n keys |
| `docs/static/style.css` | Add sparkline, bubble chart, matrix, and viz-toggle styles |

---

## Chunk 1: Sparkline column

### Task 1: `computeAccel()` helper + Sparkline function

**Files:**
- Modify: `docs/static/app.js` (around line 690, before `renderEtfThemes`)

The accel computation is currently duplicated inside `renderEtfThemes` and `renderEtfList`. Extract it once, use it everywhere.

- [ ] **Step 1: Add `computeThemeAccel()` helper before `renderEtfThemes`**

Insert this block at line ~690 (before `// --- Themes table`):

```javascript
// Compute Accel = rank_3M - rank_1M for a themes or subnodes map.
// Returns { [key]: number } — positive = fresh momentum.
function computeAccel(entries) {
  const sorted1M = [...entries].sort(([,a],[,b]) => (b.perfs["1M"] ?? -999) - (a.perfs["1M"] ?? -999));
  const sorted3M = [...entries].sort(([,a],[,b]) => (b.perfs["3M"] ?? -999) - (a.perfs["3M"] ?? -999));
  const rank1M = {}, rank3M = {};
  sorted1M.forEach(([k], i) => rank1M[k] = i + 1);
  sorted3M.forEach(([k], i) => rank3M[k] = i + 1);
  const accel = {};
  entries.forEach(([k]) => { accel[k] = (rank3M[k] ?? entries.length) - (rank1M[k] ?? entries.length); });
  return accel;
}

// Render a 4-point sparkline SVG (YTD→3M→1M→1W) colored by accel value.
function renderSparkline(perfs, accel) {
  const TFS = ["YTD", "3M", "1M", "1W"];
  const vals = TFS.map(tf => perfs[tf] ?? null);
  const defined = vals.filter(v => v !== null);
  if (defined.length < 2) return `<svg width="72" height="26" style="display:block"></svg>`;

  const min = Math.min(...defined);
  const max = Math.max(...defined);
  const range = max - min || 1;
  const W = 72, H = 26, PX = 5, PY = 4;

  const pts = vals.map((v, i) => {
    if (v === null) return null;
    const x = PX + (i / (TFS.length - 1)) * (W - 2 * PX);
    const y = H - PY - ((v - min) / range) * (H - 2 * PY);
    return [x.toFixed(1), y.toFixed(1)];
  });

  const polyPts = pts.filter(Boolean).map(p => p.join(",")).join(" ");
  const last = pts.filter(Boolean).pop();

  const color = accel >= 10 ? "#4ade80"
              : accel <= -10 ? "#f87171"
              : accel >= 5   ? "#86efac"
              : "#6b7280";

  const tooltipParts = TFS.map((tf, i) =>
    vals[i] !== null ? `${tf}: ${vals[i] > 0 ? "+" : ""}${vals[i].toFixed(1)}%` : `${tf}: —`
  ).join("  ");

  return `<svg width="72" height="26" style="display:block;cursor:help" title="${tooltipParts}">
    <polyline points="${polyPts}" fill="none" stroke="${color}" stroke-width="1.8"
      stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="2.2" fill="${color}"/>
  </svg>`;
}
```

- [ ] **Step 2: Replace duplicated accel logic in `renderEtfThemes`**

Find this block (~line 712–718):
```javascript
  const sorted1M = [...entries].sort(([,a],[,b]) => (b.perfs["1M"] ?? -999) - (a.perfs["1M"] ?? -999));
  const sorted3M = [...entries].sort(([,a],[,b]) => (b.perfs["3M"] ?? -999) - (a.perfs["3M"] ?? -999));
  const rank1M = {}, rank3M = {};
  sorted1M.forEach(([th], i) => rank1M[th] = i + 1);
  sorted3M.forEach(([th], i) => rank3M[th] = i + 1);
  const themeAccel = {};
  entries.forEach(([th]) => { themeAccel[th] = (rank3M[th] ?? entries.length) - (rank1M[th] ?? entries.length); });
```

Replace with:
```javascript
  const themeAccel = computeAccel(entries);
```

- [ ] **Step 3: Replace duplicated accel logic in `renderEtfList`**

Find the same block (~line 820–828 in renderEtfList):
```javascript
  const sorted1M = [...allEntries].sort(([,a],[,b]) => (b.perfs["1M"] ?? -999) - (a.perfs["1M"] ?? -999));
  const sorted3M = [...allEntries].sort(([,a],[,b]) => (b.perfs["3M"] ?? -999) - (a.perfs["3M"] ?? -999));
  const rank1M = {}, rank3M = {};
  sorted1M.forEach(([k], i) => rank1M[k] = i + 1);
  sorted3M.forEach(([k], i) => rank3M[k] = i + 1);
  const subAccel = {};
  allEntries.forEach(([k]) => { subAccel[k] = (rank3M[k] ?? allEntries.length) - (rank1M[k] ?? allEntries.length); });
```

Replace with:
```javascript
  const subAccel = computeAccel(allEntries);
```

- [ ] **Step 4: Add i18n key for Trend/Sparkline column**

In `I18N.de` add after `etfColAccel`:
```javascript
    colTrend:     "Trend",
```

In `I18N.en` add the same (already exists as `colTrend` in the heatmap section — verify that key name is shared and correct, or use `etfColTrend` if it conflicts).

Check: the heatmap table already has `colTrend`. Reuse it — no new key needed.

- [ ] **Step 5: Commit**

```bash
git add docs/static/app.js
git commit -m "refactor: extract computeAccel() helper; add renderSparkline() function"
```

---

### Task 2: Add Sparkline column to Themes table

**Files:**
- Modify: `docs/index.html` (line ~140)
- Modify: `docs/static/app.js` — `renderEtfThemes()` row template
- Modify: `docs/static/style.css`

- [ ] **Step 1: Add `<th>` to Themes table header in index.html**

After the `etfColEtfs` th (the "Top Sub-Themes" column), add:
```html
<th data-i18n="colTrend">Trend</th>
```

The thead row now has 11 columns (#, Theme, 1D, 1W, 1M, 3M, YTD, Score, Accel, Top Sub-Themes, Trend).

- [ ] **Step 2: Add sparkline cell to `renderEtfThemes()` row**

In the row template inside `renderEtfThemes`, after the `chips` td, add:
```javascript
      <td>${renderSparkline(row.perfs, themeAccel[theme] ?? 0)}</td>
```

The full return becomes:
```javascript
    return `<tr>
      <td>${idx + 1}</td>
      <td style="text-align:left">
        ${themeBadge(theme)}
        ${tickerBadge}
        ${copyBtn}
      </td>
      ${perfCells}
      <td>${row.score.toFixed(1)}</td>
      <td class="${accelClass}" title="${accelTooltip}" style="cursor:help;font-weight:700">${accelSign}${accel}</td>
      <td style="text-align:left">${chips}</td>
      <td>${renderSparkline(row.perfs, themeAccel[theme] ?? 0)}</td>
    </tr>`;
```

- [ ] **Step 3: Update colspan in BOTH fallback locations in `renderEtfThemes`**

`renderEtfThemes` has two `colspan` values that must both be updated:
1. Early-return guard (~line 695): `colspan="10"` → `colspan="11"`
2. Bottom empty-rows fallback (~line 776): `colspan="10"` → `colspan="11"`

- [ ] **Step 4: Add sparkline CSS to style.css**

Append to end of style.css:
```css
/* Sparkline column */
#etf-themes-table td:last-child,
#etf-list-table td:last-child { padding: 4px 8px; }
```

- [ ] **Step 5: Verify in browser**

Open `docs/index.html` locally. Go to Themes tab. Confirm: Trend column appears with colored SVG curves. Hover shows YTD/3M/1M/1W values. Green curves = high Accel, red = low.

- [ ] **Step 6: Commit**

```bash
git add docs/index.html docs/static/app.js docs/static/style.css
git commit -m "feat: add Trend sparkline column to Themes table (YTD→3M→1M→1W)"
```

---

### Task 3: Add Sparkline column to Sub-Themes table

**Files:**
- Modify: `docs/index.html` (line ~163)
- Modify: `docs/static/app.js` — `renderEtfList()` row template

- [ ] **Step 1: Add `<th>` to Sub-Themes table header in index.html**

After the `accel` th, add:
```html
<th data-i18n="colTrend">Trend</th>
```

- [ ] **Step 2: Add sparkline cell to `renderEtfList()` row**

In the row template inside `renderEtfList`, after the accel td, add:
```javascript
      <td>${renderSparkline(row.perfs, subAccel[key] ?? 0)}</td>
```

Full row becomes:
```javascript
    return `<tr>
      <td>${idx + 1}</td>
      <td style="text-align:left;font-weight:600">
        <a href="${subUrl}" target="_blank" rel="noopener" class="sub-theme-link">${row.label}</a>
        ${tickerBadge}
        ${copyBtn}
      </td>
      <td style="text-align:left">${themeBadge(row.theme)}</td>
      ${perfCells}
      <td>${row.score.toFixed(1)}</td>
      <td class="${accelClass}" title="${accelTooltip}" style="cursor:help;font-weight:700">${accelSign}${accel}</td>
      <td>${renderSparkline(row.perfs, subAccel[key] ?? 0)}</td>
    </tr>`;
```

- [ ] **Step 3: Update colspan in BOTH fallback locations in `renderEtfList`**

`renderEtfList` has two `colspan` values with DIFFERENT starting values (check the actual file):
1. Early-return guard (~line 802): `colspan="9"` → `colspan="10"` (was 9 before the Accel column was added, is now 10 — adding sparkline makes it 11; verify the current value in the file and increment by 1)
2. Bottom empty-rows fallback (~line 876): `colspan="10"` → `colspan="11"`

**Always verify the current colspan value in the file before changing it — increment by 1.**

- [ ] **Step 4: Verify in browser**

Switch to Sub-Themes view. Confirm sparkline column appears with correct colors and tooltips.

- [ ] **Step 5: Commit**

```bash
git add docs/index.html docs/static/app.js
git commit -m "feat: add Trend sparkline column to Sub-Themes table"
```

---

## Chunk 2: Bubble Chart + Momentum Matrix

### Task 4: Viz-toggle infrastructure + HTML containers

**Files:**
- Modify: `docs/index.html`
- Modify: `docs/static/app.js` — state var + `initThemeVizToggle()`
- Modify: `docs/static/style.css`

The viz toggle (Table | Bubble | Matrix) only applies to the Themes view. Sub-Themes is always a table.

- [ ] **Step 1: Add viz-toggle buttons and containers to index.html**

Inside `<div id="etf-themes-view">`, BEFORE the `<div class="table-scroll">`, add:
```html
<!-- Viz toggle: only visible in Themes tab -->
<div class="viz-toggle" id="theme-viz-toggle">
  <button class="viz-btn active" data-vizview="table">📋 Tabelle</button>
  <button class="viz-btn" data-vizview="bubble">🔵 Bubble</button>
  <button class="viz-btn" data-vizview="matrix">⊞ Matrix</button>
</div>
<div id="etf-bubble-view" class="hidden"></div>
<div id="etf-matrix-view" class="hidden"></div>
```

- [ ] **Step 2: Add state variable and toggle initializer to app.js**

After `let _etfListSort = ...` (~line 622), add:
```javascript
let _themeVizView = "table"; // "table" | "bubble" | "matrix"
```

After `initEtfViewToggle()` definition, add:
```javascript
function initThemeVizToggle() {
  document.querySelectorAll(".viz-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".viz-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      _themeVizView = btn.dataset.vizview;
      renderEtfThemes(_etfData);
    });
  });
}
```

- [ ] **Step 3: Call `initThemeVizToggle()` at bottom of app.js**

Find the block at the bottom that calls `initTabs()`, `initSortHeaders()`, etc., and add:
```javascript
initThemeVizToggle();
```

- [ ] **Step 4: Add viz-toggle CSS to style.css**

```css
/* Viz toggle (Table / Bubble / Matrix) */
.viz-toggle { display:flex; gap:6px; margin-bottom:12px; }
.viz-btn {
  padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  border: 1px solid var(--border); background: var(--bg2); color: var(--text-dim);
  cursor: pointer; transition: all 0.15s;
}
.viz-btn:hover { background: var(--bg3); color: var(--text); }
.viz-btn.active { background: var(--accent); color: #000; border-color: var(--accent); }
```

- [ ] **Step 5: Update `renderEtfThemes()` to show/hide views based on `_themeVizView`**

**Critical ordering:** `entries` and `themeAccel` must be computed BEFORE the view-switch so they can be passed to renderBubbleChart / renderMomentumMatrix.

The beginning of `renderEtfThemes()` must become:
```javascript
function renderEtfThemes(data) {
  const tbody = document.getElementById("etf-themes-body");
  if (!data || !data.themes) {
    tbody.innerHTML = `<tr><td colspan="11" class="empty-msg">${t("etfNoData")}</td></tr>`;
    return;
  }

  // Must be computed before view-switch so bubble/matrix can use it
  let entries = Object.entries(data.themes);
  const themeAccel = computeAccel(entries);

  // Show/hide the three view containers
  const tableScroll = document.querySelector("#etf-themes-view .table-scroll");
  if (tableScroll) tableScroll.classList.toggle("hidden", _themeVizView !== "table");
  document.getElementById("etf-bubble-view").classList.toggle("hidden", _themeVizView !== "bubble");
  document.getElementById("etf-matrix-view").classList.toggle("hidden", _themeVizView !== "matrix");

  if (_themeVizView === "bubble") { renderBubbleChart(data, themeAccel); return; }
  if (_themeVizView === "matrix") { renderMomentumMatrix(data, themeAccel); return; }

  // --- table view continues below ---
  // ... (rest of existing sort headers, sort, row rendering)
```

Note: use `#etf-themes-view .table-scroll` as selector (not the bare `.table-scroll`) to avoid accidentally hiding the sub-themes table-scroll when switching views.

- [ ] **Step 6: Commit**

```bash
git add docs/index.html docs/static/app.js docs/static/style.css
git commit -m "feat: add viz-toggle infrastructure (Table/Bubble/Matrix) to Themes tab"
```

---

### Task 5: Bubble Chart

**Files:**
- Modify: `docs/static/app.js` — add `renderBubbleChart()`

The bubble chart is an SVG scatter plot. X = 3M performance, Y = 1M performance. Bubble size = number of tickers. Color = Accel. Quadrant lines at median 3M / median 1M. Clicking a bubble opens the Finviz screener for that theme.

- [ ] **Step 1: Add `renderBubbleChart(data, themeAccel)` function to app.js**

Add before `renderEtfTab()`:

```javascript
function renderBubbleChart(data, themeAccel) {
  const container = document.getElementById("etf-bubble-view");
  const entries = Object.entries(data.themes)
    .filter(([,r]) => r.perfs["3M"] !== null && r.perfs["1M"] !== null);

  const all3M = entries.map(([,r]) => r.perfs["3M"]);
  const all1M = entries.map(([,r]) => r.perfs["1M"]);
  const med3M = [...all3M].sort((a,b)=>a-b)[Math.floor(all3M.length/2)];
  const med1M = [...all1M].sort((a,b)=>a-b)[Math.floor(all1M.length/2)];
  const min3M = Math.min(...all3M), max3M = Math.max(...all3M);
  const min1M = Math.min(...all1M), max1M = Math.max(...all1M);
  // Add 10% padding to axis ranges
  const pad3M = (max3M - min3M) * 0.1, pad1M = (max1M - min1M) * 0.1;
  const lo3M = min3M - pad3M, hi3M = max3M + pad3M;
  const lo1M = min1M - pad1M, hi1M = max1M + pad1M;

  const maxTickers = Math.max(...entries.map(([,r]) => (r.tickers || []).length)) || 1;

  const W = 640, H = 420;
  const PAD = { top: 24, right: 24, bottom: 44, left: 54 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const toX = v => PAD.left + ((v - lo3M) / (hi3M - lo3M)) * plotW;
  const toY = v => H - PAD.bottom - ((v - lo1M) / (hi1M - lo1M)) * plotH;
  const toR = n => Math.max(6, Math.min(22, 6 + (n / maxTickers) * 16));
  const toColor = a => a >= 10 ? "#4ade80" : a <= -10 ? "#f87171" : a >= 5 ? "#86efac" : "#6b7280";

  const medX = toX(med3M).toFixed(1);
  const medY = toY(med1M).toFixed(1);

  // Quadrant label positions
  const qLabels = [
    { x: PAD.left + 4,     y: PAD.top + 14,          text: "🚀 First Flag",   fill: "#4ade80" },
    { x: W - PAD.right - 4, y: PAD.top + 14,          text: "Extended ⚠️",     fill: "#f87171", anchor: "end" },
    { x: PAD.left + 4,     y: H - PAD.bottom - 6,     text: "💀 Dead",         fill: "#6b7280" },
    { x: W - PAD.right - 4, y: H - PAD.bottom - 6,    text: "🔻 Fading",       fill: "#f87171", anchor: "end" },
  ].map(q => `<text x="${q.x}" y="${q.y}" font-size="10" fill="${q.fill}"
    text-anchor="${q.anchor || "start"}" style="pointer-events:none">${q.text}</text>`).join("");

  // Axis tick lines + labels (5 ticks each axis)
  function axisTicks(axis) {
    const isX = axis === "x";
    const lo = isX ? lo3M : lo1M, hi = isX ? hi3M : hi1M;
    return Array.from({length: 5}, (_, i) => {
      const v = lo + (i / 4) * (hi - lo);
      const coord = isX ? toX(v).toFixed(1) : toY(v).toFixed(1);
      const lbl = `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
      return isX
        ? `<line x1="${coord}" y1="${H - PAD.bottom}" x2="${coord}" y2="${H - PAD.bottom + 4}" stroke="#4b5563" stroke-width="1"/>
           <text x="${coord}" y="${H - PAD.bottom + 15}" text-anchor="middle" font-size="9" fill="#6b7280">${lbl}</text>`
        : `<line x1="${PAD.left - 4}" y1="${coord}" x2="${PAD.left}" y2="${coord}" stroke="#4b5563" stroke-width="1"/>
           <text x="${PAD.left - 6}" y="${parseFloat(coord) + 3}" text-anchor="end" font-size="9" fill="#6b7280">${lbl}</text>`;
    }).join("");
  }

  const circles = entries.map(([theme, row]) => {
    const x = toX(row.perfs["3M"]).toFixed(1);
    const y = toY(row.perfs["1M"]).toFixed(1);
    const r = toR((row.tickers || []).length).toFixed(1);
    const accel = themeAccel[theme] ?? 0;
    const color = toColor(accel);
    const accelSign = accel > 0 ? "+" : "";
    const p3 = row.perfs["3M"] > 0 ? "+" : "";
    const p1 = row.perfs["1M"] > 0 ? "+" : "";
    const tip = `${theme}\n3M: ${p3}${row.perfs["3M"]?.toFixed(1)}%  1M: ${p1}${row.perfs["1M"]?.toFixed(1)}%\nAccel: ${accelSign}${accel}  |  ${(row.tickers||[]).length} Aktien`;
    const url = themeScreenerUrl(theme);
    const shortLabel = theme.length > 11 ? theme.slice(0, 9) + "…" : theme;
    return `<a href="${url}" target="_blank" rel="noopener">
      <circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity="0.72"
        stroke="${color}" stroke-width="0.8"><title>${tip}</title></circle>
      <text x="${x}" y="${(parseFloat(y) - parseFloat(r) - 3).toFixed(1)}"
        text-anchor="middle" font-size="8" fill="${color}" style="pointer-events:none">${shortLabel}</text>
    </a>`;
  }).join("");

  container.innerHTML = `
    <div class="bubble-chart-wrap">
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="max-width:100%">
        <!-- Grid background -->
        <rect x="${PAD.left}" y="${PAD.top}" width="${plotW}" height="${plotH}"
          fill="#0d1117" rx="4"/>
        <!-- Quadrant divider lines -->
        <line x1="${medX}" y1="${PAD.top}" x2="${medX}" y2="${H - PAD.bottom}"
          stroke="#374151" stroke-width="1" stroke-dasharray="5,4"/>
        <line x1="${PAD.left}" y1="${medY}" x2="${W - PAD.right}" y2="${medY}"
          stroke="#374151" stroke-width="1" stroke-dasharray="5,4"/>
        <!-- Axis ticks -->
        ${axisTicks("x")}${axisTicks("y")}
        <!-- Axis labels -->
        <text x="${PAD.left + plotW / 2}" y="${H - 4}" text-anchor="middle"
          font-size="11" fill="#9ca3af">3M Performance →</text>
        <text x="12" y="${PAD.top + plotH / 2}" text-anchor="middle" font-size="11"
          fill="#9ca3af" transform="rotate(-90,12,${PAD.top + plotH / 2})">1M Performance ↑</text>
        <!-- Quadrant labels -->
        ${qLabels}
        <!-- Bubbles -->
        ${circles}
      </svg>
      <div class="bubble-legend">
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#4ade80" fill-opacity="0.8"/></svg> Accel ≥ +10 (First Flag)</span>
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#86efac" fill-opacity="0.8"/></svg> Accel +5…+9</span>
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#6b7280" fill-opacity="0.8"/></svg> Neutral</span>
        <span class="bubble-legend-item"><svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="#f87171" fill-opacity="0.8"/></svg> Accel ≤ −10 (Extended/Fading)</span>
        <span class="bubble-legend-item"><svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="#9ca3af" fill-opacity="0.5"/></svg> Größe = Aktienanzahl</span>
      </div>
    </div>`;
}
```

- [ ] **Step 2: Add Bubble Chart CSS to style.css**

```css
/* Bubble Chart */
.bubble-chart-wrap { padding: 8px 0; }
.bubble-legend {
  display: flex; flex-wrap: wrap; gap: 12px;
  margin-top: 8px; padding: 0 8px; font-size: 11px; color: var(--text-dim);
}
.bubble-legend-item { display: flex; align-items: center; gap: 5px; }
```

- [ ] **Step 3: Verify in browser**

Click "🔵 Bubble" toggle. Confirm:
- Scatter plot appears with all ~40 themes
- Quadrant lines visible with labels (First Flag / Extended / Dead / Fading)
- Green bubbles in top-left (weak 3M, strong 1M = First Flag zone)
- Red bubbles in top-right (extended)
- Hover tooltip shows theme name, 3M, 1M, Accel, ticker count
- Clicking a bubble opens Finviz screener

- [ ] **Step 4: Commit**

```bash
git add docs/static/app.js docs/static/style.css
git commit -m "feat: add Bubble Chart view for Themes tab (3M vs 1M scatter, colored by Accel)"
```

---

### Task 6: Momentum Matrix

**Files:**
- Modify: `docs/static/app.js` — add `renderMomentumMatrix()`
- Modify: `docs/static/style.css`
- Modify: `docs/static/app.js` — i18n for DE/EN matrix labels

- [ ] **Step 1: Add i18n keys for matrix quadrant labels**

In `I18N.de` add:
```javascript
    matrixFresh:    "🚀 First Flag Zone",
    matrixFreshSub: "3M schwach → 1M stark",
    matrixTrend:    "⚡ Trending (Extended)",
    matrixTrendSub: "3M stark → 1M stark",
    matrixFading:   "🔻 Fading",
    matrixFadingSub:"3M stark → 1M schwach",
    matrixDead:     "💀 Dead",
    matrixDeadSub:  "beide schwach",
```

In `I18N.en` add:
```javascript
    matrixFresh:    "🚀 First Flag Zone",
    matrixFreshSub: "3M weak → 1M strong",
    matrixTrend:    "⚡ Trending (Extended)",
    matrixTrendSub: "3M strong → 1M strong",
    matrixFading:   "🔻 Fading",
    matrixFadingSub:"3M strong → 1M weak",
    matrixDead:     "💀 Dead",
    matrixDeadSub:  "both weak",
```

- [ ] **Step 2: Add `renderMomentumMatrix(data, themeAccel)` to app.js**

Add before `renderEtfTab()`:

```javascript
function renderMomentumMatrix(data, themeAccel) {
  const container = document.getElementById("etf-matrix-view");
  const entries = Object.entries(data.themes);

  const all3M = entries.map(([,r]) => r.perfs["3M"]).filter(v => v !== null);
  const all1M = entries.map(([,r]) => r.perfs["1M"]).filter(v => v !== null);
  const med3M = [...all3M].sort((a,b)=>a-b)[Math.floor(all3M.length/2)];
  const med1M = [...all1M].sort((a,b)=>a-b)[Math.floor(all1M.length/2)];

  const q = { fresh: [], trending: [], fading: [], dead: [] };
  entries.forEach(([theme, row]) => {
    const p3 = row.perfs["3M"] ?? 0;
    const p1 = row.perfs["1M"] ?? 0;
    if      (p3 < med3M && p1 >= med1M) q.fresh.push(theme);
    else if (p3 >= med3M && p1 >= med1M) q.trending.push(theme);
    else if (p3 >= med3M && p1 < med1M)  q.fading.push(theme);
    else                                  q.dead.push(theme);
  });

  const chips = (themes) => themes.map(theme => {
    const c = THEME_COLORS[theme] || { bg: "#1a1a2a", fg: "#8b949e" };
    const accel = themeAccel[theme] ?? 0;
    const accelSign = accel > 0 ? "+" : "";
    const tip = `Accel: ${accelSign}${accel}`;
    return `<a href="${themeScreenerUrl(theme)}" target="_blank" rel="noopener"
      class="etf-theme-badge matrix-chip" title="${tip}"
      style="background:${c.bg};color:${c.fg};text-decoration:none">${theme}</a>`;
  }).join(" ");

  container.innerHTML = `
    <div class="momentum-matrix">
      <div class="matrix-cell matrix-fresh">
        <div class="matrix-cell-hdr">${t("matrixFresh")}<span class="matrix-sub">${t("matrixFreshSub")}</span></div>
        <div class="matrix-chips">${chips(q.fresh)}</div>
      </div>
      <div class="matrix-cell matrix-trending">
        <div class="matrix-cell-hdr">${t("matrixTrend")}<span class="matrix-sub">${t("matrixTrendSub")}</span></div>
        <div class="matrix-chips">${chips(q.trending)}</div>
      </div>
      <div class="matrix-cell matrix-dead">
        <div class="matrix-cell-hdr">${t("matrixDead")}<span class="matrix-sub">${t("matrixDeadSub")}</span></div>
        <div class="matrix-chips">${chips(q.dead)}</div>
      </div>
      <div class="matrix-cell matrix-fading">
        <div class="matrix-cell-hdr">${t("matrixFading")}<span class="matrix-sub">${t("matrixFadingSub")}</span></div>
        <div class="matrix-chips">${chips(q.fading)}</div>
      </div>
    </div>
    <p style="font-size:11px;color:var(--text-dim);margin-top:8px;padding:0 4px">
      ${_lang === "de"
        ? `Einteilung nach Median 3M (${med3M > 0 ? "+" : ""}${med3M.toFixed(1)}%) und Median 1M (${med1M > 0 ? "+" : ""}${med1M.toFixed(1)}%). Klick auf Theme öffnet Finviz.`
        : `Divided at median 3M (${med3M > 0 ? "+" : ""}${med3M.toFixed(1)}%) and median 1M (${med1M > 0 ? "+" : ""}${med1M.toFixed(1)}%). Click any theme to open Finviz.`}
    </p>`;
}
```

- [ ] **Step 3: Add Matrix CSS to style.css**

```css
/* Momentum Matrix */
.momentum-matrix {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  margin-bottom: 8px;
}
.matrix-cell {
  border-radius: 8px; border: 1px solid var(--border);
  padding: 12px; min-height: 120px;
}
.matrix-fresh   { background: #0a1f12; border-color: #4ade80; }
.matrix-trending{ background: #1f1200; border-color: #f97316; }
.matrix-dead    { background: #111; border-color: #374151; }
.matrix-fading  { background: #1f0a0a; border-color: #f87171; }
.matrix-cell-hdr {
  font-size: 11px; font-weight: 700; margin-bottom: 8px;
  display: flex; align-items: baseline; gap: 6px;
}
.matrix-fresh    .matrix-cell-hdr { color: #4ade80; }
.matrix-trending .matrix-cell-hdr { color: #f97316; }
.matrix-dead     .matrix-cell-hdr { color: #6b7280; }
.matrix-fading   .matrix-cell-hdr { color: #f87171; }
.matrix-sub { font-size: 9px; font-weight: 400; opacity: 0.7; }
.matrix-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.matrix-chip { font-size: 11px !important; }
```

- [ ] **Step 4: Verify in browser**

Click "⊞ Matrix" toggle. Confirm:
- 4 quadrants visible with theme chips in each
- First Flag Zone (top-left) shows themes with high Accel
- Clicking any chip opens Finviz screener
- Median values shown in footnote
- Language switch updates quadrant labels

- [ ] **Step 5: Push everything**

```bash
git add docs/index.html docs/static/app.js docs/static/style.css
git commit -m "feat: add Momentum Matrix view for Themes tab (4-quadrant: First Flag / Trending / Fading / Dead)"
git push
```

---

## Verification Checklist

After all tasks complete, verify:

- [ ] Sparklines appear in Themes table — colored green/red/grey by Accel
- [ ] Sparklines appear in Sub-Themes table — same logic
- [ ] Hover on sparkline shows YTD/3M/1M/1W values
- [ ] Language switch (DE/EN) re-renders all three views correctly
- [ ] Bubble Chart: all ~40 themes visible, quadrant labels correct, hover tooltip works, click opens Finviz
- [ ] Momentum Matrix: themes correctly classified by median split, chips clickable
- [ ] Refresh button re-loads data and re-renders current view
- [ ] No console errors in browser devtools
