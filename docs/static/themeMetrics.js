/**
 * themeMetrics.js — Kennzahlen-Kern für die Tabs "First Flag" und "Base Breakout".
 *
 * Abhängigkeitsfrei, seiteneffektfrei, framework-agnostisch.
 * Alle Prozentwerte als Zahl in Prozent (14.35 = +14,35 %), nicht als Bruch.
 *
 * Zwei Ebenen:
 *   - GRUPPE  (perfs/accel)  -> Segmente, Frische, Stage        [heute verfügbar]
 *   - TICKER  (rs/atr/sma..) -> Dichte, Breite, Konzentration   [Phase 2]
 * Fehlen Ticker-Daten, liefern die Ebene-2-Felder null. Nichts wirft.
 */

/* ------------------------------------------------------------------ */
/* Schwellenwerte — bewusst an EINER Stelle, damit sie tunebar bleiben */
/* ------------------------------------------------------------------ */

export const THRESHOLDS = {
  stage: {
    bounceDamage: -15,      // m4_6 + m2_3 <= -15 -> BOUNCE (harte Sperre)
    pullbackRun: 10,        // m4_6 >= 10
    pullbackDipMin: -20,    // m2_3 > -20
    baseFlatBand: 8,        // |m4_6| <= 8 und |m2_3| <= 8
    baseBreakMin: 8,        // m1 >= 8
    trendAccelFloor: -5,    // TREND nur solange accel > -5
  },
  freshness: { min: 0.15, max: 0.65 },   // 1W / 1M
  accel: { firstFlagMin: 10 },           // nur >= 10 gilt als First-Flag-Signal
  ticker: {
    rsMin: 80,
    pivotDistMin: -0.5,     // in ATR14: negativ = bereits über dem Pivot
    pivotDistMax: 1.5,
    extSma50Max: 1.0,       // in ATR14
    pivotLookback: 20,
  },
  group: {
    densityMin: 25,         // % handelbarer Mitglieder
    concentrationMax: 2.5,  // Mittelwert / Median der 1M-Perf
  },
};

export const STAGE = {
  BOUNCE: 'BOUNCE',
  PULLBACK: 'PULLBACK',
  BASE_BREAK: 'BASE_BREAK',
  EXTENDED: 'EXTENDED',
  TREND: 'TREND',
  NEUTRAL: 'NEUTRAL',
  UNKNOWN: 'UNKNOWN',
};

export const TAB = { FIRST_FLAG: 'FIRST_FLAG', BASE_BREAKOUT: 'BASE_BREAKOUT' };

/* ------------------------------------------------------------------ */
/* Ebene 1 — Gruppe                                                    */
/* ------------------------------------------------------------------ */

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/**
 * Entschachtelt zwei kumulative Fenster zum dazwischenliegenden Segment.
 * shortWin und longWin in Prozent. longWin MUSS das längere Fenster sein.
 * @returns {number|null} Segment-Performance in Prozent
 */
export function chainSegment(shortWin, longWin) {
  const a = num(shortWin), b = num(longWin);
  if (a === null || b === null) return null;
  const base = 1 + a / 100;
  if (Math.abs(base) < 1e-9) return null;        // -100 % -> undefiniert
  return ((1 + b / 100) / base - 1) * 100;
}

/**
 * Zerlegt perfs in NICHT überlappende Segmente.
 * Das ist der Kern: 1W steckt in 1M steckt in 3M steckt in 6M.
 * @param {{ '1W'?:number,'1M'?:number,'3M'?:number,'6M'?:number }} perfs
 * @returns {{ m1:number|null, m2_3:number|null, m4_6:number|null }}
 */
export function segments(perfs = {}) {
  return {
    m1: num(perfs['1M']),
    m2_3: chainSegment(perfs['1M'], perfs['3M']),
    m4_6: chainSegment(perfs['3M'], perfs['6M']),
  };
}

/** Anteil des Monatsgewinns, der in der letzten Woche entstand. */
export function freshness(perfs = {}) {
  const w = num(perfs['1W']), m = num(perfs['1M']);
  if (w === null || m === null || Math.abs(m) < 1e-9) return null;
  return w / m;
}

/** Kumulierter Schaden vor dem letzten Monat (Monate 2-6). */
export function damage(seg) {
  if (seg.m2_3 === null || seg.m4_6 === null) return null;
  return seg.m2_3 + seg.m4_6;
}

/**
 * Struktur-Klasse. Reihenfolge ist bindend: BOUNCE zuerst (Sicherheits-Veto),
 * damit ein hoher accel eine beschädigte Gruppe nie nach oben ziehen kann.
 * @returns {string} STAGE.*
 */
export function classifyStage(seg, accel) {
  const { m1, m2_3, m4_6 } = seg;
  const t = THRESHOLDS.stage;
  if (m1 === null || m2_3 === null || m4_6 === null) return STAGE.UNKNOWN;
  const dmg = m2_3 + m4_6;
  const a = num(accel) ?? 0;

  if (dmg <= t.bounceDamage && m1 > 0) return STAGE.BOUNCE;
  if (m4_6 >= t.pullbackRun && m2_3 > t.pullbackDipMin && m2_3 < 0 && m1 > 0)
    return STAGE.PULLBACK;
  if (Math.abs(m4_6) <= t.baseFlatBand && Math.abs(m2_3) <= t.baseFlatBand
      && m1 >= t.baseBreakMin && m1 > Math.max(Math.abs(m4_6), Math.abs(m2_3)))
    return STAGE.BASE_BREAK;
  if (m4_6 > 0 && m2_3 > 0 && a <= 0 && m1 < m2_3) return STAGE.EXTENDED;
  if (m4_6 > 0 && m2_3 > -t.baseFlatBand && m1 > 0 && a > t.trendAccelFloor)
    return STAGE.TREND;
  return STAGE.NEUTRAL;
}

/* ------------------------------------------------------------------ */
/* Ebene 2 — Ticker                                                    */
/* ------------------------------------------------------------------ */

/**
 * @typedef {Object} Ticker
 * @property {string} symbol
 * @property {number} [rs]        Relative-Stärke-Rang 1-99
 * @property {number} [close]
 * @property {number} [atr14]
 * @property {number} [sma50]
 * @property {number} [sma200]
 * @property {number} [pivot]     Hoch der letzten N Tage (THRESHOLDS.ticker.pivotLookback)
 * @property {number} [perf1M]
 */

/** Pivot-Distanz in ATR. Negativ = Kurs steht bereits über dem Pivot. */
export function pivotDistance(t) {
  if (!t || !num(t.pivot) || !num(t.close) || !num(t.atr14) || t.atr14 <= 0) return null;
  return (t.pivot - t.close) / t.atr14;
}

/** Extension über der SMA50, in ATR. */
export function extSma50(t) {
  if (!t || !num(t.close) || !num(t.sma50) || !num(t.atr14) || t.atr14 <= 0) return null;
  return (t.close - t.sma50) / t.atr14;
}

/**
 * Handelbares Setup? Zweiseitig: knapp vor dem Ausbruch UND frisch darüber.
 * Bewusst NICHT an der 52-Wochen-Hoch-Distanz gemessen — das würde
 * Base Breakouts aus tieferen Basen systematisch ausschließen.
 */
export function isSetup(t) {
  const c = THRESHOLDS.ticker;
  const pd = pivotDistance(t), ext = extSma50(t);
  if (pd === null || ext === null || !num(t.rs)) return false;
  return t.rs >= c.rsMin && pd >= c.pivotDistMin && pd <= c.pivotDistMax && ext < c.extSma50Max;
}

const median = (xs) => {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Gruppen-Aggregate aus der Ticker-Ebene.
 * Liefert null-Felder, solange keine angereicherten Ticker vorliegen.
 * @param {Ticker[]} tickers
 * @param {Ticker[]} [prevTickers] Snapshot von vor 5 Handelstagen (für breadthDelta)
 */
export function tickerAggregates(tickers = [], prevTickers = null) {
  const enriched = tickers.filter((t) => t && typeof t === 'object' && num(t.close) !== null);
  if (!enriched.length) {
    return { density: null, breadth: null, breadthDelta: null, concentration: null, setups: [] };
  }
  const setups = enriched.filter(isSetup).map((t) => t.symbol);
  const density = (setups.length / enriched.length) * 100;

  const stage2 = (list) => {
    const ok = list.filter((t) => num(t.close) !== null && num(t.sma50) !== null && num(t.sma200) !== null);
    if (!ok.length) return null;
    return (ok.filter((t) => t.close > t.sma50 && t.close > t.sma200).length / ok.length) * 100;
  };
  const breadth = stage2(enriched);
  const prevBreadth = prevTickers ? stage2(prevTickers.filter((t) => t && num(t.close) !== null)) : null;

  const perfs = enriched.map((t) => num(t.perf1M)).filter((v) => v !== null);
  const med = median(perfs);
  const mean = perfs.length ? perfs.reduce((a, b) => a + b, 0) / perfs.length : null;
  const concentration = (mean !== null && med !== null && Math.abs(med) > 1e-9) ? mean / med : null;

  return {
    density,
    breadth,
    breadthDelta: (breadth !== null && prevBreadth !== null) ? breadth - prevBreadth : null,
    concentration,
    setups,
  };
}

/* ------------------------------------------------------------------ */
/* Zusammenführung                                                     */
/* ------------------------------------------------------------------ */

/**
 * Vollständige Kennzahlen einer Gruppe.
 * @param {{name:string,type:string,score:number,accel:number,perfs:object,tickers:any[]}} group
 * @param {{prevTickers?:any[]}} [opts]
 */
export function groupMetrics(group, opts = {}) {
  const seg = segments(group.perfs);
  const stage = classifyStage(seg, group.accel);
  const agg = tickerAggregates(
    Array.isArray(group.tickers) ? group.tickers.map(normalizeTicker) : [],
    opts.prevTickers ? opts.prevTickers.map(normalizeTicker) : null
  );
  return {
    name: group.name,
    type: group.type,
    score: num(group.score),
    accel: num(group.accel),
    members: Array.isArray(group.tickers) ? group.tickers.length : 0,
    segments: seg,
    damage: damage(seg),
    freshness: freshness(group.perfs),
    stage,
    ...agg,
  };
}

/** Toleriert sowohl "AAPL" als auch {symbol:"AAPL", rs:91, ...}. */
function normalizeTicker(t) {
  return typeof t === 'string' ? { symbol: t } : t;
}

/* ------------------------------------------------------------------ */
/* Tab-Auswahl inkl. "knapp daneben"                                   */
/* ------------------------------------------------------------------ */

/**
 * Kriterienliste eines Tabs. Jedes Kriterium ist einzeln auswertbar,
 * damit die UI benennen kann, WORAN eine Gruppe gescheitert ist.
 */
function criteriaFor(tab, m) {
  const f = THRESHOLDS.freshness, g = THRESHOLDS.group;
  const base = [
    { key: 'freshness', label: 'Frische 1W/1M im Band',
      ok: m.freshness !== null && m.freshness >= f.min && m.freshness <= f.max,
      actual: m.freshness, required: `${f.min}–${f.max}` },
    // Ebene-2-Kriterien gelten als erfüllt, solange keine Ticker-Daten vorliegen.
    { key: 'density', label: 'Setup-Dichte',
      ok: m.density === null || m.density >= g.densityMin,
      actual: m.density, required: `≥ ${g.densityMin} %`, soft: m.density === null },
    { key: 'breadthDelta', label: 'Breite expandiert',
      ok: m.breadthDelta === null || m.breadthDelta > 0,
      actual: m.breadthDelta, required: '> 0', soft: m.breadthDelta === null },
    { key: 'concentration', label: 'Nicht von Einzelnamen getragen',
      ok: m.concentration === null || m.concentration < g.concentrationMax,
      actual: m.concentration, required: `< ${g.concentrationMax}`, soft: m.concentration === null },
  ];
  if (tab === TAB.FIRST_FLAG) {
    return [
      { key: 'stage', label: 'Stage = PULLBACK', ok: m.stage === STAGE.PULLBACK,
        actual: m.stage, required: 'PULLBACK' },
      { key: 'accel', label: 'Accel über Rauschschwelle',
        ok: m.accel !== null && m.accel >= THRESHOLDS.accel.firstFlagMin,
        actual: m.accel, required: `≥ +${THRESHOLDS.accel.firstFlagMin}` },
      ...base,
    ];
  }
  return [
    { key: 'stage', label: 'Stage = BASE_BREAK', ok: m.stage === STAGE.BASE_BREAK,
      actual: m.stage, required: 'BASE_BREAK' },
    ...base,
  ];
}

/**
 * Wertet eine Gruppe für einen Tab aus.
 * @returns {{qualified:boolean, nearMiss:boolean, failed:Array, criteria:Array}}
 */
export function evaluateForTab(metrics, tab) {
  const criteria = criteriaFor(tab, metrics);
  const failed = criteria.filter((c) => !c.ok);
  return { qualified: failed.length === 0, nearMiss: failed.length === 1, failed, criteria };
}

/**
 * Baut den kompletten Tab-Inhalt.
 * Sortierung: nach Setup-Dichte, solange vorhanden — sonst nach accel.
 * Score wird NUR als letzter Tiebreaker benutzt (niedriger = stärker).
 */
export function buildTab(groups, tab, opts = {}) {
  const rows = groups.map((g) => {
    const m = groupMetrics(g, opts);
    return { ...m, ...evaluateForTab(m, tab) };
  });
  const rank = (a, b) =>
    (b.density ?? -1) - (a.density ?? -1) ||
    (b.accel ?? 0) - (a.accel ?? 0) ||
    (a.score ?? 1e9) - (b.score ?? 1e9);
  return {
    tab,
    qualified: rows.filter((r) => r.qualified).sort(rank),
    nearMiss: rows.filter((r) => !r.qualified && r.nearMiss).sort(rank),
    rejected: rows.filter((r) => !r.qualified && !r.nearMiss).sort(rank),
  };
}
