import { test } from "node:test";
import assert from "node:assert/strict";
import {
  retOver, smaLast, high52, isNewHigh, basketIndex, lastBasketLow, atrPct, adrPct,
  rvol, dollarVol, weightedRs, downDayStrength, rankChange, firstToHigh,
  computeLeaders, filterRows, orderThemes, tradingViewWatchlist,
} from "./leadersMetrics.js";
import { LEADERS } from "./config.js";

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

test("retOver / smaLast: Luecke -> null", () => {
  near(retOver([100, 110], 1), 10);
  near(retOver([100, null, 120], 2), 20);       // nur die Endpunkte zaehlen
  assert.equal(retOver([null, 120], 1), null);
  assert.equal(retOver([120], 1), null);
  near(smaLast([1, 2, 3, 4], 2), 3.5);
  assert.equal(smaLast([1, null, 3], 2), null);
});

test("high52 / isNewHigh", () => {
  const h = range(260, (i) => 100 + (i === 5 ? 50 : 0));
  assert.equal(high52(h, 259), 100);           // Spitze bei 5 liegt > 252 Tage zurueck
  assert.equal(high52(h, 300), null);          // ausserhalb
  assert.equal(high52(h, 255), 150);
  h[259] = 101;
  assert.equal(isNewHigh(h, 259), true);
  assert.equal(isNewHigh(h, 258), false);
  assert.equal(isNewHigh(h, 200), null);       // zu wenig Vorlauf
});

test("basketIndex: gleichgewichtet, fehlende Mitglieder werden ausgelassen", () => {
  const idx = basketIndex([[100, 110, 121], [50, 50, null]]);
  assert.equal(idx[0], 100);
  near(idx[1], 100 * (1 + (0.10 + 0) / 2));
  near(idx[2], idx[1] * 1.10);                 // nur Mitglied 1 hat Tag 2
  const broken = basketIndex([[100, null, 100]]);
  assert.deepEqual(broken, [100, null, null]);  // kein Fortschreiben
});

test("lastBasketLow: juengste Episode >= 10 %", () => {
  const idx = [100, 95, 85, 90, 101, 120, 105, 104.9, 110, 125];
  const low = lastBasketLow(idx, 10);
  assert.equal(low.index, 7);                  // 104.9 = -12.6 % vom Hoch 120
  near(low.drawdown, (104.9 / 120 - 1) * 100);
  assert.equal(lastBasketLow([100, 95, 92, 99], 10), null);
  assert.equal(lastBasketLow([100, 80, 85], 10).index, 1); // laufende Episode
});

test("atrPct / adrPct mit kurzem Low-Array", () => {
  const c = [10, 10, 10, 10];
  const h = [11, 11, 11, 12];
  const l = [9, 9, 8];                         // letzte 3 Tage
  near(atrPct(h, l, c, 2), ((2 + 4) / 2) / 10 * 100);
  near(adrPct(h, l, c, 2), ((2 / 10) + (4 / 10)) / 2 * 100);
  assert.equal(atrPct(h, [9, null, 8], c, 2), null);
});

test("rvol / dollarVol", () => {
  near(rvol([10, 10, 30], 2), 3);
  assert.equal(rvol([10, null, 30], 2), null);
  near(dollarVol([2, 4], [10, 20], 2), (20 + 80) / 2);
});

test("weightedRs = IBD-Nachbildung", () => {
  const c = range(253, (i) => 100 + i);        // linear steigend
  const exp = LEADERS.RS_WEIGHTS.reduce((s, { bars, w }) => s + w * ((352 / (352 - bars) - 1) * 100), 0);
  near(weightedRs(c), exp);
  assert.equal(weightedRs(c.slice(1)), null);  // 252 Bars reichen nicht fuer ROC(252)
});

test("downDayStrength: nur SPY-Tage < -1 %", () => {
  const spy = [100, 98, 98, 97];               // -2 %, 0 %, -1.02 %
  const c = [100, 99, 50, 50];                 // -1 %, …, 0 %
  const r = downDayStrength(c, spy, 3, -1);
  assert.equal(r.days, 2);
  near(r.value, ((-1 - -2) + (0 - (97 / 98 - 1) * 100)) / 2);
});

test("rankChange: settled-Tage, gap -> null", () => {
  const days = range(22, (i) => ({ settled: true, gap: false, ranks: { A: 10 - Math.min(i, 9) } }));
  assert.equal(rankChange(days, "A", 20), days[1].ranks.A - days[21].ranks.A);
  days[15].gap = true;
  assert.equal(rankChange(days, "A", 20), null);
  assert.equal(rankChange(days.slice(0, 10), "A", 20), null);
});

test("firstToHigh: erstes neues 52W-Hoch nach dem Basket-Tief", () => {
  const n = 300;
  const flat = range(n, () => 100);
  const basket = range(n, (i) => (i < 260 ? 100 : i < 270 ? 85 : 95));
  const a = flat.slice(); a[285] = 120;
  const b = flat.slice(); b[275] = 130;
  const dates = range(n, (i) => `d${i}`);
  const r = firstToHigh([{ sym: "A", h: a }, { sym: "B", h: b }], basket, dates);
  assert.equal(r.low.date, "d260");
  assert.deepEqual(r.perTicker.B, { is_first: true, date: "d275" });
  assert.deepEqual(r.perTicker.A, { is_first: false, date: "d285" });
  // Tief zu frueh fuer ein bestimmbares 52W-Hoch -> n/a
  const early = range(n, (i) => (i < 10 ? 100 : i < 20 ? 80 : 100));
  assert.equal(firstToHigh([{ sym: "A", h: a }], early, dates).reason, "low_too_old");
  assert.equal(firstToHigh([{ sym: "A", h: a }], flat, dates).reason, "no_drawdown");
});

function fakeBars(n = 300) {
  const dates = range(n, (i) => `2026-01-${i}`);
  const mk = (slope) => {
    const c = range(n, (i) => 100 + slope * i);
    return { x: "NASDAQ", c, h: c.map((x) => x * 1.01), l: c.slice(-22).map((x) => x * 0.97), v: range(22, () => 1e6) };
  };
  return {
    dates,
    bench: { c: range(n, (i) => 100 + 0.1 * i) },
    tickers: { UP: mk(1), MID: mk(0.3), DOWN: mk(-0.2) },
  };
}

test("computeLeaders: Ranking, Breadth, n/a fuer fehlende Ticker", () => {
  const bars = fakeBars();
  const cons = { themes: { T: { source: "finviz_theme", tickers: ["NASDAQ:DOWN", "NASDAQ:UP", "NYSE:GONE", "NASDAQ:MID"] } } };
  const res = computeLeaders(bars, cons, { T: { rank: 1, score: 10 } }, []);
  const t = res.T;
  assert.deepEqual(t.rows.map((r) => r.ticker), ["NASDAQ:UP", "NASDAQ:MID", "NASDAQ:DOWN", "NYSE:GONE"]);
  const gone = t.rows[3];
  assert.equal(gone.has_data, false);
  assert.equal(gone.rs_vs_theme, null);
  assert.equal(gone.atr_pct, null);
  assert.equal(t.breadth.members, 4);
  assert.equal(t.breadth.members_with_data, 3);
  near(t.breadth.pct_above_50ma, (2 / 3) * 100);     // UP, MID ueber SMA50
  assert.equal(t.breadth.rank_change_4w, null);
  assert.ok(t.rows[0].rs_vs_theme > 0 && t.rows[2].rs_vs_theme < 0);
});

test("filterRows: Liquiditaet + ATR, n/a faellt bei aktivem Filter raus", () => {
  const rows = [
    { ticker: "A", rs_vs_theme: 5, dollar_vol_20d: 50e6, atr_pct: 5 },
    { ticker: "B", rs_vs_theme: 3, dollar_vol_20d: 1e6, atr_pct: 6 },
    { ticker: "C", rs_vs_theme: 1, dollar_vol_20d: null, atr_pct: 6 },
    { ticker: "D", rs_vs_theme: 0, dollar_vol_20d: 90e6, atr_pct: 3 },
  ];
  assert.deepEqual(filterRows(rows, { minDollarVol: 20e6, minAtrPct: 4 }).map((r) => r.ticker), ["A"]);
  const all = filterRows(rows, {});
  assert.equal(all.length, 4);
  assert.equal(all[0].leader, true);
  assert.equal(all[1].leader, false);
});

test("orderThemes + tradingViewWatchlist", () => {
  const themes = {
    X: { name: "X, Y", rank: 2, breadth: { sort_value: 90 }, rows: [{ ticker: "NYSE:B" }] },
    Z: { name: "Z", rank: 1, breadth: { sort_value: 10 }, rows: [{ ticker: "NASDAQ:A" }, { ticker: "NASDAQ:C" }] },
  };
  assert.deepEqual(orderThemes(themes, "score").map((t) => t.name), ["Z", "X, Y"]);
  assert.deepEqual(orderThemes(themes, "breadth").map((t) => t.name), ["X, Y", "Z"]);
  assert.equal(tradingViewWatchlist(Object.values(themes)),
    "###Z\nNASDAQ:A\nNASDAQ:C\n###X  Y\nNYSE:B\n");
});
