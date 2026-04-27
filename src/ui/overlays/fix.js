// Per-rule fix overlay: slides up from the bottom (~1/3 height), shows every
// sentence that triggered the clicked rule on the left and its AI rewrite on
// the right. Keeps a request token per open so a stale response from a previous
// open can't overwrite the current view.

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

let openToken = 0;

export function openFixOverlay(cls, sentences, fullText) {
  const overlay = document.getElementById('sc-fix-overlay');
  const titleEl = document.getElementById('sc-fix-title');
  const listEl = document.getElementById('sc-fix-list');
  if (!overlay || !titleEl || !listEl) return;

  const matches = (sentences || []).filter(s =>
    s.stats.some(stat => stat.cls === cls && stat.count > 0),
  );

  titleEl.textContent = `${RULE_TITLES[cls] || 'Sentences'} (${matches.length})`;
  listEl.innerHTML = '';

  if (matches.length === 0) {
    listEl.innerHTML = '<div class="sc-fix-empty">No sentences with this issue.</div>';
  } else {
    matches.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'sc-fix-row';
      row.innerHTML = `
        <div class="sc-fix-original">${escapeHtml(s.text.trim())}</div>
        <div class="sc-fix-rewrite sc-fix-pending" data-i="${i}">Rewriting…</div>
      `;
      listEl.appendChild(row);
    });
  }

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');

  const myToken = ++openToken;
  matches.forEach((s, i) => {
    callLLM({ type: 'refactor', text: s.text, context: fullText || '' })
      .then(result => {
        if (myToken !== openToken) return;
        const cell = listEl.querySelector(`.sc-fix-rewrite[data-i="${i}"]`);
        if (!cell) return;
        cell.textContent = result;
        cell.classList.remove('sc-fix-pending');
      })
      .catch(err => {
        if (myToken !== openToken) return;
        const cell = listEl.querySelector(`.sc-fix-rewrite[data-i="${i}"]`);
        if (!cell) return;
        cell.textContent = 'Error: ' + errMsg(err);
        cell.classList.remove('sc-fix-pending');
        cell.classList.add('sc-fix-error');
      });
  });
}

export function closeFixOverlay() {
  const overlay = document.getElementById('sc-fix-overlay');
  if (!overlay) return;
  openToken++;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
