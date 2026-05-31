// Heuristic sentence roles and bridge chains (Structure Map Phase 1).

const ACTION_VERBS = /\b(?:locate|find|sort|add|remove|update|create|delete|fix|move|change|set|get|send|write|read|build|run|open|close|check|verify|implement|document|explain|describe|list|show|hide|enable|disable|click|select|enter|submit|save|load|navigate|go|use|start|stop|try|ensure|make|let|put|keep|give|take|turn|name|define|provide|include|exclude|avoid|follow|complete|finish)\b/i;
const WHY_WORDS = /\b(?:because|so that|since|matters|important|need|reason|why|therefore|so readers|so users|so that)\b/i;
const FRAME_START = /^(?:in|at|on|for|within|inside|during|while|when|where|after|before|from|to|under|over|across)\b/i;
const BRIDGE_WORDS = /\b(?:this|that|these|those|it|they|which|such|also|then|therefore|because|so|but|however|those|the same)\b/i;

const FLOW_STOP = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'in', 'on', 'at', 'to',
  'for', 'of', 'and', 'or', 'but', 'it', 'this', 'that', 'with', 'as', 'by', 'from',
]);

function contentWords(text) {
  return (text.toLowerCase().match(/\b[a-z]{4,}\b/g) || []).filter(w => !FLOW_STOP.has(w));
}

/** @returns {{ role: string, status: string, bridge: string|null, moveHint: string|null }} */
export function analyzeSentenceStructure(sentence, index, prevSentence) {
  const text = sentence.text.trim();
  const hasPrep = sentence.stats.some(s => s.cls === 'sc-hl-prep' && s.count > 0);
  const hasFlow = sentence.stats.some(s => s.cls === 'sc-hl-flow' && s.count > 0);
  const hasPass = sentence.stats.some(s => s.cls === 'sc-hl-pass' && s.count > 0);

  let bridge = null;
  if (index > 0 && prevSentence) {
    bridge = detectBridge(prevSentence.text, text);
  }

  let role = '?';
  let status = '';

  if (WHY_WORDS.test(text)) {
    role = 'Why';
    status = 'Why or reason present';
  } else if (hasPrep || FRAME_START.test(text)) {
    role = 'Frame';
    status = hasPrep ? 'Frame detected' : 'Opens with location';
  } else if (ACTION_VERBS.test(text) && !hasPass) {
    role = 'Action';
    status = bridge ? `Bridge: ${bridge}` : 'Clear action';
  } else if (hasFlow) {
    role = '?';
    status = 'Missing bridge';
  } else if (ACTION_VERBS.test(text)) {
    role = 'Action';
    status = 'Action (check actor)';
  } else {
    role = '?';
    status = issueCountLabel(sentence);
  }

  let moveHint = null;
  if (hasFlow && index > 0) {
    moveHint = `Move Up or add bridge after S${index}`;
  } else if (role === 'Action' && index > 0 && !bridge) {
    moveHint = 'Move Wide — repeat pattern?';
  }

  return { role, status, bridge, moveHint };
}

function detectBridge(prevText, currText) {
  const prevWords = new Set(contentWords(prevText));
  const currWords = contentWords(currText);
  const shared = currWords.find(w => prevWords.has(w));
  if (shared) return `${shared} → …`;
  if (BRIDGE_WORDS.test(currText)) {
    const m = currText.match(/\b(this|that|these|those|it|they)\b/i);
    if (m) return `${m[1].toLowerCase()} → …`;
  }
  return null;
}

function issueCountLabel(sentence) {
  const n = sentence.stats.filter(s => s.count > 0).length;
  if (n === 0) return '✓';
  return `${n} check${n > 1 ? 's' : ''}`;
}

/** Thinking-focused summary — not a grammar score. */
export function computeStructureSignals(sentences) {
  if (sentences.length === 0) {
    return { summary: '', clearRoles: 0, bridges: 0, total: 0 };
  }

  let clearRoles = 0;
  let bridges = 0;

  sentences.forEach((s, i) => {
    const prev = i > 0 ? sentences[i - 1] : null;
    const { role, bridge } = analyzeSentenceStructure(s, i, prev);
    if (role !== '?') clearRoles++;
    if (bridge) bridges++;
  });

  const summary = `${clearRoles}/${sentences.length} sentences with clear role · ${bridges} bridge${bridges === 1 ? '' : 's'}`;

  return { summary, clearRoles, bridges, total: sentences.length };
}
