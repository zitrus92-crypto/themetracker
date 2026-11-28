import { test } from "node:test";
import assert from "node:assert/strict";
import {
  IPO_CFG, analyzeIpo, riskAppetite, buildIpoList, ipoTvText, ipoClipboard,
} from "./ipoMetrics.js";

const near = (a, b, eps = 0.05) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

// Close-Pfad aus Stützpunkten [[tag, close], …] linear interpoliert;
// h = c + 0.05, l = c − 0.05, Volumen 1000 (Ausnahmen über vol).
function series(points, vol = {}) {
  const c = [];
  for (let k = 0; k < points.length - 1; k++) {
    const [d0, p0] = points[k], [d1, p1] = points[k + 1];
    for (let d = d0; d < d1; d++) c.push(p0 + ((p1 - p0) * (d - d0)) / (d1 - d0));
  }
  c.push(points.at(-1)[1]);
  const r = (x) => Math.round(x * 100) / 100;
  return {
    first: "2026-01-02",
    o: c.map(r), c: c.map(r), h: c.map((x) => r(x + 0.05)), l: c.map((x) => r(x - 0.05)),
    v: c.map((_, i) => vol[i] ?? 1000),
  };
}
const cut = (t, n) => ({ ...t, o: t.o.slice(0, n), h: t.h.slice(0, n), l: t.l.slice(0, n), c: t.c.slice(0, n), v: t.v.slice(0, n) });

// SNDK 2025 nachgebaut (split-bereinigt): Hoch 7.30 (Tag 22), Tief 3.49 (37),
// rechte Seite 6.23 (94), Henkel 5.01 (119), 6.10 (137), Ausbruch A 6.36 (138),
// 6.60 (142), Ausbruch B 7.81 (143), danach neue Hochs.
const SNDK = series(
  [[0, 4.5], [22, 7.25], [37, 3.54], [94, 6.18], [119, 5.06], [137, 6.10], [138, 6.36],
   [142, 6.60], [143, 7.81], [149, 9.0], [160, 9.5]],
  { 138: 1200, 143: 4000 },
);

test("SNDK: zu frisch kurz nach dem IPO-Hoch", () => {
  assert.equal(analyzeIpo(cut(SNDK, 31)).status, "fresh");
});

test("SNDK: Basis mit Pivot A und B, Tiefe ohne Grenze", () => {
  const a = analyzeIpo(cut(SNDK, 121));
  assert.equal(a.status, "base");
  near(a.pivotB, 7.30);
  near(a.pivotA, 6.23);
  near(a.depthPct, -52.2, 0.2);
  assert.ok(a.baseLen >= 98);
});

test("SNDK: nahe Pivot A vor dem Ausbruch", () => {
  const a = analyzeIpo(cut(SNDK, 138));      // letzter Tag 137, Close 6.10
  assert.equal(a.status, "near");
  assert.equal(a.near, "A");
  near(a.distA, -2.1, 0.2);
});

test("SNDK: Ausbruch A am Tag 138", () => {
  const a = analyzeIpo(cut(SNDK, 139));
  assert.equal(a.status, "breakoutA");
  near(a.breakout.pivot, 6.23);
  near(a.breakout.volX, 1.2, 0.05);
  assert.equal(a.breakout.since, 0);
});

test("SNDK: Ausbruch B am Tag 143, Pivot bleibt bei neuen Hochs eingefroren", () => {
  const b = analyzeIpo(cut(SNDK, 144));
  assert.equal(b.status, "breakoutB");
  near(b.breakout.pivot, 7.30);
  near(b.breakout.volX, 4, 0.1);
  const later = analyzeIpo(cut(SNDK, 147));  // Tag 146, neues Hoch
  assert.equal(later.status, "breakoutB");
  near(later.breakout.pivot, 7.30);
  assert.equal(later.breakout.since, 3);
});

test("SNDK: nach 5 Tagen über dem Pivot endet der Ausbruchs-Status", () => {
  const a = analyzeIpo(cut(SNDK, 150));      // Tag 149
  assert.notEqual(a.status, "breakoutB");
  assert.equal(a.status, "fresh");           // neues IPO-Hoch -> neue Basis
  assert.equal(a.breakout.kind, "B");        // jüngster Ausbruch bleibt für Signal 3
});

test("Fehlausbruch: Close fällt unter den eingefrorenen Pivot", () => {
  const t = cut(SNDK, 141);
  t.c[140] = 6.0; t.l[140] = 5.95; t.h[140] = 6.05;
  assert.equal(analyzeIpo(t).status, "failed");
});

test("Täglich neue Hochs ohne Basis -> nie Ausbruch", () => {
  const t = series([[0, 10], [40, 50]]);
  const a = analyzeIpo(t);
  assert.equal(a.breakout, null);
  assert.equal(a.status, "fresh");
});

test("Pivot A braucht einen Henkel: kurzer Rücksetzer + Erholung ist kein Ausbruch", () => {
  // Hoch Tag 10, Fall bis Tag 30, Erholung auf 8.0 (Tag 33), 2 Tage runter, dann Close 8.2
  const t = series([[0, 5], [10, 10], [30, 6], [33, 8.0], [35, 7.7], [36, 8.2]]);
  const a = analyzeIpo(t);
  assert.equal(a.breakout, null);
  assert.notEqual(a.status, "breakoutA");
  assert.equal(IPO_CFG.MIN_HANDLE, 5);
  const b = analyzeIpo(cut(t, 35));            // Tag 34: A-Hoch (Tag 33) erst 1 Tag alt
  assert.equal(b.handleOk, false);
  assert.equal(b.handleDays, 1);
});

test("null-Bar in der Basis ändert die Pivots nicht", () => {
  const t = cut(SNDK, 121);
  for (const k of ["o", "h", "l", "c", "v"]) t[k][60] = null;
  const a = analyzeIpo(t);
  near(a.pivotB, 7.30);
  near(a.pivotA, 6.23);
  assert.equal(a.status, "base");
});

test("ATR am Basis-Tief: null, wenn das Tief in den ersten 14 Bars liegt", () => {
  const t = series([[0, 10], [5, 12], [10, 8], [40, 9]]);
  const a = analyzeIpo(t);
  assert.equal(a.atrAtLow, null);
  assert.ok(Number.isFinite(a.atrNow));
});

// --- Ampel -----------------------------------------------------------------
function data(nDays, tickers, benchSlope = 0) {
  const dates = Array.from({ length: nDays }, (_, i) => `d${String(i).padStart(3, "0")}`);
  return {
    dates,
    bench: { c: dates.map((_, i) => 100 + benchSlope * i) },
    etf: { symbol: "IPO", c: dates.map((_, i) => 50 + i) },
    tickers,
  };
}
const rising = (n) => series([[0, 10], [n - 1, 10 + n]]);
const falling = (n) => series([[0, 30], [n - 1, 10]]);

test("riskAppetite: zu wenig Tage -> Index-Signal null", () => {
  const d = data(15, { A: rising(15) });
  const r = riskAppetite(d, Object.values(d.tickers).map((t) => analyzeIpo(t)));
  assert.equal(r.signals.find((s) => s.key === "index").ok, null);
});

test("riskAppetite: Index, Breite, Ampel-Zählung", () => {
  const d = data(60, { A: rising(60), B: rising(60), C: falling(60) });
  const an = Object.values(d.tickers).map((t) => analyzeIpo(t));
  const r = riskAppetite(d, an);
  const sig = Object.fromEntries(r.signals.map((s) => [s.key, s]));
  assert.equal(sig.index.ok, true);
  assert.equal(sig.breadth.ok, true);          // 2/3 über SMA
  assert.equal(sig.hold.ok, null);             // keine Ausbrüche
  assert.equal(r.score, 2);
  assert.equal(r.light, "green");
  assert.equal(r.etf.ok, true);
});

test("riskAppetite: Ausbrüche halten (≥ 3 nötig)", () => {
  const bo = (pivot, last) => ({ breakout: { kind: "A", pivot, since: 3 }, lastClose: last });
  const d = data(10, {});
  const two = riskAppetite(d, [bo(10, 11), bo(10, 12)]);
  assert.equal(two.signals.find((s) => s.key === "hold").ok, null);
  const three = riskAppetite(d, [bo(10, 11), bo(10, 12), bo(10, 9)]);
  assert.equal(three.signals.find((s) => s.key === "hold").ok, true);  // 2/3
  const old = riskAppetite(d, [bo(10, 11), bo(10, 12), { breakout: { pivot: 10, since: 25 }, lastClose: 9 }]);
  assert.equal(old.signals.find((s) => s.key === "hold").ok, null);   // since ≥ 20 zählt nicht
  assert.equal(three.light, "yellow");          // nur hold ✓, index/breadth null
});

test("riskAppetite: rot bei 0 Signalen", () => {
  const d = data(60, { A: falling(60), B: falling(60) }, 0.5);
  const r = riskAppetite(d, Object.values(d.tickers).map((t) => analyzeIpo(t)));
  assert.equal(r.light, "red");
});

// --- Liste & Export ----------------------------------------------------------
test("buildIpoList: Filter, Sortierung, Export", () => {
  const big = (t) => ({ ...t, v: t.v.map((x) => (x === null ? null : x * 1e5)) });
  const d = data(161, {
    SNDK: big(SNDK),                        // nach Tag 160: fresh
    BASE: big(cut(SNDK, 121)),              // base
    NEAR: big(cut(SNDK, 138)),              // near
    BRKA: big(cut(SNDK, 139)),              // breakoutA
    TINY: cut(SNDK, 139),                   // $-Vol zu klein
  });
  // Reihen enden am letzten Datum: kürzere Reihen sind hier nur Testobjekte.
  const out = buildIpoList(d, { minDvolM: 0.1, minAtr: 0, exchangeOf: (s) => (s === "BRKA" ? "NYSE:BRKA" : null) });
  assert.equal(out.total, 5);
  assert.deepEqual(out.rows.map((r) => r.sym), ["BRKA", "NEAR", "BASE", "SNDK"]);
  assert.equal(out.rows[0].tv, "NYSE:BRKA");
  assert.equal(ipoTvText(out.rows), "###Ausbruch\nNYSE:BRKA\n###Nahe Pivot\nNEAR\n###Basis\nBASE\n");
  assert.equal(ipoClipboard(out.rows), "NYSE:BRKA,NEAR,BASE");
  assert.equal(ipoTvText([]), "");
  assert.equal(IPO_CFG.MIN_BASE, 15);
});
