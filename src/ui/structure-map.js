// Structure Map Phase 0 — compact sentence list (UX slice 5).

export function renderStructureMap(sentences) {
  const list = document.getElementById('sc-structure-list');
  if (!list) return;
  list.innerHTML = '';

  if (sentences.length === 0) {
    list.innerHTML = '<li class="sc-structure-empty">Sentences appear here as you write.</li>';
    return;
  }

  sentences.forEach((sentence, i) => {
    const li = document.createElement('li');
    li.className = 'sc-structure-item';
    const preview = sentence.text.trim().replace(/\s+/g, ' ');
    const short = preview.length > 48 ? preview.slice(0, 45) + '…' : preview;
    const issueCount = sentence.stats.filter(s => s.count > 0).length;
    const issueLabel = issueCount === 0 ? '✓' : `${issueCount} check${issueCount > 1 ? 's' : ''}`;

    li.innerHTML = `
      <span class="sc-structure-num">S${i + 1}</span>
      <span class="sc-structure-preview">${esc(short)}</span>
      <span class="sc-structure-issues">${issueLabel}</span>
    `;

    li.addEventListener('click', () => scrollToSentence(sentence.text));
    list.appendChild(li);
  });
}

function scrollToSentence(sText) {
  const input = document.getElementById('sc-input');
  if (!input) return;
  const start = input.value.indexOf(sText);
  if (start === -1) return;
  input.focus();
  input.setSelectionRange(start, start + sText.length);
  const before = input.value.slice(0, start);
  const lineNum = (before.match(/\n/g) || []).length;
  const lineHeight = parseFloat(getComputedStyle(input).lineHeight) || 24;
  input.scrollTop = Math.max(0, lineNum * lineHeight - input.clientHeight / 3);
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function setRightPanelView(view) {
  const map = document.getElementById('sc-structure-map');
  const tree = document.getElementById('sc-tree-container');
  document.querySelectorAll('.sc-panel-view-btn').forEach(b => {
    b.classList.toggle('sc-panel-view-btn--active', b.dataset.view === view);
  });
  if (map) map.hidden = view !== 'map';
  if (tree) tree.hidden = view !== 'tree';
}

export function wirePanelViewToggle() {
  document.querySelectorAll('.sc-panel-view-btn').forEach(btn => {
    btn.addEventListener('click', () => setRightPanelView(btn.dataset.view));
  });
}
