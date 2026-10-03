/**
 * Tages-Protokoll der Leader-Watchlist — Grundlage fuer "neu seit letztem
 * Freitag" im Leading-Stocks-Tab und fuer eine spaetere Pruefung der
 * Schwellen (Forward-Returns der Watchlist-Namen).
 *
 *   node scripts/watchlist_log.mjs
 *
 * Rechnet mit DEMSELBEN Rechenkern wie die Seite (docs/static/leadersMetrics.js
 * + config.js) - es gibt nur eine Implementierung der Kriterien. Protokolliert
 * wird die ungefilterte Watchlist (ohne die UI-Filter $-Vol/ATR), denn die
 * Filter sind eine Ansichtssache, die Qualifikation nicht.
 *
 * Ausgabe: docs/data/watchlist_log/YYYY-MM.json
 *   { "YYYY-MM-DD": { generated_at, n, criteria, tickers: [...], rs: {ticker: rating} } }
 * Schluessel = letzter Handelstag der Kursreihe. Idempotent: ein erneuter Lauf
 * fuer denselben Tag ueberschreibt nur diesen Eintrag.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeLeaders, buildWatchlist } from "../docs/static/leadersMetrics.js";
import { LEADERS } from "../docs/static/config.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");
const read = (p) => JSON.parse(readFileSync(join(docs, p), "utf8"));

const bars = read("data/leaders_bars.json");
const cons = read("data/theme_constituents.json");
const etf = read("etf_data.json");

const date = bars.dates[bars.dates.length - 1];
const list = buildWatchlist(computeLeaders(bars, cons, etf.themes, []));

const dir = join(docs, "data", "watchlist_log");
mkdirSync(dir, { recursive: true });
const file = join(dir, `${date.slice(0, 7)}.json`);
const shard = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};

shard[date] = {
  generated_at: new Date().toISOString(),
  n: list.length,
  criteria: LEADERS.WL,
  tickers: list.map((e) => e.ticker),
  rs: Object.fromEntries(list.map((e) => [e.ticker, e.rs_rating])),
};

const sorted = Object.fromEntries(Object.entries(shard).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(file, JSON.stringify(sorted, null, 1) + "\n");
console.log(`  Watchlist-Protokoll ${date}: ${list.length} Ticker -> ${file}`);
