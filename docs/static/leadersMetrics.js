// Rechenkern des Leading-Stocks-Tabs — einzige Implementierung der Metriken.
//
// Eingabe: docs/data/leaders_bars.json (Close/High lang, Low/Volumen kurz,
// alle auf SPY-Tage ausgerichtet; Luecke = null) + theme_constituents.json.
// Schwellen/Gewichte ausschliesslich aus config.js.
//
// Grundregel: Fehlt ein Wert im benoetigten Fenster, ist das Ergebnis null
// ("n/a" in der UI). Es wird nie interpoliert oder ueber Luecken gerechnet.

import { LEADERS } from "./config.js";

const isNum = (x) => typeof x === "number" && Number.isFinite(x);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Werte [from, to) oder null, sobald einer fehlt / das Fenster nicht passt. */
function windowOf(arr, from, to) {
  if (!arr || from < 0 || to > arr.length || from >= to) return null;
  const out = arr.slice(from, to);
  return out.every(isNum) ? out : null;
}

/** Performance in % von Index i-back bis i. */
export function retOver(c, back, i = c.length - 1) {
  const a = c?.[i - back], b = c?.[i];
  return i - back >= 0 && isNum(a) && isNum(b) && a > 0 ? (b / a - 1) * 100 : null;
}

export function smaLast(c, n) {
  const w = windowOf(c, c.length - n, c.length);
  return w ? mean(w) : null;
}

/** 52W-Hoch am Tag i (inklusive i). */
export function high52(h, i = h.length - 1, bars = LEADERS.HIGH_52W_BARS) {
  const w = windowOf(h, i - bars + 1, i + 1);
  return w ? Math.max(...w) : null;
}

/** Neues 52W-Hoch am Tag i: High liegt ueber dem Maximum der 251 Vortage. */
export function isNewHigh(h, i, bars = LEADERS.HIGH_52W_BARS) {
  const prior = windowOf(h, i - bars + 1, i);
  return prior && isNum(h[i]) ? h[i] > Math.max(...prior) : null;
}

/** Gleichgewichteter Basket als Index (Start 100) aus Tagesrenditen.
 *  An einem Tag zaehlen nur Mitglieder mit Kurs an beiden Tagen; hat kein
 *  Mitglied Daten, bricht die Reihe ab (null) statt fortgeschrieben zu werden. */
export function basketIndex(series) {
  const n = series[0]?.length ?? 0;
  const idx = new Array(n).fill(null);
  if (!n) return idx;
  idx[0] = 100;
  for (let i = 1; i < n; i++) {
    const rets = [];
    for (const c of series) {
      if (isNum(c[i - 1]) && isNum(c[i]) && c[i - 1] > 0) rets.push(c[i] / c[i - 1] - 1);
    }
    idx[i] = rets.length && isNum(idx[i - 1]) ? idx[i - 1] * (1 + mean(rets)) : null;
  }
  return idx;
}

/** Tiefpunkt des juengsten Drawdowns >= ddPct im Basket.
 *  Episode beginnt, sobald der Index ddPct unter dem laufenden Hoch liegt, und
 *  endet mit einem neuen Hoch. Liefert {index, drawdown} oder null. */
export function lastBasketLow(idx, ddPct = LEADERS.BASKET_DRAWDOWN_PCT) {
  let peak = null, inEp = false, cur = null, last = null;
  for (let i = 0; i < idx.length; i++) {
    const v = idx[i];
    if (!isNum(v)) { peak = null; inEp = false; cur = null; continue; }
    if (peak === null || v > peak) {
      if (inEp) last = cur;
      peak = v; inEp = false; cur = null;
      continue;
    }
    const dd = (v / peak - 1) * 100;
    if (dd <= -ddPct) {
      inEp = true;
      if (!cur || v < idx[cur.index]) cur = { index: i, drawdown: dd };
    }
  }
  return inEp ? cur : last;
}

/** Mittlere True Range der letzten n Tage in % vom letzten Close.
 *  h/l/c muessen am Ende ausgerichtet sein (gleicher letzter Tag). */
export function atrPct(h, l, c, n) {
  if (!h || !l || !c || l.length < n || c.length < n + 1) return null;
  const off = c.length - l.length;   // l ist kurz, c lang
  const trs = [];
  for (let k = l.length - n; k < l.length; k++) {
    const i = k + off;
    const hi = h[i], lo = l[k], pc = c[i - 1];
    if (![hi, lo, pc].every(isNum)) return null;
    trs.push(Math.max(hi - lo, Math.abs(hi - pc), Math.abs(lo - pc)));
  }
  const last = c[c.length - 1];
  return isNum(last) && last > 0 ? (mean(trs) / last) * 100 : null;
}

/** ADR% = Ø (High − Low) / Close ueber n Tage (wie setups.py). */
export function adrPct(h, l, c, n = LEADERS.ADR_BARS) {
  if (!l || l.length < n) return null;
  const off = c.length - l.length;
  const xs = [];
  for (let k = l.length - n; k < l.length; k++) {
    const i = k + off;
    if (![h[i], l[k], c[i]].every(isNum) || c[i] <= 0) return null;
    xs.push(((h[i] - l[k]) / c[i]) * 100);
  }
  return mean(xs);
}

export function rvol(v, n = LEADERS.RVOL_BARS) {
  const prior = windowOf(v, v.length - 1 - n, v.length - 1);
  const today = v[v.length - 1];
  if (!prior || !isNum(today)) return null;
  const avg = mean(prior);
  return avg > 0 ? today / avg : null;
}

export function dollarVol(c, v, n = LEADERS.DOLLAR_VOL_BARS) {
  const cw = windowOf(c, c.length - n, c.length);
  const vw = windowOf(v, v.length - n, v.length);
  if (!cw || !vw) return null;
  return mean(cw.map((x, k) => x * vw[k]));
}

/** IBD-artiger gewichteter RS-Score (Summe w·ROC). null, wenn ein Fenster fehlt. */
export function weightedRs(c, weights = LEADERS.RS_WEIGHTS) {
  let s = 0;
  for (const { bars, w } of weights) {
    const r = retOver(c, bars);
    if (r === null) return null;
    s += w * r;
  }
  return s;
}

/** Ø Relativperformance (Aktie − SPY, %-Punkte) an Tagen mit SPY < Schwelle. */
export function downDayStrength(c, spy, lookback = LEADERS.DOWN_DAY_LOOKBACK,
                                thr = LEADERS.DOWN_DAY_SPY_PCT) {
  const n = c.length, diffs = [];
  let days = 0;
  for (let i = n - lookback; i < n; i++) {
    if (i < 1) continue;
    const sr = retOver(spy, 1, i);
    if (sr === null || sr >= thr) continue;
    days++;
    const r = retOver(c, 1, i);
    if (r !== null) diffs.push(r - sr);
  }
  return { value: diffs.length ? mean(diffs) : null, days, used: diffs.length };
}

/** Rangveraenderung ueber `lookback` settled Snapshot-Tage.
 *  days: [{date, settled, gap, ranks:{name:rank}}] aufsteigend.
 *  Positiv = Theme ist im Rang gestiegen. null bei zu kurzer Historie oder
 *  einem Datenloch (gap) im Zeitraum — kein Zaehlen ueber Luecken. */
export function rankChange(days, name, lookback = LEADERS.RANK_CHANGE_DAYS) {
  const s = (days || []).filter((d) => d.settled);
  if (s.length < lookback + 1) return null;
  const last = s[s.length - 1], ref = s[s.length - 1 - lookback];
  for (let k = s.length - lookback; k < s.length; k++) if (s[k].gap === true) return null;
  const a = ref.ranks?.[name], b = last.ranks?.[name];
  return isNum(a) && isNum(b) ? a - b : null;
}

// ── Leader-Watchlist (Performer Study) ────────────────────────────────────

/** Sortierte IBD-Scores des RS-Universums (aufsteigend) oder null.
 *  Universum = die n liquidesten Zeilen (Ø $-Vol 50T) aus bars.rs_universe,
 *  Score mit denselben RS_WEIGHTS wie weightedRs(). */
export function rsUniverse(bars, n = LEADERS.RS_UNIVERSE_N, weights = LEADERS.RS_WEIGHTS) {
  const u = bars?.rs_universe;
  if (!u?.rows) return null;
  const idx = weights.map(({ bars: b }) => u.fields.indexOf(`roc${b}`));
  const dIdx = u.fields.findIndex((f) => f.startsWith("dvol"));
  if (idx.some((k) => k < 0) || dIdx < 0) return null;
  const rows = Object.values(u.rows).filter((r) => isNum(r[dIdx]))
    .sort((a, b) => b[dIdx] - a[dIdx]).slice(0, n);
  const scores = rows.map((r) => weights.reduce((s, { w }, k) => s + w * r[idx[k]], 0));
  return scores.length ? Float64Array.from(scores).sort() : null;
}

/** RS-Rating 1–99: Anteil des Universums mit Score <= score. */
export function rsRating(score, sorted) {
  if (!isNum(score) || !sorted?.length) return null;
  let lo = 0, hi = sorted.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] <= score) lo = m + 1; else hi = m; }
  return Math.min(99, Math.max(1, Math.round((100 * lo) / sorted.length)));
}

/** Ø Volumen der n Tage VOR Index k (kurzes Array); null bei Luecke. */
function volBase(v, k, n) {
  const w = windowOf(v, k - n, k);
  return w ? mean(w) : null;
}

/** Stufe-2-Kennzahlen am letzten Tag + EP-Suche im Fenster.
 *  c/h lang, o/l/v kurz - alle am Ende ausgerichtet. */
export function triggerMetrics(t, dates, cfg = LEADERS) {
  const T = cfg.TRIGGER, E = cfg.EP;
  const c = t.c, h = t.h, o = t.o, v = t.v;
  const out = { rvol_50d: null, gap_pct: null, breakout_20d: null, trigger: null,
                weak_volume: null, ep: null, ep_date: null, dollar_vol_50d: null, rmv: null };
  if (!o || !v || !c) return out;
  const off = c.length - v.length;
  const k = v.length - 1, i = k + off;
  const gapAt = (kk) => {
    const ii = kk + off;
    return isNum(o[kk]) && isNum(c[ii - 1]) && c[ii - 1] > 0 ? (o[kk] / c[ii - 1] - 1) * 100 : null;
  };
  const base = volBase(v, k, T.VOL_BASE_BARS);
  out.rvol_50d = base && isNum(v[k]) ? v[k] / base : null;
  out.gap_pct = gapAt(k);
  const piv = windowOf(h, i - T.PIVOT_BARS, i);
  out.breakout_20d = piv && isNum(c[i]) ? c[i] > Math.max(...piv) : null;
  if (out.breakout_20d === null || (out.rvol_50d === null && out.gap_pct === null)) {
    out.trigger = null;
  } else {
    out.trigger = out.breakout_20d
      && ((out.rvol_50d ?? 0) >= T.RVOL_MIN || (out.gap_pct ?? -Infinity) >= T.GAP_MIN_PCT);
  }
  out.weak_volume = out.trigger === true && out.rvol_50d !== null ? out.rvol_50d < T.WEAK_VOL_MAX : null;

  // EP: Gap >= GAP_MIN_PCT bei Volumen >= VOL_MULT x Ø 50 Vortage, juengster Treffer zaehlt
  let epKnown = false;
  for (let kk = k; kk > k - E.WINDOW; kk--) {
    const g = gapAt(kk), b = volBase(v, kk, T.VOL_BASE_BARS);
    if (g === null || b === null || !isNum(v[kk])) continue;
    epKnown = true;
    if (g >= E.GAP_MIN_PCT && v[kk] >= E.VOL_MULT * b) { out.ep = true; out.ep_date = dates?.[kk + off] ?? null; break; }
  }
  if (out.ep === null && epKnown) out.ep = false;

  const cw = windowOf(c, c.length - T.VOL_BASE_BARS, c.length);
  const vw = windowOf(v, v.length - T.VOL_BASE_BARS, v.length);
  out.dollar_vol_50d = cw && vw ? mean(cw.map((x, j) => x * vw[j])) : null;
  const a5 = atrPct(h, t.l, c, cfg.RMV.SHORT), a50 = atrPct(h, t.l, c, cfg.RMV.LONG);
  out.rmv = isNum(a5) && isNum(a50) && a50 > 0 ? a5 / a50 : null;
  return out;
}

/** Stufe-1-Kriterien. Liefert die Schluessel der NICHT erfuellten Kriterien;
 *  ein fehlender Wert gilt als nicht erfuellt (er kann nichts belegen). */
export function watchlistFails(r, wl = LEADERS.WL) {
  const f = [];
  if (!(r.rs_rating >= wl.RS_MIN)) f.push("rs_rating");
  if (!(r.p6m > wl.P6M_MIN)) f.push("p6m");
  if (!(r.dist_52wh_pct >= -wl.DIST_MAX_PCT)) f.push("wl_dist");
  if (wl.ABOVE_SMA50 && r.above_sma50 !== true) f.push("sma50");
  if (wl.ABOVE_SMA200 && r.above_sma200 !== true) f.push("sma200");
  if (!(r.close >= wl.MIN_PRICE)) f.push("min_price");
  if (!(r.dollar_vol_50d >= wl.MIN_DVOL50)) f.push("dollar_vol_50d");
  return f;
}

/** Alle Ticker-Metriken eines Konstituenten. */
export function tickerMetrics(t, spy, basket, atrBars, dates = null) {
  const c = t.c, h = t.h, i = c.length - 1;
  const hi = high52(h);
  const last = c[i];
  const dist = isNum(hi) && isNum(last) ? (last / hi - 1) * 100 : null;
  const adr = adrPct(h, t.l, c);
  const rTheme = retOver(c, LEADERS.RS_THEME_BARS);
  const rBasket = retOver(basket, LEADERS.RS_THEME_BARS);
  const wsStock = weightedRs(c), wsSpy = weightedRs(spy);
  const sma = smaLast(c, LEADERS.SMA_BREADTH);
  const sma200 = smaLast(c, 200);
  const dd = downDayStrength(c, spy);
  let newHigh5 = null;
  for (let k = i - LEADERS.NEW_HIGH_DAYS + 1; k <= i; k++) {
    const nh = isNewHigh(h, k);
    if (nh === null) { newHigh5 = null; break; }
    newHigh5 = newHigh5 || nh;
  }
  return {
    close: isNum(last) ? last : null,
    rs_vs_theme: rTheme !== null && rBasket !== null ? rTheme - rBasket : null,
    rs_vs_spy: wsStock !== null && wsSpy !== null ? wsStock - wsSpy : null,
    dist_52wh_pct: dist,
    dist_52wh_adr: dist !== null && isNum(adr) && adr > 0 ? dist / adr : null,
    down_day_strength: dd.value,
    down_days: dd.days,
    rvol_20d: rvol(t.v),
    adr_pct: adr,
    atr_pct: atrPct(h, t.l, c, atrBars),
    dollar_vol_20d: dollarVol(c.slice(-t.v.length), t.v),
    above_sma50: sma !== null && isNum(last) ? last > sma : null,
    near_high: dist !== null ? dist >= -LEADERS.NEAR_HIGH_PCT : null,
    new_high_5d: newHigh5,
    rs_score: wsStock,
    p6m: retOver(c, LEADERS.WL.P6M_BARS),
    above_sma200: sma200 !== null && isNum(last) ? last > sma200 : null,
    ...triggerMetrics(t, dates),
  };
}

/** first_to_high fuer ein Theme. Liefert {low, perTicker:{sym:{is_first,date}}}.
 *  low = null -> kein Basket-Tief >= Schwelle im Fenster; dann sind alle
 *  Ticker n/a. Liegt das Tief so frueh, dass ein 52W-Hoch direkt danach nicht
 *  bestimmbar waere (zu wenig Vorlauf), ebenfalls n/a statt falscher Antwort. */
export function firstToHigh(members, basket, dates) {
  const low = lastBasketLow(basket);
  const per = {};
  if (!low) return { low: null, reason: "no_drawdown", perTicker: per };
  const firstComputable = LEADERS.HIGH_52W_BARS - 1;
  if (low.index + 1 < firstComputable) {
    return { low: { date: dates[low.index], drawdown: low.drawdown }, reason: "low_too_old", perTicker: per };
  }
  let best = Infinity;
  for (const m of members) {
    let hit = null;
    for (let i = low.index + 1; i < m.h.length; i++) {
      const nh = isNewHigh(m.h, i);
      if (nh === true) { hit = i; break; }
    }
    per[m.sym] = { idx: hit };
    if (hit !== null && hit < best) best = hit;
  }
  for (const sym of Object.keys(per)) {
    const hit = per[sym].idx;
    per[sym] = { is_first: hit !== null && hit === best, date: hit !== null ? dates[hit] : null };
  }
  return { low: { date: dates[low.index], drawdown: low.drawdown }, reason: null, perTicker: per };
}

// Felder einer Zeile ohne Kursdaten: alles explizit null (n/a), nie weggelassen.
const EMPTY_ROW = {
  close: null, rs_vs_theme: null, rs_vs_spy: null, dist_52wh_pct: null, dist_52wh_adr: null,
  down_day_strength: null, down_days: null, rvol_20d: null, adr_pct: null, atr_pct: null,
  dollar_vol_20d: null, above_sma50: null, near_high: null, new_high_5d: null,
  rs_score: null, p6m: null, above_sma200: null, rvol_50d: null, gap_pct: null,
  breakout_20d: null, trigger: null, weak_volume: null, ep: null, ep_date: null,
  dollar_vol_50d: null, rmv: null, rs_rating: null,
};

const sortDesc = (a, b) => (b ?? -Infinity) - (a ?? -Infinity);

/** Kompletter Rechenlauf ueber alle Themes.
 *  @param bars        leaders_bars.json
 *  @param constituents theme_constituents.json
 *  @param themeRows   etf_data.json themes ({name:{rank, score, …}})
 *  @param snapDays    Snapshot-Tage mit ranks (fuer rank_change_4w)
 *  @param opts        {atrPeriod}
 */
export function computeLeaders(bars, constituents, themeRows, snapDays, opts = {}) {
  const atrBars = LEADERS.ATR_PERIODS[opts.atrPeriod ?? LEADERS.ATR_PERIOD];
  const spy = bars.bench.c;
  const uni = rsUniverse(bars);
  const out = {};
  for (const [name, row] of Object.entries(themeRows || {})) {
    const cons = constituents.themes?.[name];
    if (!cons) continue;
    const members = cons.tickers.map((tv) => {
      const sym = tv.includes(":") ? tv.split(":")[1].replace(".", "-") : tv.replace(".", "-");
      const b = bars.tickers[sym];
      return { tv, sym, b };
    });
    const withData = members.filter((m) => m.b);
    const basket = basketIndex(withData.map((m) => m.b.c));

    const fth = firstToHigh(withData.map((m) => ({ sym: m.sym, h: m.b.h })), basket, bars.dates);

    const rows = members.map((m) => {
      const base = { ticker: m.tv, has_data: !!m.b };
      if (!m.b) {
        return { ...base, ...EMPTY_ROW, first_to_high: null, first_high_date: null,
          qualified: false, wl_fails: ["no_data"] };
      }
      const mt = tickerMetrics(m.b, spy, basket, atrBars, bars.dates);
      mt.rs_rating = rsRating(mt.rs_score, uni);
      const fails = watchlistFails(mt);
      const f = fth.low && !fth.reason ? fth.perTicker[m.sym] : null;
      return { ...base, ...mt,
        first_to_high: f ? f.is_first : null,
        first_high_date: f ? f.date : null,
        qualified: fails.length === 0, wl_fails: fails };
    });

    const frac = (key) => {
      const v = rows.filter((r) => r[key] === true || r[key] === false);
      return v.length ? (v.filter((r) => r[key]).length / v.length) * 100 : null;
    };
    const nhValid = rows.filter((r) => r.new_high_5d === true || r.new_high_5d === false);
    const breadth = {
      pct_above_50ma: frac("above_sma50"),
      pct_near_high: frac("near_high"),
      new_highs_5d: nhValid.length ? nhValid.filter((r) => r.new_high_5d).length : null,
      rank_change_4w: rankChange(snapDays, name),
      members: members.length,
      members_with_data: withData.length,
    };
    const bKeys = LEADERS.BREADTH_SORT_KEYS.map((k) => breadth[k]);
    breadth.sort_value = bKeys.every(isNum) ? mean(bKeys) : null;

    // Reihenfolge (und damit der Leader) laut config.js LEADER_SORT:
    // "rs_rating" = wie die Performer Study (RS absteigend), "rs_vs_theme" =
    // 3M relativ zum Theme-Basket (urspruengliche Brief-Vorgabe).
    rows.sort(LEADERS.LEADER_SORT === "rs_vs_theme"
      ? (a, b) => sortDesc(a.rs_vs_theme, b.rs_vs_theme) || sortDesc(a.rs_vs_spy, b.rs_vs_spy)
      : (a, b) => sortDesc(a.rs_rating, b.rs_rating) || sortDesc(a.rs_score, b.rs_score)
        || sortDesc(a.rs_vs_theme, b.rs_vs_theme));
    for (const r of rows) {
      r.laggard = isNum(r.rs_vs_theme) && isNum(r.dist_52wh_adr)
        && r.rs_vs_theme < LEADERS.LAGGARD_RS_THEME_MAX && r.dist_52wh_adr <= LEADERS.LAGGARD_DIST_ADR;
    }

    out[name] = {
      name, rank: row.rank ?? null, score: row.score ?? null,
      qualified_count: rows.filter((r) => r.qualified).length,
      source: cons.source, thin: !!cons.thin,
      breadth, basket_low: fth.low, fth_reason: fth.reason,
      basket_3m: retOver(basket, LEADERS.RS_THEME_BARS),
      rows,
    };
  }
  return out;
}

/** UI-/Export-Filter: Liquiditaet + ATR. Fehlender Wert faellt bei aktivem
 *  Filter heraus (er kann die Schwelle nicht belegen), Rang wird neu vergeben.
 *  Leader = der hoechstplatzierte Ticker, der die Watchlist-Kriterien erfuellt -
 *  erfuellt sie keiner, hat das Theme keinen Leader (ehrliche Aussage). */
export function filterRows(rows, { minDollarVol = 0, minAtrPct = 0 } = {}) {
  const kept = rows.filter((r) =>
    (minDollarVol <= 0 || (isNum(r.dollar_vol_20d) && r.dollar_vol_20d >= minDollarVol)) &&
    (minAtrPct <= 0 || (isNum(r.atr_pct) && r.atr_pct >= minAtrPct)));
  const lead = kept.findIndex((r) => r.qualified);
  return kept.map((r, k) => ({ ...r, rank: k + 1, leader: k === lead }));
}

/** Leader-Watchlist: jeder qualifizierte Ticker genau einmal, mit allen
 *  Themes, in denen Finviz ihn fuehrt (Rang aufsteigend), sortiert nach
 *  RS-Rating (Studie: "Sortierung: RS absteigend"). Themes sind Kontext,
 *  kein Filter (Studie: Gruppen-Rang als Filter fragil). */
export function buildWatchlist(result, { minDollarVol = 0, minAtrPct = 0 } = {}) {
  const per = new Map();
  for (const t of Object.values(result)) {
    const leaderTk = filterRows(t.rows, { minDollarVol, minAtrPct }).find((r) => r.leader)?.ticker;
    for (const r of t.rows) {
      if (!r.qualified) continue;
      if (minDollarVol > 0 && !(r.dollar_vol_20d >= minDollarVol)) continue;
      if (minAtrPct > 0 && !(r.atr_pct >= minAtrPct)) continue;
      const e = per.get(r.ticker) ?? { ...r, themes: [] };
      e.themes.push({ name: t.name, rank: t.rank, leader: r.ticker === leaderTk });
      per.set(r.ticker, e);
    }
  }
  const list = [...per.values()];
  for (const e of list) {
    e.themes.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
    e.best_theme_rank = e.themes[0]?.rank ?? null;
    e.strong = e.rs_rating >= LEADERS.WL.RS_STRONG;
  }
  return list.sort((a, b) => sortDesc(a.rs_rating, b.rs_rating) || sortDesc(a.rs_score, b.rs_score));
}

/** Themes in Anzeigereihenfolge: "score" = Theme-Rang, "breadth" = Breadth-Mittel. */
export function orderThemes(result, sortBy = "score") {
  const list = Object.values(result);
  if (sortBy === "breadth") {
    return list.sort((a, b) => sortDesc(a.breadth.sort_value, b.breadth.sort_value) || (a.rank ?? 99) - (b.rank ?? 99));
  }
  return list.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
}

/** TradingView aus der Leader-Watchlist: jeder Ticker genau EINMAL.
 *  Erst "###In Play" (Trigger heute), dann je Ticker sein staerkstes Theme
 *  als Sektion; Sektionen nach Theme-Rang, Ticker nach RS-Rating. */
export function tradingViewFromWatchlist(entries, inPlayLabel = "In Play") {
  const clean = (s) => String(s).replace(/,/g, " ");
  const lines = [];
  const inPlay = entries.filter((e) => e.trigger === true);
  if (inPlay.length) {
    lines.push(`###${clean(inPlayLabel)}`);
    for (const e of inPlay) lines.push(e.ticker);
  }
  const groups = new Map();
  for (const e of entries) {
    if (e.trigger === true) continue;
    const top = e.themes[0];
    if (!top) continue;
    if (!groups.has(top.name)) groups.set(top.name, { rank: top.rank, items: [] });
    groups.get(top.name).items.push(e.ticker);
  }
  for (const [name, g] of [...groups.entries()].sort((a, b) => (a[1].rank ?? 99) - (b[1].rank ?? 99))) {
    lines.push(`###${clean(name)}`);
    lines.push(...g.items);
  }
  return lines.join("\n") + "\n";
}

/** TradingView-Watchlist: ###Theme-Sektionen (ohne Kommas), EXCHANGE:SYMBOL
 *  je Zeile; Sektionen nach Theme-Staerke, Ticker in Ranking-Reihenfolge. */
export function tradingViewWatchlist(themes) {
  const lines = [];
  for (const t of [...themes].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))) {
    if (!t.rows.length) continue;
    lines.push(`###${String(t.name).replace(/,/g, " ")}`);
    for (const r of t.rows) lines.push(r.ticker);
  }
  return lines.join("\n") + "\n";
}
