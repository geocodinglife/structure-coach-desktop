// Words that look like nominalizations but aren't — institutional/abstract nouns
// that we don't want flagged.

export const NOMINALIZATION_EXCLUSIONS = [
  // Entity / institution nouns
  'organization', 'organizations', 'organisation', 'organisations',
  'corporation', 'corporations', 'institution', 'institutions',
  'department', 'departments', 'government', 'governments',
  'foundation', 'foundations', 'nation', 'nations',
  'community', 'communities', 'university', 'universities',
  'authority', 'authorities', 'region', 'regions',
  'section', 'sections', 'division', 'divisions',
  'generation', 'generations', 'population', 'populations',
  // Abstract/idiomatic nouns common in business writing
  'information', 'communication', 'communications',
  'situation', 'situations', 'condition', 'position', 'positions',
  'operation', 'operations', 'function', 'functions',
  'relation', 'relations', 'tradition', 'traditions',
  'direction', 'directions', 'portion', 'portions',
  'mention', 'action', 'actions', 'question', 'questions', 'station',
  'opinion', 'opinions', 'version', 'versions',
  'interaction', 'interactions', 'experience', 'experiences',
  'audience', 'audiences', 'conference', 'conferences',
  'reference', 'references', 'difference', 'differences',
  'instance', 'instances', 'sequence', 'sequences',
  'distance', 'distances', 'substance', 'substances',
  'document', 'documents', 'environment', 'environments',
  'moment', 'moments', 'element', 'elements',
  'equipment', 'instrument', 'instruments',
  // -ity entity/idiom nouns
  'quality', 'qualities', 'activity', 'activities',
  'city', 'cities', 'entity', 'entities',
  'reality', 'security', 'variety', 'varieties',
  'priority', 'priorities', 'majority', 'minority',
  'opportunity', 'opportunities', 'facility', 'facilities',
  'capacity', 'capacities', 'identity', 'identities',
];

export const NOMINALIZATION_EXCLUSION_SET = new Set(NOMINALIZATION_EXCLUSIONS);

export function isNominalization(text, ctx) {
  const lower = text.toLowerCase();
  if (NOMINALIZATION_EXCLUSION_SET.has(lower)) return false;
  if (text.length <= 4) return false;
  if (ctx && ctx.verbSet && ctx.verbSet.has(lower)) return false;
  if (ctx && ctx.properSet && ctx.properSet.has(lower)) return false;
  if (ctx && ctx.adjSet && ctx.adjSet.has(lower)) return false;
  return true;
}
