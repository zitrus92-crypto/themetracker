import { test } from "node:test";
import assert from "node:assert/strict";
import {
  retOver, smaLast, high52, isNewHigh, basketIndex, lastBasketLow, atrPct, adrPct,
  rvol, dollarVol, weightedRs, downDayStrength, rankChange, firstToHigh,
  computeLeaders, filterRows, orderThemes, tradingViewWatchlist,
  rsUniverse, rsRating, triggerMetrics, watchlistFails, buildWatchlist, tradingViewFromWatchlist,
  applyGroupRs, applyGroupState, rs3mUniverse,
  weekMonday, weekReference, diffWatchlist,
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
    { ticker: "A", rs_vs_theme: 5, dollar_vol_20d: 50e6, atr_pct: 5, qualified: false },
    { ticker: "B", rs_vs_theme: 3, dollar_vol_20d: 1e6, atr_pct: 6, qualified: true },
    { ticker: "C", rs_vs_theme: 1, dollar_vol_20d: null, atr_pct: 6, qualified: true },
    { ticker: "D", rs_vs_theme: 0, dollar_vol_20d: 90e6, atr_pct: 3, qualified: false },
  ];
  assert.deepEqual(filterRows(rows, { minDollarVol: 20e6, minAtrPct: 4 }).map((r) => r.ticker), ["A"]);
  const all = filterRows(rows, {});
  assert.equal(all.length, 4);
  // Leader = erster QUALIFIZIERTER Ticker, nicht einfach Rang 1
  assert.deepEqual(all.map((r) => r.leader), [false, true, false, false]);
  // erfuellt nach Filter keiner die Kriterien -> kein Leader
  assert.ok(filterRows(rows, { minDollarVol: 20e6 }).every((r) => !r.leader));
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

test("rsUniverse + rsRating: IBD-Gewichte, Top-N nach Dollarvolumen", () => {
  const rows = {};
  for (let i = 1; i <= 100; i++) rows["T" + i] = [i, i, i, i, 1e6 * i];   // Score = i
  rows.ILLIQ = [1000, 1000, 1000, 1000, 1];                              // faellt bei n=100 raus
  const bars = { rs_universe: { fields: ["roc63", "roc126", "roc189", "roc252", "dvol50"], rows } };
  const u = rsUniverse(bars, 100);
  assert.equal(u.length, 100);
  near(u[0], 1);
  assert.equal(rsRating(90, u), 90);
  assert.equal(rsRating(1000, u), 99);   // gekappt auf 99
  assert.equal(rsRating(-5, u), 1);      // gekappt auf 1
  assert.equal(rsRating(null, u), null);
  assert.equal(rsUniverse({}), null);
});

function trigBars({ lastClose = 120, lastOpen = 101, lastVol = 1e6, epAt = null } = {}) {
  const n = 80, S = 57;
  const c = range(n, () => 100), h = range(n, () => 101);
  c[n - 1] = lastClose; h[n - 1] = Math.max(lastClose, 101);
  const o = range(S, () => 100), l = range(S, () => 99), v = range(S, () => 1e6);
  o[S - 1] = lastOpen; v[S - 1] = lastVol;
  if (epAt !== null) { o[epAt] = 110; v[epAt] = 4e6; }
  return { c, h, o, l, v };
}

test("triggerMetrics: Breakout + (RVOL >= 3 ODER Gap >= 4 %)", () => {
  const dates = range(80, (i) => "d" + i);
  const volT = triggerMetrics(trigBars({ lastVol: 3e6 }), dates);
  assert.equal(volT.breakout_20d, true);
  near(volT.rvol_50d, 3);
  assert.equal(volT.trigger, true);
  assert.equal(volT.weak_volume, false);
  const gapT = triggerMetrics(trigBars({ lastOpen: 105, lastVol: 0.5e6 }), dates);
  assert.equal(gapT.trigger, true);               // Gap 5 % reicht
  assert.equal(gapT.weak_volume, true);           // aber Volumen < 1x -> meiden
  const none = triggerMetrics(trigBars({ lastVol: 1.2e6 }), dates);
  assert.equal(none.trigger, false);              // Breakout ohne Energie
  const noBo = triggerMetrics(trigBars({ lastClose: 100, lastVol: 5e6 }), dates);
  assert.equal(noBo.trigger, false);              // kein Close ueber dem 20T-Hoch
});

test("triggerMetrics: EP = Gap >= 4 % bei >= 3x Volumen im 6-Tage-Fenster", () => {
  const dates = range(80, (i) => "d" + i);
  const ep = triggerMetrics(trigBars({ epAt: 53 }), dates);   // 4 Tage vor heute
  assert.equal(ep.ep, true);
  assert.equal(ep.ep_date, "d76");
  const old = triggerMetrics(trigBars({ epAt: 50 }), dates);  // 7 Tage zurueck: ausserhalb
  assert.equal(old.ep, false);
});

test("watchlistFails: alle Kriterien, fehlender Wert = nicht erfuellt", () => {
  const ok = { rs_rating: 91, p6m: 60, dist_52wh_pct: -12, above_sma50: true, above_sma200: true,
               close: 25, dollar_vol_50d: 6e6 };
  assert.deepEqual(watchlistFails(ok), []);
  assert.deepEqual(watchlistFails({ ...ok, rs_rating: 89 }), ["rs_rating"]);
  assert.deepEqual(watchlistFails({ ...ok, p6m: 50 }), ["p6m"]);              // > 50, nicht >=
  assert.deepEqual(watchlistFails({ ...ok, dist_52wh_pct: -21 }), ["wl_dist"]);
  assert.deepEqual(watchlistFails({ ...ok, above_sma200: null }), ["sma200"]);
  assert.deepEqual(watchlistFails({ ...ok, close: 9 }), ["min_price"]);
  assert.deepEqual(watchlistFails({ ...ok, dollar_vol_50d: null }), ["dollar_vol_50d"]);
});

test("buildWatchlist: jeder Ticker einmal, alle Themes als Kontext", () => {
  const q = (ticker, rs, extra = {}) => ({ ticker, rs_vs_theme: 1, rs_rating: rs, rs_score: rs, qualified: true,
    dollar_vol_20d: 1e9, atr_pct: 5, ...extra });
  const res = {
    A: { name: "A", rank: 3, rows: [q("X:CRWD", 97), { ticker: "X:JUNK", qualified: false }] },
    B: { name: "B", rank: 1, rows: [q("X:NET", 92), q("X:CRWD", 97)] },
  };
  const wl = buildWatchlist(res);
  assert.deepEqual(wl.map((e) => e.ticker), ["X:CRWD", "X:NET"]);
  assert.deepEqual(wl[0].themes.map((t) => [t.name, t.leader]), [["B", false], ["A", true]]);
  assert.equal(wl[0].strong, true);
  assert.equal(wl[1].strong, false);
  assert.equal(buildWatchlist(res, { minAtrPct: 6 }).length, 0);
});

test("tradingViewFromWatchlist: In Play zuerst, danach staerkstes Theme, keine Dubletten", () => {
  const e = (ticker, trigger, themes) => ({ ticker, trigger, themes });
  const txt = tradingViewFromWatchlist([
    e("X:A", true, [{ name: "Cyber, Sec", rank: 1 }]),
    e("X:B", false, [{ name: "Semis", rank: 2 }, { name: "Cyber, Sec", rank: 1 }].sort((a, b) => a.rank - b.rank)),
    e("X:C", false, [{ name: "Semis", rank: 2 }]),
  ]);
  assert.equal(txt, ["###In Play", "X:A", "###Cyber  Sec", "X:B", "###Semis", "X:C", ""].join("\n"));
});

test("applyGroupRs: Median-3M-RS je Theme, Mindestzahl, Perzentil unter Themes", () => {
  const rows = (...v) => v.map((x) => ({ rs3m: x }));
  const res = applyGroupRs({
    A: { name: "A", rank: 3, rows: rows(90, 80, 70, null) },     // Median 80
    B: { name: "B", rank: 1, rows: rows(40, 60, 50, 99) },       // Median 55
    C: { name: "C", rank: 2, rows: rows(99, 98) },               // < 3 Werte -> null
  }, 3);
  assert.equal(res.A.group_rs_3m, 80);
  assert.equal(res.B.group_rs_3m, 55);
  assert.equal(res.C.group_rs_3m, null);
  assert.equal(res.A.group_rs_pct, 100);
  assert.equal(res.B.group_rs_pct, 50);
  assert.equal(res.C.group_rs_pct, null);
  // Sortierung: hoechster Median zuerst, ohne Wert ans Ende
  assert.deepEqual(orderThemes(res, "group_rs").map((t) => t.name), ["A", "B", "C"]);
  assert.deepEqual(orderThemes(res, "score").map((t) => t.name), ["B", "C", "A"]);
});

test("rs3mUniverse: nur ROC63, gleiche Liquiditaetsauswahl", () => {
  const rows = { X: [10, 99, 99, 99, 3e6], Y: [20, 0, 0, 0, 2e6], Z: [30, 0, 0, 0, 1] };
  const bars = { rs_universe: { fields: ["roc63", "roc126", "roc189", "roc252", "dvol50"], rows } };
  assert.deepEqual([...rs3mUniverse(bars, 2)], [10, 20]);
});

test("tradingViewWatchlist keepOrder: Reihenfolge wie angezeigt", () => {
  const th = [
    { name: "B", rank: 5, rows: [{ ticker: "X:2" }] },
    { name: "A", rank: 1, rows: [{ ticker: "X:1" }, { ticker: "X:2" }] },
    { name: "Leer", rank: 2, rows: [] },
  ];
  assert.equal(tradingViewWatchlist(th, { keepOrder: true }), ["###B", "X:2", "###A", "X:1", "X:2", ""].join("\n"));
  assert.equal(tradingViewWatchlist(th), ["###A", "X:1", "X:2", "###B", "X:2", ""].join("\n"));
});

test("weekMonday / weekReference: letzter Protokolltag vor dem Montag der Datenwoche", () => {
  assert.equal(weekMonday("2026-10-02"), "2026-09-28");   // Freitag
  assert.equal(weekMonday("2026-10-05"), "2026-10-05");   // Montag
  assert.equal(weekMonday("2026-10-07"), "2026-10-05");   // Mittwoch
  const log = {
    "2026-09-24": { tickers: ["A"] },
    "2026-09-25": { tickers: ["A", "B"] },
    "2026-10-01": { tickers: ["C"] },
    "2026-10-02": { tickers: ["A", "C"] },
  };
  // Wochenend-Prep auf Freitagsdaten: Vergleich mit dem Freitag davor
  assert.deepEqual(weekReference(log, "2026-10-02"), { date: "2026-09-25", tickers: ["A", "B"] });
  // Unter der Woche: Vergleich mit dem letzten Freitag (= Prep-Stand)
  assert.equal(weekReference(log, "2026-10-07").date, "2026-10-02");
  assert.equal(weekReference(log, "2026-09-25"), null);    // noch keine Vorwoche
  assert.equal(weekReference({}, "2026-10-02"), null);
});

test("diffWatchlist: neu und herausgefallen", () => {
  assert.deepEqual(diffWatchlist(["A", "C", "D"], ["A", "B"]), { added: ["C", "D"], removed: ["B"] });
});

test("applyGroupState: Raenge, Gap und Zustand (N=8 -> Top=2, Cool=4)", () => {
  const mk = (name, r3, r12) => [name, { name, rows: [1, 2, 3].map(() => ({ rs3m: r3, rs_rating: r12 })) }];
  const res = applyGroupRs(Object.fromEntries([
    mk("A", 99, 99),   // 3M #1, 12M #1 -> confirmed
    mk("B", 50, 98),   // 3M #7, 12M #2 -> cooling (3M > 4)
    mk("C", 98, 40),   // 3M #2, 12M #7 -> rising (gap >= 2)
    mk("D", 90, 90), mk("E", 80, 80), mk("F", 60, 60), mk("G", 70, 70), mk("H", 20, 20),
  ]), 3);
  assert.equal(res.A.n_ranked, 8);
  assert.equal(res.A.state, "confirmed");
  assert.equal(res.B.state, "cooling");
  assert.equal(res.C.state, "rising");
  assert.equal(res.C.rank_3m, 2);
  assert.equal(res.C.rank_gap, res.C.rank_12m - res.C.rank_3m);
  assert.equal(res.H.state, "neutral");
  const thin = applyGroupRs({ X: { name: "X", rows: [{ rs3m: 90, rs_rating: 90 }] } }, 3);
  assert.equal(thin.X.state, null);
  assert.equal(thin.X.rank_3m, null);
});
