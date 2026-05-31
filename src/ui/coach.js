// Coach drawer — Learn tab (teach before fix).

import { getChipDef } from './chip-defs.js';
import { openFixOverlay } from './overlays/fix.js';
import { closeDrawer } from './drawer.js';

let activeCls = null;
let lastOpenerChip = null;
let keptSession = new Set();

export function isChipKept(cls) {
  return keptSession.has(cls);
}

export function openCoachLearn(cls, chipEl, sentences, fullText) {
  const def = getChipDef(cls);
  if (!def) return;

  if (activeCls === cls && isDrawerOpen()) {
    closeCoach();
    return;
  }

  activeCls = cls;
  lastOpenerChip = chipEl || null;

  const drawer = document.getElementById('sc-drawer');
  if (!drawer) return;

  setCoachTab('learn');
  renderLearnContent(def, cls);
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  drawer.dataset.coachCls = cls;

  drawer._coachContext = { sentences, fullText, cls };
}

export function isDrawerOpen() {
  const drawer = document.getElementById('sc-drawer');
  return drawer?.classList.contains('open');
}

export function closeCoach() {
  const drawer = document.getElementById('sc-drawer');
  if (!drawer) return;
  const chip = lastOpenerChip;
  closeDrawer();
  activeCls = null;
  delete drawer.dataset.coachCls;
  if (chip && chip.focus) chip.focus();
}

export function setCoachTab(tab) {
  document.querySelectorAll('.sc-coach-tab').forEach(btn => {
    const on = btn.dataset.tab === tab;
    btn.classList.toggle('sc-coach-tab--active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('.sc-coach-panel').forEach(panel => {
    panel.hidden = panel.dataset.panel !== tab;
  });
}

function renderLearnContent(def, cls) {
  const el = document.getElementById('sc-coach-learn');
  if (!el) return;
  const c = def.coach;
  el.innerHTML = `
    <h3 class="sc-coach-learn-title">${def.label}</h3>
    <dl class="sc-coach-dl">
      <dt>Detected</dt><dd>${esc(c.detected)}</dd>
      <dt>Why it may matter</dt><dd>${esc(c.why)}</dd>
      <dt>Keep when</dt><dd>${esc(c.keep)}</dd>
      <dt>Rewrite when</dt><dd>${esc(c.rewrite)}</dd>
      <dt>One move to try</dt><dd>${esc(c.move)}</dd>
    </dl>
    <div class="sc-coach-example">
      <div class="sc-coach-example-bad">${esc(c.exampleBefore)}</div>
      <div class="sc-coach-example-arrow">&darr;</div>
      <div class="sc-coach-example-good">${esc(c.exampleAfter)}</div>
    </div>
    <div class="sc-coach-actions">
      <button type="button" class="sc-btn sc-btn-secondary" id="sc-coach-highlight">Highlight in editor</button>
      <button type="button" class="sc-btn sc-btn-secondary" id="sc-coach-fix">Fix sentences</button>
      <button type="button" class="sc-btn sc-btn-secondary" id="sc-coach-keep">Keep for this session</button>
    </div>
  `;

  el.querySelector('#sc-coach-highlight')?.addEventListener('click', () => highlightRule(cls));
  el.querySelector('#sc-coach-fix')?.addEventListener('click', () => {
    const ctx = document.getElementById('sc-drawer')?._coachContext;
    if (ctx) openFixOverlay(ctx.cls, ctx.sentences, ctx.fullText);
  });
  el.querySelector('#sc-coach-keep')?.addEventListener('click', () => {
    keptSession.add(cls);
    if (lastOpenerChip) lastOpenerChip.classList.add('sc-stat--kept');
    closeCoach();
  });
}

function highlightRule(cls) {
  const layer = document.getElementById('sc-highlight-layer');
  if (!layer) return;
  layer.querySelectorAll('mark').forEach(m => m.classList.remove('sc-hl-pulse'));
  layer.querySelectorAll(`mark.${cls}`).forEach(m => {
    m.classList.add('sc-hl-pulse');
    m.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function wireCoachTabs() {
  document.querySelectorAll('.sc-coach-tab').forEach(btn => {
    btn.addEventListener('click', () => setCoachTab(btn.dataset.tab));
  });
}
