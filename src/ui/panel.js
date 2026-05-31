// Mounts the entire Structure Coach panel into the given root element.
// The desktop window IS the panel — no per-tab toggling, no previous-element focus dance.

import { analyzeText } from '../analysis/analyzer.js';
import { EXAMPLE_ID_TO_CLS } from '../analysis/rules.js';
import { renderTree } from './tree.js';
import { makeGlyphIcon } from './glyphs.js';
import { refactorSelectedSentence, closeDrawer } from './drawer.js';
import { openReader, closeReader } from './overlays/reader.js';
import {
  rewriteFullText,
  closeCompare,
  hideCompare,
  openStoredCompare,
  markRewriteDirty,
  getCompareSourceText,
  refreshCompareResumeButton,
} from './overlays/compare.js';
import { openFixOverlay, closeFixOverlay, retryFixRow } from './overlays/fix.js';
import { openSettingsModal, closeSettingsModal, wireSettingsModal } from './settings-modal.js';
import { getApiKey } from '../llm/settings.js';
import { getParamedicMethodHTML } from '../guides/paramedic.js';
import { getAdvancedStructureHTML } from '../guides/advanced-structure.js';
import { getBDDGuidanceHTML } from '../guides/bdd.js';

let lastSentences = [];
let lastText = '';

export function mountPanel(root) {
  if (!root) return;
  root.innerHTML = panelMarkup();

  // Decorate reference-drawer example labels with their glyph icon.
  root.querySelectorAll('.sc-example-section[id^="sc-example-"]').forEach(section => {
    const cls = EXAMPLE_ID_TO_CLS[section.id];
    if (!cls) return;
    const label = section.querySelector('.sc-example-label');
    if (label) label.prepend(makeGlyphIcon(cls));
  });

  wireEvents(root);
  wireSettingsModal();
  window.__sc_refreshKeyState = refreshKeyState;
  refreshKeyState();
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

  document.getElementById('sc-ai-rewrite').addEventListener('click', rewriteFullText);
  const compareResume = document.getElementById('sc-compare-resume');
  const compareRewrite = document.getElementById('sc-compare-rewrite');
  if (compareResume) compareResume.addEventListener('click', openStoredCompare);
  if (compareRewrite) compareRewrite.addEventListener('input', markRewriteDirty);

  document.getElementById('sc-settings-btn').addEventListener('click', openSettingsModal);

  document.getElementById('sc-hide-btn').addEventListener('click', () => {
    window.__TAURI__?.webviewWindow?.getCurrent()?.hide();
  });

  document.getElementById('sc-setup-open').addEventListener('click', openSettingsModal);
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

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest('#sc-drawer-close')) { closeDrawer(); return; }
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
        openFixOverlay(cls, sentences, src);
        refreshCompareResumeButton();
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
    navigator.clipboard.writeText(rewriteEl.value || rewriteEl.textContent || '');
    const btn = document.getElementById('sc-compare-copy');
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    clearTimeout(btn._hideTimer);
    btn._hideTimer = setTimeout(() => { btn.textContent = original; }, 1200);
  });

  document.getElementById('sc-error-count').addEventListener('click', (e) => {
    const btn = e.target.closest('.sc-stat');
    if (!btn) return;
    const cls = btn.getAttribute('data-cls');
    if (cls) openFixOverlay(cls, lastSentences, lastText);
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
      closeDrawer();
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
  copyBtn.disabled = !text.trim();
  if (aiBtn && !aiBtn.dataset.busy) aiBtn.disabled = !text.trim();

  requestAnimationFrame(() => {
    const { html, stats, sentences } = analyzeText(text);

    lastSentences = sentences;
    lastText = text;

    layer.innerHTML = html;
    renderTree(sentences);

    const wordCount = text.match(/\S+/g)?.length || 0;
    if (wordCount === 0) { report.innerHTML = ''; return; }

    const parts = [];
    const weakCount = stats
      .filter(s => s.cls === 'sc-hl-pass')
      .reduce((sum, s) => sum + s.count, 0);

    const prepRule = stats.find(s => s.cls === 'sc-hl-prep');
    const nomRule = stats.find(s => s.cls === 'sc-hl-nom');
    const fillRule = stats.find(s => s.cls === 'sc-hl-fill');
    const needlessRule = stats.find(s => s.cls === 'sc-hl-needless');
    const spineRule = stats.find(s => s.cls === 'sc-hl-spine');
    const stackRule = stats.find(s => s.cls === 'sc-hl-stack');
    const flowRule = stats.find(s => s.cls === 'sc-hl-flow');

    const chip = (variant, cls, label, count) =>
      `<button type="button" class="sc-stat sc-stat--${variant}" data-cls="${cls}" aria-label="${label}: ${count}. Open reference">${label}: ${count}</button>`;

    if (weakCount > 0) parts.push(chip('pass', 'sc-hl-pass', 'Weak', weakCount));
    if (prepRule && prepRule.count > 0) parts.push(chip('prep', 'sc-hl-prep', 'Prep', prepRule.count));
    if (nomRule && nomRule.count > 0) parts.push(chip('nom', 'sc-hl-nom', 'Nom', nomRule.count));
    if (fillRule && fillRule.count > 0) parts.push(chip('fill', 'sc-hl-fill', 'Fill', fillRule.count));
    if (needlessRule && needlessRule.count > 0) parts.push(chip('needless', 'sc-hl-needless', 'Needless', needlessRule.count));
    if (spineRule && spineRule.count > 0) parts.push(chip('spine', 'sc-hl-spine', 'Spine', spineRule.count));
    if (stackRule && stackRule.count > 0) parts.push(chip('stack', 'sc-hl-stack', 'Stack', stackRule.count));
    if (flowRule && flowRule.count > 0) parts.push(chip('flow', 'sc-hl-flow', 'Flow', flowRule.count));

    report.innerHTML = parts.join(' ');
  });
}

function panelMarkup() {
  return `
    <div id="sc-panel" role="application" aria-label="Structure Coach">
      <div id="sc-setup-banner" style="display: none">
        <span class="sc-setup-icon" aria-hidden="true">✨</span>
        <span class="sc-setup-text">No AI provider set up yet. Add a key (Gemini is free) or pick Ollama for local-only — then AI Rewrite and per-rule Smart Fix become active.</span>
        <button type="button" id="sc-setup-open" class="sc-btn sc-btn-primary">Open Settings</button>
        <button type="button" id="sc-setup-dismiss" class="sc-setup-x" aria-label="Dismiss">&times;</button>
      </div>
      <div id="sc-body">
        <div id="sc-main">
          <div id="sc-left">
            <div id="sc-core-question">Does the other person have enough context?</div>
            <div id="sc-editor-wrap">
              <div id="sc-highlight-layer" aria-hidden="true"></div>
              <textarea id="sc-input" placeholder="Start writing here..."></textarea>
            </div>
            <div id="sc-toolbar">
              <div id="sc-error-count"></div>
              <div id="sc-actions">
                <button id="sc-ai-rewrite" class="sc-btn sc-btn-primary sc-btn-ai" disabled>✨ AI Rewrite</button>
                <button id="sc-copy" class="sc-btn sc-btn-primary" disabled>Copy</button>
                <button id="sc-hide-btn" class="sc-btn sc-btn-secondary" title="Hide to Tray">Hide</button>
                <button id="sc-settings-btn" class="sc-btn sc-btn-secondary" title="Settings">Settings</button>
                <div id="sc-copied-toast" hidden>Copied!</div>
              </div>
            </div>
          </div>
          <div id="sc-right">
            <div id="sc-tree-container">
              <svg id="sc-tree-svg" xmlns="http://www.w3.org/2000/svg">
                <g id="sc-tree-content"></g>
              </svg>
            </div>
          </div>
        </div>
        <button id="sc-compare-resume" class="sc-btn sc-btn-primary sc-compare-resume" hidden>Open Rewrite Draft</button>
        <div id="sc-drawer" role="dialog" aria-modal="false" aria-labelledby="sc-drawer-title" aria-hidden="true">
          <div id="sc-drawer-header">
            <div id="sc-drawer-title">Reference Guide</div>
            <button id="sc-drawer-close" aria-label="Close reference guide">&times;</button>
          </div>
          <div id="sc-drawer-content">
            <div class="sc-example-header">Context Checklist</div>
            <div class="sc-example-section"><div class="sc-rule">Readers cannot read your mind. Provide the context they need.</div></div>
            <div id="sc-ai-coach" class="sc-example-section sc-ai-coach">
              <div class="sc-example-label sc-color-ai">✨ Smart Fix (AI)</div>
              <div id="sc-ai-target-text" class="sc-ai-target-text">Select a sentence node to refactor.</div>
              <button id="sc-ai-refactor-btn" class="sc-btn sc-btn-primary sc-ai-refactor-btn" disabled>Refactor with AI</button>
              <div id="sc-ai-result" class="sc-ai-result" hidden></div>
            </div>
            <div class="sc-example-divider"></div>
            <div id="sc-example-passive" class="sc-example-section">
              <div class="sc-example-label sc-color-situation">Passive Voice</div>
              <div class="sc-example-bad">"The report was sent by me"</div>
              <div class="sc-example-arrow">&darr;</div>
              <div class="sc-example-good">"I sent the report"</div>
            </div>
            <div id="sc-example-nominal" class="sc-example-section">
              <div class="sc-example-label sc-color-nominal">Nominalizations</div>
              <div class="sc-example-bad">"Give an explanation"</div>
              <div class="sc-example-arrow">&darr;</div>
              <div class="sc-example-good">"Explain"</div>
            </div>
            <div id="sc-example-prep" class="sc-example-section">
              <div class="sc-example-label sc-color-complication">Prepositions (Nesting)</div>
              <div class="sc-example-bad">"Decision of the manager"</div>
              <div class="sc-example-arrow">&darr;</div>
              <div class="sc-example-good">"Manager's decision"</div>
            </div>
            <div id="sc-example-filler" class="sc-example-section">
              <div class="sc-example-label sc-color-filler">Filler / Wind-ups</div>
              <div class="sc-example-bad">"It is important to note that"</div>
              <div class="sc-example-arrow">&darr;</div>
              <div class="sc-example-good">"Note that"</div>
            </div>
            <div id="sc-example-needless" class="sc-example-section">
              <div class="sc-example-label sc-color-filler">Needless Words (Omit!)</div>
              <div class="sc-example-bad">"In order to achieve the goal"</div>
              <div class="sc-example-arrow">&darr;</div>
              <div class="sc-example-good">"To achieve the goal"</div>
            </div>
            <div id="sc-example-spine" class="sc-example-section">
              <div class="sc-example-label sc-color-spine">Spine Check</div>
              <div class="sc-example-bad">"The organization customer journey map documents..."</div>
              <div class="sc-example-arrow">&darr;</div>
              <div class="sc-example-good">"Journey maps document..."</div>
              <div class="sc-example-desc">Keep the subject and verb close. If they are separated by 6+ words, the "spine" is broken.</div>
            </div>
            <div id="sc-example-stack" class="sc-example-section">
              <div class="sc-example-label sc-color-stack">Noun Stack</div>
              <div class="sc-example-bad">"Early childhood thought disorders misdiagnosis"</div>
              <div class="sc-example-arrow">&darr;</div>
              <div class="sc-example-good">"Misdiagnosis of disordered thought in young children"</div>
              <div class="sc-example-desc">3+ nouns in a row create a "noun-like monster" that's hard to parse. Break them up with verbs or prepositions.</div>
            </div>
            <div id="sc-example-flow" class="sc-example-section">
              <div class="sc-example-label sc-color-flow">Flow (sentence link)</div>
              <div class="sc-example-bad">"The map documents interactions. Banking has similar issues."</div>
              <div class="sc-example-arrow">&darr;</div>
              <div class="sc-example-good">"The map documents interactions. Those interactions reveal where banking has similar issues."</div>
              <div class="sc-example-desc">Each sentence should pick up something from the previous one — a shared noun or a transition word — so readers ride one thread instead of jumping between islands.</div>
            </div>
            <div class="sc-example-divider"></div>
            <button id="sc-reader-toggle" class="sc-reader-btn-toggle">Open Full Paramedic Method Guide</button>
            <button id="sc-reader-advanced-toggle" class="sc-reader-btn-toggle">Advanced Structure Guide (Spine &amp; Flow)</button>
            <button id="sc-reader-bdd-toggle" class="sc-reader-btn-toggle">Scenario Scaffold (Protagonist-First)</button>
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
            <div id="sc-fix-title">Fix</div>
            <button type="button" id="sc-fix-close-btn" class="sc-btn sc-btn-secondary">Close</button>
          </div>
          <div id="sc-fix-chips"></div>
          <div id="sc-fix-cols-head">
            <div>Your sentence</div>
            <div>AI rewrite</div>
          </div>
          <div id="sc-fix-list"></div>
        </div>
        <div id="sc-compare-overlay" role="dialog" aria-modal="true" aria-labelledby="sc-compare-title" aria-hidden="true">
          <div id="sc-compare-header">
            <div id="sc-compare-title">AI Rewrite — Compare</div>
            <div id="sc-compare-actions">
              <button id="sc-compare-copy" class="sc-btn sc-btn-secondary" disabled>Copy Rewrite</button>
              <button id="sc-compare-hide-btn" class="sc-btn sc-btn-secondary">Hide</button>
              <button id="sc-compare-close-btn" class="sc-btn sc-btn-secondary">Discard</button>
            </div>
          </div>
          <div id="sc-compare-body">
            <div class="sc-compare-col">
              <div class="sc-compare-col-title">Your text</div>
              <div id="sc-compare-issues" class="sc-compare-issues"></div>
              <div id="sc-compare-original" class="sc-compare-text"></div>
            </div>
            <div class="sc-compare-col">
              <div class="sc-compare-col-title">Rewrite <span class="sc-compare-col-hint">(editable)</span></div>
              <div id="sc-compare-status" class="sc-compare-status" hidden></div>
              <textarea id="sc-compare-rewrite" class="sc-compare-text" spellcheck="true"></textarea>
            </div>
          </div>
        </div>
        <div id="sc-settings-modal" role="dialog" aria-modal="true" aria-labelledby="sc-settings-title" aria-hidden="true">
          <div class="sc-settings-card">
            <header class="sc-settings-header">
              <h2 id="sc-settings-title">Settings</h2>
              <button id="sc-settings-close" class="sc-btn sc-btn-secondary" aria-label="Close settings">&times;</button>
            </header>
            <form id="sc-settings-form">
              <label for="sc-settings-provider">LLM Provider</label>
              <select id="sc-settings-provider">
                <option value="gemini">Google Gemini</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="groq">Groq (Llama 3)</option>
                <option value="openai-compat">OpenAI-compatible (OpenAI, OpenRouter, Together, vLLM, …)</option>
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

              <button type="submit" class="sc-btn sc-btn-primary">Save</button>
              <p class="sc-settings-note">Key is stored in the OS keyring (Secret Service / GNOME Keyring / KWallet on Linux). Other settings are stored locally.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}
