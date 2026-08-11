// Regenerates the PingClose task dashboard from projects/pingclose/TASKS.md.
// Run: node projects/pingclose/scripts/build-task-dashboard.mjs
// Output: projects/pingclose/task-dashboard.html (gitignored, regenerable —
// re-run this script any time to get a fresh one from the current task list).
//
// Fully self-contained on purpose: earlier versions of this dashboard were
// built as one-off chat artifacts living in a session's temp scratchpad
// folder, which meant the file (and the template it was built from)
// disappeared the moment that session ended. This script has zero
// dependency on anything outside this repo.
//
// Layout (rebuilt 2026-08-11, previous flex-wrap version discarded):
// a real 3-column grid per row — [72px: number stacked over status]
// [flexible: title, wraps] [150px fixed: tag, wraps] — collapsing to a
// single stacked column below 640px so nothing ever gets cramped.
// Type sizes match the project's real current tokens (lib/designTokens.ts:
// label 18 / body 19 / heading 24), not an inherited stale 16px.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASKS_PATH = path.resolve(__dirname, '..', 'TASKS.md');
const OUT_PATH = path.resolve(__dirname, '..', 'task-dashboard.html');

const src = fs.readFileSync(TASKS_PATH, 'utf8');
const lines = src.split('\n');

const startIdx = lines.findIndex(l => /^#0001 —/.test(l));
const endIdx = lines.findIndex(l => /^## SECTION A/.test(l));
const body = lines.slice(startIdx, endIdx);

const STATUS = { '🟩': 'done', '❌': 'open', '🥫': 'deferred' };
const STATUS_LABEL = { '🟩': 'Done', '❌': 'Open', '🥫': 'Deferred' };

const items = [];
let current = null;
for (const line of body) {
  const m = line.match(/^#(\d{4}) — (🟩|❌|🥫) (.*)$/);
  if (m) {
    if (current) items.push(current);
    current = { num: m[1], statusIcon: m[2], headerRest: m[3], extraLines: [] };
  } else if (current && line.trim() !== '') {
    current.extraLines.push(line);
  }
}
if (current) items.push(current);

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function mdInline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}
function parseHeader(headerRest) {
  // Titles often contain their own internal " — " as a sub-clause (e.g.
  // "citywideheatingair.com — dead lead-capture form... (PC-FIX-1) —
  // start: 2026-08-11") — splitting on the *first* em-dash cuts the title
  // short and swallows the real tag into the detail text. Every entry
  // reliably contains " — start:" exactly once, so anchor on that.
  const anchor = ' — start:';
  const idx = headerRest.indexOf(anchor);
  let title = idx === -1 ? headerRest : headerRest.slice(0, idx);
  let detail = idx === -1 ? '' : headerRest.slice(idx + 3); // keep "start:..." in detail
  let tag = '';
  const tagMatch = title.match(/\(([A-Za-z][\w-]*)\)\s*$/);
  if (tagMatch) tag = tagMatch[1];
  return { title: title.trim(), detail: detail.trim(), tag };
}
// Reads the real tag prefix, not scattered text in the title — a title
// like "...via edge proxy (PC-FIX-3)" contains the word "edge" but is not
// Edge Agent work; only the tag itself is authoritative. Falls back to a
// title scan only when there's no tag at all.
function categorize(tag, title) {
  const t = tag.toLowerCase();
  if (t.startsWith('pc-edge')) return 'Edge Agent';
  if (t.startsWith('pc-gbp')) return 'GBP Agent';
  if (t.startsWith('pc-fix')) return 'Client-Fix Agent';
  if (t.startsWith('pc-sec')) return 'Security';
  if (t.startsWith('pc-perf')) return 'Performance';
  if (t.startsWith('pc-cq')) return 'Code Quality';
  if (t.startsWith('pc-e')) return 'Phone';
  if (t.startsWith('pc-future')) return 'Future';
  if (t) return 'General';
  const tt = title.toLowerCase();
  if (tt.includes('edge agent')) return 'Edge Agent';
  if (tt.includes('gbp agent') || tt.includes('gbp superagent')) return 'GBP Agent';
  if (tt.includes('client-fix agent')) return 'Client-Fix Agent';
  return '';
}

function renderItem(it) {
  const { title, detail, tag } = parseHeader(it.headerRest);
  const status = STATUS[it.statusIcon];
  const statusLabel = STATUS_LABEL[it.statusIcon];
  const isReflagged = /\(Previously shown as complete/i.test(detail) || it.extraLines.some(l => /\(Previously shown as complete/i.test(l));
  const category = categorize(tag, title);
  const searchBlob = esc((title + ' ' + tag + ' ' + detail + ' ' + it.extraLines.join(' ')).toLowerCase());

  let flagNote = '';
  let mainDetail = detail;
  const flagMatch = detail.match(/(\*\*\(Previously shown as complete[^)]*\)\*\*)/i);
  if (flagMatch) flagNote = `<p class="flagnote"><strong>${mdInline(flagMatch[1].replace(/\*\*/g, ''))}</strong></p>`;

  const extraParas = it.extraLines.map(l => {
    if (/^Files:/.test(l)) return `<p class="files"><span class="files-label">Files</span> ${mdInline(l.replace(/^Files:\s*/, ''))}</p>`;
    return `<p class="detail">${mdInline(l)}</p>`;
  }).join('\n      ');

  return `  <details class="row" data-search="${searchBlob}">
    <summary>
      <div class="meta">
        <span class="num">#${it.num}</span>
        <span class="pill pill-${status}">${statusLabel}</span>
        ${isReflagged ? '<span class="pill pill-flag">Re-flagged</span>' : ''}
      </div>
      <span class="title">${mdInline(title)}</span>
      <span class="tag-cell">${category ? `<span class="tag" title="${esc(tag || category)}">${esc(category)}</span>` : ''}</span>
    </summary>
    <div class="body">
      ${flagNote}
      <p class="detail">${mdInline(mainDetail)}</p>
      ${extraParas}
    </div>
  </details>`;
}

const done = items.filter(i => i.statusIcon === '🟩');
const open = items.filter(i => i.statusIcon === '❌');
const deferred = items.filter(i => i.statusIcon === '🥫');
const doneHtml = done.map(renderItem).join('\n');
const openHtml = open.map(renderItem).join('\n');
const deferredHtml = deferred.map(renderItem).join('\n');
const today = new Date().toISOString().slice(0, 10);

const html = `<!doctype html>
<title>PingClose — Task Brain</title>
<style>
:root {
  --void: #0A1330; --surface: #132A54; --surface-inset: #0F2040; --border: #FFFFFF;
  --text-primary: #F1F5F9; --text-secondary: #CBD5E1; --text-tertiary: #8DA0C4;
  --accent: #10D9A0; --done: #10D9A0; --done-bg: rgba(16,217,160,0.16);
  --open: #F87171; --open-bg: rgba(248,113,113,0.16);
  --deferred: #FBBF24; --deferred-bg: rgba(251,191,36,0.16);
  --flag-bg: rgba(251,146,60,0.18); --flag: #FDBA74;
}
:root[data-theme="light"] {
  --void: #F4F6FB; --surface: #FFFFFF; --surface-inset: #EBF0FA; --border: #10162B;
  --text-primary: #10162B; --text-secondary: #3C4A66; --text-tertiary: #6B7A99;
  --accent: #0B9E7A; --done: #0B9E7A; --done-bg: rgba(11,158,122,0.12);
  --open: #DC2626; --open-bg: rgba(220,38,38,0.10);
  --deferred: #B45309; --deferred-bg: rgba(180,83,9,0.12);
  --flag-bg: rgba(234,88,12,0.12); --flag: #C2410C;
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --void: #F4F6FB; --surface: #FFFFFF; --surface-inset: #EBF0FA; --border: #10162B;
    --text-primary: #10162B; --text-secondary: #3C4A66; --text-tertiary: #6B7A99;
    --accent: #0B9E7A; --done: #0B9E7A; --done-bg: rgba(11,158,122,0.12);
    --open: #DC2626; --open-bg: rgba(220,38,38,0.10);
    --deferred: #B45309; --deferred-bg: rgba(180,83,9,0.12);
    --flag-bg: rgba(234,88,12,0.12); --flag: #C2410C;
  }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--void); color: var(--text-primary); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.5; }
.wrap { max-width: 1000px; margin: 0 auto; padding: 28px 20px 80px; }
header { margin-bottom: 20px; }
h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 4px; }
.sub { color: var(--text-secondary); font-size: 18px; margin: 0 0 18px; }
.stats { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.stat { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; flex: 1; min-width: 130px; }
.stat .n { font-variant-numeric: tabular-nums; font-size: 24px; font-weight: 700; display: block; }
.stat.done .n { color: var(--done); }
.stat.open .n { color: var(--open); }
.stat .l { color: var(--text-secondary); font-size: 18px; text-transform: uppercase; letter-spacing: 0.05em; }
.search { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); color: var(--text-primary); font-size: 18px; margin-bottom: 22px; }
.search:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
.search::placeholder { color: var(--text-tertiary); }
section { margin-bottom: 28px; }
.section-title { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-secondary); margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
.section-title .count { background: var(--surface-inset); border-radius: 6px; padding: 1px 7px; font-variant-numeric: tabular-nums; }
.list { display: flex; flex-direction: column; gap: 6px; }
.row { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }

/* Real 3-column grid: [meta 72px] [title, flexible, wraps] [tag 150px,
   wraps]. Below 640px collapses to a single stacked column so the tag
   never gets cramped against long titles on a narrow screen. */
.row summary {
  list-style: none; cursor: pointer; padding: 14px 16px;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 150px;
  grid-template-areas: "meta title tag";
  align-items: start; gap: 4px 16px;
}
.row summary::-webkit-details-marker { display: none; }
.row summary:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.row[open] summary { border-bottom: 1px solid var(--border); }

.meta { grid-area: meta; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.num { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-variant-numeric: tabular-nums; color: var(--text-primary); font-size: 18px; }
.pill { font-size: 15px; font-weight: 700; padding: 2px 9px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.03em; white-space: nowrap; }
.pill-done { background: var(--done-bg); color: var(--done); }
.pill-open { background: var(--open-bg); color: var(--open); }
.pill-deferred { background: var(--deferred-bg); color: var(--deferred); }
.pill-flag { background: var(--flag-bg); color: var(--flag); }

.title { grid-area: title; min-width: 0; color: var(--text-primary); font-size: 18px; overflow-wrap: break-word; word-break: break-word; }

.tag-cell { grid-area: tag; min-width: 0; }
.tag { display: inline-block; font-size: 15px; font-weight: 600; color: var(--accent); background: var(--surface-inset); border: 1px solid var(--accent); padding: 3px 10px; border-radius: 6px; white-space: normal; overflow-wrap: break-word; line-height: 1.3; }

.body { padding: 4px 16px 16px 104px; color: var(--text-secondary); font-size: 18px; overflow-wrap: break-word; word-break: break-word; }
.body p { margin: 0 0 8px; }
.body p:last-child { margin-bottom: 0; }
.flagnote { color: var(--flag) !important; }
.detail code { background: var(--surface-inset); padding: 1px 5px; border-radius: 5px; font-size: 0.95em; overflow-wrap: anywhere; }
.files { font-size: 18px; color: var(--text-primary) !important; overflow-wrap: break-word; word-break: break-word; }
.files-label { text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-right: 4px; color: var(--text-primary); }
.empty { text-align: center; color: var(--text-tertiary); padding: 30px 0; display: none; }

@media (max-width: 640px) {
  .row summary { grid-template-columns: 1fr; grid-template-areas: "meta" "title" "tag"; }
  .meta { flex-direction: row; align-items: center; }
  .tag-cell { margin-top: 2px; }
  .body { padding: 4px 16px 16px 16px; }
}
</style>
<body>
  <div class="wrap">
    <header>
      <h1>PingClose — Task Brain</h1>
      <p class="sub">Completion-order numbering, locked 2026-08-10. Completed items first (in the order they were actually finished), not-complete items after. Rebuilt ${today} from the current TASKS.md (${items.length} items).</p>
      <div class="stats">
        <div class="stat done"><span class="n">${done.length}</span><span class="l">Completed</span></div>
        <div class="stat open"><span class="n">${open.length}</span><span class="l">Not complete</span></div>
        <div class="stat"><span class="n">${deferred.length}</span><span class="l">Deferred</span></div>
      </div>
    </header>
    <input class="search" type="text" placeholder="Filter by title, tag, or detail…" oninput="filterRows(this.value)">
    <section>
      <p class="section-title">Completed <span class="count">${done.length}</span></p>
      <div class="list">
${doneHtml}</div>
    </section>
    <section>
      <p class="section-title">Not Complete <span class="count">${open.length}</span></p>
      <div class="list">
${openHtml}</div>
    </section>
    <section>
      <p class="section-title">Deferred <span class="count">${deferred.length}</span></p>
      <div class="list">
${deferredHtml}</div>
    </section>
    <p class="empty">No matching tasks.</p>
  </div>
  <script>
    function filterRows(q) {
      q = q.trim().toLowerCase();
      const rows = document.querySelectorAll('.row');
      let visible = 0;
      rows.forEach(r => {
        const match = !q || r.dataset.search.includes(q);
        r.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      document.querySelector('.empty').style.display = visible === 0 ? 'block' : 'none';
    }
  </script>
</body>`;

fs.writeFileSync(OUT_PATH, html, 'utf8');
console.log('Wrote', OUT_PATH, '—', done.length, 'done,', open.length, 'open,', deferred.length, 'deferred, total', items.length);
