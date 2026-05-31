// "What's working" positive feedback heuristics (UX slice 2b).

const ACTION_VERBS = /\b(?:locate|find|sort|add|remove|update|create|delete|fix|move|change|set|get|send|write|read|build|run|open|close|check|verify|implement|document|explain|describe|list|show|hide|enable|disable)\b/i;
const BRIDGE_WORDS = /\b(?:this|that|these|those|it|they|which|such|also|then|therefore|because|so|but|however)\b/i;
const CONSTRAINT_WORDS = /\b(?:only|just|do not|don't|must not|never|always|exactly|without changing)\b/i;

export function computePositiveChecks(text, sentences) {
  if (!text.trim()) return [];
  const out = [];
  const trimmed = text.trim();

  if (ACTION_VERBS.test(trimmed)) {
    out.push('Clear action verb found');
  }

  if (/\b(?:section|page|view|file|list|module|url|path|folder|screen|tab|field|column|row|table|button|form)\b/i.test(trimmed)) {
    out.push('Specific target named');
  }

  if (sentences.length >= 2) {
    const prev = sentences[sentences.length - 2]?.text?.toLowerCase() || '';
    const curr = sentences[sentences.length - 1]?.text?.toLowerCase() || '';
    const prevWords = new Set(prev.match(/\b[a-z]{4,}\b/g) || []);
    const currWords = curr.match(/\b[a-z]{4,}\b/g) || [];
    const overlap = currWords.some(w => prevWords.has(w));
    if (overlap || BRIDGE_WORDS.test(curr)) {
      out.push('Bridge connects to previous sentence');
    }
  }

  if (CONSTRAINT_WORDS.test(trimmed)) {
    out.push('Constraint stated');
  }

  if (/\b(?:because|so that|since|matters|important|need|reason|why)\b/i.test(trimmed)) {
    out.push('Why or reason present');
  }

  return out.slice(0, 3);
}

export function renderPositiveRow(el, checks) {
  if (!el) return;
  if (checks.length === 0) {
    el.innerHTML = '<span class="sc-positive-empty">What\'s working: write a sentence to see strengths.</span>';
    el.hidden = false;
    return;
  }
  const items = checks.map(c => `<span class="sc-positive-item">✓ ${c}</span>`).join('');
  el.innerHTML = `<span class="sc-positive-label">What's working:</span> ${items}`;
  el.hidden = false;
}
