// Mounts the entire Structure Coach panel into the given root element.

import { analyzeText } from '../analysis/analyzer.js';
import { EXAMPLE_ID_TO_CLS } from '../analysis/rules.js';
import { renderTree } from './tree.js';
import { makeGlyphIcon } from './glyphs.js';
import { refactorSelectedSentence } from './drawer.js';
import { openReader, closeReader } from './overlays/reader.js';
import {
  openWorkshop,
  closeCompare,
  hideCompare,
  openStoredCompare,
  markRewriteDirty,
  getCompareSourceText,
  refreshCompareResumeButton,
  generateWorkshopSuggestion,
  insertIntoDraft,
  insertWorkshopScaffold,
  restoreWorkshopSession,
  openWorkshopApply,
  updateWorkshopChrome,
} from './overlays/compare.js';
import { openFixOverlay, closeFixOverlay, retryFixRow } from './overlays/fix.js';
import { openSettingsModal, closeSettingsModal, wireSettingsModal } from './settings-modal.js';
import { getApiKey } from '../llm/settings.js';
import { getParamedicMethodHTML } from '../guides/paramedic.js';
import { getAdvancedStructureHTML } from '../guides/advanced-structure.js';
import { getBDDGuidanceHTML } from '../guides/bdd.js';
import { CHIP_DEFS, chipAriaLabel } from './chip-defs.js';
import { openCoachLearn, closeCoach, wireCoachTabs, isChipKept } from './coach.js';
import { computePositiveChecks, renderPositiveRow } from './positive.js';
import { wireMovementBar, updateMovementBarVisibility } from './movement.js';
import { saveMainDraft, showRestorePrompt } from './persistence.js';
import { renderStructureMap, wirePanelViewToggle } from './structure-map.js';
import { renderStructureSignals } from './structure-signals.js';
import { wireApplyEditor } from './apply-editor.js';

let lastSentences = [];
let lastText = '';

export function mountPanel(root) {
  if (!root) return;
  root.innerHTML = panelMarkup();

  root.querySelectorAll('.sc-example-section[id^="sc-example-"]').forEach(section => {
    const cls = EXAMPLE_ID_TO_CLS[section.id];
    if (!cls) return;
    const label = section.querySelector('.sc-example-label');
    if (label) label.prepend(makeGlyphIcon(cls));
  });

  wireEvents(root);
  wireSettingsModal();
  wireCoachTabs();
  wireMovementBar();
  wirePanelViewToggle();
  wireApplyEditor();
  window.__sc_refreshKeyState = refreshKeyState;
  refreshKeyState();

  showRestorePrompt(
    (main) => {
      const input = document.getElementById('sc-input');
      const layer = document.getElementById('sc-highlight-layer');
      if (input) {
        input.value = main;
        updateUI(input, layer);
      }
    },
    (workshop) => {
      restoreWorkshopSession(workshop);
      updateWorkshopChrome();
    },
  );

  updateWorkshopChrome();

  setTimeout(() => document.getElementById('sc-input')?.focus(), 50);
}

export async function refreshKeyState() {
  const key = await getApiKey();
  const banner = document.getElementById('sc-setup-banner');
  const settingsBtn = document.getElementById('sc-settings-btn');
  const hasKey = Boolean(key);
  if (banner && !banner.dataset.dismissed) {
    banner.style.display = hasKey ? 'none' : 'flex';
  }
  if (settingsBtn) {
    settingsBtn.classList.toggle('sc-btn-attention', !hasKey);
    settingsBtn.textContent = hasKey ? 'Settings' : 'Settings ●';
  }
}

function wireEvents(root) {
  const input = document.getElementById('sc-input');
  const highlightLayer = document.getElementById('sc-highlight-layer');
  input.addEventListener('input', () => updateUI(input, highlightLayer));
  input.addEventListener('scroll', () => {
    highlightLayer.scrollTop = input.scrollTop;
    highlightLayer.scrollLeft = input.scrollLeft;
  });

  document.getElementById('sc-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(input.value.trim());
    const toast = document.getElementById('sc-copied-toast');
    if (!toast) return;
    toast.hidden = false;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.hidden = true; }, 1200);
  });

  document.getElementById('sc-ai-rewrite').addEventListener('click', openWorkshop);
  document.getElementById('sc-compare-resume')?.addEventListener('click', openStoredCompare);
  document.getElementById('sc-compare-rewrite')?.addEventListener('input', markRewriteDirty);
  document.getElementById('sc-compare-generate')?.addEventListener('click', generateWorkshopSuggestion);
  document.getElementById('sc-compare-insert-replace')?.addEventListener('click', () => insertIntoDraft('replace'));
  document.getElementById('sc-compare-insert-append')?.addEventListener('click', () => insertIntoDraft('append'));
  document.getElementById('sc-compare-insert-selection')?.addEventListener('click', () => insertIntoDraft('selection'));
  document.getElementById('sc-compare-apply')?.addEventListener('click', openWorkshopApply);
  document.querySelectorAll('[data-workshop-scaffold]').forEach(btn => {
    btn.addEventListener('click', () => insertWorkshopScaffold(btn.dataset.workshopScaffold));
  });

  document.getElementById('sc-settings-btn').addEventListener('click', openSettingsModal);
  document.getElementById('sc-hide-btn').addEventListener('click', () => {
    window.__TAURI__?.webviewWindow?.getCurrent()?.hide();
  });
  document.getElementById('sc-setup-open').addEventListener('click', openSettingsModal);
  document.getElementById('sc-setup-continue')?.addEventListener('click', () => {
    const b = document.getElementById('sc-setup-banner');
    if (b) { b.dataset.dismissed = '1'; b.style.display = 'none'; }
  });
  document.getElementById('sc-setup-dismiss').addEventListener('click', () => {
    const b = document.getElementById('sc-setup-banner');
    if (b) { b.dataset.dismissed = '1'; b.style.display = 'none'; }
  });

  document.getElementById('sc-reader-toggle').addEventListener('click', () => {
    openReader('Paramedic Method: Full Guide', getParamedicMethodHTML());
    refreshCompareResumeButton();
  });
  document.getElementById('sc-reader-advanced-toggle').addEventListener('click', () => {
    openReader('Advanced Structure Guide: Spine & Flow', getAdvancedStructureHTML());
    refreshCompareResumeButton();
  });
  document.getElementById('sc-reader-bdd-toggle').addEventListener('click', () => {
    openReader('Scenario Scaffold: Protagonist-First Writing', getBDDGuidanceHTML());
    refreshCompareResumeButton();
  });

  document.getElementById('sc-error-count').addEventListener('click', (e) => {
    const btn = e.target.closest('.sc-stat');
    if (!btn) return;
    const cls = btn.getAttribute('data-cls');
    if (cls) openCoachLearn(cls, btn, lastSentences, lastText);
  });

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest('#sc-drawer-close')) {
      closeCoach();
      return;
    }
    if (t.closest('#sc-reader-close-btn, .sc-reader-close-footer')) {
      closeReader();
      refreshCompareResumeButton();
      return;
    }
    if (t.closest('#sc-compare-hide-btn')) { hideCompare(); return; }
    if (t.closest('#sc-compare-close-btn')) { closeCompare(); return; }
    if (t.closest('#sc-fix-close-btn')) {
      closeFixOverlay();
      refreshCompareResumeButton();
      return;
    }
    if (t.closest('#sc-setup-dismiss')) {
      const b = document.getElementById('sc-setup-banner');
      if (b) { b.dataset.dismissed = '1'; b.style.display = 'none'; }
      return;
    }
    if (t.closest('#sc-setup-open')) { openSettingsModal(); return; }

    const compareChip = t.closest('#sc-compare-issues .sc-stat');
    if (compareChip) {
      const cls = compareChip.dataset.cls;
      const src = getCompareSourceText();
      if (cls && src) {
        const { sentences } = analyzeText(src);
        openCoachLearn(cls, compareChip, sentences, src);
      }
      return;
    }
    const fixChip = t.closest('#sc-fix-chips .sc-stat');
    if (fixChip) {
      const cls = fixChip.dataset.cls;
      if (cls) openFixOverlay(cls, lastSentences, lastText);
      refreshCompareResumeButton();
      return;
    }
    const retry = t.closest('.sc-fix-retry');
    if (retry) {
      retryFixRow(retry.dataset.cls, retry.dataset.key);
      return;
    }
  });

  document.getElementById('sc-compare-copy').addEventListener('click', () => {
    const rewriteEl = document.getElementById('sc-compare-rewrite');
    if (!rewriteEl) return;
    navigator.clipboard.writeText(rewriteEl.value || '');
    const btn = document.getElementById('sc-compare-copy');
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    clearTimeout(btn._hideTimer);
    btn._hideTimer = setTimeout(() => { btn.textContent = original; }, 1200);
  });

  root.addEventListener('click', (e) => {
    if (e.target.id === 'sc-ai-refactor-btn') refactorSelectedSentence();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const compare = document.getElementById('sc-compare-overlay');
    const reader = document.getElementById('sc-reader-overlay');
    const fix = document.getElementById('sc-fix-overlay');
    const drawer = document.getElementById('sc-drawer');
    const settings = document.getElementById('sc-settings-modal');
    if (settings && settings.classList.contains('open')) {
      closeSettingsModal();
    } else if (compare && compare.classList.contains('open')) {
      hideCompare();
    } else if (reader && reader.classList.contains('open')) {
      closeReader();
      refreshCompareResumeButton();
    } else if (fix && fix.classList.contains('open')) {
      closeFixOverlay();
      refreshCompareResumeButton();
    } else if (drawer && drawer.classList.contains('open')) {
      closeCoach();
    } else {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  });
}

function updateUI(input, layer) {
  const text = input.value;
  const copyBtn = document.getElementById('sc-copy');
  const aiBtn = document.getElementById('sc-ai-rewrite');
  const report = document.getElementById('sc-error-count');
  const positive = document.getElementById('sc-positive-row');
  const signals = document.getElementById('sc-structure-signals');

  copyBtn.disabled = !text.trim();
  if (aiBtn) aiBtn.disabled = !text.trim();

  saveMainDraft(text);
  updateMovementBarVisibility(text);

  requestAnimationFrame(() => {
    const { html, stats, sentences } = analyzeText(text);
    lastSentences = sentences;
    lastText = text;

    layer.innerHTML = html;
    renderTree(sentences);
    renderStructureMap(sentences);
    renderPositiveRow(positive, computePositiveChecks(text, sentences));
    renderStructureSignals(signals, sentences);
    renderStructureSignals(document.getElementById('sc-structure-signals-map'), sentences);

    const wordCount = text.match(/\S+/g)?.length || 0;
    const sentCount = sentences.length;
    const statsEl = document.getElementById('sc-doc-stats');
    if (statsEl) {
      statsEl.textContent = sentCount
        ? `${wordCount} word${wordCount === 1 ? '' : 's'} · ${sentCount} sentence${sentCount === 1 ? '' : 's'}`
        : '';
    }

    if (wordCount === 0) {
      report.innerHTML = '';
      return;
    }

    const parts = [];
    const countByCls = (cls) => {
      if (cls === 'sc-hl-pass') {
        return stats.filter(s => s.cls === 'sc-hl-pass').reduce((n, s) => n + s.count, 0);
      }
      return stats.find(s => s.cls === cls)?.count || 0;
    };

    CHIP_DEFS.forEach(def => {
      const count = countByCls(def.cls);
      if (count > 0) {
        const sentenceHits = sentences.filter(s =>
          s.stats.some(st => st.cls === def.cls && st.count > 0),
        ).length;
        let severity = '';
        if (count >= 3) severity = ' sc-stat--heavy';
        else if (sentenceHits >= 2) severity = ' sc-stat--repeat';
        if (isChipKept(def.cls)) severity += ' sc-stat--kept';
        parts.push(
          `<button type="button" class="sc-stat sc-stat--${def.variant}${severity}" data-cls="${def.cls}" ` +
          `aria-label="${chipAriaLabel(def.label, count)}">${def.label}: ${count}</button>`,
        );
      }
    });

    report.innerHTML = parts.join(' ');
  });
}

function panelMarkup() {
  return `
    <div id="sc-panel" role="application" aria-label="Structure Coach">
      <header class="sc-app-header">
        <div class="sc-app-brand">
          <span class="sc-app-mark" aria-hidden="true">SC</span>
          <div>
            <h1 class="sc-app-title">Structure Coach</h1>
            <p class="sc-app-tagline">Think clearly · write truthfully</p>
          </div>
        </div>
      </header>
      <div id="sc-restore-banner" hidden>
        <span class="sc-restore-text">Restore saved work?</span>
        <button type="button" id="sc-restore-yes" class="sc-btn sc-btn-primary">Restore</button>
        <button type="button" id="sc-restore-dismiss" class="sc-btn sc-btn-secondary">Dismiss</button>
      </div>
      <div id="sc-setup-banner" style="display: none">
        <span class="sc-setup-icon" aria-hidden="true">✨</span>
        <span class="sc-setup-text">Local checks are active. Add AI when you want rewrite suggestions and Smart Fix.</span>
        <button type="button" id="sc-setup-continue" class="sc-btn sc-btn-secondary">Continue without AI</button>
        <button type="button" id="sc-setup-open" class="sc-btn sc-btn-primary">Open Settings</button>
        <button type="button" id="sc-setup-dismiss" class="sc-setup-x" aria-label="Dismiss">&times;</button>
      </div>
      <div id="sc-body">
        <div id="sc-main">
          <div id="sc-left">
            <div id="sc-movement-bar" hidden role="group" aria-labelledby="sc-movement-hint">
              <div id="sc-movement-hint" class="sc-movement-hint">What should your next sentence do?</div>
              <div class="sc-movement-controls">
                <label class="sc-move-opt"><input type="radio" name="sc-move" value="up" /> Move Up</label>
                <label class="sc-move-opt"><input type="radio" name="sc-move" value="down" /> Move Down</label>
                <label class="sc-move-opt"><input type="radio" name="sc-move" value="wide" /> Move Wide</label>
                <label class="sc-audience-label" for="sc-audience">Audience</label>
                <select id="sc-audience" aria-label="Audience mode">
                  <option value="builder">Builder</option>
                  <option value="operator">Operator</option>
                  <option value="business">Business</option>
                  <option value="reader">Reader</option>
                </select>
              </div>
            </div>
            <div id="sc-llm-scaffold" class="sc-llm-scaffold" hidden>
              <div class="sc-llm-scaffold-title">LLM Task scaffold</div>
              <div class="sc-llm-scaffold-fields">
                <label>Location<input type="text" id="sc-scaffold-location" placeholder="Welcome view" /></label>
                <label>Target<input type="text" id="sc-scaffold-target" placeholder="Tips section" /></label>
                <label>Action<input type="text" id="sc-scaffold-action" placeholder="sort the list" /></label>
                <label>Constraint<input type="text" id="sc-scaffold-constraint" placeholder="do not change order elsewhere" /></label>
              </div>
              <div class="sc-llm-scaffold-actions">
                <button type="button" id="sc-scaffold-insert" class="sc-btn sc-btn-secondary sc-btn-sm">Insert scaffold</button>
                <button type="button" id="sc-scaffold-generate" class="sc-btn sc-btn-secondary sc-btn-sm">Generate with AI</button>
              </div>
              <div id="sc-scaffold-status" class="sc-scaffold-status" hidden role="status" aria-live="polite"></div>
            </div>
            <div class="sc-editor-section">
              <label class="sc-section-label" for="sc-input">Your draft</label>
              <div id="sc-editor-wrap">
                <div id="sc-highlight-layer" aria-hidden="true"></div>
                <textarea id="sc-input" placeholder="Write a sentence. Coaching appears as you go." aria-label="Main editor"></textarea>
              </div>
            </div>
            <div id="sc-toolbar">
              <div class="sc-coaching-panel">
                <div class="sc-coaching-head">
                  <span class="sc-section-label">Coaching</span>
                  <span id="sc-doc-stats" class="sc-doc-stats"></span>
                </div>
                <div id="sc-error-count"></div>
                <div id="sc-positive-row" hidden></div>
                <div id="sc-structure-signals" hidden></div>
              </div>
              <div class="sc-action-bar">
                <span id="sc-workshop-indicator" class="sc-workshop-indicator" hidden>Rewrite in progress</span>
                <button id="sc-ai-rewrite" class="sc-btn sc-btn-primary sc-btn-ai" disabled>Rewrite…</button>
                <button id="sc-copy" class="sc-btn sc-btn-secondary" disabled>Copy</button>
                <button id="sc-hide-btn" class="sc-btn sc-btn-secondary" title="Hide to Tray">Hide to tray</button>
                <button id="sc-settings-btn" class="sc-btn sc-btn-secondary" title="Settings">Settings</button>
                <div id="sc-copied-toast" hidden>Copied!</div>
                <div id="sc-workshop-toast" class="sc-workshop-toast" hidden></div>
              </div>
            </div>
          </div>
          <div id="sc-right">
            <div class="sc-panel-view-tabs">
              <button type="button" class="sc-panel-view-btn sc-panel-view-btn--active" data-view="map">Structure map</button>
              <button type="button" class="sc-panel-view-btn" data-view="tree">Classic tree</button>
            </div>
            <div id="sc-structure-map">
              <div id="sc-structure-signals-map" class="sc-structure-signals-map" hidden aria-live="polite"></div>
              <ol id="sc-structure-list" class="sc-structure-list"></ol>
            </div>
            <div id="sc-tree-container" hidden>
              <svg id="sc-tree-svg" xmlns="http://www.w3.org/2000/svg">
                <g id="sc-tree-content"></g>
              </svg>
            </div>
          </div>
        </div>
        <button id="sc-compare-resume" class="sc-btn sc-btn-primary sc-compare-resume" hidden>Resume rewrite</button>
        <div id="sc-drawer" role="dialog" aria-modal="false" aria-labelledby="sc-drawer-title" aria-hidden="true">
          <div id="sc-drawer-header">
            <div id="sc-drawer-title">Coach</div>
            <button id="sc-drawer-close" aria-label="Close coach">&times;</button>
          </div>
          <div class="sc-coach-tabs" role="tablist">
            <button type="button" class="sc-coach-tab sc-coach-tab--active" data-tab="learn" role="tab" aria-selected="true">Learn</button>
            <button type="button" class="sc-coach-tab" data-tab="fix" role="tab" aria-selected="false">Fix</button>
            <button type="button" class="sc-coach-tab" data-tab="guides" role="tab" aria-selected="false">Guides</button>
          </div>
          <div id="sc-drawer-content">
            <div id="sc-coach-learn" class="sc-coach-panel" data-panel="learn"></div>
            <div id="sc-coach-fix-panel" class="sc-coach-panel" data-panel="fix" hidden>
              <div id="sc-ai-coach" class="sc-example-section sc-ai-coach">
                <div class="sc-example-label sc-color-ai">Smart Fix</div>
                <div id="sc-ai-target-text" class="sc-ai-target-text">Select a sentence in the classic tree to refactor.</div>
                <button id="sc-ai-refactor-btn" class="sc-btn sc-btn-primary sc-ai-refactor-btn" disabled>Generate suggestion</button>
                <textarea id="sc-ai-result" class="sc-ai-result sc-ai-result-input" hidden rows="4" spellcheck="true" placeholder="AI suggestion appears here — edit or copy."></textarea>
              </div>
            </div>
            <div id="sc-coach-guides-panel" class="sc-coach-panel" data-panel="guides" hidden>
              <button id="sc-reader-toggle" class="sc-reader-btn-toggle">Paramedic Method Guide</button>
              <button id="sc-reader-advanced-toggle" class="sc-reader-btn-toggle">Advanced Structure Guide</button>
              <button id="sc-reader-bdd-toggle" class="sc-reader-btn-toggle">Scenario Scaffold Guide</button>
              <div class="sc-example-divider"></div>
              <div class="sc-example-header">Reference examples</div>
              <div id="sc-drawer-examples">
                <div id="sc-example-passive" class="sc-example-section">
                  <div class="sc-example-label sc-color-situation">Hidden action</div>
                  <div class="sc-example-bad">"The report was sent by me"</div>
                  <div class="sc-example-arrow">&darr;</div>
                  <div class="sc-example-good">"I sent the report"</div>
                </div>
                <div id="sc-example-prep" class="sc-example-section">
                  <div class="sc-example-label sc-color-complication">Frames</div>
                  <div class="sc-example-bad">"In this URL, find the Better Tips section"</div>
                  <div class="sc-example-arrow">&darr;</div>
                  <div class="sc-example-good">"Locate the Welcome view. Find the Better Tips section."</div>
                </div>
                <div id="sc-example-nominal" class="sc-example-section">
                  <div class="sc-example-label sc-color-nominal">Noun not verb</div>
                  <div class="sc-example-bad">"Give an explanation of the process"</div>
                  <div class="sc-example-arrow">&darr;</div>
                  <div class="sc-example-good">"Explain the process"</div>
                </div>
                <div id="sc-example-filler" class="sc-example-section">
                  <div class="sc-example-label sc-color-filler">Wind-up</div>
                  <div class="sc-example-bad">"It is important to note that the list is unsorted"</div>
                  <div class="sc-example-arrow">&darr;</div>
                  <div class="sc-example-good">"The list is unsorted"</div>
                </div>
                <div id="sc-example-needless" class="sc-example-section">
                  <div class="sc-example-label sc-color-filler">Extra words</div>
                  <div class="sc-example-bad">"In order to finish the task, sort the list"</div>
                  <div class="sc-example-arrow">&darr;</div>
                  <div class="sc-example-good">"To finish the task, sort the list"</div>
                </div>
                <div id="sc-example-spine" class="sc-example-section">
                  <div class="sc-example-label sc-color-spine">Subject-verb gap</div>
                  <div class="sc-example-bad">"The organization customer journey map documents interactions"</div>
                  <div class="sc-example-arrow">&darr;</div>
                  <div class="sc-example-good">"Journey maps document customer interactions"</div>
                  <div class="sc-example-desc">Keep subject and verb close. Six or more words between them stretches the spine.</div>
                </div>
                <div id="sc-example-stack" class="sc-example-section">
                  <div class="sc-example-label sc-color-stack">Noun pile</div>
                  <div class="sc-example-bad">"Early childhood thought disorders misdiagnosis"</div>
                  <div class="sc-example-arrow">&darr;</div>
                  <div class="sc-example-good">"Misdiagnosis of disordered thought in young children"</div>
                  <div class="sc-example-desc">Three or more nouns in a row are hard to parse. Break them with verbs or prepositions.</div>
                </div>
                <div id="sc-example-flow" class="sc-example-section">
                  <div class="sc-example-label sc-color-flow">Missing bridge</div>
                  <div class="sc-example-bad">"The map documents interactions. Banking has similar issues."</div>
                  <div class="sc-example-arrow">&darr;</div>
                  <div class="sc-example-good">"The map documents interactions. Those interactions reveal where banking has similar issues."</div>
                  <div class="sc-example-desc">Each sentence should carry an idea forward — a shared word or transition — so readers ride one thread.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="sc-reader-overlay" role="dialog" aria-modal="true" aria-labelledby="sc-reader-title" aria-hidden="true">
          <div id="sc-reader-header">
            <div id="sc-reader-title">Reference Guide</div>
            <button id="sc-reader-close-btn" class="sc-btn sc-btn-secondary">Close Guide</button>
          </div>
          <div id="sc-reader-content"></div>
          <div id="sc-reader-footer">
            <button type="button" class="sc-btn sc-btn-secondary sc-reader-close-footer">Close Guide</button>
          </div>
        </div>
        <div id="sc-fix-overlay" role="dialog" aria-modal="false" aria-labelledby="sc-fix-title" aria-hidden="true">
          <div id="sc-fix-header">
            <div id="sc-fix-title">Fix sentences</div>
            <div class="sc-fix-header-actions">
              <button type="button" id="sc-fix-generate-all" class="sc-btn sc-btn-secondary">Generate all</button>
              <button type="button" id="sc-fix-close-btn" class="sc-btn sc-btn-secondary">Close</button>
            </div>
          </div>
          <div id="sc-fix-chips"></div>
          <div id="sc-fix-cols-head">
            <div>Your sentence</div>
            <div>Rewrite (editable)</div>
          </div>
          <div id="sc-fix-list"></div>
        </div>
        <div id="sc-compare-overlay" role="dialog" aria-modal="true" aria-labelledby="sc-compare-title" aria-hidden="true">
          <div id="sc-compare-header">
            <div id="sc-compare-title">Rewrite Workshop</div>
            <div id="sc-compare-actions">
              <button id="sc-compare-copy" class="sc-btn sc-btn-secondary">Copy my draft</button>
              <button id="sc-compare-apply" class="sc-btn sc-btn-secondary">Apply to editor</button>
              <button id="sc-compare-hide-btn" class="sc-btn sc-btn-secondary">Hide workshop</button>
              <button id="sc-compare-close-btn" class="sc-btn sc-btn-secondary">Discard workshop</button>
            </div>
          </div>
          <div id="sc-compare-body">
            <div class="sc-compare-col">
              <div class="sc-compare-col-title">Your source text</div>
              <div id="sc-compare-issues" class="sc-compare-issues"></div>
              <div id="sc-compare-original" class="sc-compare-text"></div>
            </div>
            <div class="sc-compare-col sc-compare-col-draft">
              <label for="sc-compare-rewrite" class="sc-compare-col-title">My draft</label>
              <div id="sc-compare-status" class="sc-compare-status" hidden role="status" aria-live="polite"></div>
              <div class="sc-workshop-scaffolds">
                <button type="button" class="sc-btn sc-btn-secondary sc-btn-sm" data-workshop-scaffold="up">Move Up</button>
                <button type="button" class="sc-btn sc-btn-secondary sc-btn-sm" data-workshop-scaffold="down">Move Down</button>
                <button type="button" class="sc-btn sc-btn-secondary sc-btn-sm" data-workshop-scaffold="wide">Move Wide</button>
              </div>
              <textarea id="sc-compare-rewrite" class="sc-compare-text" spellcheck="true"></textarea>
              <div class="sc-ai-lane">
                <label for="sc-compare-ai" class="sc-compare-col-title sc-ai-lane-title">AI suggestion</label>
                <textarea id="sc-compare-ai" class="sc-compare-text sc-compare-ai" readonly spellcheck="true" aria-readonly="true"></textarea>
                <div class="sc-ai-lane-actions">
                  <button type="button" id="sc-compare-generate" class="sc-btn sc-btn-secondary">Generate</button>
                  <button type="button" id="sc-compare-insert-replace" class="sc-btn sc-btn-secondary">Insert (replace all)</button>
                  <button type="button" id="sc-compare-insert-append" class="sc-btn sc-btn-secondary">Insert (append)</button>
                  <button type="button" id="sc-compare-insert-selection" class="sc-btn sc-btn-secondary">Insert (selection)</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="sc-apply-modal" role="dialog" aria-modal="true" aria-labelledby="sc-apply-title" aria-hidden="true">
          <div class="sc-apply-card">
            <header class="sc-apply-header">
              <h2 id="sc-apply-title">Apply to editor</h2>
              <button type="button" id="sc-apply-modal-close" class="sc-btn sc-btn-secondary" aria-label="Close">&times;</button>
            </header>
            <div id="sc-apply-body" class="sc-apply-body"></div>
            <footer class="sc-apply-footer">
              <button type="button" id="sc-apply-copy" class="sc-btn sc-btn-primary">Copy to clipboard</button>
              <button type="button" id="sc-apply-replace" class="sc-btn sc-btn-secondary">Replace editor text</button>
              <button type="button" id="sc-apply-cancel" class="sc-btn sc-btn-secondary">Cancel</button>
            </footer>
          </div>
        </div>
        <div id="sc-undo-toast" hidden role="status" aria-live="polite">
          Applied to editor.
          <button type="button" id="sc-undo-btn" class="sc-link-btn">Undo</button>
        </div>
        <div id="sc-settings-modal" role="dialog" aria-modal="true" aria-labelledby="sc-settings-title" aria-hidden="true">
          <div class="sc-settings-card">
            <header class="sc-settings-header">
              <h2 id="sc-settings-title">Settings</h2>
              <button id="sc-settings-close" class="sc-btn sc-btn-secondary" aria-label="Close settings">&times;</button>
            </header>
            <form id="sc-settings-form">
              <p class="sc-settings-note sc-settings-note-top">Highlights and coaching work without a key. AI suggestions need a provider or Ollama.</p>
              <p id="sc-settings-connection-line" class="sc-settings-connection-line">Manual mode · highlights work without AI</p>
              <label for="sc-settings-provider">LLM Provider</label>
              <select id="sc-settings-provider">
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="groq">Groq (Llama 3)</option>
                <option value="openai-compat">OpenAI-compatible</option>
                <option value="ollama">Ollama (local, no key)</option>
              </select>
              <div id="sc-settings-base-url-row" hidden>
                <label for="sc-settings-base-url">Base URL</label>
                <input type="text" id="sc-settings-base-url" placeholder="https://api.openai.com/v1" autocomplete="off" spellcheck="false" />
              </div>
              <label for="sc-settings-model">Model (optional)</label>
              <input type="text" id="sc-settings-model" placeholder="leave blank for provider default" autocomplete="off" spellcheck="false" />
              <div id="sc-settings-key-row-wrap">
                <label for="sc-settings-key">API Key</label>
                <div class="sc-settings-key-row">
                  <input type="password" id="sc-settings-key" placeholder="Enter your API key" autocomplete="off" spellcheck="false" />
                  <button type="button" id="sc-settings-toggle">Show</button>
                </div>
              </div>
              <div id="sc-settings-help" class="sc-settings-help" hidden>
                <div class="sc-settings-help-text"></div>
                <div class="sc-settings-help-link-row">
                  Get a key here: <a id="sc-settings-help-link" href="#" target="_blank" rel="noopener">link</a>
                </div>
              </div>
              <div id="sc-settings-status" class="sc-settings-status" hidden></div>
              <div class="sc-settings-actions">
                <button type="button" id="sc-settings-test" class="sc-btn sc-btn-secondary">Test connection</button>
                <button type="submit" class="sc-btn sc-btn-primary">Save</button>
              </div>
              <p class="sc-settings-note">Key is stored in the OS keyring. Other settings are stored locally.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}
