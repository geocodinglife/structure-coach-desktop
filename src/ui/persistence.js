// Draft persistence — main editor + workshop (UX slice 4).

const MAIN_KEY = 'sc.draft.main';
const WORKSHOP_KEY = 'sc.draft.workshop';
const DEBOUNCE_MS = 400;

let mainTimer = null;
let workshopTimer = null;

export function saveMainDraft(text) {
  clearTimeout(mainTimer);
  mainTimer = setTimeout(() => {
    try {
      localStorage.setItem(MAIN_KEY, text);
      localStorage.setItem(MAIN_KEY + '.ts', String(Date.now()));
    } catch { /* quota */ }
  }, DEBOUNCE_MS);
}

export function saveWorkshopDraft(data) {
  clearTimeout(workshopTimer);
  workshopTimer = setTimeout(() => {
    try {
      if (data) localStorage.setItem(WORKSHOP_KEY, JSON.stringify(data));
      else localStorage.removeItem(WORKSHOP_KEY);
    } catch { /* quota */ }
  }, DEBOUNCE_MS);
}

export function clearWorkshopDraft() {
  try {
    localStorage.removeItem(WORKSHOP_KEY);
  } catch { /* ignore */ }
}

export function loadMainDraft() {
  try {
    return localStorage.getItem(MAIN_KEY) || '';
  } catch {
    return '';
  }
}

export function loadWorkshopDraft() {
  try {
    const raw = localStorage.getItem(WORKSHOP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function showRestorePrompt(onRestoreMain, onRestoreWorkshop) {
  const main = loadMainDraft();
  const workshop = loadWorkshopDraft();
  if (!main.trim() && !workshop) return;

  const banner = document.getElementById('sc-restore-banner');
  if (!banner) return;

  const parts = [];
  if (main.trim()) parts.push('editor text');
  if (workshop) parts.push('rewrite workshop');

  banner.querySelector('.sc-restore-text').textContent =
    `Restore saved ${parts.join(' and ')}?`;
  banner.hidden = false;

  banner.querySelector('#sc-restore-yes')?.addEventListener('click', () => {
    if (main.trim()) onRestoreMain(main);
    if (workshop) onRestoreWorkshop(workshop);
    banner.hidden = true;
  }, { once: true });

  banner.querySelector('#sc-restore-dismiss')?.addEventListener('click', () => {
    banner.hidden = true;
  }, { once: true });
}
