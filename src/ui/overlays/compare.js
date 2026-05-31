// Rewrite Workshop — manual draft + optional AI suggestion lanes.

import { analyzeText } from '../../analysis/analyzer.js';
import { callLLM } from '../../llm/client.js';
import { CHIP_DEFS, getChipDef, chipAriaLabel } from '../chip-defs.js';
import { saveWorkshopDraft, clearWorkshopDraft } from '../persistence.js';

let rewriteDirty = false;
let suppressRewriteInput = false;
let activeRequestId = 0;
let compareHasSession = false;
let compareSourceText = '';
let aiSuggestionText = '';

function errMsg(e) {
  if (typeof e === 'string') return e;
  if (e && typeof e.message === 'string') return e.message;
  return String(e);
}

export function openWorkshop() {
  const input = document.getElementById('sc-input');
  if (!input || !input.value.trim()) return;
  const sourceText = input.value;
  showCompare(sourceText, sourceText, {
    rewriteReady: true,
    statusText: 'Edit your draft, or click Generate for an AI suggestion.',
    openAiEmpty: true,
  });
}

export async function generateWorkshopSuggestion() {
  if (!compareSourceText) return;
  const btn = document.getElementById('sc-compare-generate');
  const statusEl = document.getElementById('sc-compare-status');
  const aiEl = document.getElementById('sc-compare-ai');
  if (!aiEl) return;

  persistWorkshop();

  const requestId = ++activeRequestId;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Generating…';
  }
  if (statusEl) {
    statusEl.textContent = 'AI is drafting a suggestion. Your draft will not be overwritten.';
    statusEl.hidden = false;
  }

  try {
    const result = await callLLM({ type: 'rewrite-full', text: compareSourceText, context: '' });
    if (requestId !== activeRequestId) return;
    aiSuggestionText = result;
    aiEl.value = result;
    if (statusEl) {
      statusEl.textContent = 'Suggestion ready. Review before inserting into your draft.';
      statusEl.hidden = false;
    }
  } catch (err) {
    if (requestId !== activeRequestId) return;
    if (statusEl) {
      statusEl.innerHTML = 'AI unavailable: ' + esc(errMsg(err)) +
        ' <button type="button" class="sc-link-btn" id="sc-status-settings">Open Settings</button> ' +
        'Keep editing your draft manually.';
      statusEl.hidden = false;
      statusEl.querySelector('#sc-status-settings')?.addEventListener('click', () => {
        import('../settings-modal.js').then(m => m.openSettingsModal());
      });
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Generate';
    }
    persistWorkshop();
  }
}

export function insertIntoDraft(mode) {
  const draft = document.getElementById('sc-compare-rewrite');
  const aiEl = document.getElementById('sc-compare-ai');
  if (!draft || !aiEl) return;
  const suggestion = aiEl.value.trim();
  if (!suggestion) return;

  if (mode === 'append') {
    const sep = draft.value.trim() ? '\n\n' : '';
    draft.value += sep + suggestion;
  } else if (mode === 'selection') {
    const start = draft.selectionStart;
    const end = draft.selectionEnd;
    if (start === end) return;
    draft.value = draft.value.slice(0, start) + suggestion + draft.value.slice(end);
  } else {
    if (draft.value.trim() && !confirm('Replace all of your draft with the AI suggestion?')) return;
    draft.value = suggestion;
  }
  draft.focus();
  markRewriteDirty();
  persistWorkshop();
}

export function insertWorkshopScaffold(kind) {
  const draft = document.getElementById('sc-compare-rewrite');
  if (!draft) return;
  const scaffolds = {
    up: 'This matters because ___',
    down: 'Do this: ___ in ___',
    wide: 'Check whether ___ also applies to ___',
  };
  const s = scaffolds[kind];
  if (!s) return;
  const sep = draft.value.trim() && !draft.value.endsWith('\n') ? '\n' : '';
  draft.value += sep + s;
  const idx = draft.value.indexOf('___');
  if (idx !== -1) draft.setSelectionRange(idx, idx + 3);
  draft.focus();
  markRewriteDirty();
  persistWorkshop();
}

/** @deprecated use openWorkshop — kept for toolbar id compatibility */
export async function rewriteFullText() {
  openWorkshop();
}

export function showCompare(originalText, rewriteText, options = {}) {
  updateCompareContent(originalText, rewriteText, options);
  openStoredCompare();
}

export function restoreWorkshopSession(data) {
  if (!data?.sourceText) return;
  compareSourceText = data.sourceText;
  compareHasSession = true;
  updateCompareContent(data.sourceText, data.myDraft || data.sourceText, {
    rewriteReady: true,
    statusText: 'Restored rewrite workshop.',
    preserveDirty: true,
  });
  const aiEl = document.getElementById('sc-compare-ai');
  if (aiEl && data.aiSuggestion) {
    aiSuggestionText = data.aiSuggestion;
    aiEl.value = data.aiSuggestion;
  }
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
  preserveDirty = false,
  openAiEmpty = false,
} = {}) {
  const originalEl = document.getElementById('sc-compare-original');
  const issuesEl = document.getElementById('sc-compare-issues');
  const rewriteEl = document.getElementById('sc-compare-rewrite');
  const aiEl = document.getElementById('sc-compare-ai');
  const copyBtn = document.getElementById('sc-compare-copy');
  const statusEl = document.getElementById('sc-compare-status');
  if (!originalEl || !rewriteEl || !copyBtn) return;

  const analysis = analyzeText(originalText);
  originalEl.innerHTML = analysis.html;
  renderIssueSummary(issuesEl, analysis.stats);

  if (!preserveDirty || !rewriteDirty) {
    setRewriteValue(rewriteEl, rewriteText);
    rewriteDirty = false;
  }
  rewriteEl.classList.toggle('sc-compare-pending', !rewriteReady);
  copyBtn.disabled = false;

  if (aiEl && openAiEmpty) {
    aiSuggestionText = '';
    aiEl.value = '';
  }

  compareSourceText = originalText;
  if (statusEl) {
    statusEl.textContent = statusText;
    statusEl.hidden = !statusText;
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');
  }
  compareHasSession = true;
  updateResumeButton();
  persistWorkshop();
}

function persistWorkshop() {
  if (!compareHasSession) return;
  const draft = document.getElementById('sc-compare-rewrite');
  const aiEl = document.getElementById('sc-compare-ai');
  saveWorkshopDraft({
    sourceText: compareSourceText,
    myDraft: draft?.value || '',
    aiSuggestion: aiEl?.value || aiSuggestionText || '',
  });
}

export function markRewriteDirty() {
  if (suppressRewriteInput) return;
  rewriteDirty = true;
  persistWorkshop();
}

export function hideCompare() {
  const overlay = document.getElementById('sc-compare-overlay');
  if (!overlay) return;
  persistWorkshop();
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  updateResumeButton();
}

function setRewriteValue(el, value) {
  suppressRewriteInput = true;
  try {
    if ('value' in el) el.value = value;
    else el.textContent = value;
  } finally {
    suppressRewriteInput = false;
  }
}

export function closeCompare() {
  const overlay = document.getElementById('sc-compare-overlay');
  const originalEl = document.getElementById('sc-compare-original');
  const issuesEl = document.getElementById('sc-compare-issues');
  const rewriteEl = document.getElementById('sc-compare-rewrite');
  const aiEl = document.getElementById('sc-compare-ai');
  const statusEl = document.getElementById('sc-compare-status');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  if (originalEl) originalEl.textContent = '';
  if (issuesEl) issuesEl.innerHTML = '';
  if (rewriteEl) setRewriteValue(rewriteEl, '');
  if (aiEl) aiEl.value = '';
  if (statusEl) {
    statusEl.textContent = '';
    statusEl.hidden = true;
  }
  rewriteDirty = false;
  compareHasSession = false;
  compareSourceText = '';
  aiSuggestionText = '';
  activeRequestId += 1;
  clearWorkshopDraft();
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
  const countByCls = (cls) => stats.find(s => s.cls === cls)?.count || 0;

  CHIP_DEFS.forEach(def => {
    let count = countByCls(def.cls);
    if (def.cls === 'sc-hl-pass') {
      count = stats.filter(s => s.cls === 'sc-hl-pass').reduce((n, s) => n + s.count, 0);
    }
    if (count > 0) {
      parts.push(
        `<button type="button" class="sc-stat sc-stat--${def.variant}" data-cls="${def.cls}" ` +
        `aria-label="${chipAriaLabel(def.label, count)}">${def.label}: ${count}</button>`,
      );
    }
  });
  el.innerHTML = parts.join(' ');
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

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
