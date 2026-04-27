// compromise.js wrapper. The library is loaded as a global via vendor/compromise.min.js,
// so we read it from window.nlp at call time (not at module-load time) to avoid race
// conditions with the script's defer.

export function buildPosContext(text) {
  const verbSet = new Set();
  const properSet = new Set();
  const adjSet = new Set();
  const nlp = typeof window !== 'undefined' ? window.nlp : undefined;
  if (typeof nlp === 'undefined') return { verbSet, properSet, adjSet };
  try {
    const doc = nlp(text);
    const collect = (arr, set) => {
      arr.forEach(phrase => {
        phrase.split(/\s+/).forEach(w => {
          const clean = w.toLowerCase().replace(/[^\w']/g, '');
          if (clean) set.add(clean);
        });
      });
    };
    collect(doc.match('#Verb').out('array'), verbSet);
    collect(doc.match('#ProperNoun').out('array'), properSet);
    collect(doc.match('#Adjective').out('array'), adjSet);
  } catch {}
  return { verbSet, properSet, adjSet };
}

export function findNounStacks(text) {
  const nlp = typeof window !== 'undefined' ? window.nlp : undefined;
  if (typeof nlp === 'undefined') return [];
  const results = [];
  try {
    const doc = nlp(text);
    const phrases = doc.match('#Noun #Noun #Noun+').out('array');
    const counts = new Map();
    phrases.forEach(p => {
      const key = p.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    counts.forEach((count, phraseLower) => {
      const escaped = phraseLower.split(/\s+/)
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('\\s+');
      const rx = new RegExp('\\b' + escaped + '\\b', 'gi');
      let m;
      let found = 0;
      while ((m = rx.exec(text)) !== null && found < count) {
        results.push({ text: m[0], index: m.index });
        found++;
      }
    });
  } catch {}
  return results.sort((a, b) => a.index - b.index);
}
