// Per-rule fix overlay — manual-first, generate on demand.

import { callLLM } from '../../llm/client.js';
import { analyzeText } from '../../analysis/analyzer.js';
import { getChipDef } from '../chip-defs.js';
import { CHIP_DEFS } from '../chip-defs.js';

const RULE_TITLES = Object.fromEntries(
  CHIP_DEFS.map(d => [d.cls, d.label])
);

let session = null;

function rowCache(cls, key) {
  if (!session) return null;
  let clsCache = session.cache.get(cls);
  if (!clsCache) {
    clsCache = new Map();
    session.cache.set(cls, clsCache);
  }
  let cached = clsCache.get(key);
  if (!cached) {
    cached = { state: 'idle', userText: '', aiText: '', errorMsg: '' };
    clsCache.set(key, cached);
  }
  return cached;
}

function snapshotRowEdits(cls) {
  if (!session) return;
  document.querySelectorAll(`.sc-fix-row[data-cls="${cls}"]`).forEach(row => {
    const key = row.dataset.key;
    const ta = row.querySelector('.sc-fix-rewrite-input');
    const cached = rowCache(cls, key);
    if (!cached || !ta || cached.state === 'pending') return;
    cached.userText = ta.value;
  });
}

export function openFixOverlay(cls, sentences, fullText) {
  const overlay = document.getElementById('sc-fix-overlay');
  if (!overlay) return;

  if (session?.activeCls) snapshotRowEdits(session.activeCls);

  if (!session) {
    session = { sentences: sentences || [], fullText: fullText || '', cache: new Map() };
  } else {
    session.sentences = sentences || session.sentences;
    session.fullText = fullText || session.fullText;
  }

  session.activeCls = cls;
  renderChipStrip(cls);
  renderRowsForCls(cls);

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

export function closeFixOverlay() {
  if (session?.activeCls) snapshotRowEdits(session.activeCls);
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

function rewriteValue(cached) {
  if (cached.state === 'done') return cached.aiText || cached.userText;
  return cached.userText;
}

function renderRowsForCls(cls) {
  const titleEl = document.getElementById('sc-fix-title');
  const listEl = document.getElementById('sc-fix-list');
  const genAll = document.getElementById('sc-fix-generate-all');
  if (!titleEl || !listEl || !session) return;

  const matches = session.sentences.filter(s =>
    s.stats.some(stat => stat.cls === cls && stat.count > 0),
  );

  titleEl.textContent = (RULE_TITLES[cls] || 'Sentences') + ' (' + matches.length + ')';
  listEl.innerHTML = '';

  if (genAll) {
    genAll.hidden = matches.length === 0;
    genAll.onclick = () => {
      if (!confirm(`Generate AI suggestions for ${matches.length} sentence(s)?`)) return;
      matches.forEach(sent => generateRow(cls, sent.text));
    };
  }

  if (matches.length === 0) {
    listEl.innerHTML = '<div class="sc-fix-empty">No sentences with this check.</div>';
    return;
  }

  matches.forEach(sent => {
    const key = sent.text;
    const cached = rowCache(cls, key);

    const row = document.createElement('div');
    row.className = 'sc-fix-row';
    row.dataset.cls = cls;
    row.dataset.key = key;

    const origWrap = document.createElement('div');
    origWrap.className = 'sc-fix-original-wrap';

    const orig = document.createElement('div');
    orig.className = 'sc-fix-original';
    const mini = analyzeText(sent.text);
    orig.innerHTML = mini.html.replace(/<br>\s*$/, '');
    origWrap.appendChild(orig);

    const why = document.createElement('div');
    why.className = 'sc-fix-why';
    const def = getChipDef(cls);
    why.textContent = def?.coach?.detected || 'Flagged by structure check.';
    origWrap.appendChild(why);

    row.appendChild(origWrap);

    const rewriteWrap = document.createElement('div');
    rewriteWrap.className = 'sc-fix-rewrite-wrap';

    const ta = document.createElement('textarea');
    ta.className = 'sc-fix-rewrite-input';
    ta.rows = 3;
    ta.spellcheck = true;
    ta.value = rewriteValue(cached);
    ta.placeholder = cached.state === 'pending' ? 'Generating…' : 'Edit manually or click Generate';
    ta.disabled = cached.state === 'pending';
    ta.addEventListener('input', () => {
      if (cached.state !== 'pending') {
        cached.userText = ta.value;
        cached.state = 'idle';
      }
    });
    rewriteWrap.appendChild(ta);

    const genBtn = document.createElement('button');
    genBtn.type = 'button';
    genBtn.className = 'sc-btn sc-btn-secondary sc-fix-generate';
    genBtn.textContent = cached.state === 'pending' ? 'Generating…' : 'Generate';
    genBtn.disabled = cached.state === 'pending';
    genBtn.addEventListener('click', () => generateRow(cls, key));
    rewriteWrap.appendChild(genBtn);

    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'sc-btn sc-btn-secondary sc-fix-apply';
    applyBtn.textContent = 'Apply to editor';
    applyBtn.addEventListener('click', () => {
      const rewrite = ta.value.trim();
      if (!rewrite) return;
      import('../apply-editor.js').then(m => m.applySentenceReplace(sent.text, rewrite));
    });
    rewriteWrap.appendChild(applyBtn);

    if (cached.state === 'error' && cached.errorMsg) {
      const err = document.createElement('div');
      err.className = 'sc-fix-error-msg';
      err.textContent = cached.errorMsg;
      rewriteWrap.appendChild(err);
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'sc-fix-retry';
      retry.dataset.cls = cls;
      retry.dataset.key = key;
      retry.textContent = 'Retry';
      retry.addEventListener('click', () => generateRow(cls, key));
      rewriteWrap.appendChild(retry);
    }

    row.appendChild(rewriteWrap);
    listEl.appendChild(row);
  });
}

function generateRow(cls, key) {
  if (!session) return;
  snapshotRowEdits(cls);
  const cached = rowCache(cls, key);
  const sent = session.sentences.find(s => s.text === key);
  if (!cached || !sent) return;

  cached.state = 'pending';
  cached.errorMsg = '';
  renderRowsForCls(cls);

  const sessionRef = session;
  callLLM({ type: 'refactor', text: sent.text, context: session.fullText })
    .then(result => {
      if (session !== sessionRef) return;
      cached.state = 'done';
      cached.aiText = result;
      cached.errorMsg = '';
      renderRowsForCls(cls);
    })
    .catch(err => {
      if (session !== sessionRef) return;
      cached.state = 'error';
      cached.errorMsg = 'Error: ' + errMsg(err);
      renderRowsForCls(cls);
    });
}

export function retryFixRow(cls, key) {
  generateRow(cls, key);
}

function errMsg(e) {
  if (typeof e === 'string') return e;
  if (e && typeof e.message === 'string') return e.message;
  return String(e);
}
