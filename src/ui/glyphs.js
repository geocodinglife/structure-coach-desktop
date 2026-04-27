// SVG glyph shapes — one per paramedic-rule class.

const SVG_NS = 'http://www.w3.org/2000/svg';

export function drawGlyph(type) {
  const g = document.createElementNS(SVG_NS, 'g');
  g.classList.add('sc-node-base');
  if (type === 'sc-hl-prep') {
    const p = document.createElementNS(SVG_NS, 'polygon');
    p.setAttribute('points', '-10,-8 10,-8 0,10');
    p.classList.add('sc-node-nesting');
    g.appendChild(p);
  } else if (type === 'sc-hl-pass') {
    const p = document.createElementNS(SVG_NS, 'polygon');
    p.setAttribute('points', '8,-10 8,10 -10,0');
    p.classList.add('sc-node-passive');
    g.appendChild(p);
  } else if (type === 'sc-hl-nom') {
    const p = document.createElementNS(SVG_NS, 'polygon');
    p.setAttribute('points', '-9,-6 9,-6 9,6 -9,6');
    p.classList.add('sc-node-nominal');
    g.appendChild(p);
  } else if (type === 'sc-hl-fill') {
    const p = document.createElementNS(SVG_NS, 'polygon');
    p.setAttribute('points', '0,-10 9,-3 6,10 -6,10 -9,-3');
    p.classList.add('sc-node-filler');
    g.appendChild(p);
  } else if (type === 'sc-hl-needless') {
    const p = document.createElementNS(SVG_NS, 'polygon');
    p.setAttribute('points', '0,-10 10,0 0,10 -10,0');
    p.classList.add('sc-node-needless');
    g.appendChild(p);
  } else if (type === 'sc-hl-spine') {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M -10,0 Q -5,-8 0,0 T 10,0');
    path.classList.add('sc-node-spine');
    g.appendChild(path);
  } else if (type === 'sc-hl-stack') {
    const offsets = [-6, 0, 6];
    offsets.forEach(y => {
      const r = document.createElementNS(SVG_NS, 'rect');
      r.setAttribute('x', -9);
      r.setAttribute('y', y - 1.5);
      r.setAttribute('width', 18);
      r.setAttribute('height', 3);
      r.classList.add('sc-node-stack');
      g.appendChild(r);
    });
  } else if (type === 'sc-hl-flow') {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M -10,-4 L -3,4 M 3,-4 L 10,4');
    path.classList.add('sc-node-flow');
    g.appendChild(path);
  }
  return g;
}

export function makeGlyphIcon(cls) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '-12 -12 24 24');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('sc-example-icon');
  svg.appendChild(drawGlyph(cls));
  return svg;
}
