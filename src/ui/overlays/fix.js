// Per-rule fix overlay: slides up from the bottom (~1/3 height), shows every
// sentence that triggered the active rule on the left and its AI rewrite on
// the right. The overlay carries a live chip strip so you can switch between
// rules without closing it; previously fetched rewrites stay cached for the
// duration of the open session and clear when the overlay closes.

import { callLLM } from '../../llm/client.js';

const RULE_TITLES = {
  'sc-hl-pass':     'Weak / Passive Sentences',
  'sc-hl-prep':     'Prepositional Nesting',
  'sc-hl-nom':      'Nominalizations',
  'sc-hl-fill':     'Filler / Wind-ups',
  'sc-hl-needless': 'Needless Words',
  'sc-hl-spine':    'Spine Issues',
  'sc-hl-stack':    'Noun Stacks',
  'sc-hl-flow':     'Flow Issues',
};

const CHIP_DEFS = [
  { cls: 'sc-hl-pass',     label: 'Weak',     variant: 'pass' },
  { cls: 'sc-hl-prep',     label: 'Prep',     variant: 'prep' },
  { cls: 'sc-hl-nom',      label: 'Nom',      variant: 'nom' },
  { cls: 'sc-hl-fill',     label: 'Fill',     variant: 'fill' },
  { cls: 'sc-hl-needless', label: 'Needless', variant: 'needless' },
  { cls: 'sc-hl-spine',    label: 'Spine',    variant: 'spine' },
  { cls: 'sc-hl-stack',    label: 'Stack',    variant: 'stack' },
  { cls: 'sc-hl-flow',     label: 'Flow',     variant: 'flow' },
];

let session = null;

export function openFixOverlay(cls, sentences, fullText) {
  const overlay = document.getElementById('sc-fix-overlay');
  if (!overlay) return;

  if (!session) {
    session = { sentences: sentences || [], fullText: fullText || '', cache: new Map() };
  }

  session.activeCls = cls;
  renderChipStrip(cls);
  renderRowsForCls(cls);

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

export function closeFixOverlay() {
  const overlay = document.getElementById('sc-fix-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  session = null;
}

function getCountsByCls(sentences) {
  const counts = new Map();
  sentences.forEach(s => s.stats.forEach(stat => {
    if (stat.count > 0) {
      counts.set(stat.cls, (counts.get(stat.cls) || 0) + stat.count);
    }
  }));
  return counts;
}

function renderChipStrip(activeCls) {
  const chipsEl = document.getElementById('sc-fix-chips');
  if (!chipsEl || !session) return;
  const counts = getCountsByCls(session.sentences);
  chipsEl.innerHTML = '';
  CHIP_DEFS.forEach(def => {
    const c = counts.get(def.cls) || 0;
    if (c === 0) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sc-stat sc-stat--' + def.variant + (def.cls === activeCls ? ' sc-stat--active' : '');
    btn.dataset.cls = def.cls;
    btn.textContent = def.label + ': ' + c;
    chipsEl.appendChild(btn);
  });
}

function renderRowsForCls(cls) {
  const titleEl = document.getElementById('sc-fix-title');
  const listEl = document.getElementById('sc-fix-list');
  if (!titleEl || !listEl || !session) return;

  const matches = session.sentences.filter(s =>
    s.stats.some(stat => stat.cls === cls && stat.count > 0),
  );

  titleEl.textContent = (RULE_TITLES[cls] || 'Sentences') + ' (' + matches.length + ')';
  listEl.innerHTML = '';

  if (matches.length === 0) {
    listEl.innerHTML = '<div class="sc-fix-empty">No sentences with this issue.</div>';
    return;
  }

  let clsCache = session.cache.get(cls);
  if (!clsCache) {
    clsCache = new Map();
    session.cache.set(cls, clsCache);
  }

  matches.forEach((sent) => {
    const key = sent.text;
    let cached = clsCache.get(key);
    if (!cached) {
      cached = { state: 'pending', result: 'Rewriting…' };
      clsCache.set(key, cached);
      kickOffCall(cls, key, sent.text, cached);
    }

    const row = document.createElement('div');
    row.className = 'sc-fix-row';
    row.dataset.cls = cls;
    row.dataset.key = key;
    const orig = document.createElement('div');
    orig.className = 'sc-fix-original';
    orig.textContent = sent.text.trim();
    row.appendChild(orig);
    const rewrite = document.createElement('div');
    paintRewriteCell(rewrite, cached, cls, key);
    row.appendChild(rewrite);
    listEl.appendChild(row);
  });
}

function paintRewriteCell(cell, cached, cls, key) {
  cell.className = 'sc-fix-rewrite ' + stateClass(cached.state);
  cell.textContent = cached.result;
  if (cached.state === 'error') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sc-fix-retry';
    btn.textContent = 'Retry';
    btn.dataset.cls = cls;
    btn.dataset.key = key;
    cell.appendChild(btn);
  }
}

function kickOffCall(cls, key, text, cached) {
  const sessionRef = session;
  callLLM({ type: 'refactor', text, context: session.fullText })
    .then(result => {
      if (session !== sessionRef) return;
      cached.state = 'done';
      cached.result = result;
      updateRowIfVisible(cls, key, cached);
    })
    .catch(err => {
      if (session !== sessionRef) return;
      cached.state = 'error';
      cached.result = 'Error: ' + errMsg(err);
      updateRowIfVisible(cls, key, cached);
    });
}

export function retryFixRow(cls, key) {
  if (!session) return;
  const clsCache = session.cache.get(cls);
  if (!clsCache) return;
  const cached = clsCache.get(key);
  if (!cached) return;
  const sent = session.sentences.find(s => s.text === key);
  if (!sent) return;
  cached.state = 'pending';
  cached.result = 'Rewriting…';
  updateRowIfVisible(cls, key, cached);
  kickOffCall(cls, key, sent.text, cached);
}

function stateClass(state) {
  if (state === 'pending') return 'sc-fix-pending';
  if (state === 'error') return 'sc-fix-error';
  return '';
}

function updateRowIfVisible(cls, key, cached) {
  const listEl = document.getElementById('sc-fix-list');
  if (!listEl) return;
  listEl.querySelectorAll('.sc-fix-row').forEach(row => {
    if (row.dataset.cls === cls && row.dataset.key === key) {
      const cell = row.querySelector('.sc-fix-rewrite');
      if (!cell) return;
      paintRewriteCell(cell, cached, cls, key);
    }
  });
}

function errMsg(e) {
  if (typeof e === 'string') return e;
  if (e && typeof e.message === 'string') return e.message;
  return String(e);
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
