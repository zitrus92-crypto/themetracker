/**
 * Läuft ohne Abhängigkeiten:  node --test todMetrics.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankDay, buildBoard, cutoffs, TOD } from './todMetrics.js';

// Eine Perf für alle vier Zeiträume -> alle vier Ränge identisch.
const row = (name, p, members = 10) =>
  ({ name, members, perfs: { '1W': p, '1M': p, '3M': p, '6M': p, 'YTD': p } });
const day = (date, perfs) =>
  ({ date, rows: Object.entries(perfs).map(([n, p]) => row(n, p)) });

test('rankDay: 1 = stärkste Perf, dünne und lückenhafte Gruppen fallen raus', () => {
  const rows = [row('A', 5), row('B', 9), row('C', 1), row('Thin', 50, 2),
    { name: 'Gap', members: 10, perfs: { '1W': 1, '1M': null, '3M': 1, '6M': 1 } }];
  const r = rankDay(rows);
  assert.deepEqual(Object.keys(r).sort(), ['A', 'B', 'C']);
  assert.deepEqual(r.B, { LT: 1, MOM: 1, FAST: 1, SF: 1 });
  assert.equal(r.C.SF, 3);
});

test('rankDay: Zeiträume sind getrennt gerankt', () => {
  const r = rankDay([
    { name: 'Slow', members: 5, perfs: { '1W': -1, '1M': 0, '3M': 9, '6M': 9 } },
    { name: 'Fast', members: 5, perfs: { '1W': 8, '1M': 6, '3M': 1, '6M': 1 } },
  ]);
  assert.deepEqual(r.Slow, { LT: 1, MOM: 1, FAST: 2, SF: 2 });
  assert.deepEqual(r.Fast, { LT: 2, MOM: 2, FAST: 1, SF: 1 });
});

test('cutoffs skalieren mit n (416 -> 80 / 104)', () => {
  assert.deepEqual(cutoffs(416), { lead: 80, riseMedian: 104 });
  assert.deepEqual(cutoffs(40), { lead: 8, riseMedian: 10 });
  assert.deepEqual(cutoffs(3), { lead: 1, riseMedian: 1 });
});

// 20 Gruppen G0..G19 -> lead-Schwelle 4, Median-Schwelle 5.
const base = (overrides = {}) =>
  Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`G${i}`, 100 - i]).concat(Object.entries(overrides)));

test('buildBoard: Leading-Panel, Streak und Sortierung', () => {
  const days = [
    day('d1', base()),
    day('d2', base()),
    day('d3', base({ G4: 200 })),   // G4 springt auf Platz 1, G3 fällt auf 5 raus
  ];
  const b = buildBoard(days);
  assert.equal(b.n, 20);
  assert.deepEqual(b.leading.map((r) => r.name), ['G4', 'G0', 'G1', 'G2']);
  const g0 = b.rows.find((r) => r.name === 'G0');
  assert.equal(g0.leadStreak, 3);
  assert.equal(g0.leadCapped, true);      // reicht bis zum ersten Tag zurück
  const g4 = b.rows.find((r) => r.name === 'G4');
  assert.equal(g4.leadStreak, 1);          // "new today"
  assert.equal(g4.leadCapped, false);
  assert.equal(b.refDate, null);           // < LOOKBACK Tage -> keine Veränderung
  assert.equal(g4.change, null);
  assert.equal(b.rising.length, 0);
});

test('buildBoard: Rising braucht Verbesserung auf allen vier und Median in Reichweite', () => {
  const flat = Array.from({ length: TOD.LOOKBACK }, (_, i) => day(`d${i}`, base()));
  // G6 (Rang 7) -> Rang 3: besser auf allen vier, Median 3 <= 5.
  // G19 (Rang 20) -> Rang 12: besser, aber Median 12 > 5.
  const b = buildBoard([...flat, day('today', base({ G6: 98.5, G19: 85.5 }))]);
  assert.equal(b.refDate, 'd0');
  assert.deepEqual(b.rising.map((r) => r.name), ['G6']);
  const g6 = b.rows.find((r) => r.name === 'G6');
  assert.deepEqual(g6.change, { LT: 4, MOM: 4, FAST: 4, SF: 4 });
  assert.equal(g6.riseStreak, 1);
  assert.equal(b.rows.find((r) => r.name === 'G19').rising, false);
});

test('buildBoard: leere Eingabe -> null', () => {
  assert.equal(buildBoard([]), null);
  assert.equal(buildBoard([{ date: 'd', rows: [] }]), null);
});
