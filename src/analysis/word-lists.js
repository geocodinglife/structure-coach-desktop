// Lexical word lists used by paramedic rules.

export const WEAK_VERBS = [
  'is', 'are', 'were', 'was', 'be', 'been', 'being', 'am',
  "isn't", "aren't", "wasn't", "weren't",
];

export const PREPOSITIONS = [
  'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at',
  'back', 'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'by',
  'despite', 'down', 'during', 'except', 'following', 'for', 'from', 'in', 'inside', 'into', 'like',
  'near', 'of', 'off', 'on', 'onto', 'out', 'outside', 'over', 'past', 'per', 'since', 'through',
  'throughout', 'till', 'to', 'toward', 'towards', 'under', 'underneath', 'until', 'up', 'upon',
  'with', 'within', 'without',
];

export const EXPLETIVES = [
  'it is observed that', 'it was observed that',
  'I think that', 'we think that',
  'I believe that', 'we believe that',
  'respectively', 'based off',
  'just', 'basically', 'actually', 'maybe', 'possibly', 'perhaps',
  'really', 'very', 'quite', 'sort of', 'kind of',
  'I guess', 'I feel like', 'it seems', 'the thing is',
];

export const NEEDLESS_WORDS = [
  'the fact that', 'in order to', 'at the present time', 'at this point in time',
  'due to the fact that', 'in the event that', 'the question as to whether',
  'whether or not', 'there is no doubt that', 'as a matter of fact',
  'each and every', 'if and when', 'in the process of', 'for the purpose of',
  'with reference to', 'with regard to', 'in terms of', 'is able to',
  'is capable of', 'it is interesting to note that', 'it is important to note that',
  'it should be noted that', 'along the lines of', 'at all times',
  'by means of', 'in the near future', 'in spite of the fact that',
  'there is', 'there are', 'there was', 'there were',
  'there has been', 'there have been', 'there had been', 'there will be',
  'an evaluation of', 'the purpose of', 'in such a manner that',
  'for the reason that', 'on the grounds that', 'in the case that',
  'is that', 'was that',
];

export function buildWordRegex(words) {
  const sorted = [...words].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp('(?<=\\s|^)(' + escaped.join('|') + ')(?=\\s|[.,;:!?]|$)', 'gi');
}
