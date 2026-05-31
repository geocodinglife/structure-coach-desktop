// Apply workshop/fix rewrites to main editor — diff + undo (UX deferred slice).

let undoText = null;
let undoTimer = null;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function simpleDiff(before, after) {
  if (before === after) return '<p class="sc-diff-same">No changes.</p>';
  const max = 1200;
  const b = before.length > max ? before.slice(0, max) + '…' : before;
  const a = after.length > max ? after.slice(0, max) + '…' : after;
  return `
    <div class="sc-diff-cols">
      <div class="sc-diff-col">
        <div class="sc-diff-label">Current editor</div>
        <pre class="sc-diff-pre">${esc(b)}</pre>
      </div>
      <div class="sc-diff-col">
        <div class="sc-diff-label">After apply</div>
        <pre class="sc-diff-pre">${esc(a)}</pre>
      </div>
    </div>`;
}

export function openApplyDiff({ title, before, after, confirmLabel = 'Replace editor text' }) {
  return new Promise((resolve) => {
    const modal = document.getElementById('sc-apply-modal');
    const body = document.getElementById('sc-apply-body');
    const titleEl = document.getElementById('sc-apply-title');
    const copyBtn = document.getElementById('sc-apply-copy');
    const replaceBtn = document.getElementById('sc-apply-replace');
    const cancelBtn = document.getElementById('sc-apply-cancel');
    if (!modal || !body) {
      resolve(false);
      return;
    }

    titleEl.textContent = title || 'Apply to editor';
    body.innerHTML = simpleDiff(before, after);

    const cleanup = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      copyBtn?.removeEventListener('click', onCopy);
      replaceBtn?.removeEventListener('click', onReplace);
      cancelBtn?.removeEventListener('click', onCancel);
    };

    const onCopy = async () => {
      await navigator.clipboard.writeText(after);
      cleanup();
      resolve('copy');
    };

    const onReplace = () => {
      applyFullReplace(after, before);
      cleanup();
      resolve('replace');
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    copyBtn?.addEventListener('click', onCopy);
    replaceBtn?.addEventListener('click', onReplace);
    cancelBtn?.addEventListener('click', onCancel);

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    copyBtn?.focus();
  });
}

export function applyFullReplace(newText, previousText) {
  const input = document.getElementById('sc-input');
  const layer = document.getElementById('sc-highlight-layer');
  if (!input) return;
  undoText = previousText ?? input.value;
  input.value = newText;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  if (layer) {
    requestAnimationFrame(() => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  showUndoToast();
}

export function applySentenceReplace(originalSentence, newSentence) {
  const input = document.getElementById('sc-input');
  if (!input) return false;
  const idx = input.value.indexOf(originalSentence);
  if (idx === -1) return false;

  const before = input.value;
  const after = before.slice(0, idx) + newSentence + before.slice(idx + originalSentence.length);

  return openApplyDiff({
    title: 'Apply sentence fix',
    before,
    after,
  }).then(result => result === 'replace');
}

export function showUndoToast() {
  const toast = document.getElementById('sc-undo-toast');
  if (!toast) return;
  toast.hidden = false;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => { toast.hidden = true; }, 8000);
}

export function undoLastApply() {
  const input = document.getElementById('sc-input');
  if (!input || undoText == null) return;
  input.value = undoText;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  undoText = null;
  const toast = document.getElementById('sc-undo-toast');
  if (toast) toast.hidden = true;
}

export function wireApplyEditor() {
  document.getElementById('sc-undo-btn')?.addEventListener('click', undoLastApply);
  document.getElementById('sc-apply-modal-close')?.addEventListener('click', () => {
    const modal = document.getElementById('sc-apply-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}
