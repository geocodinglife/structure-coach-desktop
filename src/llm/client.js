// LLM provider switch. In Tauri we can either fetch directly from the renderer
// or proxy through a Rust command (see src-tauri/src/lib.rs). Plan: proxy through Rust
// so the API key stays in the OS keyring and never lives in the renderer.
// TODO: port callGemini, callAnthropic, callGroq from extension background.js.

export async function callLLM({ type, text, context }) {
  throw new Error('LLM client not wired yet');
}
