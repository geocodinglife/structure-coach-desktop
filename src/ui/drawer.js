// Right-side reference drawer + per-sentence AI refactor.
// Opens with relevant rule examples filtered to whatever the sentence triggers.

import { CLS_TO_EXAMPLE_ID } from '../analysis/rules.js';
import { callLLM } from '../llm/client.js';

let currentSelectedSentence = null;

function showDrawer() {
  const drawer = document.getElementById('sc-drawer');
  if (!drawer) return null;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  return drawer;
}

export function closeDrawer() {
  const drawer = document.getElementById('sc-drawer');
  if (drawer) {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
}

export function filterDrawerExamples(drawer, focusIds) {
  const focusSet = new Set(focusIds);
  drawer.querySelectorAll('.sc-example-section').forEach(s => {
    const isExample = s.id && s.id.startsWith('sc-example-');
    if (!isExample) { s.classList.remove('hidden', 'highlight-focus'); return; }
    if (focusSet.size === 0) {
      s.classList.remove('hidden', 'highlight-focus');
    } else if (focusSet.has(s.id)) {
      s.classList.remove('hidden');
      s.classList.add('highlight-focus');
    } else {
      s.classList.add('hidden');
      s.classList.remove('highlight-focus');
    }
  });
  if (focusIds.length === 1) {
    const el = document.getElementById(focusIds[0]);
    const content = document.getElementById('sc-drawer-content');
    if (el && content) {
      content.scrollTop = Math.max(0, el.offsetTop - content.offsetTop);
    }
  }
}

export function openDrawerForError(cls) {
  const drawer = showDrawer();
  if (!drawer) return;
  const targetId = CLS_TO_EXAMPLE_ID[cls];
  filterDrawerExamples(drawer, targetId ? [targetId] : []);
}

export function openDrawerForSentence(sentence) {
  currentSelectedSentence = sentence;
  const drawer = showDrawer();
  if (!drawer) return;

  const aiTarget = drawer.querySelector('#sc-ai-target-text');
  const aiBtn = drawer.querySelector('#sc-ai-refactor-btn');
  const aiResult = drawer.querySelector('#sc-ai-result');

  if (aiTarget) aiTarget.textContent = `Target: "${sentence.text.substring(0, 80)}${sentence.text.length > 80 ? '…' : ''}"`;
  if (aiBtn) aiBtn.disabled = false;
  if (aiResult) aiResult.hidden = true;

  import('./coach.js').then(m => m.setCoachTab('fix'));

  const focusIds = sentence.stats
    .filter(s => s.count > 0)
    .map(s => CLS_TO_EXAMPLE_ID[s.cls])
    .filter(Boolean);
  filterDrawerExamples(drawer, focusIds);
}

export async function refactorSelectedSentence() {
  if (!currentSelectedSentence) return;
  const btn = document.getElementById('sc-ai-refactor-btn');
  const resultDiv = document.getElementById('sc-ai-result');
  const input = document.getElementById('sc-input');

  btn.disabled = true;
  btn.textContent = 'Refactoring...';
  try {
    const result = await callLLM({
      type: 'refactor',
      text: currentSelectedSentence.text,
      context: input.value,
    });
    resultDiv.textContent = result;
    resultDiv.hidden = false;
    btn.textContent = 'Refactor with AI';
    btn.disabled = false;
  } catch (err) {
    const msg = typeof err === 'string' ? err : (err?.message || String(err));
    resultDiv.textContent = 'Error: ' + msg;
    resultDiv.hidden = false;
    btn.textContent = 'Retry Refactor';
    btn.disabled = false;
  }
}
