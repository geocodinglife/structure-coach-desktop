// User-facing chip labels and coach content (UX.md vocabulary).

export const CHIP_DEFS = [
  {
    cls: 'sc-hl-pass',
    variant: 'pass',
    label: 'Hidden action',
    ariaHint: 'Check whether the actor and action are clear',
    coach: {
      detected: 'This may hide who is doing what — a weak or passive verb pattern.',
      why: 'Readers need a clear actor and action to follow the thought.',
      keep: 'Keep it when the actor is obvious from context or the passive is intentional.',
      rewrite: 'Rewrite when the reader cannot tell who acts or what happens.',
      move: 'Name the actor as the subject and use a strong verb.',
      exampleBefore: 'The report was sent by me.',
      exampleAfter: 'I sent the report.',
    },
  },
  {
    cls: 'sc-hl-prep',
    variant: 'prep',
    label: 'Frames',
    ariaHint: 'Check whether this preposition creates helpful location or hides the action',
    coach: {
      detected: 'This may be a frame — a boundary that tells the reader where to place the idea.',
      why: 'Frames help when they locate the action. They hurt when they stack before the main verb.',
      keep: 'Keep it when the frame gives useful location, scope, or role. Example: "In the Welcome view".',
      rewrite: 'Rewrite when the frame stacks before the main action or hides who does what.',
      move: 'Name the target directly, or split into two sentences: frame first, then action.',
      exampleBefore: 'In this URL, find the Better Tips section.',
      exampleAfter: 'Locate the Welcome view. Find the Better Tips section.',
    },
  },
  {
    cls: 'sc-hl-nom',
    variant: 'nom',
    label: 'Noun not verb',
    ariaHint: 'Check whether a noun phrase should become a verb',
    coach: {
      detected: 'This may be a nominalization — an action buried in a noun.',
      why: 'Verbs carry motion; noun piles slow the reader.',
      keep: 'Keep it when the noun is the real subject of the sentence.',
      rewrite: 'Rewrite when you can express the idea with a verb instead.',
      move: 'Turn the noun into a verb. Example: "give an explanation" → "explain".',
      exampleBefore: 'Give an explanation of the process.',
      exampleAfter: 'Explain the process.',
    },
  },
  {
    cls: 'sc-hl-fill',
    variant: 'fill',
    label: 'Wind-up',
    ariaHint: 'Check whether this opener delays the point',
    coach: {
      detected: 'This may be a wind-up — words before the real point.',
      why: 'Wind-ups make readers wait for the action.',
      keep: 'Keep it when the opener sets necessary context.',
      rewrite: 'Rewrite when you can start at the point.',
      move: 'Delete the wind-up and begin with the main clause.',
      exampleBefore: 'It is important to note that the list is unsorted.',
      exampleAfter: 'The list is unsorted.',
    },
  },
  {
    cls: 'sc-hl-needless',
    variant: 'needless',
    label: 'Extra words',
    ariaHint: 'Check whether these words can be omitted without losing truth',
    coach: {
      detected: 'These may be extra words that do not add meaning.',
      why: 'Omitting needless words keeps the spine visible.',
      keep: 'Keep them when they carry necessary precision or tone.',
      rewrite: 'Rewrite when the sentence works without them.',
      move: 'Remove the phrase and read aloud — if truth stays, keep the cut.',
      exampleBefore: 'In order to finish the task, sort the list.',
      exampleAfter: 'To finish the task, sort the list.',
    },
  },
  {
    cls: 'sc-hl-spine',
    variant: 'spine',
    label: 'Subject-verb gap',
    ariaHint: 'Check whether subject and verb are too far apart',
    coach: {
      detected: 'The subject and verb may be too far apart — the spine is stretched.',
      why: 'Readers parse subject-verb pairs to grasp who does what.',
      keep: 'Keep it when the middle material is essential and short.',
      rewrite: 'Rewrite when six or more words separate subject from verb.',
      move: 'Move the base clause (subject + verb) near the start.',
      exampleBefore: 'The organization customer journey map documents interactions.',
      exampleAfter: 'Journey maps document customer interactions.',
    },
  },
  {
    cls: 'sc-hl-stack',
    variant: 'stack',
    label: 'Noun pile',
    ariaHint: 'Check whether a chain of nouns is hard to scan',
    coach: {
      detected: 'This may be a noun pile — three or more nouns in a row.',
      why: 'Noun piles are hard to parse without verbs or prepositions.',
      keep: 'Keep it when the term is a standard compound name.',
      rewrite: 'Rewrite when a reader would stumble on the chain.',
      move: 'Break the pile with a verb or preposition.',
      exampleBefore: 'Early childhood thought disorders misdiagnosis',
      exampleAfter: 'Misdiagnosis of disordered thought in young children',
    },
  },
  {
    cls: 'sc-hl-flow',
    variant: 'flow',
    label: 'Missing bridge',
    ariaHint: 'Check whether this sentence connects to the previous one',
    coach: {
      detected: 'This sentence may not carry an idea forward from the previous sentence.',
      why: 'Bridges help readers ride one thread instead of jumping between islands.',
      keep: 'Keep it when the break is intentional (new topic or section).',
      rewrite: 'Rewrite when the reader needs a shared word or transition.',
      move: 'Repeat a key word from the previous sentence or add a transition.',
      exampleBefore: 'The map documents interactions. Banking has similar issues.',
      exampleAfter: 'The map documents interactions. Those interactions reveal where banking has similar issues.',
    },
  },
];

export function getChipDef(cls) {
  return CHIP_DEFS.find(d => d.cls === cls);
}

export function chipLabelFor(cls) {
  return getChipDef(cls)?.label || cls;
}

export function chipAriaLabel(label, count) {
  const def = CHIP_DEFS.find(d => d.label === label);
  const hint = def?.ariaHint || 'Open coaching for this check';
  return `${label}: ${count}. ${hint}`;
}
