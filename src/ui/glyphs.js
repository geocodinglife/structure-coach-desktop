// SVG glyph shapes used in the tree and reference drawer (one shape per rule class).
// TODO: port drawGlyph, makeGlyphIcon from extension content.js.

export function drawGlyph(_type) {
  return document.createElementNS('http://www.w3.org/2000/svg', 'g');
}

export function makeGlyphIcon(_cls) {
  return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
}
