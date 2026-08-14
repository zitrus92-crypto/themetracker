/**
 * Kalibrierungs-Report (DECISIONS.md §2/§6) — ein Skript, kein Feature.
 *
 *   node scripts/calibration_report.mjs [snapshotDir]
 *
 * Liest die Snapshot-Shards (default docs/snapshots/), klassifiziert jede
 * Zeile mit themeMetrics.js (dieselbe Implementierung wie die App — Schwellen
 * ändern und neu laufen lassen reklassifiziert die GESAMTE Historie) und
 * berechnet Forward-Returns +5 / +10 / +20 Handelstage je Stage-Klasse.
 *
 * Auswertungsfrage nach ~8 Wochen: Wie unterscheiden sich die 20-Tage-
 * Forward-Returns von PULLBACK- gegenüber BOUNCE-Gruppen? Fällt der
 * Unterschied klein aus, ist nicht die Schwelle falsch, sondern die
 * Klasseneinteilung.
 *
 * Methodik (Näherung, weil Snapshots kumulative Finviz-Fenster speichern,
 * keine Kursniveaus):
 *   +5d  = perfs["1W"] der Zeile 5 Handelstage später
 *   +10d = Verkettung der 1W-Fenster bei +5 und +10
 *   +20d = perfs["1M"] der Zeile 21 Handelstage später
 * Samples werden verworfen, wenn dazwischen ticker_hash bricht (Finviz hat
 * die Gruppenzusammensetzung geändert) oder ein gap liegt.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyStage, segments, STAGE } from "../docs/static/themeMetrics.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const snapDir = process.argv[2] ?? join(root, "docs", "snapshots");

if (!existsSync(snapDir)) {
  console.log(`Kein Snapshot-Verzeichnis: ${snapDir}`);
  process.exit(0);
}

const shardFiles = readdirSync(snapDir).filter(f => /^\d{4}-\d{2}\.json$/.test(f)).sort();
if (!shardFiles.length) {
  console.log("Noch keine Snapshot-Shards — der Report braucht Historie.");
  process.exit(0);
}

// Tage chronologisch einlesen
const days = [];
for (const f of shardFiles) {
  const shard = JSON.parse(readFileSync(join(snapDir, f), "utf8"));
  for (const [date, entry] of Object.entries(shard)) days.push({ date, ...entry });
}
days.sort((a, b) => a.date.localeCompare(b.date));

// Pro Gruppe (type|name) eine indizierte Zeitreihe
const series = new Map();
days.forEach((day, i) => {
  for (const row of day.rows) {
    const key = `${row.type}|${row.name}`;
    if (!series.has(key)) series.set(key, []);
    series.get(key).push({ i, day, row });
  }
});

const chain = (a, b) => (a === null || b === null) ? null : ((1 + a / 100) * (1 + b / 100) - 1) * 100;

// Sample-Sammlung: je Beobachtung {type, stage, fwd5, fwd10, fwd20}
const samples = [];
let hashBreaks = 0, unsettled = 0;

for (const points of series.values()) {
  const byIndex = new Map(points.map(p => [p.i, p]));
  for (const p of points) {
    if (!p.day.settled) { unsettled++; }
    const stage = classifyStage(segments(p.row.perfs), p.row.accel);
    const at = (offset) => byIndex.get(p.i + offset) ?? null;

    const valid = (q) => {
      if (!q) return false;
      if (q.row.ticker_hash !== p.row.ticker_hash) { hashBreaks++; return false; }
      return true;
    };

    const p5 = at(5), p10 = at(10), p21 = at(21);
    const fwd5 = valid(p5) ? (p5.row.perfs["1W"] ?? null) : null;
    const fwd10 = (valid(p5) && valid(p10))
      ? chain(p5.row.perfs["1W"] ?? null, p10.row.perfs["1W"] ?? null) : null;
    const fwd20 = valid(p21) ? (p21.row.perfs["1M"] ?? null) : null;

    if (fwd5 !== null || fwd10 !== null || fwd20 !== null) {
      samples.push({ type: p.row.type, stage, fwd5, fwd10, fwd20 });
    }
  }
}

const mean = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const median = xs => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const fmt = v => v === null ? "    —" : (v >= 0 ? "+" : "") + v.toFixed(2).padStart(5);

console.log(`Snapshot-Tage: ${days.length} (${days[0].date} … ${days[days.length - 1].date})`);
console.log(`Samples: ${samples.length} · verworfen wegen ticker_hash-Bruch: ${hashBreaks}`);
if (unsettled) console.log(`Hinweis: ${unsettled} Beobachtungen aus nicht-settled Tagen (Intraday-Stand).`);
console.log();

for (const type of ["theme", "industry"]) {
  const ofType = samples.filter(s => s.type === type);
  if (!ofType.length) continue;
  console.log(`── ${type.toUpperCase()} ──`);
  console.log("Stage        n     fwd5 mean/med    fwd10 mean/med   fwd20 mean/med");
  for (const stage of Object.values(STAGE)) {
    const ss = ofType.filter(s => s.stage === stage);
    if (!ss.length) continue;
    const col = (k) => {
      const vals = ss.map(s => s[k]).filter(v => v !== null);
      return `${fmt(mean(vals))} /${fmt(median(vals))}`;
    };
    console.log(
      `${stage.padEnd(11)} ${String(ss.length).padStart(4)}   ${col("fwd5")}   ${col("fwd10")}   ${col("fwd20")}`
    );
  }
  console.log();
}
