// AI-rewrite comparison overlay (original vs AI side-by-side).

import { analyzeText } from '../../analysis/analyzer.js';
import { callLLM } from '../../llm/client.js';

let rewriteDirty = false;
let suppressRewriteInput = false;
let activeRequestId = 0;
let compareHasSession = false;
let compareSourceText = '';

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

  const sourceText = input.value;
  const requestId = ++activeRequestId;
  showCompare(sourceText, sourceText, {
    rewriteReady: false,
    statusText: 'Generating AI rewrite. You can edit this draft while it works.'
  });

  try {
    const result = await callLLM({ type: 'rewrite-full', text: sourceText, context: '' });
    if (requestId === activeRequestId && !rewriteDirty) {
      updateCompareContent(sourceText, result, { rewriteReady: true, statusText: '' });
    } else if (requestId === activeRequestId) {
      setCompareStatus('AI rewrite finished, but your manual edits were kept.');
    }
  } catch (err) {
    if (requestId === activeRequestId) {
      updateCompareContent(sourceText, sourceText, {
        rewriteReady: true,
        preserveDirty: true,
        statusText: 'AI rewrite failed: ' + errMsg(err) + '. Edit the draft manually.'
      });
    }
  } finally {
    btn.textContent = originalLabel;
    delete btn.dataset.busy;
    btn.disabled = !input.value.trim();
  }
}

export function showCompare(originalText, rewriteText, options = {}) {
  updateCompareContent(originalText, rewriteText, options);
  openStoredCompare();
}

export function openStoredCompare() {
  if (!compareHasSession) return;
  const overlay = document.getElementById('sc-compare-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  updateResumeButton();
}

function updateCompareContent(originalText, rewriteText, {
  rewriteReady = false,
  statusText = '',
  preserveDirty = false
} = {}) {
  const overlay = document.getElementById('sc-compare-overlay');
  const originalEl = document.getElementById('sc-compare-original');
  const issuesEl = document.getElementById('sc-compare-issues');
  const rewriteEl = document.getElementById('sc-compare-rewrite');
  const copyBtn = document.getElementById('sc-compare-copy');
  const statusEl = document.getElementById('sc-compare-status');
  if (!overlay || !originalEl || !rewriteEl || !copyBtn) return;
  const analysis = analyzeText(originalText);
  originalEl.innerHTML = analysis.html;
  renderIssueSummary(issuesEl, analysis.stats);
  if (!preserveDirty || !rewriteDirty) {
    setRewriteValue(rewriteEl, rewriteText);
    rewriteDirty = false;
  }
  rewriteEl.classList.toggle('sc-compare-pending', !rewriteReady);
  copyBtn.disabled = !rewriteReady;
  compareSourceText = originalText;
  if (statusEl) {
    statusEl.textContent = statusText;
    statusEl.hidden = !statusText;
  }
  compareHasSession = true;
  updateResumeButton();
}

export function markRewriteDirty() {
  if (suppressRewriteInput) return;
  rewriteDirty = true;
}

export function hideCompare() {
  const overlay = document.getElementById('sc-compare-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  updateResumeButton();
}

function setRewriteValue(el, value) {
  suppressRewriteInput = true;
  try {
    if ('value' in el) {
      el.value = value;
    } else {
      el.textContent = value;
    }
  } finally {
    suppressRewriteInput = false;
  }
}

function setCompareStatus(message) {
  const statusEl = document.getElementById('sc-compare-status');
  const rewriteEl = document.getElementById('sc-compare-rewrite');
  if (rewriteEl) rewriteEl.classList.remove('sc-compare-pending');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.hidden = !message;
}

export function closeCompare() {
  const overlay = document.getElementById('sc-compare-overlay');
  const originalEl = document.getElementById('sc-compare-original');
  const issuesEl = document.getElementById('sc-compare-issues');
  const rewriteEl = document.getElementById('sc-compare-rewrite');
  const statusEl = document.getElementById('sc-compare-status');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  if (originalEl) originalEl.textContent = '';
  if (issuesEl) issuesEl.innerHTML = '';
  if (rewriteEl) setRewriteValue(rewriteEl, '');
  if (statusEl) {
    statusEl.textContent = '';
    statusEl.hidden = true;
  }
  rewriteDirty = false;
  compareHasSession = false;
  compareSourceText = '';
  activeRequestId += 1;
  updateResumeButton();
}

export function getCompareSourceText() {
  return compareSourceText;
}

export function refreshCompareResumeButton() {
  updateResumeButton();
}

function renderIssueSummary(el, stats) {
  if (!el) return;
  const parts = [];
  const weakCount = stats
    .filter(s => s.cls === 'sc-hl-pass')
    .reduce((sum, s) => sum + s.count, 0);

  const addChip = (variant, cls, label, count) => {
    if (count > 0) {
      parts.push(`<span class="sc-stat sc-stat--${variant}" data-cls="${cls}">${label}: ${count}</span>`);
    }
  };

  addChip('pass', 'sc-hl-pass', 'Weak', weakCount);
  addRuleChip(parts, stats, 'sc-hl-prep', 'prep', 'Prep');
  addRuleChip(parts, stats, 'sc-hl-nom', 'nom', 'Nom');
  addRuleChip(parts, stats, 'sc-hl-fill', 'fill', 'Fill');
  addRuleChip(parts, stats, 'sc-hl-needless', 'needless', 'Needless');
  addRuleChip(parts, stats, 'sc-hl-spine', 'spine', 'Spine');
  addRuleChip(parts, stats, 'sc-hl-stack', 'stack', 'Stack');
  addRuleChip(parts, stats, 'sc-hl-flow', 'flow', 'Flow');
  el.innerHTML = parts.join(' ');
}

function addRuleChip(parts, stats, cls, variant, label) {
  const rule = stats.find(s => s.cls === cls);
  if (rule && rule.count > 0) {
    parts.push(`<span class="sc-stat sc-stat--${variant}" data-cls="${cls}">${label}: ${rule.count}</span>`);
  }
}

function updateResumeButton() {
  const resumeBtn = document.getElementById('sc-compare-resume');
  const overlay = document.getElementById('sc-compare-overlay');
  const fix = document.getElementById('sc-fix-overlay');
  const reader = document.getElementById('sc-reader-overlay');
  const settings = document.getElementById('sc-settings-modal');
  if (!resumeBtn) return;
  const isOpen = overlay?.classList.contains('open');
  const blockingOverlayOpen =
    fix?.classList.contains('open') ||
    reader?.classList.contains('open') ||
    settings?.classList.contains('open');
  resumeBtn.hidden = !compareHasSession || isOpen || blockingOverlayOpen;
}
