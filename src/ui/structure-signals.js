// Structure signals row — thinking metrics, not grammar scores.

import { computeStructureSignals } from '../analysis/sentence-roles.js';

export function renderStructureSignals(el, sentences) {
  if (!el) return;
  const { summary } = computeStructureSignals(sentences);
  if (!summary) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.hidden = false;
  el.innerHTML = `<span class="sc-signals-label">Structure:</span> ${summary}`;
}
