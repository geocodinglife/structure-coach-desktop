// Top-level analyzer: orchestrates rules + flow + POS context, returns { html, stats, sentences }.
// TODO: port analyzeText, collectMatches from extension content.js.

export function analyzeText(_text) {
  return { html: '', stats: [], sentences: [] };
}
