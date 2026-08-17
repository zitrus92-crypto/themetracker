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
  relatedness, structureScore, exclusionReason, borderline, buildWeekendPrep, WEEKEND, preferPrimary,
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

/* ── Weekend Prep ──────────────────────────────────────────────────────── */

test('relatedness: gleicher Name auf verschiedenen Ebenen = derselbe Trade', () => {
  const a = { name: 'Semiconductors', type: 'theme',    tickers: ['NVDA'] };
  const b = { name: 'Semiconductors', type: 'industry', tickers: ['AMD'] };
  assert.equal(relatedness(a, b).related, true);
  assert.equal(relatedness(a, b).reason, 'name');
  // Selbstvergleich (Name UND Ebene gleich) ist keine Dublette:
  assert.equal(relatedness(a, { ...a }).related, false);
});

test('relatedness: Ticker-Überschneidung schlägt an, Disjunktheit nicht', () => {
  const a = { name: 'Defense & Aerospace', type: 'theme',    tickers: ['BA', 'LMT', 'RTX', 'NOC'] };
  const b = { name: 'Aerospace & Defense', type: 'industry', tickers: ['BA', 'LMT', 'GD'] };
  const r = relatedness(a, b);
  assert.equal(r.related, true);
  assert.equal(r.reason, 'tickers');
  assert.ok(r.overlap >= 0.6);
  // Industries sind untereinander überschneidungsfrei -> keine falsche Dublette:
  const x = { name: 'Silver', type: 'industry', tickers: ['AG', 'PAAS'] };
  const y = { name: 'Airlines', type: 'industry', tickers: ['AAL', 'DAL'] };
  assert.equal(relatedness(x, y).related, false);
});

test('relatedness: Komplex-Tabelle fängt präfixlose Rohstoff-Paare', () => {
  const silver = { name: 'Silver', type: 'industry', tickers: ['AG'] };
  const opm    = { name: 'Other Precious Metals & Mining', type: 'industry', tickers: ['HL'] };
  assert.equal(relatedness(silver, opm).reason, 'complex');
  // Namens-Präfix deckt die Oil & Gas-Familie ab:
  const d = { name: 'Oil & Gas Drilling', type: 'industry', tickers: ['RIG'] };
  const e = { name: 'Oil & Gas Midstream', type: 'industry', tickers: ['KMI'] };
  assert.ok(['complex', 'name'].includes(relatedness(d, e).reason));
});

test('exclusionReason spiegelt die harten Vetos der Tabs', () => {
  const m = (perfs, accel = 0) => groupMetrics({ name: 'X', type: 'theme', score: 1, accel, perfs, tickers: ['A'] });
  // Agriculture-Fixture ist BOUNCE:
  assert.equal(exclusionReason(m(P(3.37, 13.87, 2.03, -5.58))), 'bounce');
  // Cybersecurity-Fixture ist EXTENDED:
  assert.equal(exclusionReason(m(P(8.04, 11.60, 51.65, 68.43), -7)), 'extended');
  // 1M nicht positiv -> Killswitch. Profil muss NEUTRAL sein, sonst greift
  // vorher ein Stage-Veto und der Test prüfte den falschen Zweig.
  assert.equal(classifyStage(segments(P(-1, -5, -8, -6)), 0), STAGE.NEUTRAL);
  assert.equal(exclusionReason(m(P(-1, -5, -8, -6))), 'm1');
  // 6M fehlt -> nicht klassifizierbar:
  assert.equal(exclusionReason(m({ '1W': 1, '1M': 5 })), 'unknown');
  // Space Tech (PULLBACK) passiert alle Vetos:
  assert.equal(exclusionReason(m(P(5.34, 14.35, -5.71, 24.93))), null);
});

test('structureScore: Frische im Band gibt volle Punkte, Schaden am Boden keine', () => {
  const base = { stage: STAGE.PULLBACK, freshness: 0.4, damage: 30 };
  const full = structureScore(base, 1);
  assert.equal(Math.round(full.total), 100, 'Bestprofil erreicht 100');
  assert.equal(full.parts.freshness, WEEKEND.scoreWeights.freshness);

  // Frische außerhalb des Bands kostet, aber setzt nicht auf 0:
  const stale = structureScore({ ...base, freshness: 0.05 }, 1);
  assert.ok(stale.parts.freshness < full.parts.freshness);
  assert.ok(stale.parts.freshness > 0);

  // Schaden auf BOUNCE-Höhe -> 0 Punkte in dieser Komponente:
  assert.equal(structureScore({ ...base, damage: WEEKEND.damageFloor }, 1).parts.damage, 0);

  // Fehlende Werte fallen auf die halbe Gewichtung zurück, nie auf NaN:
  const unknown = structureScore({ stage: STAGE.NEUTRAL, freshness: null, damage: null }, null);
  assert.ok(Number.isFinite(unknown.total));
});

test('borderline erkennt Rundungs-Verfehlungen der Frische', () => {
  const crit = (actual) => ({ key: 'freshness', ok: false, actual });
  assert.equal(borderline(crit(0.1452)), true,  '0,1452 verfehlt 0,15 um Rundungsbreite');
  assert.equal(borderline(crit(0.6544)), true,  '0,6544 verfehlt 0,65 um Rundungsbreite');
  assert.equal(borderline(crit(0.05)),   false, '0,05 ist ein echtes Nein');
  assert.equal(borderline({ key: 'stage', ok: false, actual: STAGE.BOUNCE }), false);
  assert.equal(borderline(crit(0.4)),    false, 'erfüllte Kriterien sind nie Grenzfall');
});

test('buildWeekendPrep: Bounce fliegt raus, Dubletten belegen keinen Fokus-Slot', () => {
  const g = (name, type, perfs, accel) => ({ name, type, score: 50, accel, perfs, tickers: [name + '1'] });
  const groups = [
    g('Space Tech',           'theme', P(5.34, 14.35, -5.71, 24.93), 33),   // PULLBACK
    g('Commodities — Metals', 'theme', P(5.24, 12.67, -11.39, -12.38), 34), // BOUNCE
    g('Silver',               'industry', P(3.87, 31.40, -7.21, 5.90), 111),
    g('Other Precious Metals & Mining', 'industry', P(2.61, 22.86, -10.19, -14.90), 101),
    g('Software',             'theme', P(6.54, 16.62, 24.90, 26.31), 1),    // BASE_BREAK
  ];
  const wp = buildWeekendPrep(groups, { focusSlots: 3 });

  const focusNames = wp.focus.map(r => r.name);
  assert.ok(!focusNames.includes('Commodities — Metals'), 'BOUNCE nie im Fokus');
  assert.ok(wp.excluded.some(r => r.name === 'Commodities — Metals' && r.exclusion === 'bounce'));

  // Silver + Other Precious Metals sind derselbe Komplex: höchstens einer im Fokus.
  const pm = focusNames.filter(n => ['Silver', 'Other Precious Metals & Mining'].includes(n));
  assert.ok(pm.length <= 1, 'Komplex belegt nur einen Fokus-Slot');

  // Fokus ist nach Score absteigend und respektiert das Slot-Limit:
  assert.ok(wp.focus.length <= 3);
  for (let i = 1; i < wp.focus.length; i++)
    assert.ok(wp.focus[i - 1].score >= wp.focus[i].score, 'Fokus absteigend sortiert');
  assert.ok(wp.focus.every(r => !r.duplicateOf), 'Fokus enthält keine Dubletten');
  // Watch enthält keine hart aussortierten Gruppen:
  assert.ok(wp.watch.every(r => !r.exclusion));
});

test('preferPrimary: bei Score-Gleichstand gewinnt das bessere Jagdrevier', () => {
  const mk = (score, freshness, n) => ({ score, freshness, tickers: Array(n).fill('X') });
  // Abstand größer als tieEpsilon -> Score entscheidet, sonst nichts.
  assert.ok(preferPrimary(mk(95, 0.65, 10), mk(80, 0.30, 99)) < 0, 'klarer Score-Vorsprung gewinnt');
  // Innerhalb von tieEpsilon -> Frische im Band schlägt Frische daneben.
  assert.ok(preferPrimary(mk(95.1, 0.65, 47), mk(94.8, 0.26, 72)) > 0, 'Frische im Band gewinnt den Gleichstand');
  // Beide im Band -> größere Ticker-Basis gewinnt.
  assert.ok(preferPrimary(mk(90, 0.3, 20), mk(88, 0.4, 60)) > 0, 'mehr Ticker gewinnt bei gleicher Güte');
});

test('buildWeekendPrep: Cluster-Vertreter ist der mit der besseren Frische', () => {
  const g = (name, type, perfs, accel, extra = []) =>
    ({ name, type, accel, perfs, score: 50, tickers: [name.slice(0, 3), ...extra] });
  // Gleicher Name auf beiden Ebenen = ein Cluster; die Industry-Variante hat
  // die Frische im Band, das Theme liegt darüber.
  const groups = [
    g('Semiconductors', 'theme',    P(3.03, 4.63, -20.0, 20.0), 11),
    g('Semiconductors', 'industry', P(2.00, 7.70, -12.0, 25.0), 60, ['AMD', 'NVDA', 'AVGO']),
    g('Software',       'theme',    P(6.54, 16.62, 24.90, 26.31), 1),
  ];
  const wp = buildWeekendPrep(groups, { focusSlots: 3 });
  const semis = wp.reviere.filter(r => r.name === 'Semiconductors');
  assert.equal(semis.length, 2, 'beide Einträge bleiben sichtbar');
  const primary = semis.find(r => !r.duplicateOf);
  assert.equal(primary.type, 'industry', 'die Variante mit Frische im Band vertritt den Cluster');
  assert.equal(semis.find(r => r.duplicateOf).duplicateOf, 'Semiconductors');
  // Ein Cluster belegt nur einen Fokus-Slot:
  assert.equal(wp.focus.filter(r => r.name === 'Semiconductors').length, 1);
});
