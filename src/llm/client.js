// LLM client. The HTTP request and the API key both live on the Rust side —
// this file just builds a prompt from the requested type and dispatches the
// `llm_call` Tauri command.

import { buildSentenceRefactorPrompt, buildFullRewritePrompt, buildTaskScaffoldPrompt, buildPingPrompt } from './prompts.js';
import { getConfig } from './settings.js';

export async function callLLM({ type, text, context }) {
  const inv = window.__TAURI__?.core?.invoke;
  if (!inv) throw new Error('Tauri runtime unavailable.');

  const { provider, baseUrl, model } = getConfig();
  const prompt = type === 'rewrite-full'
    ? buildFullRewritePrompt(text)
    : type === 'task-scaffold'
      ? buildTaskScaffoldPrompt(text, context || '')
      : type === 'ping'
        ? buildPingPrompt()
        : buildSentenceRefactorPrompt(text, context);

  return inv('llm_call', {
    req: {
      provider,
      prompt,
      baseUrl: baseUrl || null,
      model: model || null,
    },
  });
}

/** Minimal LLM call to verify provider + key. */
export async function testLLMConnection() {
  const { provider } = getConfig();
  const key = await import('./settings.js').then(m => m.getApiKey());
  const presetNeedsKey = provider !== 'ollama';
  if (presetNeedsKey && !key) {
    throw new Error('No API key — manual mode only.');
  }
  await callLLM({ type: 'ping', text: '', context: '' });
  return provider;
}
