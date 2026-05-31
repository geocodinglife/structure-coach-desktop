# UX One: Structure Coach Experience Plan

Status: Planning only. No implementation decisions are final.

This document reviews the current app experience as a senior UX pass. It is based on the current codebase: editor panel, highlight layer, sentence tree, reference drawer, guide overlays, fix overlay, AI rewrite compare overlay, settings modal, local/remote LLM flow, and Tauri shell behavior.

The goal is not to make the app prettier first. The goal is to make the app help the user think, write, and communicate with more truth and structure.

## Product North Star

Structure Coach should help the user know when to move:

> Up, down, or wide.

- Up: explain why, purpose, impact, business truth.
- Down: explain how, action, implementation, exact detail.
- Wide: check related cases, repeated patterns, system-wide consistency.

The current app mostly highlights sentence-level issues. The next UX step is to turn those highlights into decisions:

> What is the issue? Why does it matter? What move should I make next?

## Current Experience Summary

The app currently has these main surfaces:

- Main editor: user writes text and sees inline highlights.
- Issue chips: counts for weak/passive, prepositions, nominalizations, filler, needless words, spine, noun stack, and flow.
- Sentence tree: visual sentence map with issue glyphs.
- Reference drawer: examples and per-sentence AI refactor.
- Fix overlay: per-rule sentence list with AI rewrite suggestions.
- AI Rewrite compare overlay: original text with issue chips and editable rewrite draft.
- Reader overlay: long-form guides for Paramedic Method, advanced structure, and BDD scaffold.
- Settings modal: provider/key/model setup for AI features.
- Tray/window behavior: hide/show workflow for desktop use.

The strongest current idea is immediate feedback. The weakest current idea is that the app does not yet explain whether a highlight is truly harmful, useful, or simply worth checking.

## Primary UX Problem

The app shows signals, but it does not always teach a reliable next move.

Example:

> In this URL, find the Better Tips section.

The app can flag `in` as a preposition, but the user needs to know whether it is:

- a useful frame,
- an unnecessary frame,
- a nested frame,
- or a frame that should become an action.

Current feedback says:

> Prepositions (Nesting)

Better UX should say:

> Frame detected. Is this frame helping the reader locate the task, or hiding the action?

## Experience Principle 1: Diagnose The Move, Not Just The Word

A word is rarely the problem by itself.

The user needs to understand what thinking move the word creates.

Examples:

- `in` can create a frame.
- `but` can create contrast or tension.
- `if` can create a condition or branch.
- `or` and `else` can create alternatives.
- repeated nouns can create a scan problem.
- weak verbs can hide action.

UX recommendation:

Replace rule-only feedback with rule plus thinking move.

Current:

> Prep: 3

Better:

> Frames: 3. Check whether these frames help location or hide action.

Current:

> Flow: 2

Better:

> Bridges missing: 2. These sentences may not carry an idea forward.

## Experience Principle 2: Separate Detection From Judgment

The app should not imply every highlight is wrong.

A highlight should mean:

> Check this.

Not:

> Delete this.

UX recommendation:

Introduce issue states:

- Useful: keep it.
- Suspicious: inspect it.
- Heavy: rewrite it.
- Unknown: needs user judgment.

Example for `in`:

- Useful frame: `In the Welcome view`
- Heavy frame: `in the process of the implementation of...`
- Rewrite move: turn frame into action.

## Experience Principle 3: Teach One Move At A Time

The user is trying to build a mental anchor. Showing every possible rule at once can overload the learning path.

UX recommendation:

Add a "Focus Mode" where the user chooses one learning target:

- Frames
- Bridges
- Actor/action
- Why/reason
- Business level
- LLM command clarity

In Focus Mode, the app should suppress unrelated coaching and teach one move repeatedly.

## Experience Principle 4: Keep Truth Before Polish

The user wants clear thinking, not political framing.

UX recommendation:

All AI and guidance should favor truth-first communication:

> Reality -> Problem -> Why -> Action -> Constraint

Avoid guidance that only makes language smoother while hiding the hard fact.

The app should ask:

- What is true?
- What changed?
- Who is affected?
- Why does it matter?
- What action follows?

## Core UX Improvements

## 1. Add A Movement Panel: Up / Down / Wide

Current app asks:

> Does the other person have enough context?

This is useful, but it is too static.

Recommended upgrade:

Show a compact movement selector:

- Move Up: explain why.
- Move Down: give exact action.
- Move Wide: check similar cases.

The selector should help the user decide what their next sentence should do.

Example:

User writes:

> Sort the Better Tips list alphabetically.

Move Up suggestion:

> Users need to scan this list quickly.

Move Down suggestion:

> Change only the list in `welcome/index.html`.

Move Wide suggestion:

> Check other lists on the Welcome page for the same scan issue.

## 2. Rename Some Rule Labels For User Meaning

Current labels are short but sometimes too technical.

Recommended labels:

- Weak -> Hidden Action
- Prep -> Frames / Nesting
- Nom -> Noun Instead Of Action
- Fill -> Wind-up
- Needless -> Extra Words
- Spine -> Subject-Verb Distance
- Stack -> Noun Pile
- Flow -> Missing Bridge

Keep short chip labels if needed, but add clear descriptions in the drawer and overlays.

## 3. Turn The Reference Drawer Into A Coach Drawer

Current drawer mostly shows examples.

Recommended drawer structure:

1. What was detected?
2. Why it may matter.
3. When to keep it.
4. When to rewrite it.
5. Rewrite moves.
6. Examples.

For prepositions:

- Detected: frame/nesting.
- Keep when: it gives location, scope, source, or role.
- Rewrite when: it hides actor/action or stacks too many frames.
- Move: turn the frame into an action, split the sentence, or name the target directly.

## 4. Add A "Why Missing" Check

The app currently checks grammar-like patterns. It does not explicitly check whether a task or claim explains why it matters.

Recommended feature:

Detect command-style writing and ask whether a reason is needed.

Example:

> Sort the list alphabetically.

Possible coach prompt:

> This command is clear. Do you need to add why? Example: "Users need to scan it quickly."

This should be optional because LLM commands often do not need the why.

## 5. Add Audience Mode

The right structure depends on audience.

Recommended audience modes:

- LLM / Builder
- Operator / Manager
- Business Owner
- General Reader

Each mode changes the coaching questions.

LLM / Builder:

> Location -> Target -> Problem -> Why -> Action -> Constraint

Operator / Manager:

> Process -> Bottleneck -> Cause -> Metric -> Action

Business Owner:

> Area -> Outcome -> Pain -> Impact -> Priority

General Reader:

> Frame -> Point -> Reason -> Bridge

## 6. Add A Prompt Builder For LLM Work

The user spends much of the day writing commands to LLMs. This is a training opportunity.

Recommended UX:

Add a small "LLM Task" scaffold:

- Location
- Target
- Problem
- Why
- Action
- Constraint

Generated prompt example:

> In `app/views/welcome/index.html`, find the "Better Ideas" section. The list is organized by item quantity, which makes it hard for users to scan. Sort only that list alphabetically.

The app should allow the user to write naturally, then map the sentence into the scaffold.

## 7. Make AI Rewrite A Workshop, Not A Result

Current AI Rewrite shows original and editable rewrite.

Recommended improvements:

- Show detected issues on the left.
- Show editable rewrite on the right.
- Add "Apply movement" controls: Up, Down, Wide.
- Add "Preserve my draft" by default.
- Show "AI suggestion" versus "My rewrite" explicitly.
- Add "Explain why this rewrite helps" as optional.

Do not make AI the owner of the final text. The user should remain the editor.

## 8. Make Issue Chips Actionable

Current chips open references or fix overlays.

Recommended chip behavior:

- Click once: show explanation.
- Click issue text: highlight examples in editor.
- Click "Fix": open sentence-level repair.
- Click "Teach": show the rewrite strategy.

This separates learning from automation.

## 9. Improve False Positive Handling

The app can flag valid command language as an issue.

UX recommendation:

Add quick judgments:

- Keep
- Rewrite
- Ignore this type
- This is useful here

The app can later learn from these judgments, but even before learning, the UI should let the user mark a highlight as not harmful.

## 10. Add Sentence Role Labels

The app should help identify what each sentence is doing.

Possible roles:

- Frame
- Point
- Reason
- Action
- Constraint
- Bridge
- Example
- Question

This would connect directly to the framework and help the user learn paragraph flow.

## 11. Replace The Tree With A More Legible Structure Map

The current SVG tree is interesting, but it may not be the clearest visual for the user's goal.

Possible redesign:

- Sentence list instead of abstract tree.
- Each sentence gets role labels and issue chips.
- Show links between sentences.
- Mark missing bridge when one sentence does not connect to the previous.
- Allow selecting a sentence to edit, inspect, or rewrite.

Recommended structure:

> S1 Frame -> S2 Point -> S3 Reason -> S4 Action

This may teach flow better than a decorative tree.

## 12. Make Flow Visible As A Chain

The current flow rule detects isolated sentences by token overlap and transition words.

UX recommendation:

Show the chain of repeated or bridged ideas:

Example:

> section -> that section -> list -> sort that list

If the chain breaks, show:

> No bridge from previous sentence.

This is more teachable than only "Flow: 2".

## 13. Add "Command Is Clear" Positive Feedback

The app currently emphasizes problems.

Recommended positive checks:

- Clear action found.
- Target is specific.
- Constraint is explicit.
- Reason is present.
- Bridge connects to previous sentence.

This helps the user know what worked, not only what failed.

## 14. Improve Onboarding Around AI Setup

Current setup banner is useful but mixes provider setup with feature activation.

Recommended onboarding:

1. Start writing without AI.
2. Show local rules immediately.
3. When user clicks AI Rewrite, explain that AI is optional.
4. Settings modal should offer "Use local only" and "Use API provider" paths clearly.

The user should not feel blocked if AI is unavailable.

## 15. Make Provider Errors Actionable

Rust already returns friendly provider errors.

UX recommendation:

Map errors to next actions:

- Missing key -> Open Settings
- Wrong model -> Edit Model
- Rate limit -> Retry later / switch provider
- Ollama unavailable -> show command to start Ollama

The message should preserve the user's draft and avoid making AI failure feel like writing failure.

## 16. Improve Settings UX

Current settings are functional.

Potential improvements:

- Test connection button.
- Show current provider status.
- Show "AI unavailable, manual mode active."
- Separate "Provider" from "Advanced model settings."
- Explain when API key is not needed for Ollama.
- Add "Clear key" explicitly.

## 17. Add Draft Persistence

Current text appears session-based.

Recommended:

- Auto-save main editor draft locally.
- Auto-save AI rewrite draft.
- Restore after app restart.
- Show last saved time.

This is important because the app is a thinking workspace.

## 18. Add Undo-Friendly Interactions

Any AI or rewrite action should be reversible.

Recommended:

- Do not overwrite main text without preview.
- Copy-only by default.
- If "Apply to editor" is added later, provide undo.
- Show diff before apply.

## 19. Clarify Hide, Close, Discard

The desktop app has two kinds of hiding:

- Hide app to tray.
- Hide rewrite overlay.

Recommended labels:

- App: Hide to Tray
- Rewrite overlay: Hide Draft
- Discard rewrite: Discard Draft

Avoid using "Close" where content may be lost.

## 20. Create A Learning Loop

The product should create a cycle:

1. User writes.
2. App detects.
3. User classifies the issue.
4. App teaches a move.
5. User rewrites.
6. App shows what improved.

Current app has steps 1, 2, and some of 4. The biggest UX opportunity is steps 3, 5, and 6.

## Priority Plan

## Priority 1: Make Feedback Truthful

Goal:

> A highlight means "check this," not "this is wrong."

Planned improvements:

- Rename rule labels around thinking moves.
- Add keep/rewrite explanation.
- Distinguish useful frames from suspicious nesting.
- Add false-positive handling.

## Priority 2: Add Up / Down / Wide

Goal:

> Help the user choose the right direction for the next sentence.

Planned improvements:

- Add movement panel.
- Add suggestions for moving up, down, or wide.
- Connect movement to sentence roles.

## Priority 3: Improve LLM Command Practice

Goal:

> Turn daily LLM command writing into training for better human communication.

Planned improvements:

- Add LLM Task scaffold.
- Add optional why check.
- Show command clarity positives.
- Keep commands efficient while adding one bridge/reason when useful.

## Priority 4: Rework The Structure Visualization

Goal:

> Make paragraph flow visible.

Planned improvements:

- Replace or supplement tree with sentence list.
- Show roles, bridges, and movement.
- Show chain continuity.

## Priority 5: Strengthen AI Rewrite As A Manual Workspace

Goal:

> AI helps, but the user remains the editor.

Planned improvements:

- Preserve drafts.
- Add movement controls.
- Add diff/explanation.
- Keep manual editing usable when AI fails.

## Detailed UX Opportunities By Surface

## Main Editor

Current strengths:

- Immediate writing surface.
- Inline highlights are visible.
- Issue chips give quick counts.

Issues:

- No word count or sentence count.
- No role detection.
- Highlight colors may feel like errors instead of prompts.
- Transparent textarea over highlight layer can make selection/caret UX fragile.
- Toolbar can become crowded.

Recommendations:

- Add a small status row: words, sentences, active focus mode.
- Add "All / Focus" toggle.
- Add positive checks.
- Add sentence role labels in a side rail or below chips.
- Let user click a highlight directly for explanation.

## Issue Chips

Current strengths:

- Simple and compact.
- Clickable path to deeper guidance.

Issues:

- Labels are too compressed for learning.
- Counts do not explain severity.
- A chip click can open a large overlay without clear expectation.

Recommendations:

- Add hover/title text.
- Add severity categories: check, heavy, repeated.
- Add "why this matters" inside opened panel.
- Use chips as filters and lessons, not just counts.

## Sentence Tree

Current strengths:

- Gives a second view of text structure.
- Sentence nodes are clickable.

Issues:

- It is visually abstract.
- It may not clearly teach up/down/wide, frame, bridge, or action.
- It occupies 60% of the app without always producing proportional value.

Recommendations:

- Consider replacing with "Structure Map."
- Show sentence roles and bridge chain.
- Add movement direction indicators.
- Show issue clusters by sentence.

## Reference Drawer

Current strengths:

- Persistent side panel.
- Good place for targeted teaching.

Issues:

- Examples are static.
- The selected sentence target is truncated.
- Smart Fix result is not editable.
- The drawer mixes reference, AI coach, and long guide links.

Recommendations:

- Make the drawer contextual and sentence-specific.
- Show detected phrase, reason, and rewrite move.
- Make Smart Fix editable or copyable.
- Separate "Learn" from "Fix".

## Fix Overlay

Current strengths:

- Shows all sentences for one rule.
- Caches AI rewrites during session.
- Lets user switch rules.

Issues:

- AI rewrite cells are read-only.
- It starts calls automatically, which may surprise users or spend tokens.
- There is no manual fix path when AI fails.
- It does not explain why each sentence was selected.

Recommendations:

- Add manual editable rewrite.
- Add "Generate" per row instead of auto-calling every row, or batch with clear status.
- Highlight the exact matched phrase in each original sentence.
- Add "why flagged" text per row.

## AI Rewrite Compare Overlay

Current strengths:

- Side-by-side comparison.
- Editable rewrite draft.
- Preserves draft on hide.
- Shows source issue chips.

Issues:

- "AI Rewrite" still sounds like the AI owns the result.
- Copy is available only after AI readiness in current logic.
- Issue chips in compare need clearer affordance.
- The overlay could better support manual rewrite flow.

Recommendations:

- Rename to "Rewrite Workspace" or "Rewrite Draft."
- Separate "AI suggestion" from "My draft."
- Add "Generate AI suggestion" and "Manual rewrite" paths.
- Add Up/Down/Wide controls.
- Add "Apply to main editor" only with diff and undo.

## Reader Guides

Current strengths:

- Useful long-form learning material.
- Guides support Paramedic Method, structure, and BDD.

Issues:

- Long guides are separate from the moment of writing.
- Some guide language is not aligned with the emerging framework.
- Markdown-style bold appears inside HTML strings in BDD guide as literal `**`.

Recommendations:

- Break guides into small contextual cards.
- Align guide language with up/down/wide and truth-first framing.
- Add "practice this move" examples.
- Keep full guide as reference, but make the drawer teach in context.

## Settings

Current strengths:

- Supports multiple providers.
- Gives key links and help text.
- Stores key in OS keyring.

Issues:

- No connection test.
- Advanced provider setup may overwhelm.
- AI failure path is disconnected from settings action.

Recommendations:

- Add provider status.
- Add test connection.
- Add clear "Manual mode works without AI."
- Link AI errors directly to the relevant settings field.

## Desktop Shell

Current strengths:

- Tray support.
- Hide instead of exit.
- Single instance toggles window.

Issues:

- Hide semantics can conflict with overlay hide.
- No explicit unsaved draft state.

Recommendations:

- Clarify "Hide to Tray" versus "Hide Draft."
- Persist drafts.
- Show restoration behavior after reopen.

## Content Strategy

The app should teach these concepts in this order:

1. Up / Down / Wide.
2. Frame versus action.
3. Focus object versus actor.
4. Why/reason.
5. Bridge between sentences.
6. Constraint.
7. Pattern across cases.

Avoid starting with grammar terminology. Use grammar as evidence, not as the main language.

## Recommended Terminology

Use:

- Frame
- Focus
- Actor
- Action
- Why
- Bridge
- Constraint
- Pattern
- Move Up
- Move Down
- Move Wide

Use carefully:

- Passive voice
- Nominalization
- Preposition
- Noun stack

The technical terms can stay in advanced/reference mode.

## Example Future UX Flow

User writes:

> Locate the Welcome view. Find the Better Tips section. Sort its list alphabetically.

App shows:

- Clear action: Locate, Find, Sort.
- Specific target: Better Tips section, its list.
- Bridge: section -> its list.
- Missing why: optional.

User adds:

> Users need to scan the list quickly.

App shows:

- Why added.
- Flow chain: section -> list -> users scan list.
- Suggested movement:
  - Up: Welcome page should help users find value faster.
  - Down: Change only `app/views/welcome/index.html`.
  - Wide: Check other lists on the Welcome page.

This is the target experience.

## Not Recommended

Avoid these directions:

- Do not make the app a generic grammar checker.
- Do not imply every preposition is wrong.
- Do not let AI rewrite replace user learning.
- Do not optimize only for polished prose.
- Do not hide hard truth behind softer language.
- Do not make long guides the main learning path.

## Open UX Questions

- Should the main right panel be a tree, a sentence list, or a movement map?
- Should Focus Mode be global or per paragraph?
- Should AI suggestions be generated automatically or only on demand?
- How should the app distinguish command writing from human-facing prose?
- Should the user select audience mode manually, or should the app infer it?
- How much should false-positive judgments persist?
- Should the app support page/task planning for LLM command work?

## Next Planning Step

Before code changes, define the first small UX slice.

Recommended slice:

> Turn preposition feedback into Frame feedback for `in`, with keep/rewrite guidance and one rewrite move.

Why this slice:

- It matches the current conversation.
- It fixes a real confusion.
- It can teach the up/down/wide model later.
- It changes the experience from "word is wrong" to "what move is this word making?"

