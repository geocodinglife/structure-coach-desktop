// compromise.js wrapper — POS tagging context for filters.
// TODO: port buildPosContext, findNounStacks from extension content.js.

export function buildPosContext(_text) {
  return { verbSet: new Set(), properSet: new Set(), adjSet: new Set() };
}

export function findNounStacks(_text) {
  return [];
}
