// SVG sentence tree on the right side of the panel.
// Click on a tree node selects the sentence in the editor and opens the drawer.

import { drawGlyph } from './glyphs.js';
import { openDrawerForSentence } from './drawer.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function renderTree(sentences) {
  const container = document.getElementById('sc-tree-content');
  const svg = document.getElementById('sc-tree-svg');
  if (!container || !svg) return;
  container.innerHTML = '';
  if (sentences.length === 0) { svg.setAttribute('height', '100%'); return; }
  const startY = 60, sentenceSpacing = 120, spineX = 80;
  const totalHeight = (sentences.length * sentenceSpacing) + 100;
  svg.setAttribute('height', totalHeight);
  svg.style.height = totalHeight + 'px';

  const trunk = document.createElementNS(SVG_NS, 'line');
  trunk.setAttribute('x1', spineX); trunk.setAttribute('y1', startY);
  trunk.setAttribute('x2', spineX); trunk.setAttribute('y2', startY + (sentences.length - 1) * sentenceSpacing);
  trunk.classList.add('sc-trunk');
  container.appendChild(trunk);

  sentences.forEach((sentence, i) => {
    const y = startY + i * sentenceSpacing;
    const activeStats = sentence.stats.filter(s => s.count > 0);
    const nodeGroup = document.createElementNS(SVG_NS, 'g');
    nodeGroup.setAttribute('transform', `translate(${spineX}, ${y})`);
    nodeGroup.style.cursor = 'pointer';

    const hasError = activeStats.length > 0;
    const hitArea = document.createElementNS(SVG_NS, 'rect');
    hitArea.setAttribute('x', -60);
    hitArea.setAttribute('y', -30);
    hitArea.setAttribute('width', 240);
    hitArea.setAttribute('height', 80 + (activeStats.length * 25));
    hitArea.style.fill = 'transparent';
    hitArea.style.pointerEvents = 'all';
    hitArea.addEventListener('click', (e) => {
      e.stopPropagation();
      const input = document.getElementById('sc-input');
      if (input) {
        const start = input.value.indexOf(sentence.text);
        if (start !== -1) {
          input.focus();
          input.setSelectionRange(start, start + sentence.text.length);
          const before = input.value.slice(0, start);
          const lineNum = (before.match(/\n/g) || []).length;
          const lineHeight = parseFloat(getComputedStyle(input).lineHeight) || 24;
          input.scrollTop = Math.max(0, lineNum * lineHeight - input.clientHeight / 3);
        }
      }
      openDrawerForSentence(sentence);
    });
    nodeGroup.appendChild(hitArea);

    renderMiniTree(nodeGroup, sentence);

    activeStats.forEach((stat, idx) => {
      const glyph = drawGlyph(stat.cls);
      glyph.setAttribute('transform', `translate(0, ${25 + (idx * 25)})`);
      const title = document.createElementNS(SVG_NS, 'title');
      title.textContent = stat.name;
      glyph.appendChild(title);
      nodeGroup.appendChild(glyph);
    });

    if (!hasError) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('r', 8);
      c.classList.add('sc-node-healthy');
      nodeGroup.appendChild(c);
    }
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', -40);
    label.setAttribute('y', 5);
    label.classList.add('sc-node-label');
    label.style.textAnchor = 'end';
    label.style.fontSize = '12px';
    label.textContent = `S${i + 1}`;
    nodeGroup.appendChild(label);
    container.appendChild(nodeGroup);
  });
}

function renderMiniTree(parentGroup, sentence) {
  const nlp = typeof window !== 'undefined' ? window.nlp : undefined;
  if (typeof nlp === 'undefined') return;
  const doc = nlp(sentence.text);
  const structuralPoints = [];
  const root = doc.match('(#Noun|#Verb)').first();
  if (root.found) structuralPoints.push({ text: root.text(), type: 'root' });
  doc.match('#Preposition . .?').forEach(m => structuralPoints.push({ text: m.text(), type: 'nest' }));
  if (sentence.stats.some(s => s.cls === 'sc-hl-pass' && s.count > 0)) {
    const passiveMatch = doc.match('#Passive');
    if (passiveMatch.found) structuralPoints.push({ text: 'REVERSAL: ' + passiveMatch.first().text(), type: 'passive' });
  }
  const displayPoints = structuralPoints.slice(0, 5);
  displayPoints.forEach((pt, i) => {
    const x = 25 + (i * 20);
    const y = i * 18;
    if (i > 0) {
      const line = document.createElementNS(SVG_NS, 'path');
      const prevX = 25 + ((i - 1) * 20);
      const prevY = (i - 1) * 18;
      line.setAttribute('d', `M ${prevX} ${prevY + 5} V ${y} H ${x}`);
      line.classList.add('sc-tree-branch');
      parentGroup.appendChild(line);
    }
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', x + 5);
    t.setAttribute('y', y + 4);
    t.classList.add('sc-tree-text');
    if (pt.type === 'nest') t.style.fill = '#e67e22';
    else if (pt.type === 'passive') t.style.fill = '#3498db';
    else if (pt.type === 'root') t.style.fontWeight = 'bold';
    t.textContent = pt.text.length > 25 ? pt.text.substring(0, 22) + '...' : pt.text;
    parentGroup.appendChild(t);
  });
}
