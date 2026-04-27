// Full-screen reader overlay for long-form reference guides.

export function openReader(title, html) {
  const overlay = document.getElementById('sc-reader-overlay');
  const titleEl = document.getElementById('sc-reader-title');
  const contentEl = document.getElementById('sc-reader-content');
  if (!overlay || !titleEl || !contentEl) return;
  titleEl.textContent = title;
  contentEl.innerHTML = html;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

export function closeReader() {
  const overlay = document.getElementById('sc-reader-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
}
