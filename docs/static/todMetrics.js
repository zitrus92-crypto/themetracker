/**
 * todMetrics.js — Rechenkern für den versteckten Tab "Themes of the day".
 *
 * Abhängigkeitsfrei, seiteneffektfrei. Eingabe sind Snapshot-Tage
 * (docs/snapshots/YYYY-MM.json), aufsteigend nach Datum.
 *
 * Je Gruppe vier Ränge (1 = stärkste Perf) aus den Finviz-Perfs:
 *   LT = 6M · MOM = 3M · FAST = 1M · SF = 1W
 * (Snapshots haben kein 1D, deshalb ist 1W der schnellste Zeitraum.)
 *
 * Panels (Schwellen skaliert auf die Gruppenzahl n; Vorbild 80 bzw. 104 von 416):
 *   Leading on all four — schlechtester der vier Ränge <= LEAD_SHARE * n
 *   Rising on all four  — Rang auf allen vier besser als vor LOOKBACK Handelstagen
 *                          UND Median der vier Ränge <= RISE_MEDIAN_SHARE * n
 * Streak "day N" = aufeinanderfolgende Snapshot-Tage im Panel, bis heute.
 */

export const TOD = {
  TF: { LT: '6M', MOM: '3M', FAST: '1M', SF: '1W' },
  KEYS: ['LT', 'MOM', 'FAST', 'SF'],
  LOOKBACK: 5,              // Handelstage (Snapshot-Tage) für die Rangveränderung
  LEAD_SHARE: 80 / 416,
  RISE_MEDIAN_SHARE: 104 / 416,
  MIN_MEMBERS: 3,           // dünnere Gruppen werden nicht gerankt
};

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function cutoffs(n, cfg = TOD) {
  return {
    lead: Math.max(1, Math.round(n * cfg.LEAD_SHARE)),
    riseMedian: Math.max(1, Math.round(n * cfg.RISE_MEDIAN_SHARE)),
  };
}

/** Ränge eines Tages: { name: { LT, MOM, FAST, SF } }. Gruppen mit fehlender
 *  Perf in einem Zeitraum oder zu wenig Mitgliedern fallen ganz raus, damit
 *  alle vier Ränge über dieselbe Menge laufen. */
export function rankDay(rows, cfg = TOD) {
  const eligible = rows.filter((r) =>
    (r.members ?? 0) >= cfg.MIN_MEMBERS &&
    cfg.KEYS.every((k) => typeof r.perfs?.[cfg.TF[k]] === 'number'));
  const out = {};
  for (const r of eligible) out[r.name] = {};
  for (const k of cfg.KEYS) {
    const tf = cfg.TF[k];
    const sorted = [...eligible].sort((a, b) =>
      (b.perfs[tf] - a.perfs[tf]) || a.name.localeCompare(b.name));
    sorted.forEach((r, i) => { out[r.name][k] = i + 1; });
  }
  return out;
}

function isLeading(ranks, cut, cfg) {
  return Math.max(...cfg.KEYS.map((k) => ranks[k])) <= cut.lead;
}

function isRising(ranks, prev, cut, cfg) {
  if (!prev) return false;
  return cfg.KEYS.every((k) => ranks[k] < prev[k]) &&
    median(cfg.KEYS.map((k) => ranks[k])) <= cut.riseMedian;
}

/**
 * days: [{ date, rows }] aufsteigend, rows bereits auf EINEN Typ gefiltert.
 * Returns { date, refDate, n, cut, rows, leading, rising } oder null ohne Daten.
 * rows: { name, label, theme, members, ranks, change (null ohne Referenz),
 *         worst, median, leading, rising, leadStreak, riseStreak,
 *         leadCapped, riseCapped }
 */
export function buildBoard(days, cfg = TOD) {
  const usable = days.filter((d) => d.rows?.length);
  if (!usable.length) return null;

  const ranked = usable.map((d) => ({ date: d.date, ranks: rankDay(d.rows, cfg) }));
  const flags = ranked.map((d, i) => {
    const n = Object.keys(d.ranks).length;
    const cut = cutoffs(n, cfg);
    const prev = i >= cfg.LOOKBACK ? ranked[i - cfg.LOOKBACK].ranks : null;
    const lead = new Set(), rise = new Set();
    for (const [name, r] of Object.entries(d.ranks)) {
      if (isLeading(r, cut, cfg)) lead.add(name);
      if (isRising(r, prev?.[name], cut, cfg)) rise.add(name);
    }
    return { n, cut, prev, lead, rise };
  });

  const last = ranked.length - 1;
  const today = ranked[last];
  const { n, cut, prev } = flags[last];
  const streak = (name, key) => {
    let s = 0;
    for (let i = last; i >= 0 && flags[i][key].has(name); i--) s++;
    // Rising braucht eine Referenz: reicht die Serie bis zum ersten
    // bewertbaren Tag, ist der echte Beginn unbekannt.
    const first = key === 'rise' ? cfg.LOOKBACK : 0;
    return { s, capped: s > 0 && last - s + 1 <= first };
  };

  const meta = Object.fromEntries(usable[last].rows.map((r) => [r.name, r]));
  const rows = Object.entries(today.ranks).map(([name, ranks]) => {
    const p = prev?.[name];
    const vals = cfg.KEYS.map((k) => ranks[k]);
    const ls = streak(name, 'lead'), rs = streak(name, 'rise');
    return {
      name,
      label: meta[name].label ?? name,
      theme: meta[name].theme ?? null,
      members: meta[name].members ?? null,
      ranks,
      change: p ? Object.fromEntries(cfg.KEYS.map((k) => [k, p[k] - ranks[k]])) : null,
      worst: Math.max(...vals),
      median: median(vals),
      leading: flags[last].lead.has(name),
      rising: flags[last].rise.has(name),
      leadStreak: ls.s, leadCapped: ls.capped,
      riseStreak: rs.s, riseCapped: rs.capped,
    };
  });

  const byWorst = (a, b) => (a.worst - b.worst) || (a.median - b.median);
  const byMedian = (a, b) => (a.median - b.median) || (a.worst - b.worst);
  return {
    date: today.date,
    refDate: last >= cfg.LOOKBACK ? ranked[last - cfg.LOOKBACK].date : null,
    n, cut,
    rows: [...rows].sort(byWorst),
    leading: rows.filter((r) => r.leading).sort(byWorst),
    rising: rows.filter((r) => r.rising).sort(byMedian),
  };
}
