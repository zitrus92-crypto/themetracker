/**
 * Läuft ohne Abhängigkeiten:  node --test themeMetrics.test.js
 *
 * Fixtures sind die echten ThemeTracker-Werte vom 14.08.2026, 00:35.
 * Erwartungswerte sind bewusst hart verdrahtet — wenn ein Threshold
 * verstellt wird, MUSS ein Test brechen. Das ist der Sinn dieser Datei.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  segments, chainSegment, freshness, classifyStage, groupMetrics,
  evaluateForTab, buildTab, pivotDistance, extSma50, isSetup,
  STAGE, TAB,
} from './themeMetrics.js';

const P = (w, m, m3, m6) => ({ '1W': w, '1M': m, '3M': m3, '6M': m6 });

const FIXTURES = [
  { name: 'Software',               accel: 1,  score: 56.7,  perfs: P(6.54, 16.62, 24.90, 26.31), stage: STAGE.BASE_BREAK },
  { name: 'Cloud Computing',        accel: 2,  score: 55.2,  perfs: P(6.45, 14.47, 23.00, 51.59), stage: STAGE.TREND },
  { name: 'Space Tech',             accel: 33, score: 67.5,  perfs: P(5.34, 14.35, -5.71, 24.93), stage: STAGE.PULLBACK },
  { name: 'Agriculture & Food',     accel: 23, score: 136.6, perfs: P(3.37, 13.87, 2.03, -5.58),  stage: STAGE.BOUNCE },
  { name: 'Commodities — Metals',   accel: 34, score: 85.6,  perfs: P(5.24, 12.67, -11.39, -12.38), stage: STAGE.BOUNCE },
  { name: 'VR & Augmented Reality', accel: 2,  score: 73.0,  perfs: P(4.32, 12.56, 14.77, 33.78), stage: STAGE.TREND },
  { name: 'Big Data',               accel: -1, score: 62.8,  perfs: P(5.76, 12.54, 19.46, 31.32), stage: STAGE.TREND },
  { name: 'Cybersecurity',          accel: -7, score: 57.2,  perfs: P(8.04, 11.60, 51.65, 68.43), stage: STAGE.EXTENDED },
].map((f) => ({ type: 'theme', tickers: [], ...f }));

const near = (a, b, eps = 0.02) =>
  assert.ok(Math.abs(a - b) < eps, `erwartet ~${b}, war ${a}`);

test('chainSegment entschachtelt korrekt', () => {
  near(chainSegment(14.35, -5.71), -17.54);   // Space Tech, Monate 2-3
  near(chainSegment(-5.71, 24.93), 32.50);    // Space Tech, Monate 4-6
  assert.equal(chainSegment(-100, 10), null); // Division durch Null abgefangen
  assert.equal(chainSegment(undefined, 10), null);
});

test('Kernfehler: verschachtelte Fenster tarnen eine echte Flat Base', () => {
  // Base flach, dann +14 % Ausbruch -> ALLE kumulativen Fenster zeigen +14.
  const flatBase = P(4.0, 14.0, 14.0, 14.0);
  const s = segments(flatBase);
  near(s.m2_3, 0); near(s.m4_6, 0);
  assert.equal(classifyStage(s, 5), STAGE.BASE_BREAK,
    'entschachtelt muss die Flat Base als BASE_BREAK erkannt werden');
});

test('Stage-Klassifikation über alle acht echten Zeilen', () => {
  for (const f of FIXTURES) {
    assert.equal(classifyStage(segments(f.perfs), f.accel), f.stage, f.name);
  }
});

test('BOUNCE hat Vorrang vor hohem accel (Korrektur vom 10.08.)', () => {
  const metals = FIXTURES.find((f) => f.name === 'Commodities — Metals');
  const m = groupMetrics(metals);
  assert.equal(m.stage, STAGE.BOUNCE);
  assert.ok(m.damage < -20);
  assert.equal(evaluateForTab(m, TAB.FIRST_FLAG).qualified, false,
    'accel +34 darf eine beschädigte Gruppe nicht in den Tab heben');
});

test('Agriculture ist trotz accel +23 kein Base Breakout', () => {
  const agri = groupMetrics(FIXTURES.find((f) => f.name === 'Agriculture & Food'));
  assert.equal(agri.stage, STAGE.BOUNCE);
  near(agri.damage, -17.86, 0.05);
  assert.equal(evaluateForTab(agri, TAB.BASE_BREAKOUT).qualified, false);
});

test('Frische-Quote', () => {
  near(freshness(P(5.34, 14.35, 0, 0)), 0.372, 0.01);
  assert.equal(freshness({ '1W': 3, '1M': 0 }), null);
});

test('Fehlendes 6M führt zu UNKNOWN statt zu einer Falschklassifikation', () => {
  const m = groupMetrics({ name: 'x', type: 'theme', accel: 20, perfs: { '1W': 5, '1M': 14, '3M': -5 }, tickers: [] });
  assert.equal(m.stage, STAGE.UNKNOWN);
  assert.equal(evaluateForTab(m, TAB.FIRST_FLAG).qualified, false);
});

test('Tab-Belegung mit dem echten Datensatz', () => {
  const ff = buildTab(FIXTURES, TAB.FIRST_FLAG);
  const bb = buildTab(FIXTURES, TAB.BASE_BREAKOUT);
  assert.deepEqual(ff.qualified.map((r) => r.name), ['Space Tech']);
  assert.deepEqual(bb.qualified.map((r) => r.name), ['Software']);
});

test('Knapp-daneben benennt genau ein gescheitertes Kriterium', () => {
  // Space Tech mit accel unter der Rauschschwelle -> ein Kriterium fällt.
  const weak = { ...FIXTURES.find((f) => f.name === 'Space Tech'), accel: 4 };
  const r = evaluateForTab(groupMetrics(weak), TAB.FIRST_FLAG);
  assert.equal(r.qualified, false);
  assert.equal(r.nearMiss, true);
  assert.deepEqual(r.failed.map((c) => c.key), ['accel']);
});

test('Ticker-Ebene: USAR-Profil qualifiziert, MP-Profil nicht', () => {
  // Werte aus den Charts vom 14.08.: USAR Ext -0,37x, MP Ext 1,22x.
  const usar = { symbol: 'USAR', rs: 85, close: 18.61, atr14: 1.36, sma50: 19.11, sma200: 17.0, pivot: 20.0, perf1M: 20 };
  const mp   = { symbol: 'MP',   rs: 88, close: 55.66, atr14: 3.46, sma50: 51.44, sma200: 58.0, pivot: 56.0, perf1M: 30 };
  near(extSma50(usar), -0.37, 0.03);
  near(extSma50(mp), 1.22, 0.03);
  assert.equal(isSetup(usar), true,  'USAR: unter SMA50, Pivot in Reichweite');
  assert.equal(isSetup(mp), false,   'MP: 1,22x über SMA50 -> extended');
  assert.ok(pivotDistance(usar) > 0);
});

test('Ticker-Aggregate bleiben null, solange nur Symbole vorliegen', () => {
  const m = groupMetrics({ ...FIXTURES[0], tickers: ['AAPL', 'MSFT'] });
  assert.equal(m.density, null);
  assert.equal(m.concentration, null);
  // Ebene-2-Kriterien dürfen dann nicht blockieren:
  assert.equal(evaluateForTab(m, TAB.BASE_BREAKOUT).qualified, true);
});
