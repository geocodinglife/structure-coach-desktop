// AI-rewrite comparison overlay (original vs AI side-by-side).

import { callLLM } from '../../llm/client.js';

function errMsg(e) {
  if (typeof e === 'string') return e;
  if (e && typeof e.message === 'string') return e.message;
  return String(e);
}

export async function rewriteFullText() {
  const input = document.getElementById('sc-input');
  const btn = document.getElementById('sc-ai-rewrite');
  if (!input || !btn) return;
  const text = input.value.trim();
  if (!text) return;

  btn.dataset.busy = '1';
  btn.disabled = true;
  const originalLabel = btn.textContent;
  btn.textContent = 'Rewriting…';

  openCompare(input.value, 'Generating rewrite…', { rewriteReady: false });

  try {
    const result = await callLLM({ type: 'rewrite-full', text: input.value, context: '' });
    openCompare(input.value, result, { rewriteReady: true });
  } catch (err) {
    openCompare(input.value, 'Error: ' + errMsg(err), { rewriteReady: false });
  } finally {
    btn.textContent = originalLabel;
    delete btn.dataset.busy;
    btn.disabled = !input.value.trim();
  }
}

export function openCompare(originalText, rewriteText, { rewriteReady } = { rewriteReady: false }) {
  const overlay = document.getElementById('sc-compare-overlay');
  const originalEl = document.getElementById('sc-compare-original');
  const rewriteEl = document.getElementById('sc-compare-rewrite');
  const copyBtn = document.getElementById('sc-compare-copy');
  if (!overlay || !originalEl || !rewriteEl || !copyBtn) return;
  originalEl.textContent = originalText;
  rewriteEl.textContent = rewriteText;
  rewriteEl.classList.toggle('sc-compare-pending', !rewriteReady);
  copyBtn.disabled = !rewriteReady;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

export function closeCompare() {
  const overlay = document.getElementById('sc-compare-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
}
