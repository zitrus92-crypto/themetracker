import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HORIZONS, DEFAULTS, PCT_OPTIONS, parseNum, normSym, rankAndPct, buildHorizon,
  tvText, clipboardText,
} from "./inPlayHorizon.js";

const M = 1e6;
// universe.rows: {SYM: [dvol, atr%]}
const uni = (rows) => ({ fields: ["dvol50", "atr14"], min_bars: 50, rows });
const base = (over = {}) => ({
  industries: {}, themes: {}, themeMembers: {}, universe: uni({}),
  exchangeOf: () => null, horizon: "swing", pct: [80, 80],
  minDvolM: 20, minAtr: 5, includeThemes: false, ...over,
});

test("Konstanten", () => {
  assert.deepEqual(HORIZONS.day.tfs, ["1D", "1W"]);
  assert.deepEqual(HORIZONS.swing.tfs, ["1W", "1M"]);
  assert.deepEqual(HORIZONS.position.tfs, ["1M", "3M"]);
  assert.deepEqual(DEFAULTS, { pct: [80, 80], minDvolM: 20, minAtr: 5, themes: false });
  assert.deepEqual(PCT_OPTIONS, [50, 55, 60, 65, 70, 75, 80, 85, 90, 95]);
});

test("parseNum", () => {
  assert.equal(parseNum("2,5", 9), 2.5);
  assert.equal(parseNum(" 20 ", 9), 20);
  assert.equal(parseNum("", 9), 9);
  assert.equal(parseNum("-1", 9), 9);
  assert.equal(parseNum("abc", 9), 9);
  assert.equal(parseNum(null, 9), 9);
  assert.equal(parseNum("0", 9), 0);
});

test("normSym", () => {
  assert.equal(normSym("NYSE:BRK.B"), "BRK-B");
  assert.equal(normSym("brk-b"), "BRK-B");
  assert.equal(normSym("NVDA"), "NVDA");
});

test("rankAndPct: Gleichstand, null fehlt", () => {
  const m = rankAndPct([
    { name: "A", perfs: { "1W": 10 } }, { name: "B", perfs: { "1W": 8 } },
    { name: "C", perfs: { "1W": 8 } }, { name: "D", perfs: { "1W": 5 } },
    { name: "E", perfs: { "1W": null } },
  ], "1W");
  assert.equal(m.get("A").rank, 1);
  assert.equal(m.get("B").rank, 2);
  assert.equal(m.get("C").rank, 2);
  assert.equal(m.get("D").rank, 4);
  assert.equal(m.has("E"), false);
  assert.equal(m.get("A").pct, 75);
});

// 10 Industries G0..G9, G0 stärkste in beiden Fenstern. Je eine Aktie Sk.
function tenIndustries() {
  const industries = {}, rows = {};
  for (let i = 0; i < 10; i++) {
    industries[`G${i}`] = { perfs: { "1W": 100 - i, "1M": 100 - i }, tickers: [`S${i}`] };
    rows[`S${i}`] = [50 * M, 6];
  }
  return { industries, universe: uni(rows) };
}

test("buildHorizon: Schnittmenge per Perzentil", () => {
  const out = buildHorizon(base(tenIndustries()));
  // n=10: pct = 100*(10-rank)/10 -> Rang 1 = 90, Rang 2 = 80, Rang 3 = 70
  assert.deepEqual(out.groups.map(g => g.name), ["G0", "G1"]);
  assert.equal(out.missingData, false);
  const looser = buildHorizon(base({ ...tenIndustries(), pct: [80, 50] }));
  assert.deepEqual(looser.groups.map(g => g.name), ["G0", "G1"]);
  const loosest = buildHorizon(base({ ...tenIndustries(), pct: [50, 50] }));
  assert.equal(loosest.groups.length, 5);
});

test("buildHorizon: Gruppe ohne Perf-Wert fällt raus und zählt nicht im Nenner", () => {
  const { industries, universe } = tenIndustries();
  industries.G0.perfs["1M"] = null;
  const out = buildHorizon(base({ industries, universe, pct: [50, 50] }));
  assert.equal(out.groups.some(g => g.name === "G0"), false);
});

test("buildHorizon: Sortierung nach schwächerem Rang, dann besserem", () => {
  // 43 Gruppen, damit X (Rang 15) bei Schwelle 50 noch drin ist.
  const industries = {}, rows = {};
  const perf1W = {}, perf1M = {};
  const names = Array.from({ length: 40 }, (_, i) => `F${i}`);
  // Ränge vorgeben: X 1W-Rang 2, 1M-Rang 15; Y 1W 6, 1M 7; Z 1W 7, 1M 6
  // Feste Ränge setzen, Rest mit F-Gruppen auffüllen.
  const arrange = (fixed) => {
    const out = new Array(43).fill(null);
    for (const [n, r] of Object.entries(fixed)) out[r - 1] = n;
    const rest = names.slice();
    return out.map((n) => n ?? rest.shift());
  };
  const all = ["X", "Y", "Z", ...names];
  const order1W = arrange({ X: 2, Y: 6, Z: 7 });
  const order1M = arrange({ X: 15, Y: 7, Z: 6 });
  order1W.forEach((n, i) => { perf1W[n] = 1000 - i; });
  order1M.forEach((n, i) => { perf1M[n] = 1000 - i; });
  for (const n of all) {
    industries[n] = { perfs: { "1W": perf1W[n], "1M": perf1M[n] }, tickers: [`T_${n}`] };
    rows[`T_${n}`] = [50 * M, 6];
  }
  const out = buildHorizon(base({ industries, universe: uni(rows), pct: [50, 50] }));
  const idx = (n) => out.groups.findIndex(g => g.name === n);
  const y = out.groups[idx("Y")], z = out.groups[idx("Z")], x = out.groups[idx("X")];
  assert.deepEqual(y.ranks, [6, 7]);
  assert.deepEqual(x.ranks, [2, 15]);
  assert.ok(idx("Y") < idx("X"));                 // 7 < 15
  assert.deepEqual(y.key, [7, 6]);
  assert.deepEqual(z.key, [7, 6]);
  assert.ok(idx("Y") < idx("Z"));                 // Gleichstand -> Name
});

test("buildHorizon: Aktienfilter und Sortierung nach $-Vol", () => {
  const industries = { G: { perfs: { "1W": 9, "1M": 9 }, tickers: ["A", "B", "C", "D", "E", "F"] },
    H: { perfs: { "1W": 1, "1M": 1 }, tickers: [] } };
  const universe = uni({
    A: [19.9 * M, 9], B: [20 * M, 9], C: [80 * M, 4.99], D: [90 * M, 5], E: [30 * M, 7],
  });
  const out = buildHorizon(base({ industries, universe, pct: [50, 50] }));
  assert.equal(out.groups.length, 1);
  assert.deepEqual(out.groups[0].rows.map(r => r.sym), ["D", "E", "B"]);
  assert.deepEqual(out.groups[0].rows[0], { sym: "D", tv: "D", dvol: 90 * M, atr: 5 });
});

test("buildHorizon: Themes, Dedupe über Symbol-Schreibweisen, Exchange", () => {
  const industries = {
    Ins: { perfs: { "1W": 5, "1M": 5 }, tickers: ["BRK-B", "XYZ"] },
    Low: { perfs: { "1W": 1, "1M": 1 }, tickers: [] },
  };
  const themes = {
    Fin: { perfs: { "1W": 9, "1M": 9 } },
    Low2: { perfs: { "1W": 1, "1M": 1 } },
  };
  const themeMembers = { Fin: ["NYSE:BRK.B"], Low2: [] };
  const universe = uni({ "BRK-B": [100 * M, 6], XYZ: [50 * M, 6] });
  const exchangeOf = (s) => (s === "BRK-B" ? "NYSE:BRK.B" : null);
  const withThemes = buildHorizon(base({
    industries, themes, themeMembers, universe, exchangeOf, pct: [50, 50], includeThemes: true,
  }));
  // Gleicher Rang (1/1) -> Name: "Fin" < "Ins"
  assert.deepEqual(withThemes.groups.map(g => [g.kind, g.name]), [["theme", "Fin"], ["industry", "Ins"]]);
  assert.deepEqual(withThemes.groups[0].rows.map(r => r.tv), ["NYSE:BRK.B"]);
  assert.deepEqual(withThemes.groups[1].rows.map(r => r.tv), ["XYZ"]);
  const noThemes = buildHorizon(base({ industries, themes, themeMembers, universe, exchangeOf, pct: [50, 50] }));
  assert.deepEqual(noThemes.groups.map(g => g.name), ["Ins"]);
  assert.deepEqual(noThemes.groups[0].rows.map(r => r.tv), ["NYSE:BRK.B", "XYZ"]);
});

test("buildHorizon: unbekannte Exchange -> Symbol mit Punkt", () => {
  const industries = { G: { perfs: { "1W": 9, "1M": 9 }, tickers: ["ABC-W"] }, H: { perfs: { "1W": 1, "1M": 1 }, tickers: [] } };
  const out = buildHorizon(base({ industries, universe: uni({ "ABC-W": [50 * M, 6] }), pct: [50, 50] }));
  assert.equal(out.groups[0].rows[0].tv, "ABC.W");
});

test("buildHorizon: fehlendes inplay_universe", () => {
  const out = buildHorizon(base({ ...tenIndustries(), universe: null }));
  assert.deepEqual(out, { groups: [], missingData: true });
});

test("tvText / clipboardText", () => {
  const groups = [
    { name: "Semis, Equip", kind: "industry", rows: [{ tv: "NASDAQ:NVDA" }, { tv: "AMD" }] },
    { name: "AI", kind: "theme", rows: [{ tv: "PLTR" }] },
  ];
  assert.equal(tvText(groups), "###Semis  Equip\nNASDAQ:NVDA\nAMD\n###Theme: AI\nPLTR\n");
  assert.equal(clipboardText(groups), "NASDAQ:NVDA,AMD,PLTR");
  assert.equal(tvText([]), "");
  assert.equal(clipboardText([]), "");
});
