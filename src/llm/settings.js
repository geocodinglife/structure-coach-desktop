// Provider config (non-secret) lives in localStorage.
// API key lives in the OS keyring via the `set_api_key` / `get_api_key` Tauri commands.

const PROVIDER_KEY = 'sc.llmProvider';
const BASE_URL_KEY = 'sc.baseUrl';
const MODEL_KEY = 'sc.model';

const invoke = () => window.__TAURI__?.core?.invoke;

export function getConfig() {
  return {
    provider: localStorage.getItem(PROVIDER_KEY) || 'gemini',
    baseUrl: localStorage.getItem(BASE_URL_KEY) || '',
    model: localStorage.getItem(MODEL_KEY) || '',
  };
}

export function setConfig({ provider, baseUrl, model }) {
  if (provider) localStorage.setItem(PROVIDER_KEY, provider);
  if (typeof baseUrl === 'string') localStorage.setItem(BASE_URL_KEY, baseUrl);
  if (typeof model === 'string') localStorage.setItem(MODEL_KEY, model);
}

export async function getApiKey() {
  const inv = invoke();
  if (!inv) return '';
  try {
    return await inv('get_api_key');
  } catch {
    return '';
  }
}

export async function setApiKey(key) {
  const inv = invoke();
  if (!inv) throw new Error('Tauri runtime unavailable.');
  await inv('set_api_key', { key });
}
