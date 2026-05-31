export function buildSentenceRefactorPrompt(targetSentence, context) {
  return `You are a writing coach. I am editing a document.
CONTEXT: "${context}"
SENTENCE TO REFACTOR: "${targetSentence}"

Refactor ONLY the SENTENCE TO REFACTOR to be more direct, active, and concise, while ensuring it flows perfectly with the CONTEXT provided.

Follow these rules strictly:
1. Use the active voice.
2. Remove nested prepositions (avoid "of", "in", "for").
3. Remove "needless words" or boilerplate (e.g. "it is important to note that").
4. If a sentence can be refactored into a direct, simple statement of fact, do that.
5. Keep the meaning exact.

Provide ONLY the refactored sentence text, nothing else.`;
}

export function buildFullRewritePrompt(text) {
  return `You are a writing coach applying the Paramedic Method. Rewrite the entire text below, fixing these issues while preserving meaning, intent, tone, and paragraph structure:

1. Passive voice — convert to active.
2. Nominalizations — convert noun forms (-ion, -ment, -ance, -ence, -ity, -ness) back to verbs or adjectives where natural.
3. Weak "to be" verbs (is, are, was, were, be, been, being) — replace with action verbs where natural.
4. Prepositional pile-ups — collapse nested "of / in / for / with" chains.
5. Expletives & filler ("just", "basically", "I think that", "really", "very") — remove.
6. Needless words ("in order to", "the fact that", "there is/are", "due to the fact that") — remove or shorten.
7. Spine — keep subject and verb close (within ~5 words).
8. Noun stacks — break runs of 3+ nouns with verbs or prepositions.
9. Flow — bridge each sentence to the previous via shared nouns or transitions.

Keep technical terms, proper nouns, and the author's voice. Do not add new ideas, do not summarize, do not shorten beyond what the rules require. Preserve paragraph breaks (blank lines).

Return ONLY the rewritten text, with no preamble, no commentary, and no surrounding quotes.

TEXT:
"""
${text}
"""`;
}

export function buildTaskScaffoldPrompt(fieldsJson, context) {
  const f = JSON.parse(fieldsJson);
  return `You are a writing coach for technical instructions aimed at an LLM or builder audience.

Using ONLY the fields below (replace ___ with sensible placeholders if still blank), write ONE clear sentence following:
Location → Target → Action → Constraint

Fields:
- Location: ${f.location}
- Target: ${f.target}
- Action: ${f.action}
- Constraint: ${f.constraint}

Recent document context (for tone only, do not copy verbatim):
"""
${context}
"""

Return ONLY the single sentence. No quotes, no preamble.`;
}
