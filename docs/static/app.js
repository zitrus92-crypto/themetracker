const TIMEFRAMES     = ["1D", "1W", "1M", "3M", "YTD"];
const ETF_TIMEFRAMES = ["1D", "1W", "1M", "3M", "YTD"];
const SPARKLINE_ORDER = ["YTD", "3M", "1M", "1W", "1D"];

// --- i18n ---
const I18N = {
  de: {
    notLoaded:    "— noch nicht geladen —",
    updated:      "Stand: ",
    loading:      "Daten werden geladen…",
    noData:       "Keine Daten.",
    topIndustry:  "Industry",
    tabHeatmap:   "Heatmap",
    tabPicks:     "★ Setup Picks",
    tabTop10:     "Top 10",
    heatmapTitle: "Industry Heatmap",
    colIndustry:  "Industry",
    colScore:     "Score",
    colAccel:     "Accel",
    colTrend:     "Trend",
    picksTitle:   "★ Setup Picks — First Flag",
    picksSubtitle:"Industries mit positivem Momentum-Profil für den First-Flag-Breakout-Trade.",
    picksColReason: "Setup-Begründung",
    picksEmpty:   "Aktuell keine Industries mit First-Flag-Profil gefunden.",
    top10Title:   "Top 10 per Zeitraum",
    tagHot:       "HOT",
    tagAccel:     "ACCEL ▲",
    tagFresh:     "FRISCH",
    reasonFresh:  (p3m, p1m) => `Schwache 3M-Basis (${p3m}%) aber 1M stark → erster Leg, nicht extended.`,
    reasonSolid:  ()         => `3M solide, 1W beschleunigt weiter → Trend intakt, Momentum nimmt zu.`,
    reasonSteady: ()         => `Gleichmäßig stark über 1W/1M — konsistentes Sektoren-Momentum.`,
    reasonAccel:  (acc)      => `Starke Beschleunigung (Accel +${acc}) deutet auf frisches institutionelles Interesse hin.`,
    reasonIntraday: (p1d)    => `Intraday +${p1d}% — Breakout läuft heute bereits.`,
    moversTitle:  "Where is the Puck going?",
    moversSubtitle: "Rank-Veränderung seit dem gewählten Zeitraum. Je größer der Sprung, desto stärker das Momentum.",
    moversRising: "Rising — Puck kommt hier an",
    moversFading: "Fading — Puck verlässt",
    moversNoData: (period) => `Noch nicht genug Daten für ${period}. Bitte warte bis genug tägliche Snapshots gesammelt wurden.`,
    moversCompare:(date) => `vs. ${date}`,
    viewCards:    "📊 Karten",
    viewBars:     "📈 Balken",
    tagInst:      "INST",
    infoScore:    "Gewichteter Rang-Score: 1M×70% + 1W×20% + 3M×10%. Niedriger = besser (Rang 1 = stärkste Industry).",
    infoAccel:    "Accel = 3M-Rang minus 1W-Rang. Hoch positiv = war vor 3M noch schwach, jetzt stark = erster Leg, nicht extended. Ideal fuer First-Flag-Setups.",
    hintHeatmap:  "Score sortieren: Marktüberblick — welche Industries aktuell führen.\nAccel sortieren: First Flag Suche — frisches Momentum (3M schwach + 1W stark = erster Leg, nicht extended).\nINST-Filter: zeigt nur institutionell bestätigte Industries (Top 40 in 1M und 3M).\nKlick auf Spaltenkopf = sortieren, nochmal klicken = umkehren.",
    hintPicks:    "Vorgefilterter First-Flag-Kandidatenliste: Score Top 40 + positiver Accel + 1W > 1% + 1M > 0%.\nSortierung: 60% Accel-Gewicht + 40% Score — frischeste Bewegungen zuerst.\nINST-Badge = institutionelles Kapital bestätigt die Industry = höchste Konfluenz.\nKlick auf Industry-Name öffnet Finviz-Screener mit passenden Filtern.",
    hintTop10:    "Top 10 Performer pro Zeitraum — zeigt aktuelle Marktführer.\nKarten: kompakte Übersicht pro Zeitraum.\nBalken: alle Industries sortiert nach 1M und 3M Performance.\nINST-Badge zeigt institutionelles Interesse.",
    hintMovers:   "Rang-Veränderung seit dem gewählten Zeitraum.\nRising: Industries die am stärksten gestiegen sind — frisches Kapital fließt ein. Hier suchen!\nFading: Industries die Ränge verloren haben — Kapital verlässt diesen Bereich. Meiden.\nZeitraum wählen: 1W / 2W / 1M / 3M (ausgegraut = noch nicht genug Daten).",
    tabEtfs:      "📈 Themes",
    etfTitle:     "Finviz Thematic Heatmap",
    etfViewThemes:"Themes",
    etfViewEtfs:  "Sub-Themes",
    etfColEtfs:   "Top Sub-Themes",
    etfColAccel:  "Accel",
    etfNoData:    "Theme-Daten werden geladen oder sind noch nicht verfügbar.",
    hintEtfs:     "Finviz Thematic Map — 40 Themes, 268 Sub-Themes (direkte Stock-Daten).\nThemes-Ansicht: Aggregierter Durchschnitt aller Sub-Nodes je Theme. Score = gewichteter Rank (1M×70%+1W×20%+3M×10%).\nSub-Themes: 268 granulare Segmente sortierbar nach beliebigem Zeitraum.\nNutzung: Themes mit starkem 1M UND 3M Score = institutionell bestätigtes Momentum (wie Ariel-Kriterium).",
    hintThemeAccel: "Accel = Differenz zwischen 3M-Rang und 1M-Rang aller Themes.\n\n🟢 Hoher positiver Wert (+10 bis +30): Theme war vor 3 Monaten noch schwach, hat aber im letzten Monat stark aufgeholt → frisches Momentum, ideale First-Flag-Zone. Noch Fleisch am Knochen!\n\n⚪ Nahe null (-5 bis +5): Theme läuft gleichmäßig — weder fresh noch extended.\n\n🔴 Negativer Wert: Theme lief schon vor 3 Monaten stark und ist seitdem abgeflacht → möglicherweise extended oder dreht bereits.",
    hintSubAccel:   "Accel = Differenz zwischen 3M-Rang und 1M-Rang aller 268 Sub-Themes.\n\n🟢 Stark positiv: Sub-Theme war vor 3M noch schwach, zieht jetzt an → frisches Momentum innerhalb des übergeordneten Themes. Ideal für First-Flag-Suche.\n\n⚪ Nahe null: gleichmäßige Bewegung.\n\n🔴 Negativ: Sub-Theme lief 3M schon stark, flacht ab → möglicherweise extended.\n\nTipp: Absteigend sortieren → die heißesten Sub-Theme-Pockets finden.",
    matrixFresh:    "🚀 First Flag Zone",
    matrixFreshSub: "3M schwach → 1M stark",
    matrixTrend:    "⚡ Trending (Extended)",
    matrixTrendSub: "3M stark → 1M stark",
    matrixFading:   "🔻 Fading",
    matrixFadingSub:"3M stark → 1M schwach",
    matrixDead:     "💀 Dead",
    matrixDeadSub:  "beide schwach",
    vizTable:       "📋 Tabelle",
    vizBubble:      "🔵 Bubble",
    vizMatrix:      "⊞ Matrix",
    topEtfs:          "📊 ETFs",
    etfPerfTitle:     "ETF Performance",
    etfPerfColEtf:    "ETF",
    etfPerfNoData:    "ETF-Daten werden geladen oder sind noch nicht verfügbar.",
    hintEtfPerf:      "32 ETFs in 4 Kategorien: Broad Market, US Sectors, Commodities, Crypto.\nScore = gewichteter Rang (1M×70%+1W×20%+3M×10%). Accel = 3M-Rang minus 1M-Rang.\nKlick auf Ticker öffnet Finviz-Chart.",
  },
  en: {
    notLoaded:    "— not yet loaded —",
    updated:      "Updated: ",
    loading:      "Loading data…",
    noData:       "No data.",
    topIndustry:  "Industry",
    tabHeatmap:   "Heatmap",
    tabPicks:     "★ Setup Picks",
    tabTop10:     "Top 10",
    heatmapTitle: "Industry Heatmap",
    colIndustry:  "Industry",
    colScore:     "Score",
    colAccel:     "Accel",
    colTrend:     "Trend",
    picksTitle:   "★ Setup Picks — First Flag",
    picksSubtitle:"Industries with positive momentum profile for First Flag breakout trades.",
    picksColReason: "Setup Rationale",
    picksEmpty:   "No industries with First Flag profile found.",
    top10Title:   "Top 10 per Timeframe",
    tagHot:       "HOT",
    tagAccel:     "ACCEL ▲",
    tagFresh:     "FRESH",
    reasonFresh:  (p3m, p1m) => `Weak 3M base (${p3m}%) but 1M strong → first leg confirmed, not extended.`,
    reasonSolid:  ()         => `3M solid, 1W accelerating further → trend intact, momentum building.`,
    reasonSteady: ()         => `Consistently strong across 1W/1M — steady sector momentum.`,
    reasonAccel:  (acc)      => `Strong acceleration (Accel +${acc}) suggests fresh institutional interest.`,
    reasonIntraday: (p1d)    => `Intraday +${p1d}% — breakout already running today.`,
    moversTitle:  "Where is the Puck going?",
    moversSubtitle: "Rank change since the selected period. The bigger the jump, the stronger the momentum.",
    moversRising: "Rising — Puck heading here",
    moversFading: "Fading — Puck leaving",
    moversNoData: (period) => `Not enough data for ${period} yet. Wait until enough daily snapshots are collected.`,
    moversCompare:(date) => `vs. ${date}`,
    viewCards:    "📊 Cards",
    viewBars:     "📈 Bar Chart",
    tagInst:      "INST",
    infoScore:    "Weighted rank score: 1M×70% + 1W×20% + 3M×10%. Lower = better (rank 1 = strongest industry).",
    infoAccel:    "Accel = 3M rank minus 1W rank. High positive = was weak 3M ago, now strong = first leg, not extended. Ideal for First Flag setups.",
    hintHeatmap:  "Sort by Score: market overview — which industries are currently leading.\nSort by Accel: First Flag search — fresh momentum (weak 3M + strong 1W = first leg, not extended).\nINST filter: shows only institutionally confirmed industries (Top 40 in 1M and 3M).\nClick any column header to sort, click again to reverse.",
    hintPicks:    "Pre-filtered First Flag candidate list: Score Top 40 + positive Accel + 1W > 1% + 1M > 0%.\nSorted by: 60% Accel weight + 40% Score — freshest moves first.\nINST badge = institutional capital confirms the industry = highest confluence.\nClick any industry name to open Finviz screener with matching filters.",
    hintTop10:    "Top 10 performers per timeframe — shows current market leaders.\nCards: compact overview per timeframe.\nBar chart: all industries sorted by 1M and 3M performance.\nINST badge shows institutional interest.",
    hintMovers:   "Rank change since the selected period.\nRising: industries that climbed most in ranking — fresh capital flowing in. Look here!\nFading: industries that lost ranks — capital leaving. Avoid.\nSelect period: 1W / 2W / 1M / 3M (greyed out = not enough data yet).",
    tabEtfs:      "📈 Themes",
    etfTitle:     "Finviz Thematic Heatmap",
    etfViewThemes:"Themes",
    etfViewEtfs:  "Sub-Themes",
    etfColEtfs:   "Top Sub-Themes",
    etfColAccel:  "Accel",
    etfNoData:    "Theme data loading or not yet available.",
    hintEtfs:     "Finviz Thematic Map — 40 themes, 268 sub-themes (direct stock data).\nThemes view: averaged across all sub-nodes per theme. Score = weighted rank (1M×70%+1W×20%+3M×10%).\nSub-Themes: 268 granular segments sortable by any timeframe.\nUsage: themes with strong 1M AND 3M score = institutionally confirmed momentum (Ariel criterion).",
    hintThemeAccel: "Accel = difference between 3M rank and 1M rank across all themes.\n\n🟢 High positive (+10 to +30): theme was weak 3 months ago but surged in the last month → fresh momentum, ideal First Flag zone. Plenty of room to run!\n\n⚪ Near zero (-5 to +5): theme is moving steadily — neither fresh nor extended.\n\n🔴 Negative: theme was already strong 3 months ago and has since slowed → possibly extended or beginning to rotate out.",
    hintSubAccel:   "Accel = difference between 3M rank and 1M rank across all 268 sub-themes.\n\n🟢 High positive: sub-theme was weak 3M ago, now accelerating → fresh momentum within the parent theme. Ideal for First Flag search.\n\n⚪ Near zero: steady movement.\n\n🔴 Negative: sub-theme was already strong 3M ago, now slowing → possibly extended.\n\nTip: Sort descending → find the hottest sub-theme pockets.",
    matrixFresh:    "🚀 First Flag Zone",
    matrixFreshSub: "3M weak → 1M strong",
    matrixTrend:    "⚡ Trending (Extended)",
    matrixTrendSub: "3M strong → 1M strong",
    matrixFading:   "🔻 Fading",
    matrixFadingSub:"3M strong → 1M weak",
    matrixDead:     "💀 Dead",
    matrixDeadSub:  "both weak",
    vizTable:       "📋 Table",
    vizBubble:      "🔵 Bubble",
    vizMatrix:      "⊞ Matrix",
    topEtfs:          "📊 ETFs",
    etfPerfTitle:     "ETF Performance",
    etfPerfColEtf:    "ETF",
    etfPerfNoData:    "ETF data is loading or not yet available.",
    hintEtfPerf:      "32 ETFs in 4 categories: Broad Market, US Sectors, Commodities, Crypto.\nScore = weighted rank (1M×70%+1W×20%+3M×10%). Accel = 3M rank minus 1M rank.\nClick any ticker to open Finviz chart.",
  },
};

let _lang = "de";
const t = (key, ...args) => {
  const val = I18N[_lang][key];
  return typeof val === "function" ? val(...args) : (val ?? key);
};

function initSectionHints() {
  document.querySelectorAll(".section-hint[data-hint-key]").forEach(el => {
    el.setAttribute("data-tip", t(el.dataset.hintKey));
  });
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (key === "colScore") {
      const isActive = el.classList.contains("sort-active");
      const arrow = isActive ? (_sortState.dir === 1 ? " ▲" : " ▼") : (_sortState.col === "score" ? " ▲" : "");
      el.innerHTML = t(key) + arrow + ` <span class="col-info" title="${t('infoScore')}">i</span>`;
    } else {
      el.textContent = t(key);
    }
  });
  // Viz-toggle buttons are not handled via data-i18n (buttons reset textContent unreliably)
  const vizTableBtn = document.querySelector(".viz-btn[data-vizview='table']");
  if (vizTableBtn) vizTableBtn.textContent = _lang === "de" ? "📋 Tabelle" : "📋 Table";
  document.documentElement.lang = _lang;
  document.getElementById("lang-btn").textContent = _lang === "de" ? "EN" : "DE";
  initSectionHints();
  if (_lastPayload) renderAll(_lastPayload);
  if (_lastHistory) renderMovers(_lastHistory, _activePeriodDays);
  if (_etfData) renderEtfTab();
  if (_etfPerfData) renderEtfPerfTab(_etfPerfData);
}

// --- INST helper ---
function isInst(row) {
  return (row.ranks?.["1M"] ?? 999) <= 40 && (row.ranks?.["3M"] ?? 999) <= 40;
}
function instTag() {
  return `<span class="pick-tag tag-inst" style="font-size:10px;padding:1px 5px;vertical-align:middle">${t("tagInst")}</span>`;
}

// --- Finviz link ---
function finvizUrl(ticker) {
  if (!ticker) return "";
  return `https://finviz.com/screener.ashx?v=211&f=cap_smallover%2Cind_${ticker}%2Csh_avgvol_o500%2Csh_price_o7%2Cta_highlow52w_a70h%2Cta_sma50_pa&ft=4&o=-low52w`;
}

// --- Color helpers ---
function perfClass(pct) {
  if (pct === null || pct === undefined) return "perf-0";
  if (pct >= 4)    return "perf-5";
  if (pct >= 2)    return "perf-4";
  if (pct >= 1)    return "perf-3";
  if (pct >= 0.25) return "perf-2";
  if (pct > 0)     return "perf-1";
  if (pct === 0)   return "perf-0";
  if (pct > -0.25) return "perf-n1";
  if (pct > -1)    return "perf-n2";
  if (pct > -2)    return "perf-n3";
  if (pct > -4)    return "perf-n4";
  return "perf-n5";
}

function fmtPct(v) {
  if (v === null || v === undefined) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// --- Sparkline ---
function buildSparkline(ranks, maxRank) {
  const W = 80, H = 28, pad = 4;
  const n = SPARKLINE_ORDER.length;
  const points = SPARKLINE_ORDER.map((tf, i) => {
    const x = pad + (i / (n - 1)) * (W - 2 * pad);
    const rank = ranks[tf] ?? maxRank;
    const y = pad + ((rank - 1) / (maxRank - 1)) * (H - 2 * pad);
    return [x, y];
  });
  const polyline = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const color = "#58a6ff";
  const dots = points.map(([x, y]) =>
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${color}"/>`
  ).join("");
  return `<svg class="sparkline" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
    ${dots}
  </svg>`;
}

// --- Heatmap ---
let _sortState = { col: "score", dir: 1 };
let _instFilter = false;
let _lastIndustries = null;
let _lastPayload = null;

function sortedEntries(industries) {
  const entries = Object.entries(industries);
  const { col, dir } = _sortState;
  return entries.sort(([nameA, a], [nameB, b]) => {
    let va, vb;
    if (col === "score")         { va = a.composite;    vb = b.composite; }
    else if (col === "accel")    { va = a.acceleration; vb = b.acceleration; }
    else if (col === "industry") { return dir * nameA.localeCompare(nameB); }
    else                         { va = a.perfs[col] ?? -Infinity; vb = b.perfs[col] ?? -Infinity; }
    return dir * (va - vb);
  });
}

function renderHeatmap(industries) {
  _lastIndustries = industries; // always full dataset (Movers needs it)
  const tbody = document.getElementById("heatmap-body");
  let sorted = sortedEntries(industries);
  if (_instFilter) sorted = sorted.filter(([, row]) => isInst(row));

  document.querySelectorAll("#heatmap-table thead th[data-col]").forEach(th => {
    const col = th.dataset.col;
    const isActive = col === _sortState.col;
    th.classList.toggle("sort-active", isActive);
    const i18nKey = "col" + col.charAt(0).toUpperCase() + col.slice(1);
    const label = I18N[_lang][i18nKey] !== undefined ? t(i18nKey) : (th.dataset.label || col);
    const arrow = isActive ? (_sortState.dir === 1 ? " ▲" : " ▼") : "";
    const tipKey = col === "score" ? "infoScore" : col === "accel" ? "infoAccel" : null;
    const icon = tipKey ? ` <span class="col-info" title="${t(tipKey)}">i</span>` : "";
    th.innerHTML = label + arrow + icon;
  });

  const maxRank = sorted.length;
  const rows = sorted.map(([name, row], idx) => {
    const perfCells = TIMEFRAMES.map(tf => {
      const v = row.perfs[tf];
      return `<td class="${perfClass(v)}">${fmtPct(v)}</td>`;
    }).join("");
    const accelVal = row.acceleration;
    const accelCls = accelVal > 0 ? "accel-pos" : accelVal < 0 ? "accel-neg" : "accel-neu";
    const accelStr = accelVal > 0 ? `+${accelVal}` : `${accelVal}`;
    const url = finvizUrl(row.ticker);
    const nameCell = url
      ? `<a class="pick-link" href="${url}" target="_blank" rel="noopener">${name} ↗</a>`
      : name;
    const instMark = isInst(row) ? " " + instTag() : "";
    return `<tr>
      <td>${idx + 1}</td>
      <td title="${name}">${nameCell}${instMark}</td>
      ${perfCells}
      <td>${row.composite.toFixed(2)}</td>
      <td class="${accelCls}">${accelStr}</td>
      <td class="sparkline-cell">${buildSparkline(row.ranks, maxRank)}</td>
    </tr>`;
  });

  tbody.innerHTML = rows.join("") || `<tr><td colspan="10" class="empty-msg">${t("noData")}</td></tr>`;
}

function initInstToggle() {
  const btn = document.getElementById("inst-toggle");
  btn.addEventListener("click", () => {
    _instFilter = !_instFilter;
    btn.classList.toggle("active", _instFilter);
    if (_lastIndustries) renderHeatmap(_lastIndustries);
  });
}

function initSortHeaders() {
  document.querySelectorAll("#heatmap-table thead th[data-col]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (_sortState.col === col) {
        _sortState.dir *= -1;
      } else {
        _sortState.col = col;
        _sortState.dir = (col === "score" || col === "industry") ? 1 : -1;
      }
      if (_lastIndustries) renderHeatmap(_lastIndustries);
    });
  });
}

// --- Top 10 cards ---
function renderCards(industries) {
  const container = document.getElementById("cards-row");
  const allEntries = Object.entries(industries);
  const cards = TIMEFRAMES.map(tf => {
    const sorted = allEntries
      .filter(([, row]) => row.perfs[tf] !== null && row.perfs[tf] !== undefined)
      .sort(([, a], [, b]) => b.perfs[tf] - a.perfs[tf])
      .slice(0, 10);
    const rows = sorted.map(([name, row], i) => {
      const v = row.perfs[tf];
      const url = finvizUrl(row.ticker);
      const nameEl = url
        ? `<a class="card-name pick-link" href="${url}" target="_blank" rel="noopener" title="${name}">${name}</a>`
        : `<span class="card-name" title="${name}">${name}</span>`;
      const instMark = isInst(row) ? " " + instTag() : "";
      return `<div class="card-row">
        <span class="card-rank">${i + 1}</span>
        ${nameEl}${instMark}
        <span class="badge ${v >= 0 ? "badge-pos" : "badge-neg"}">${fmtPct(v)}</span>
      </div>`;
    }).join("");
    return `<div class="card"><div class="card-header">${tf}</div>${rows}</div>`;
  });
  container.innerHTML = cards.join("");
}

// --- Bar Chart View ---
let _top10View = "cards";

function renderBarChart(industries) {
  const container = document.getElementById("bars-view");
  const entries = Object.entries(industries);
  const TFS = ["1M", "3M"];

  const panels = TFS.map(tf => {
    const sorted = entries
      .filter(([, row]) => row.perfs[tf] != null)
      .sort(([, a], [, b]) => b.perfs[tf] - a.perfs[tf]);

    const maxVal = Math.max(...sorted.map(([, r]) => Math.abs(r.perfs[tf])), 0.01);

    const bars = sorted.map(([name, row]) => {
      const v = row.perfs[tf];
      const pct = Math.min(Math.abs(v) / maxVal * 100, 100).toFixed(1);
      const cls = v >= 0 ? "bar-fill-pos" : "bar-fill-neg";
      const url = finvizUrl(row.ticker);
      const nameEl = url
        ? `<a class="pick-link bar-label" href="${url}" target="_blank" rel="noopener">${name}</a>`
        : `<span class="bar-label">${name}</span>`;
      const instMark = isInst(row) ? " " + instTag() : "";
      return `<div class="bar-row">
        <span class="bar-name-wrap">${nameEl}${instMark}</span>
        <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="bar-value ${v >= 0 ? "accel-pos" : "accel-neg"}">${fmtPct(v)}</span>
      </div>`;
    }).join("");

    const months = tf === "1M" ? "1 MONTH" : "3 MONTH";
    return `<div class="barchart-panel">
      <div class="barchart-title">${months} PERFORMANCE</div>
      <div class="barchart-body">${bars}</div>
    </div>`;
  });

  container.innerHTML = panels.join("");
}

function renderTop10(industries) {
  if (_top10View === "bars") {
    document.getElementById("cards-row").classList.add("hidden");
    document.getElementById("bars-view").classList.remove("hidden");
    renderBarChart(industries);
  } else {
    document.getElementById("bars-view").classList.add("hidden");
    document.getElementById("cards-row").classList.remove("hidden");
    renderCards(industries);
  }
}

function initViewToggle() {
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      _top10View = btn.dataset.view;
      if (_lastIndustries) renderTop10(_lastIndustries);
    });
  });
}

// --- Movers ---
let _lastHistory = null;
let _activePeriodDays = 7;

function computeMovers(history, periodDays) {
  if (!history || history.length < 2) return null;

  const today = history[history.length - 1];
  const todayDate = new Date(today.date);
  const cutoff = new Date(todayDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // Find closest snapshot at or before cutoff
  let past = null;
  for (let i = history.length - 2; i >= 0; i--) {
    if (new Date(history[i].date) <= cutoff) {
      past = history[i];
      break;
    }
  }
  if (!past) return null;

  // Derive composite ranks (lower composite = better rank = lower number)
  const rankOf = (scores) => {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => a.c - b.c);
    return Object.fromEntries(sorted.map(([n], i) => [n, i + 1]));
  };

  const todayRanks = rankOf(today.scores);
  const pastRanks  = rankOf(past.scores);

  const deltas = Object.keys(todayRanks)
    .filter(n => pastRanks[n] !== undefined)
    .map(name => ({
      name,
      delta:     pastRanks[name] - todayRanks[name], // positive = rose in rank
      todayRank: todayRanks[name],
      ticker:    today.scores[name]?.t ?? "",
    }));

  return {
    rising:   [...deltas].sort((a, b) => b.delta - a.delta).slice(0, 10),
    fading:   [...deltas].sort((a, b) => a.delta - b.delta).slice(0, 10),
    pastDate: past.date,
  };
}

function moverRow(item) {
  const url = finvizUrl(item.ticker);
  const nameEl = url
    ? `<a class="pick-link mover-name" href="${url}" target="_blank" rel="noopener">${item.name} ↗</a>`
    : `<span class="mover-name">${item.name}</span>`;
  const instMark = (_lastIndustries?.[item.name] && isInst(_lastIndustries[item.name])) ? " " + instTag() : "";
  const sign = item.delta > 0 ? "+" : "";
  const cls  = item.delta > 0 ? "mover-delta-pos" : item.delta < 0 ? "mover-delta-neg" : "mover-delta-neu";
  return `<div class="mover-row">
    <span class="mover-rank">#${item.todayRank}</span>
    ${nameEl}${instMark}
    <span class="${cls}">${sign}${item.delta}</span>
  </div>`;
}

function renderMovers(history, periodDays) {
  const risingEl = document.getElementById("movers-rising");
  const fadingEl = document.getElementById("movers-fading");
  if (!risingEl || !fadingEl) return;

  const periodLabel = document.querySelector(`.period-btn[data-days="${periodDays}"]`)?.textContent || "";
  const result = computeMovers(history, periodDays);

  if (!result) {
    const msg = `<p class="pick-empty">${t("moversNoData", periodLabel)}</p>`;
    risingEl.innerHTML = msg;
    fadingEl.innerHTML = msg;
    return;
  }

  const compareNote = `<div class="mover-compare">${t("moversCompare", result.pastDate)}</div>`;
  risingEl.innerHTML = compareNote + result.rising.map(moverRow).join("");
  fadingEl.innerHTML = compareNote + result.fading.map(moverRow).join("");
}

function updatePeriodButtons(history) {
  const btns = document.querySelectorAll(".period-btn");
  let lastAvailable = null;

  btns.forEach(btn => {
    const days = parseInt(btn.dataset.days);
    const available = computeMovers(history, days) !== null;
    btn.disabled = !available;
    if (available) lastAvailable = btn;
  });

  // If current active period got disabled, switch to longest available
  const activeBtn = document.querySelector(".period-btn.active");
  if (activeBtn && activeBtn.disabled && lastAvailable) {
    document.querySelectorAll(".period-btn").forEach(b => b.classList.remove("active"));
    lastAvailable.classList.add("active");
    _activePeriodDays = parseInt(lastAvailable.dataset.days);
  }
}

function initPeriodSelector() {
  document.querySelectorAll(".period-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".period-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      _activePeriodDays = parseInt(btn.dataset.days);
      if (_lastHistory) renderMovers(_lastHistory, _activePeriodDays);
    });
  });
}

// --- Setup Picks ---
function buildReason(perfs, accel) {
  const tags = [];
  const lines = [];
  const p1d = perfs["1D"] ?? 0;
  const p1w = perfs["1W"] ?? 0;
  const p1m = perfs["1M"] ?? 0;
  const p3m = perfs["3M"] ?? 0;

  if (p1w >= 3 && p1m >= 5) tags.push(`<span class="pick-tag tag-hot">${t("tagHot")}</span>`);
  if (accel >= 20)           tags.push(`<span class="pick-tag tag-accel">${t("tagAccel")}</span>`);
  if (p3m < 5 && p1w >= 2 && p1m >= 3) tags.push(`<span class="pick-tag tag-fresh">${t("tagFresh")}</span>`);
  // INST: institutional confirmation — top 40 in both 1M and 3M (Ariel criterion)
  if ((perfs._rank1M ?? 999) <= 40 && (perfs._rank3M ?? 999) <= 40)
    tags.push(`<span class="pick-tag tag-inst">${t("tagInst")}</span>`);

  if (p3m < 5 && p1m >= 3)        lines.push(t("reasonFresh", (p3m >= 0 ? "+" : "") + p3m.toFixed(1), p1m.toFixed(1)));
  else if (p3m >= 5 && accel >= 10) lines.push(t("reasonSolid"));
  else                               lines.push(t("reasonSteady"));

  if (accel >= 30) lines.push(t("reasonAccel", accel));
  if (p1d >= 1)    lines.push(t("reasonIntraday", p1d.toFixed(2)));

  return `${tags.join("")}<br><span>${lines.join(" ")}</span>`;
}

function pickPriority(row, accelRankMap, compRankMap, name) {
  return 0.6 * (accelRankMap[name] ?? 999) + 0.4 * (compRankMap[name] ?? 999);
}

function renderPicks(industries) {
  const container = document.getElementById("picks-container");
  const entries = Object.entries(industries);

  const scoreRankMap = Object.fromEntries(
    [...entries].sort(([, a], [, b]) => a.composite - b.composite).map(([n], i) => [n, i + 1])
  );

  const filtered = entries.filter(([name, row]) => {
    const p1w = row.perfs["1W"] ?? 0;
    const p1m = row.perfs["1M"] ?? 0;
    return scoreRankMap[name] <= 40 && row.acceleration > 0 && p1w > 1 && p1m > 0;
  });

  const byAccel = [...filtered].sort(([, a], [, b]) => b.acceleration - a.acceleration);
  const byComp  = [...filtered].sort(([, a], [, b]) => a.composite - b.composite);
  const accelRankMap = Object.fromEntries(byAccel.map(([n], i) => [n, i + 1]));
  const compRankMap  = Object.fromEntries(byComp.map(([n], i)  => [n, i + 1]));

  const candidates = filtered
    .sort(([na, a], [nb, b]) =>
      pickPriority(a, accelRankMap, compRankMap, na) -
      pickPriority(b, accelRankMap, compRankMap, nb)
    )
    .slice(0, 15);

  if (!candidates.length) {
    container.innerHTML = `<p class="pick-empty">${t("picksEmpty")}</p>`;
    return;
  }

  const header = `<div class="pick-card" style="background:var(--bg3);font-size:11px;color:var(--text-dim);font-weight:600;">
    <div>${t("colIndustry")}</div><div style="text-align:right">1D</div><div style="text-align:right">1W</div>
    <div style="text-align:right">1M</div><div style="text-align:right">3M</div><div style="text-align:right">${t("colAccel")}</div>
    <div style="padding-left:12px">${t("picksColReason")}</div></div>`;

  const cards = candidates.map(([name, row]) => {
    // Attach 1M/3M ranks so buildReason can detect INST badge
    const p = { ...row.perfs, _rank1M: row.ranks["1M"], _rank3M: row.ranks["3M"] };
    const acc = row.acceleration;
    const accelCls = acc > 0 ? "accel-pos" : "accel-neg";
    const accelStr = acc > 0 ? `+${acc}` : `${acc}`;
    const stat = tf => `<div class="pick-stat ${perfClass(p[tf])}"><span>${tf}</span>${fmtPct(p[tf])}</div>`;
    const url = finvizUrl(row.ticker);
    const nameEl = url
      ? `<a class="pick-name pick-link" href="${url}" target="_blank" rel="noopener">${name} ↗</a>`
      : `<div class="pick-name">${name}</div>`;

    return `<div class="pick-card">
      ${nameEl}
      ${stat("1D")}${stat("1W")}${stat("1M")}${stat("3M")}
      <div class="pick-stat ${accelCls}"><span>${t("colAccel")}</span>${accelStr}</div>
      <div class="pick-reason">${buildReason(p, acc)}</div>
    </div>`;
  }).join("");

  container.innerHTML = `<div class="picks-grid">${header}${cards}</div>`;
}

// --- Render ---
function updateTimestamp(iso) {
  const el = document.getElementById("fetch-time");
  if (!iso) { el.textContent = t("notLoaded"); return; }
  const d = new Date(iso);
  const locale = _lang === "de" ? "de-DE" : "en-US";
  el.textContent = t("updated") + d.toLocaleString(locale);
}

function renderAll(payload) {
  if (!payload || !payload.industries || Object.keys(payload.industries).length === 0) return;
  _lastPayload = payload;
  renderHeatmap(payload.industries);
  renderTop10(payload.industries);
  renderPicks(payload.industries);
  updateTimestamp(payload.fetched_at);
}

// --- Lang toggle ---
document.getElementById("lang-btn").addEventListener("click", () => {
  _lang = _lang === "de" ? "en" : "de";
  applyTranslations();
});

// --- Two-level navigation ---
function showPanel(panelId) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
  document.querySelector(`[data-panel="${panelId}"]`)?.classList.remove("hidden");
}

function initTabs() {
  const subNav = document.getElementById("industry-subnav");

  // Top-level: Industry | Themes
  document.querySelectorAll(".top-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".top-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (btn.dataset.top === "industry") {
        subNav.classList.remove("hidden");
        const activeSubBtn = document.querySelector(".sub-btn.active");
        showPanel(activeSubBtn ? activeSubBtn.dataset.tab : "heatmap");
      } else if (btn.dataset.top === "themes") {
        subNav.classList.add("hidden");
        showPanel("etfs");
        if (_etfData) renderEtfTab();
      } else if (btn.dataset.top === "etfperf") {
        subNav.classList.add("hidden");
        showPanel("etfperf");
        if (_etfPerfData) renderEtfPerfTab(_etfPerfData);
      }
    });
  });

  // Sub-level: Heatmap | Setup Picks | Top 10
  document.querySelectorAll(".sub-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sub-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showPanel(btn.dataset.tab);
    });
  });
}

// ── ETF Perf Tab ──────────────────────────────────────────────────────────────
let _etfPerfData = null;
let _etfPerfSort = { col: "score", dir: 1 };

// ETF Perf tab — category badge colors
const ETF_CATEGORY_COLORS = {
  "Broad Market": { bg: "#0d1f3a", fg: "#60a5fa" },  // blue
  "US Sectors":   { bg: "#1a1f0d", fg: "#a3e635" },  // lime
  "Commodities":  { bg: "#2d1a00", fg: "#fb923c" },  // orange
  "Crypto":       { bg: "#1a0d2d", fg: "#c084fc" },  // purple
};

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
                     : accel <= -10 ? "accel-extended"
                     : "accel-neutral";
    const accelTooltip = t("hintThemeAccel");

    const catColors = ETF_CATEGORY_COLORS[row.category] || { bg: "#1a1a2a", fg: "#8b949e" };
    const catBadge  = `<span class="etf-cat-badge" style="background:${catColors.bg};color:${catColors.fg}">${esc(row.category)}</span>`;
    const tickerUrl = `https://finviz.com/quote.ashx?t=${ticker}`;
    const tickerLink = `<a href="${tickerUrl}" target="_blank" rel="noopener" class="etf-ticker-link">${esc(ticker)}</a>`;
    const etfCell   = `${tickerLink}${catBadge}<span class="etf-cell-name">${esc(row.name)}</span>`;

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

// ── ETF Themes Tab ────────────────────────────────────────────────────────────

let _etfData       = null;
let _etfView       = "themes";   // "themes" | "etfs"
let _etfThemeSort  = { col: "score", dir: 1 };
let _etfListSort   = { col: "score", dir: 1 };
let _themeVizView  = "table"; // "table" | "bubble" | "matrix"

// Theme badge colours for all 40 Finviz themes
const THEME_COLORS = {
  "Artificial Intelligence":    { bg: "#0d2240", fg: "#58a6ff" },
  "Semiconductors":             { bg: "#1a2a4a", fg: "#79c0ff" },
  "Cybersecurity":              { bg: "#1a0d4a", fg: "#b794f4" },
  "Cloud Computing":            { bg: "#0d2830", fg: "#56d3d3" },
  "Clean Energy":               { bg: "#0d2a0d", fg: "#39d353" },
  "Defense & Aerospace":        { bg: "#2a1200", fg: "#ff8c42" },
  "Healthcare & Biotech":       { bg: "#2a0d1a", fg: "#f78ca0" },
  "Electric Vehicles":          { bg: "#002a1a", fg: "#26c084" },
  "Fintech":                    { bg: "#1a2a0d", fg: "#aed581" },
  "Crypto & Blockchain":        { bg: "#2a1a00", fg: "#ffd700" },
  "Software":                   { bg: "#0d1a30", fg: "#60a5fa" },
  "Hardware":                   { bg: "#201800", fg: "#d4a017" },
  "E-Commerce":                 { bg: "#2a0d2a", fg: "#d97bde" },
  "Industrial Automation":      { bg: "#1a2200", fg: "#8bc34a" },
  "Autonomous Systems":         { bg: "#002222", fg: "#4dd0e1" },
  "Space Tech":                 { bg: "#0d0d2a", fg: "#a5b4fc" },
  "Robotics":                   { bg: "#1a1a3a", fg: "#818cf8" },
  "Quantum Computing":          { bg: "#200d30", fg: "#c084fc" },
  "Internet of Things":         { bg: "#002a1a", fg: "#34d399" },
  "Big Data":                   { bg: "#1a2a30", fg: "#67e8f9" },
  "Telecommunications":         { bg: "#0d2030", fg: "#38bdf8" },
  "Transportation & Logistics": { bg: "#1a1400", fg: "#fbbf24" },
  "Energy Traditional":         { bg: "#2a1400", fg: "#f97316" },
  "Commodities — Metals":       { bg: "#2a2000", fg: "#d4a017" },
  "Commodities — Energy":       { bg: "#2a1000", fg: "#fb923c" },
  "Commodities — Agri":         { bg: "#1a2a00", fg: "#86efac" },
  "Digital Entertainment":      { bg: "#2a0d20", fg: "#fb7185" },
  "Social Media":               { bg: "#1a0030", fg: "#a78bfa" },
  "Consumer Goods":             { bg: "#2a1a10", fg: "#d4a57c" },
  "Agriculture & Food":         { bg: "#0a2000", fg: "#4ade80" },
  "VR & Augmented Reality":     { bg: "#0d0d2a", fg: "#c4b5fd" },
  "Wearables":                  { bg: "#2a1030", fg: "#e879f9" },
  "Smart Home":                 { bg: "#002030", fg: "#7dd3fc" },
  "Real Estate & REITs":        { bg: "#1a1a1a", fg: "#9ca3af" },
  "Nanotechnology":             { bg: "#1a001a", fg: "#f0abfc" },
  "Biometrics":                 { bg: "#001a30", fg: "#60a5fa" },
  "Environmental":              { bg: "#001a00", fg: "#4ade80" },
  "Education Tech":             { bg: "#1a1000", fg: "#fde68a" },
  "Aging Population":           { bg: "#2a1a1a", fg: "#d1d5db" },
  "Healthy Food & Nutrition":   { bg: "#001a10", fg: "#6ee7b7" },
};

// Finviz internal slugs that differ from auto-derived form (kept in sync with scraper.py)
const THEME_SLUG_OVERRIDES = {
  "Commodities — Agri":      "commoditiesagriculture",
  "Education Tech":          "educationtechnology",
  "Agriculture & Food":      "agriculturefoodtech",
  "Clean Energy":            "energyrenewable",
  "Environmental":           "environmentalsustainability",
  "Aging Population":        "agingpopulationlongevity",
  "VR & Augmented Reality":  "virtualaugmentedreality",
};

function themeScreenerUrl(theme) {
  const slug = THEME_SLUG_OVERRIDES[theme] ?? theme.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://finviz.com/screener.ashx?v=211&f=theme_${slug}&o=-perf13w`;
}

function themeBadge(theme) {
  const c = THEME_COLORS[theme] || { bg: "#1a1a2a", fg: "#8b949e" };
  return `<a href="${themeScreenerUrl(theme)}" target="_blank" rel="noopener" class="etf-theme-badge" style="background:${c.bg};color:${c.fg};text-decoration:none">${theme}</a>`;
}

function showToast(msg) {
  let toast = document.getElementById("copy-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "copy-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("copy-toast--visible");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("copy-toast--visible"), 2000);
}

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

  return `<svg width="72" height="26" style="display:block;cursor:help">
    <title>${tooltipParts}</title>
    <polyline points="${polyPts}" fill="none" stroke="${color}" stroke-width="1.8"
      stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="2.2" fill="${color}"/>
  </svg>`;
}

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

// --- Themes table (40 Finviz top-level themes) ---
function renderEtfThemes(data) {
  const tbody = document.getElementById("etf-themes-body");
  if (!data || !data.themes) {
    tbody.innerHTML = `<tr><td colspan="12" class="empty-msg">${t("etfNoData")}</td></tr>`;
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

  document.querySelectorAll("#etf-themes-table thead th[data-etfcol]").forEach(th => {
    const col = th.dataset.etfcol;
    const isActive = col === _etfThemeSort.col;
    th.classList.toggle("sort-active", isActive);
    const arrow = isActive ? (_etfThemeSort.dir === 1 ? " ▲" : " ▼") : "";
    if (col === "score") th.innerHTML = t("colScore") + arrow;
    else if (col === "accel") th.innerHTML = t("etfColAccel") + arrow;
    else th.textContent = (col === "theme" ? "Theme" : col) + arrow;
  });

  const { col, dir } = _etfThemeSort;
  entries.sort(([na, a], [nb, b]) => {
    if (col === "theme") return dir * na.localeCompare(nb);
    if (col === "score") return dir * (a.score - b.score);
    if (col === "accel") return dir * (themeAccel[na] - themeAccel[nb]);
    return dir * ((a.perfs[col] ?? -Infinity) - (b.perfs[col] ?? -Infinity));
  });

  const accelTooltip = t("hintThemeAccel");

  const rows = entries.map(([theme, row], idx) => {
    const perfCells = ETF_TIMEFRAMES.map(tf =>
      `<td class="${perfClass(row.perfs[tf])}">${fmtPct(row.perfs[tf])}</td>`
    ).join("");

    // Top-3 sub-nodes by 1M as small chips (clickable → Finviz screener)
    const chips = (row.top3 || []).map(nodeKey => {
      const sub = data.subnodes?.[nodeKey];
      const label = sub ? sub.label : nodeKey;
      const url = `https://finviz.com/screener.ashx?v=211&f=subtheme_${nodeKey}&o=-perf13w`;
      return `<a class="etf-ticker-chip etf-ticker-chip--link" href="${url}" target="_blank" rel="noopener" title="${label} → Finviz Screener">${label}</a>`;
    }).join(" ");

    const hasTickers = row.tickers && row.tickers.length > 0;
    const tickerCount = hasTickers ? row.tickers.length : 0;
    const tickerTooltip = _lang === "de"
      ? `${tickerCount} Aktien in diesem Theme (Quelle: Finviz Screener)`
      : `${tickerCount} stocks in this theme (source: Finviz Screener)`;
    const noTickerTooltip = _lang === "de"
      ? "Kein Finviz-Screener-Filter für dieses Theme verfügbar"
      : "No Finviz screener filter available for this theme";
    const tickerBadge = hasTickers
      ? `<span class="theme-stock-count" title="${tickerTooltip}">${tickerCount}</span>`
      : `<span class="theme-stock-count theme-stock-count--na" title="${noTickerTooltip}">—</span>`;

    const accel = themeAccel[theme];
    const accelSign = accel > 0 ? "+" : "";
    const accelClass = accel >= 10 ? "accel-fresh" : accel <= -10 ? "accel-extended" : accel >= 5 ? "accel-fresh-mild" : "accel-neutral";

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
  });

  tbody.innerHTML = rows.join("") || `<tr><td colspan="12" class="empty-msg">${t("etfNoData")}</td></tr>`;

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
}

// --- Sub-Themes table (268 Finviz sub-nodes) ---
function renderEtfList(data) {
  const tbody = document.getElementById("etf-list-body");
  if (!data || !data.subnodes) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty-msg">${t("etfNoData")}</td></tr>`;
    return;
  }

  document.querySelectorAll("#etf-list-table thead th[data-etflistcol]").forEach(th => {
    const col = th.dataset.etflistcol;
    const isActive = col === _etfListSort.col;
    th.classList.toggle("sort-active", isActive);
    const arrow = isActive ? (_etfListSort.dir === 1 ? " ▲" : " ▼") : "";
    if (col === "score") th.innerHTML = t("colScore") + arrow;
    else if (col === "accel") th.innerHTML = t("colAccel") + arrow;
    else th.textContent = th.textContent.replace(/ [▲▼]$/, "") + arrow;
  });

  const allEntries = Object.entries(data.subnodes);

  const subAccel = computeAccel(allEntries);

  const { col, dir } = _etfListSort;
  let entries = [...allEntries];
  entries.sort(([ka, a], [kb, b]) => {
    if (col === "label") return dir * a.label.localeCompare(b.label);
    if (col === "theme") return dir * a.theme.localeCompare(b.theme);
    if (col === "score") return dir * (a.score - b.score);
    if (col === "accel") return dir * (subAccel[ka] - subAccel[kb]);
    return dir * ((a.perfs[col] ?? -Infinity) - (b.perfs[col] ?? -Infinity));
  });

  const accelTooltip = t("hintSubAccel");
  const rows = entries.map(([key, row], idx) => {
    const perfCells = ETF_TIMEFRAMES.map(tf =>
      `<td class="${perfClass(row.perfs[tf])}">${fmtPct(row.perfs[tf])}</td>`
    ).join("");
    const subUrl = `https://finviz.com/screener.ashx?v=211&f=subtheme_${key}&o=-perf13w`;
    const accel = subAccel[key] ?? 0;
    const accelSign = accel > 0 ? "+" : "";
    const accelClass = accel >= 20 ? "accel-fresh" : accel <= -20 ? "accel-extended" : accel >= 8 ? "accel-fresh-mild" : "accel-neutral";

    const hasTickers = row.tickers && row.tickers.length > 0;
    const tickerCount = hasTickers ? row.tickers.length : 0;
    const tickerTooltip = _lang === "de"
      ? `${tickerCount} Aktien in diesem Sub-Theme (Quelle: Finviz Screener)`
      : `${tickerCount} stocks in this sub-theme (source: Finviz Screener)`;
    const noTickerTooltip = _lang === "de"
      ? "Kein Finviz-Screener-Filter für dieses Sub-Theme verfügbar"
      : "No Finviz screener filter available for this sub-theme";
    const tickerBadge = hasTickers
      ? `<span class="theme-stock-count" title="${tickerTooltip}">${tickerCount}</span>`
      : `<span class="theme-stock-count theme-stock-count--na" title="${noTickerTooltip}">—</span>`;
    const copyBtn = hasTickers
      ? `<button class="ticker-copy-btn" data-subkey="${key}" title="${_lang === 'de' ? 'Ticker in Zwischenablage kopieren' : 'Copy tickers to clipboard'}">📋</button>`
      : '';

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
  });

  tbody.innerHTML = rows.join("") || `<tr><td colspan="11" class="empty-msg">${t("etfNoData")}</td></tr>`;

  // Attach copy-button handlers
  tbody.querySelectorAll(".ticker-copy-btn[data-subkey]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const key = btn.dataset.subkey;
      const tickers = _etfData?.subnodes?.[key]?.tickers;
      if (!tickers || !tickers.length) return;
      navigator.clipboard.writeText(tickers.join(",")).then(() => {
        const orig = btn.textContent;
        btn.textContent = "✓";
        btn.classList.add("ticker-copy-btn--done");
        setTimeout(() => { btn.textContent = orig; btn.classList.remove("ticker-copy-btn--done"); }, 2000);
        const msg = _lang === "de" ? "Tickerliste kopiert!" : "Ticker list copied!";
        showToast(msg);
      });
    });
  });
}

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

function renderBubbleChart(data, themeAccel) {
  const container = document.getElementById("etf-bubble-view");
  const entries = Object.entries(data.themes)
    .filter(([,r]) => r.perfs["3M"] !== null && r.perfs["1M"] !== null);
  if (!entries.length) { container.innerHTML = '<p style="color:#6b7280;padding:16px">No data</p>'; return; }

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

  const W = 1100, H = 520;
  const PAD = { top: 28, right: 32, bottom: 48, left: 58 };
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
    { x: PAD.left + 4,      y: PAD.top + 14,       text: "🚀 First Flag",  fill: "#4ade80" },
    { x: W - PAD.right - 4, y: PAD.top + 14,        text: "Extended ⚠️",    fill: "#f87171", anchor: "end" },
    { x: PAD.left + 4,      y: H - PAD.bottom - 6,  text: "💀 Dead",        fill: "#6b7280" },
    { x: W - PAD.right - 4, y: H - PAD.bottom - 6,  text: "🔻 Fading",      fill: "#f87171", anchor: "end" },
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
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-height:480px;display:block">
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

function renderEtfTab() {
  if (!_etfData) return;
  if (_etfView === "themes") {
    document.getElementById("etf-themes-view").classList.remove("hidden");
    document.getElementById("etf-etfs-view").classList.add("hidden");
    renderEtfThemes(_etfData);
  } else {
    document.getElementById("etf-themes-view").classList.add("hidden");
    document.getElementById("etf-etfs-view").classList.remove("hidden");
    renderEtfList(_etfData);
  }
}

function initEtfViewToggle() {
  document.querySelectorAll(".etf-view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".etf-view-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      _etfView = btn.dataset.etfview;
      renderEtfTab();
    });
  });
}

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

function initEtfSortHeaders() {
  // Theme table sort
  document.querySelectorAll("#etf-themes-table thead th[data-etfcol]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const col = th.dataset.etfcol;
      if (_etfThemeSort.col === col) {
        _etfThemeSort.dir *= -1;
      } else {
        _etfThemeSort.col = col;
        _etfThemeSort.dir = (col === "score" || col === "theme") ? 1 : col === "accel" ? -1 : -1;
      }
      renderEtfThemes(_etfData);
    });
  });

  // Sub-themes table sort
  document.querySelectorAll("#etf-list-table thead th[data-etflistcol]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const col = th.dataset.etflistcol;
      if (_etfListSort.col === col) {
        _etfListSort.dir *= -1;
      } else {
        _etfListSort.col = col;
        _etfListSort.dir = (col === "score" || col === "label" || col === "theme") ? 1 : -1;
      }
      renderEtfList(_etfData);
    });
  });
}

initTabs();
initSortHeaders();
initInstToggle();
initSectionHints();
initPeriodSelector();
initViewToggle();
initEtfViewToggle();
initEtfSortHeaders();
initThemeVizToggle();
initEtfPerfSortHeaders();

// --- Load data ---
async function loadData() {
  const loading = document.getElementById("loading");
  const errorEl = document.getElementById("error-msg");
  const refreshBtn = document.getElementById("refresh-btn");

  // Show loading state
  loading.classList.remove("hidden");
  errorEl.classList.add("hidden");
  if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.textContent = "…"; }

  // Cache-bust so the browser always fetches fresh JSON
  const bust = `?t=${Date.now()}`;

  try {
    const [dataRes, histRes, etfRes, etfPerfRes] = await Promise.all([
      fetch("data.json" + bust),
      fetch("history.json" + bust),
      fetch("etf_data.json" + bust),
      fetch("etf_perf.json" + bust),
    ]);

    if (!dataRes.ok) throw new Error(`data.json: HTTP ${dataRes.status}`);
    const payload = await dataRes.json();
    loading.classList.add("hidden");
    renderAll(payload);

    if (histRes.ok) {
      _lastHistory = await histRes.json();
      updatePeriodButtons(_lastHistory);
      renderMovers(_lastHistory, _activePeriodDays);
    }

    if (etfRes.ok) {
      _etfData = await etfRes.json();
      renderEtfTab();
    } else {
      document.getElementById("etf-loading").classList.add("hidden");
      document.getElementById("etf-error").textContent = t("etfNoData");
      document.getElementById("etf-error").classList.remove("hidden");
    }

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
  } catch (err) {
    loading.classList.add("hidden");
    errorEl.textContent = "Fehler beim Laden der Daten: " + err.message;
    errorEl.classList.remove("hidden");
  } finally {
    if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.textContent = "⟳"; }
  }
}

document.getElementById("refresh-btn")?.addEventListener("click", loadData);

loadData();
