// Settings modal: choose LLM provider, optionally a base URL + model, and the API key.
// Provider/base URL/model live in localStorage. The API key is stored in the OS keyring
// via the `set_api_key` Tauri command.

import { getConfig, setConfig, getApiKey, setApiKey } from '../llm/settings.js';

const PRESETS = {
  gemini: {
    needsKey: true, needsBaseUrl: false, defaultModel: 'gemini-2.5-flash',
    keyUrl: 'https://aistudio.google.com/apikey',
    help: 'Free tier available. Sign in with a Google account → "Create API key". Paste it below.',
  },
  anthropic: {
    needsKey: true, needsBaseUrl: false, defaultModel: 'claude-3-5-haiku-latest',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    help: 'Paid only. Add credit in the console, then create an API key starting with sk-ant-.',
  },
  groq: {
    needsKey: true, needsBaseUrl: false, defaultModel: 'llama-3.3-70b-versatile',
    keyUrl: 'https://console.groq.com/keys',
    help: 'Free tier is generous. Sign in, create an API key starting with gsk_.',
  },
  'openai-compat': {
    needsKey: true, needsBaseUrl: true, defaultModel: 'gpt-4o-mini',
    keyUrl: 'https://openrouter.ai/keys',
    help: 'Pick any provider that speaks OpenAI\'s /v1/chat/completions API. Common base URLs: OpenAI → https://api.openai.com/v1 · OpenRouter (recommended, one key for many models) → https://openrouter.ai/api/v1 · Together → https://api.together.xyz/v1 · DeepSeek → https://api.deepseek.com/v1',
  },
  ollama: {
    needsKey: false, needsBaseUrl: true, defaultModel: 'llama3.2',
    defaultBaseUrl: 'http://localhost:11434/v1',
    keyUrl: 'https://ollama.com/download',
    help: 'Local, free, no key. Install Ollama, then run `ollama pull llama3.2` and `ollama serve` (it usually auto-starts on Linux).',
  },
};

export async function openSettingsModal() {
  const modal = document.getElementById('sc-settings-modal');
  if (!modal) return;
  const { provider, baseUrl, model } = getConfig();
  modal.querySelector('#sc-settings-provider').value = provider;
  modal.querySelector('#sc-settings-base-url').value = baseUrl;
  modal.querySelector('#sc-settings-model').value = model;
  modal.querySelector('#sc-settings-key').value = await getApiKey();
  modal.querySelector('#sc-settings-status').hidden = true;
  syncProviderUI(modal);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => modal.querySelector('#sc-settings-key').focus(), 50);
}

export function closeSettingsModal() {
  const modal = document.getElementById('sc-settings-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

export function wireSettingsModal() {
  const modal = document.getElementById('sc-settings-modal');
  if (!modal) return;
  const form = modal.querySelector('#sc-settings-form');
  const status = modal.querySelector('#sc-settings-status');
  const closeBtn = modal.querySelector('#sc-settings-close');
  const toggle = modal.querySelector('#sc-settings-toggle');
  const keyInput = modal.querySelector('#sc-settings-key');
  const providerSel = modal.querySelector('#sc-settings-provider');

  closeBtn.addEventListener('click', closeSettingsModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeSettingsModal(); });

  modal.querySelector('#sc-settings-help-link').addEventListener('click', (e) => {
    e.preventDefault();
    const url = e.currentTarget.href;
    const opener = window.__TAURI__?.opener?.openUrl;
    if (opener) opener(url);
  });

  providerSel.addEventListener('change', () => syncProviderUI(modal));

  toggle.addEventListener('click', () => {
    const showing = keyInput.type === 'text';
    keyInput.type = showing ? 'password' : 'text';
    toggle.textContent = showing ? 'Show' : 'Hide';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const provider = providerSel.value;
    const preset = PRESETS[provider];
    const baseUrl = modal.querySelector('#sc-settings-base-url').value.trim();
    const model = modal.querySelector('#sc-settings-model').value.trim();
    const apiKey = keyInput.value.trim();

    if (preset.needsKey && !apiKey) {
      showStatus(status, 'API key required for this provider.', 'error');
      return;
    }
    if (preset.needsBaseUrl && !baseUrl) {
      showStatus(status, 'Base URL required for this provider.', 'error');
      return;
    }
    if (provider === 'anthropic' && apiKey && !apiKey.startsWith('sk-ant-')) {
      showStatus(status, 'Anthropic keys usually start with sk-ant-.', 'error');
      return;
    }
    if (provider === 'groq' && apiKey && !apiKey.startsWith('gsk_')) {
      showStatus(status, 'Groq keys usually start with gsk_.', 'error');
      return;
    }

    setConfig({ provider, baseUrl, model });
    try {
      await setApiKey(apiKey);
    } catch (err) {
      showStatus(status, 'Failed to save key: ' + err, 'error');
      return;
    }
    showStatus(status, 'Saved to OS keyring.', 'success');
    const refresh = window.__sc_refreshKeyState;
    if (typeof refresh === 'function') refresh();
    setTimeout(closeSettingsModal, 700);
  });
}

function syncProviderUI(modal) {
  const provider = modal.querySelector('#sc-settings-provider').value;
  const preset = PRESETS[provider] || {};
  const baseRow = modal.querySelector('#sc-settings-base-url-row');
  const modelInput = modal.querySelector('#sc-settings-model');
  const baseInput = modal.querySelector('#sc-settings-base-url');
  const keyRow = modal.querySelector('#sc-settings-key-row-wrap');
  const helpEl = modal.querySelector('#sc-settings-help');
  const helpLink = modal.querySelector('#sc-settings-help-link');

  baseRow.hidden = !preset.needsBaseUrl;
  keyRow.hidden = !preset.needsKey;

  modelInput.placeholder = preset.defaultModel || '';
  baseInput.placeholder = preset.defaultBaseUrl || '';

  if (helpEl && helpLink) {
    if (preset.help) {
      helpEl.querySelector('.sc-settings-help-text').textContent = preset.help;
      helpEl.hidden = false;
    } else {
      helpEl.hidden = true;
    }
    if (preset.keyUrl) {
      helpLink.href = preset.keyUrl;
      helpLink.textContent = preset.keyUrl;
      helpLink.hidden = false;
    } else {
      helpLink.hidden = true;
    }
  }
}

function showStatus(el, message, kind) {
  el.textContent = message;
  el.className = 'sc-settings-status sc-settings-status--' + kind;
  el.hidden = false;
}
