// IPO-Unterreiter: Neulinge (<= 365 Tage) — Pivots A/B, Basis-Status und
// Ampel "IPO-Risikoappetit". Reine Datenfunktionen ohne DOM.
// Spec: docs/superpowers/specs/2026-11-28-ipo-subtab-design.md
// Alle Schwellen: Konvention, unvalidiert.

export const IPO_CFG = {
  MIN_BASE: 15,      // Handelstage seit IPO-Hoch, bevor ein Ausbruch zählt
  MIN_HANDLE: 5,     // Pivot A gilt erst, wenn sein Hoch so viele Tage zurückliegt (Henkel)
  NEAR_PCT: 5,       // "nahe Pivot": höchstens so viel % unter A oder B
  HOLD_DAYS: 5,      // so lange bleibt der Ausbruchs-/Fehlausbruchs-Status stehen
  ATR_BARS: 14,
  SMA_BARS: 50,
  EMA_BARS: 21,
  BREADTH_MIN: 50,   // % der Neulinge über SMA
  HOLD_MIN: 50,      // % der Ausbrüche, die halten
  HOLD_MIN_N: 3,     // darunter: zu wenig Daten
  LOOKBACK: 20,      // Ausbrüche der letzten n Handelstage
  VOL_BARS: 50,
};

const isNum = (x) => typeof x === "number" && Number.isFinite(x);
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

/** ATR% über n True Ranges, die bei `end` enden (braucht Vortages-Close). */
function atrPctAt(t, end, n) {
  if (end < n) return null;
  const trs = [];
  for (let i = end - n + 1; i <= end; i++) {
    const h = t.h[i], l = t.l[i], pc = t.c[i - 1];
    if (![h, l, pc].every(isNum)) return null;
    trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  return isNum(t.c[end]) && t.c[end] > 0 ? (mean(trs) / t.c[end]) * 100 : null;
}

function volFactor(t, i, n) {
  const prev = [];
  for (let k = i - 1; k >= 0 && prev.length < n; k--) if (isNum(t.v[k])) prev.push(t.v[k]);
  return prev.length && isNum(t.v[i]) && mean(prev) > 0 ? t.v[i] / mean(prev) : null;
}

/** Pivots, Basis-Kennzahlen und Status eines Neulings (siehe Plan Task 2). */
export function analyzeIpo(t, cfg = IPO_CFG) {
  const n = t.c.length;
  const ok = (i) => isNum(t.c[i]) && isNum(t.h[i]) && isNum(t.l[i]);
  let i0 = 0;
  while (i0 < n && !ok(i0)) i0++;
  if (i0 >= n) return null;

  let hiB = t.h[i0], hiIdx = i0, low = t.l[i0], lowIdx = i0, hiA = null, hiAIdx = null;
  let bo = null, last = null, failedAt = null, L = i0;

  // Bar j in die Basis-Größen aufnehmen (nur ohne aktiven Ausbruch).
  const absorb = (j) => {
    if (t.h[j] > hiB) { hiB = t.h[j]; hiIdx = j; low = t.l[j]; lowIdx = j; hiA = null; }
    else if (t.l[j] < low) { low = t.l[j]; lowIdx = j; hiA = null; }
    else if (hiA === null || t.h[j] > hiA) { hiA = t.h[j]; hiAIdx = j; }
  };
  const mk = (kind, pivot, i) => ({ kind, day: i, pivot, volX: volFactor(t, i, cfg.VOL_BARS), age: 0 });

  for (let i = i0 + 1; i < n; i++) {
    if (!ok(i)) continue;
    L = i;
    const pivB = hiB;
    const pivA = hiA !== null && hiA < hiB && i - hiAIdx >= cfg.MIN_HANDLE ? hiA : null;
    const baseLen = i - hiIdx;
    const c = t.c[i];
    if (bo) {
      bo.age++;
      if (c < bo.pivot) {
        // Fehlausbruch: eingefrorene Bars nachträglich in die Basis aufnehmen.
        const from = bo.day;
        failedAt = i; bo = null;
        for (let j = from; j <= i; j++) if (ok(j)) absorb(j);
        continue;
      }
      if (bo.kind === "A" && c > pivB && baseLen >= cfg.MIN_BASE) {
        bo = last = mk("B", pivB, i);
      } else if (bo.age >= cfg.HOLD_DAYS) {
        // Ausbruch hat gehalten: neues Hoch = IPO-Hoch für eine nächste Basis.
        bo = null;
        for (let j = hiIdx; j <= i; j++) if (ok(j) && t.h[j] >= hiB) { hiB = t.h[j]; hiIdx = j; }
        low = t.l[i]; lowIdx = i; hiA = null;
      }
      continue;
    }
    if (baseLen >= cfg.MIN_BASE) {
      if (c > pivB) { bo = last = mk("B", pivB, i); continue; }
      if (pivA !== null && c > pivA) { bo = last = mk("A", pivA, i); continue; }
    }
    absorb(i);
  }

  const pivotB = hiB;
  // Anzeige: A auch während des Henkel-Aufbaus (Status "nahe A" erst mit Henkel).
  const pivotA = hiA !== null && hiA < hiB ? hiA : null;
  const handleOk = pivotA !== null && L - hiAIdx >= cfg.MIN_HANDLE;
  const lastClose = t.c[L];
  const baseLen = L - hiIdx;
  const distB = (lastClose / pivotB - 1) * 100;
  const distA = pivotA !== null ? (lastClose / pivotA - 1) * 100 : null;
  const breakout = last ? { kind: last.kind, pivot: last.pivot, volX: last.volX, since: L - last.day } : null;

  let status, nearWhich = null;
  if (bo) status = "breakout" + bo.kind;
  else if (failedAt !== null && L - failedAt < cfg.HOLD_DAYS) status = "failed";
  else if (baseLen < cfg.MIN_BASE) status = "fresh";
  else {
    const cands = [["A", handleOk ? distA : null], ["B", distB]].filter(([, d]) => d !== null);
    const [which, d] = cands.reduce((a, b) => (b[1] > a[1] ? b : a));
    if (d >= -cfg.NEAR_PCT) { status = "near"; nearWhich = which; } else status = "base";
  }

  return {
    first: t.first, bars: n, lastClose, pivotB, pivotA, baseLow: low, baseLen,
    depthPct: (low / pivotB - 1) * 100, distA, distB,
    atrNow: atrPctAt(t, L, cfg.ATR_BARS), atrAtLow: atrPctAt(t, lowIdx, cfg.ATR_BARS),
    status, near: nearWhich, breakout,
    handleDays: pivotA !== null ? L - hiAIdx : null, handleOk,
  };
}

function ema(values, n) {
  const k = 2 / (n + 1);
  let e = values[0];
  for (let i = 1; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

// Linie x/bench über ihrem EMA? null bei zu wenig Daten.
function aboveEma(x, bench, n) {
  const r = [];
  for (let i = 0; i < x.length; i++) if (isNum(x[i]) && isNum(bench[i]) && bench[i] > 0) r.push(x[i] / bench[i]);
  if (r.length < n) return { ok: null, value: null };
  const e = ema(r, n);
  return { ok: r.at(-1) > e, value: (r.at(-1) / e - 1) * 100 };
}

/** Ampel "IPO-Risikoappetit": Index/SPY, Breite, Ausbrüche halten; ETF als Kontrolle. */
export function riskAppetite(data, analyses, cfg = IPO_CFG) {
  const D = data.dates.length;
  const tickers = Object.values(data.tickers || {});

  // 1) Gleichgewichteter Index der Neulinge (Ø Tagesrendite), relativ zu SPY.
  const idx = [100];
  for (let k = 1; k < D; k++) {
    const rets = [];
    for (const t of tickers) {
      const j = k - (D - t.c.length);
      if (j >= 1 && isNum(t.c[j]) && isNum(t.c[j - 1]) && t.c[j - 1] > 0) rets.push(t.c[j] / t.c[j - 1] - 1);
    }
    idx.push(idx[k - 1] * (1 + (rets.length ? mean(rets) : 0)));
  }
  const index = aboveEma(idx, data.bench.c, cfg.EMA_BARS);

  // 2) Breite: Anteil über SMA (bzw. Schnitt aller vorhandenen Closes).
  let above = 0, elig = 0;
  for (const t of tickers) {
    const cs = t.c.filter(isNum);
    if (cs.length < 2) continue;
    elig++;
    if (cs.at(-1) > mean(cs.slice(-cfg.SMA_BARS))) above++;
  }
  const bPct = elig ? (above / elig) * 100 : null;

  // 3) Ausbrüche der letzten LOOKBACK Tage, je Aktie der jüngste.
  const recent = analyses.filter((a) => a?.breakout && a.breakout.since < cfg.LOOKBACK);
  const held = recent.filter((a) => a.lastClose > a.breakout.pivot).length;
  const hPct = recent.length ? (held / recent.length) * 100 : null;

  const signals = [
    { key: "index", ok: index.ok, value: index.value },
    { key: "breadth", ok: bPct === null ? null : bPct >= cfg.BREADTH_MIN, value: bPct, detail: { above, total: elig } },
    { key: "hold", ok: recent.length < cfg.HOLD_MIN_N ? null : hPct >= cfg.HOLD_MIN, value: hPct, detail: { held, total: recent.length } },
  ];
  const score = signals.filter((s) => s.ok === true).length;
  const etf = data.etf?.c ? aboveEma(data.etf.c, data.bench.c, cfg.EMA_BARS) : { ok: null, value: null };
  return { signals, score, light: score >= 2 ? "green" : score === 1 ? "yellow" : "red", etf };
}

const STATUS_ORDER = { breakoutB: 0, breakoutA: 1, failed: 2, near: 3, base: 4, fresh: 5 };

function dollarVol(t, n) {
  const p = [];
  for (let i = t.c.length - 1; i >= 0 && p.length < n; i--) if (isNum(t.c[i]) && isNum(t.v[i])) p.push(t.c[i] * t.v[i]);
  return p.length ? mean(p) : null;
}

/** Liste aller Neulinge (gefiltert) + alle Analysen (ungefiltert, für die Ampel). */
export function buildIpoList(data, { minDvolM = 20, minAtr = 5, exchangeOf = () => null } = {}, cfg = IPO_CFG) {
  const analyses = [];
  const rows = [];
  for (const [sym, t] of Object.entries(data.tickers || {})) {
    const a = analyzeIpo(t, cfg);
    if (!a) continue;
    analyses.push(a);
    const dvol = dollarVol(t, cfg.VOL_BARS);
    if (!isNum(dvol) || dvol < minDvolM * 1e6 || (a.atrNow ?? 0) < minAtr) continue;
    const key = sym.replace(/\./g, "-").toUpperCase();
    rows.push({ sym, tv: exchangeOf(key) || sym.replace(/-/g, "."), a, dvol, atr: a.atrNow });
  }
  const gap = (a) => Math.max(a.distA ?? -Infinity, a.distB);
  rows.sort((x, y) => STATUS_ORDER[x.a.status] - STATUS_ORDER[y.a.status]
    || (x.a.status === "near" ? gap(y.a) - gap(x.a) : 0)
    || y.dvol - x.dvol);
  return { rows, total: analyses.length, analyses };
}

const SECTIONS = [["Ausbruch", ["breakoutB", "breakoutA"]], ["Nahe Pivot", ["near"]], ["Basis", ["base"]]];
const exported = (rows) => SECTIONS.map(([name, st]) => [name, rows.filter((r) => st.includes(r.a.status))]);

/** TradingView-Import: ###Ausbruch / ###Nahe Pivot / ###Basis, ein Ticker je Zeile. */
export function ipoTvText(rows) {
  const lines = [];
  for (const [name, list] of exported(rows)) {
    if (!list.length) continue;
    lines.push(`###${name}`, ...list.map((r) => r.tv));
  }
  return lines.length ? lines.join("\n") + "\n" : "";
}

/** Gleiche Ticker wie ipoTvText, kommasepariert. */
export function ipoClipboard(rows) {
  return exported(rows).flatMap(([, list]) => list.map((r) => r.tv)).join(",");
}
