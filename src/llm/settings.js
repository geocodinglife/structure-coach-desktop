// Provider + API key storage. In Tauri this calls into Rust commands that talk to libsecret
// (gnome-keyring / KWallet) via the `keyring` crate, instead of chrome.storage.local.
// TODO: implement getSettings/setSettings via Tauri invoke.

export async function getSettings() {
  return { provider: 'gemini', apiKey: '' };
}

export async function setSettings(_settings) {}
