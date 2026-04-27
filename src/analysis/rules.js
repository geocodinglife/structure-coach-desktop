// Paramedic rules + class/example mapping used to drive highlighting and the reference drawer.

import { WEAK_VERBS, PREPOSITIONS, EXPLETIVES, NEEDLESS_WORDS, buildWordRegex } from './word-lists.js';
import { isNominalization } from './nominalizations.js';
import { findNounStacks } from './nlp-context.js';

export const CLS_TO_EXAMPLE_ID = {
  'sc-hl-pass': 'sc-example-passive',
  'sc-hl-nom': 'sc-example-nominal',
  'sc-hl-prep': 'sc-example-prep',
  'sc-hl-fill': 'sc-example-filler',
  'sc-hl-needless': 'sc-example-needless',
  'sc-hl-spine': 'sc-example-spine',
  'sc-hl-stack': 'sc-example-stack',
  'sc-hl-flow': 'sc-example-flow',
};

export const EXAMPLE_ID_TO_CLS = Object.fromEntries(
  Object.entries(CLS_TO_EXAMPLE_ID).map(([cls, id]) => [id, cls])
);

export const PARAMEDIC_RULES = [
  {
    name: 'Passive voice',
    cls: 'sc-hl-pass',
    pattern: new RegExp(
      '\\b(?:am|is|are|was|were|be|been|being|' +
      '(?:has|have|had|having)\\s+been|' +
      '(?:will|would|can|could|shall|should|may|might|must)\\s+(?:have\\s+been|be))' +
      '\\s+(?:\\w+ed|' +
      ['been','done','gone','seen','taken','given','made','found','held','kept',
       'left','lost','met','paid','said','sent','shown','shut','slept','spent',
       'spoken','stood','stolen','sworn','taught','thought','thrown','understood',
       'woken','worn','written','brought','built','bought','caught','chosen',
       'drawn','driven','eaten','fallen','felt','flown','forgiven','forgotten',
       'frozen','gotten','grown','heard','hidden','hit','known','led','lent',
       'lit','read','risen','put','broken','torn','ridden','hung','rung','sung',
       'struck','swept','cast','hurt','set'].join('|') +
      ')\\b',
      'gi'
    ),
    tip: { bad: 'The report was sent by me', good: 'I sent the report' },
  },
  {
    name: 'Nominalizations',
    cls: 'sc-hl-nom',
    pattern: /\b(?:\w+(?:ion|ment|ance|ence|ity|ness)s?|(?:approval|arrival|refusal|denial|removal|proposal|renewal|survival|betrayal|revival|disposal|rebuttal|retrieval|withdrawal|dismissal|rental|burial)s?)\b/gi,
    filter: isNominalization,
    tip: { bad: 'Give an explanation', good: 'Explain' },
  },
  {
    name: 'Weak verbs',
    cls: 'sc-hl-pass',
    pattern: buildWordRegex(WEAK_VERBS),
    tip: { bad: 'The car is fast', good: 'The car accelerates quickly' },
  },
  {
    name: 'Prepositions',
    cls: 'sc-hl-prep',
    pattern: buildWordRegex(PREPOSITIONS),
    tip: { bad: 'Decision of the manager', good: "Manager's decision" },
  },
  {
    name: 'Expletives & filler',
    cls: 'sc-hl-fill',
    pattern: buildWordRegex(EXPLETIVES),
    tip: { bad: 'It is important to note that', good: 'Note that' },
  },
  {
    name: 'Needless words',
    cls: 'sc-hl-needless',
    pattern: buildWordRegex(NEEDLESS_WORDS),
    tip: { bad: 'In order to finish', good: 'To finish' },
  },
  {
    name: 'Empty opener',
    cls: 'sc-hl-fill',
    pattern: /\bit\s+(?:is|was|has\s+been|had\s+been)\s+\w+(?:\s+\w+)?\s+(?:that|to)\b/gi,
    tip: { bad: 'It is recommended that we complete', good: 'We should complete' },
  },
  {
    name: 'Spine Check',
    cls: 'sc-hl-spine',
    pattern: /\b(?!the|a|an)\w+\s+(?:\w+\s+){6,}(?:is|are|was|were|has|have)\b/gi,
    tip: {
      bad: 'The organization customer journey map documents...',
      good: 'Journey maps document...',
    },
  },
  {
    name: 'Noun stack',
    cls: 'sc-hl-stack',
    find: findNounStacks,
    tip: {
      bad: 'Early childhood thought disorders misdiagnosis',
      good: 'Misdiagnosis of disordered thought in young children',
    },
  },
];

export const FLOW_RULE = {
  name: 'Flow',
  cls: 'sc-hl-flow',
  tip: {
    bad: 'Island — no link to previous sentence',
    good: 'Bridge with a shared noun or transition ("those maps...", "however,...")',
  },
};
