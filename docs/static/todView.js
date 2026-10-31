/**
 * todView.js — Darstellung des Themes-Untertabs "Themes of the day".
 * Rechenkern: todMetrics.js.
 *
 * Datenbasis sind die Snapshot-Shards. Sub-Themes stehen erst seit 31.10.2026
 * in den Snapshots; fehlt der heutige Tag dort noch, wird er aus etf_data.json
 * ergänzt, damit Leading sofort funktioniert. Rising braucht LOOKBACK Tage.
 */
import { buildBoard, TOD } from './todMetrics.js';

const LEVELS = [
  { key: 'subtheme', label: 'Sub-Themes' },
  { key: 'theme', label: 'Themes' },
  { key: 'industry', label: 'Industries' },
];
const KEY_LABEL = { LT: 'LT', MOM: 'MOM', FAST: 'FAST', SF: 'SF' };
const STORE_KEY = 'tod-level';
const SHARD_MONTHS = 4;

let _shardDays = null;  // [{date, rows}] aufsteigend, alle Typen

function shardNames(count) {
  const names = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    names.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    d.setMonth(d.getMonth() - 1, 1);
  }
  return names.reverse();
}

async function loadShards() {
  const bust = `?t=${Date.now()}`;
  const shards = await Promise.all(shardNames(SHARD_MONTHS).map(async (name) => {
    try {
      const res = await fetch(`snapshots/${name}.json${bust}`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  }));
  const days = [];
  for (const shard of shards) {
    if (!shard) continue;
    for (const [date, entry] of Object.entries(shard)) days.push({ date, rows: entry.rows || [] });
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

function daysFor(level, etfData) {
  const days = _shardDays.map((d) => ({ date: d.date, rows: d.rows.filter((r) => r.type === level) }));
  if (level === 'subtheme' && etfData?.subnodes) {
    const liveDate = (etfData.fetched_at || '').slice(0, 10);
    const lastWithSubs = [...days].reverse().find((d) => d.rows.length);
    if (liveDate && (!lastWithSubs || lastWithSubs.date < liveDate)) {
      const rows = Object.entries(etfData.subnodes).map(([key, n]) => ({
        type: 'subtheme', name: key, label: n.label, theme: n.theme,
        members: (n.tickers || []).length, perfs: n.perfs || {},
      }));
      const same = days.find((d) => d.date === liveDate);
      if (same) same.rows = rows; else days.push({ date: liveDate, rows });
    }
  }
  return days;
}

function tickersOf(level, name, ctx) {
  if (level === 'subtheme') return ctx.etfData?.subnodes?.[name]?.tickers || [];
  if (level === 'theme') return ctx.etfData?.themes?.[name]?.tickers || [];
  return ctx.industries?.[name]?.tickers || [];
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function changeHtml(v) {
  if (v == null) return '<span class="tod-chg">–</span>';
  if (v === 0) return '<span class="tod-chg">0</span>';
  return v > 0
    ? `<span class="tod-chg up">▲${v}</span>`
    : `<span class="tod-chg down">▼${-v}</span>`;
}

function badgeHtml(streak, capped) {
  if (!streak) return '';
  if (streak === 1 && !capped) return '<span class="tod-badge new">new today</span>';
  return `<span class="tod-badge">${capped ? '≥ ' : ''}day ${streak}</span>`;
}

function cellsHtml(r, board) {
  const worstKey = TOD.KEYS.reduce((a, k) => (r.ranks[k] > r.ranks[a] ? k : a), TOD.KEYS[0]);
  return TOD.KEYS.map((k) => {
    const strong = r.ranks[k] <= board.cut.lead ? ' strong' : '';
    const outline = k === worstKey ? ' worst' : '';
    return `<div class="tod-cell${strong}${outline}">
      <span class="tod-cell-k">${KEY_LABEL[k]}</span>
      <span class="tod-cell-r">#${r.ranks[k]}</span>
      ${changeHtml(r.change?.[k])}
    </div>`;
  }).join('');
}

// Namen verlinken auf den Finviz-Screener der Gruppe (ctx.groupUrl aus app.js).
function link(url, text, cls = '') {
  return url
    ? `<a class="tod-link ${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`
    : text;
}

function nameHtml(r, level, ctx) {
  const url = (lvl, name) => ctx.groupUrl?.(lvl, name) || '';
  return level === 'subtheme'
    ? `${link(url('theme', r.theme), `${esc(r.theme)}`, 'tod-parent')}<span class="tod-parent"> ·</span> ${link(url('subtheme', r.name), esc(r.label))}`
    : link(url(level, r.name), esc(r.name));
}

function cardHtml(r, board, level, ctx, panel) {
  const tickers = tickersOf(level, r.name, ctx);
  const streak = panel === 'lead' ? badgeHtml(r.leadStreak, r.leadCapped) : badgeHtml(r.riseStreak, r.riseCapped);
  const preview = tickers.slice(0, 6).join(' · ');
  return `<div class="tod-card" title="${esc(tickers.join(', '))}">
    <div class="tod-card-info">
      <div class="tod-name">${nameHtml(r, level, ctx)} ${streak}</div>
      <div class="tod-meta">${r.members ?? tickers.length}${preview ? ` · <span class="tod-tickers">${esc(preview)}</span>` : ''}</div>
    </div>
    <div class="tod-cells">${cellsHtml(r, board)}</div>
  </div>`;
}

function render(container, ctx, level) {
  const board = buildBoard(daysFor(level, ctx.etfData));
  const switcher = LEVELS.map((l) =>
    `<button class="tod-level${l.key === level ? ' active' : ''}" data-level="${l.key}">${l.label}</button>`).join('');

  if (!board) {
    container.innerHTML = `<div class="tod-head"><div class="tod-levels">${switcher}</div></div>
      <p class="tod-empty">Noch keine Daten für diese Ebene.</p>`;
    return board;
  }

  const ref = board.refDate ? ` · vs. ${board.refDate}` : '';
  const panel = (title, rows, kind) => `
    <div class="tod-panel">
      <h3>${title} <span class="tod-count">${rows.length}</span></h3>
      ${rows.length ? rows.map((r) => cardHtml(r, board, level, ctx, kind)).join('')
        : `<p class="tod-empty">—</p>`}
    </div>`;

  container.innerHTML = `
    <div class="tod-head">
      <div><b>Themes of the day</b> <span class="tod-sub">${board.date} · ${board.n}${ref}</span></div>
      <div class="tod-levels">${switcher}</div>
    </div>
    <div class="tod-grid">
      ${panel('Leading on all four', board.leading, 'lead')}
      ${panel('Rising on all four', board.rising, 'rise')}
    </div>
    <details class="tod-all">
      <summary>Alle ${board.n}</summary>
      ${board.rows.map((r) => cardHtml(r, board, level, ctx, r.rising && !r.leading ? 'rise' : 'lead')).join('')}
    </details>`;
  return board;
}

export async function renderTod(container, ctx) {
  if (!_shardDays || ctx.reload) {
    container.innerHTML = '<p class="tod-empty">Snapshots werden geladen…</p>';
    _shardDays = await loadShards();
  }
  let level = 'subtheme';
  try { level = localStorage.getItem(STORE_KEY) || level; } catch { /* privat/blockiert */ }
  if (!LEVELS.some((l) => l.key === level)) level = 'subtheme';

  render(container, ctx, level);
  container.onclick = (e) => {
    const btn = e.target.closest('.tod-level');
    if (!btn) return;
    try { localStorage.setItem(STORE_KEY, btn.dataset.level); } catch { /* egal */ }
    render(container, ctx, btn.dataset.level);
  };
}
