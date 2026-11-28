// In-Play-Unterreiter (Day / Swing / Position): heiße Industries (optional
// Themes) per Perzentil-Schnittmenge zweier Zeitfenster, darin liquide,
// volatile Aktien ($-Vol, ATR%), gruppiert und als TradingView-Watchlist.
// Reine Datenfunktionen ohne DOM — Spec:
// docs/superpowers/specs/2026-11-28-in-play-submenus-design.md

export const HORIZONS = {
  day:      { tfs: ["1D", "1W"], label: "1T ∩ 1W", file: "day" },
  swing:    { tfs: ["1W", "1M"], label: "1W ∩ 1M", file: "swing" },
  position: { tfs: ["1M", "3M"], label: "1M ∩ 3M", file: "position" },
};

export const DEFAULTS = { pct: [80, 80], minDvolM: 20, minAtr: 5, themes: false };

export const PCT_OPTIONS = Array.from({ length: 10 }, (_, i) => 50 + 5 * i);

const isNum = (x) => typeof x === "number" && Number.isFinite(x);

/** Freitext -> Zahl ≥ 0; "2,5" = 2.5; sonst fallback. */
export function parseNum(str, fallback) {
  if (str === null || str === undefined) return fallback;
  const s = String(str).trim().replace(",", ".");
  if (s === "") return fallback;
  const x = Number(s);
  return Number.isFinite(x) && x >= 0 ? x : fallback;
}

/** Lookup-Schlüssel wie inplay_universe.rows: ohne Börsenpräfix, "." -> "-". */
export function normSym(s) {
  return String(s).split(":").pop().replace(/\./g, "-").toUpperCase();
}

/** Map name -> {rank, pct}; nur Gruppen mit endlichem perfs[tf].
 *  rank = 1 + Anzahl strikt besserer; pct = 100·(n − rank)/n. */
export function rankAndPct(groups, tf) {
  const valid = groups.filter((g) => isNum(g?.perfs?.[tf]));
  const n = valid.length;
  const out = new Map();
  for (const g of valid) {
    const v = g.perfs[tf];
    const rank = 1 + valid.filter((o) => o.perfs[tf] > v).length;
    out.set(g.name, { rank, pct: (100 * (n - rank)) / n });
  }
  return out;
}

// Gruppen eines Universums, die in beiden Fenstern die Schwelle schaffen.
function passing(groups, kind, [tfA, tfB], [pa, pb]) {
  const a = rankAndPct(groups, tfA), b = rankAndPct(groups, tfB);
  const out = [];
  for (const g of groups) {
    const ra = a.get(g.name), rb = b.get(g.name);
    if (!ra || !rb || ra.pct < pa || rb.pct < pb) continue;
    out.push({
      name: g.name, kind, members: g.members,
      ranks: [ra.rank, rb.rank],
      key: [Math.max(ra.rank, rb.rank), Math.min(ra.rank, rb.rank)],
    });
  }
  return out;
}

/** Siehe Plan Task 2. Liefert {groups, missingData}. */
export function buildHorizon({
  industries = {}, themes = {}, themeMembers = {}, universe, exchangeOf = () => null,
  horizon, pct = DEFAULTS.pct, minDvolM = DEFAULTS.minDvolM, minAtr = DEFAULTS.minAtr,
  includeThemes = false,
}) {
  const rows = universe?.rows;
  if (!rows) return { groups: [], missingData: true };
  const tfs = HORIZONS[horizon].tfs;

  const ind = Object.entries(industries).map(([name, r]) => ({
    name, perfs: r?.perfs, members: r?.tickers || [],
  }));
  let picked = passing(ind, "industry", tfs, pct);
  if (includeThemes) {
    const th = Object.entries(themes).map(([name, r]) => ({
      name, perfs: r?.perfs, members: themeMembers[name] || [],
    }));
    picked = picked.concat(passing(th, "theme", tfs, pct));
  }
  picked.sort((x, y) => x.key[0] - y.key[0] || x.key[1] - y.key[1] || x.name.localeCompare(y.name));

  const minDvol = minDvolM * 1e6;
  const seen = new Set();
  const groups = [];
  for (const g of picked) {
    const list = [];
    for (const m of g.members) {
      const sym = normSym(m);
      if (seen.has(sym)) continue;
      const u = rows[sym];
      if (!u) continue;
      const [dvol, atr] = u;
      if (!isNum(dvol) || !isNum(atr) || dvol < minDvol || atr < minAtr) continue;
      seen.add(sym);
      list.push({ sym, tv: exchangeOf(sym) || sym.replace(/-/g, "."), dvol, atr });
    }
    if (!list.length) continue;
    list.sort((a, b) => b.dvol - a.dvol);
    groups.push({ name: g.name, kind: g.kind, ranks: g.ranks, key: g.key, rows: list });
  }
  return { groups, missingData: false };
}

const sectionName = (g) => `${g.kind === "theme" ? "Theme: " : ""}${String(g.name).replace(/,/g, " ")}`;

/** TradingView-Import (.txt): ###Gruppe, darunter ein Ticker je Zeile. */
export function tvText(groups) {
  if (!groups.length) return "";
  const lines = [];
  for (const g of groups) {
    lines.push(`###${sectionName(g)}`);
    for (const r of g.rows) lines.push(r.tv);
  }
  return lines.join("\n") + "\n";
}

/** Zwischenablage: alle Ticker in Anzeige-Reihenfolge, kommasepariert. */
export function clipboardText(groups) {
  return groups.flatMap((g) => g.rows.map((r) => r.tv)).join(",");
}
