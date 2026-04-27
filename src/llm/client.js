// LLM client. The HTTP request and the API key both live on the Rust side —
// this file just builds a prompt from the requested type and dispatches the
// `llm_call` Tauri command.

import { buildSentenceRefactorPrompt, buildFullRewritePrompt } from './prompts.js';
import { getConfig } from './settings.js';

export async function callLLM({ type, text, context }) {
  const inv = window.__TAURI__?.core?.invoke;
  if (!inv) throw new Error('Tauri runtime unavailable.');

  const { provider, baseUrl, model } = getConfig();
  const prompt = type === 'rewrite-full'
    ? buildFullRewritePrompt(text)
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
