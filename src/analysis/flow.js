// Inter-sentence flow detection: a sentence is "an island" if it shares no
// content word with the previous and doesn't open with a transition word.

const FLOW_STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being','am','do','does',
  'did','have','has','had','having','will','would','can','could','should','must',
  'may','might','shall','of','to','in','for','on','with','as','by','at','from',
  'and','or','but','not','that','which','who','whom','this','that','these','those',
  'it','its','they','them','their','there','here','so','if','while','when','where',
  'what','why','how','than','then','about','into','onto','over','under','through',
  'across','against','between','among','also','just','very','really','quite','also',
  'you','your','we','our','us','i','my','me','he','she','his','her','him',
  'one','two','three','many','much','some','any','each','every','no','all',
  'thing','things',
]);

const FLOW_TRANSITIONS = new Set([
  'however','therefore','thus','moreover','furthermore','meanwhile','also','additionally',
  'consequently','nevertheless','nonetheless','instead','besides','finally','first',
  'second','third','next','then','afterwards','before','after','while','since',
  'because','although','though','still','similarly','likewise','conversely','hence',
  'accordingly','overall','in','for','as','this','that','these','those','so','yet','but','and',
]);

function flowTokens(text) {
  return text.toLowerCase().split(/[^a-z0-9']+/).filter(w => w && !FLOW_STOPWORDS.has(w));
}

function startsWithTransition(text) {
  const firstWord = (text.trim().toLowerCase().match(/^[a-z]+/) || [])[0];
  return !!firstWord && FLOW_TRANSITIONS.has(firstWord);
}

export function computeFlowFlags(sentenceTexts) {
  const flags = new Array(sentenceTexts.length).fill(false);
  let prevTokens = new Set();
  sentenceTexts.forEach((s, i) => {
    const curr = new Set(flowTokens(s));
    if (i > 0 && curr.size > 0 && !startsWithTransition(s)) {
      const overlap = [...curr].some(t => prevTokens.has(t));
      if (!overlap) flags[i] = true;
    }
    prevTokens = curr;
  });
  return flags;
}
