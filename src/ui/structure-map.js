// Structure Map Phase 0 + Phase 1 — roles, bridges, movement hints.

import { analyzeSentenceStructure } from '../analysis/sentence-roles.js';
import { openCoachLearn } from './coach.js';
import { openDrawerForSentence } from './drawer.js';
import { setCoachTab } from './coach.js';

export function renderStructureMap(sentences) {
  const list = document.getElementById('sc-structure-list');
  if (!list) return;
  list.innerHTML = '';

  if (sentences.length === 0) {
    list.innerHTML = '<li class="sc-structure-empty">Sentences appear here as you write.</li>';
    return;
  }

  sentences.forEach((sentence, i) => {
    const prev = i > 0 ? sentences[i - 1] : null;
    const { role, status, bridge, moveHint } = analyzeSentenceStructure(sentence, i, prev);
    const li = document.createElement('li');
    li.className = 'sc-structure-item';
    const preview = sentence.text.trim().replace(/\s+/g, ' ');
    const short = preview.length > 40 ? preview.slice(0, 37) + '…' : preview;

    li.innerHTML = `
      <span class="sc-structure-num">S${i + 1}</span>
      <span class="sc-structure-role sc-structure-role--${roleClass(role)}" aria-label="Role: ${role}">[${role}]</span>
      <span class="sc-structure-preview">${esc(short)}</span>
      <span class="sc-structure-issues" title="${esc(status)}">${esc(status)}</span>
    `;

    if (bridge && i > 0) {
      const bridgeEl = document.createElement('div');
      bridgeEl.className = 'sc-structure-bridge';
      bridgeEl.textContent = `↳ ${bridge}`;
      li.appendChild(bridgeEl);
    }

    if (moveHint) {
      const hintEl = document.createElement('div');
      hintEl.className = 'sc-structure-move-hint';
      hintEl.textContent = moveHint;
      li.appendChild(hintEl);
    }

    li.addEventListener('click', () => {
      scrollToSentence(sentence.text);
      const fullText = document.getElementById('sc-input')?.value || '';
      const issue = sentence.stats.find(s => s.count > 0);
      if (issue) {
        openCoachLearn(issue.cls, null, [sentence], fullText);
      } else {
        openDrawerForSentence(sentence);
        setCoachTab('fix');
      }
    });
    list.appendChild(li);
  });
}

function roleClass(role) {
  if (role === 'Frame') return 'frame';
  if (role === 'Action') return 'action';
  if (role === 'Why') return 'why';
  return 'unknown';
}

function scrollToSentence(sText) {
  const input = document.getElementById('sc-input');
  if (!input) return;
  const start = input.value.indexOf(sText);
  if (start === -1) return;
  input.focus();
  input.setSelectionRange(start, start + sText.length);
  const before = input.value.slice(0, start);
  const lineNum = (before.match(/\n/g) || []).length;
  const lineHeight = parseFloat(getComputedStyle(input).lineHeight) || 24;
  input.scrollTop = Math.max(0, lineNum * lineHeight - input.clientHeight / 3);
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function setRightPanelView(view) {
  const map = document.getElementById('sc-structure-map');
  const tree = document.getElementById('sc-tree-container');
  document.querySelectorAll('.sc-panel-view-btn').forEach(b => {
    b.classList.toggle('sc-panel-view-btn--active', b.dataset.view === view);
  });
  if (map) map.hidden = view !== 'map';
  if (tree) tree.hidden = view !== 'tree';
}

export function wirePanelViewToggle() {
  document.querySelectorAll('.sc-panel-view-btn').forEach(btn => {
    btn.addEventListener('click', () => setRightPanelView(btn.dataset.view));
  });
}
