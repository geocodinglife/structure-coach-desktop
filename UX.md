# UX: Recommended Product Direction For Structure Coach

Status: consolidated UX recommendation for LLM-assisted planning and implementation. Single canonical spec — vision from UX-ONE, build path from UX-TWO, rationale in UX-THREE.

This document compares the logic of `UX-ONE.md`, `UX-TWO.md`, and `UX-THREE.md`, then makes the case for the recommended design direction. It is written so an LLM can read it and understand what to build, what not to build, and why this design is better.

## Document Roles

| Document | Role |
| --- | --- |
| `THINKING_NOTES.md` | Mental model: Up / Down / Wide, Frame, Bridge, audience levels |
| `UX-ONE.md` | Broad vision: correct north star, wide scope |
| `UX-TWO.md` | Tactical plan: concrete changes tied to current code |
| `UX-THREE.md` | Rationale: why UX-TWO is the better build path over UX-ONE alone |
| `UX.md` | Consolidated decision document for LLM-assisted implementation |

## Short Decision

Use `UX-TWO.md` as the stronger implementation direction, but keep the product north star from `UX-ONE.md`. Use `UX-THREE.md` as the rationale for why sequence matters.

The final UX direction is:

> Structure Coach is not a grammar checker. It is a clear-thinking workspace that helps the user decide whether to move Up, Down, or Wide, then make one truthful rewrite move.

Build the vision from `UX-ONE.md`. Build the product from `UX-TWO.md`.

## Why This Direction Is Better

This design is better because it changes the app from:

> "Here are writing errors."

to:

> "Here is the thinking move this sentence is making, here is why it matters, and here is one action you can take."

That matters because the user is not only trying to produce cleaner text. The user is trying to build a repeatable thinking pattern that can transfer from LLM commands to human communication.

The app should therefore teach judgment, not just correction.

## Why Sequence Matters

`UX-ONE.md` is directionally correct, but it gives many good ideas similar visual weight. That can lead an implementer to build the right features in the wrong order.

The product should not start by adding more surfaces or more rule categories. The current pain is simpler:

> The user sees a flag like "Prep: 3" and does not know what to do next.

Therefore, the next UX work must close this gap first:

> Detect -> Classify -> Teach -> Rewrite -> Compare

The app is already strong at Write -> Detect. The missing steps are Classify, Teach, and user-owned Rewrite.

This is why `UX-TWO.md` wins as the implementation path:

- It sequences the work.
- It starts with language and labels before large UI rebuilds.
- It fixes the surfaces users already touch: chips and rewrite workshop.
- It avoids building a Structure Map before the app teaches the vocabulary that map would use.
- It treats AI optionalism and manual editing as trust requirements, not polish.

## Source Document Comparison

## UX-ONE.md

Best contribution:

- Defines the broad product vision.
- Establishes the core idea: Up / Down / Wide.
- Explains that highlights should become decisions.
- Identifies major surfaces and long-term opportunities.
- Makes the case that AI should be a workspace, not the owner of the final text.

Limit:

- It is broad.
- It lists many possible improvements.
- It does not always say what should happen first.
- It is less grounded in the current implemented UI state.

## UX-TWO.md

Best contribution:

- Turns the product vision into concrete change suggestions.
- Grounds recommendations in current code reality.
- Gives clear priorities and implementation slices.
- Names exact UI copy changes.
- Defines stronger interaction flows for the rewrite overlay, chips, drawer, fix overlay, and right panel.

Limit:

- It depends on the reader already understanding the mental model from `THINKING_NOTES.md` and `UX-ONE.md`.
- It is more tactical, so it should be paired with a clear north star.

## UX-THREE.md

Best contribution:

- Explains why `UX-TWO.md` should guide implementation.
- Makes the sequencing argument explicit.
- Shows how `UX-ONE.md` can cause build-order confusion if used alone.
- Clarifies that `UX-TWO.md` does not replace the vision; it operationalizes it.
- Adds a useful success test: the user should never be stuck at "Prep: 3" without a next step.

Limit:

- It is an argument document, not the final implementation guide.
- Its role is rationale; its useful decisions should be merged into `UX.md` and `UX-TWO.md` rather than treated as a separate build spec.

## Final Position

The final UX should combine them:

- Use `UX-ONE.md` for **why the product exists**.
- Use `UX-TWO.md` for **what to change next**.
- Use `UX-THREE.md` for **why sequence matters**.
- Use this `UX.md` as the **decision document** for LLMs and future implementation.

## Product North Star

The app should help the user answer:

1. Where am I in the thought?
2. Does the reader need me to move Up, Down, or Wide?
3. What one truthful rewrite move should I try?

Definitions:

- **Move Up**: explain why, purpose, impact, business truth.
- **Move Down**: explain how, action, implementation, exact detail.
- **Move Wide**: check related cases, repeated patterns, system-wide consistency.

Everything in the UX should support this.

## Learning Loop

Every feature should fit one step in this loop:

```text
Write -> Detect -> Classify -> Teach -> Rewrite -> Compare -> Write
```

Current state:

- Strong: Write, Detect
- Partial: Teach (drawer examples exist; teach-first chip flow does not)
- Missing: Classify (keep vs rewrite), user-owned Compare

Do not add surfaces that skip Classify or Teach. Detection alone does not create learning.

## Core User Problem

The user can see highlights, but the highlights do not automatically create learning.

Current failure pattern:

> The app flags "in" as a preposition. The user does not know whether "in" is bad, useful, necessary, or hiding the action.

Better UX pattern:

> The app explains that "in" may create a frame. It asks whether the frame helps location or hides action. Then it offers one move: keep it, split the sentence, or turn the frame into an action.

This is the key UX change:

> Detection must become judgment, then judgment must become a move.

## Current Implementation Baseline

This section prevents LLMs from rebuilding work that already exists.

Current foundations:

- Main editor with highlight layer.
- Issue chips for current rule counts.
- Sentence tree with clickable sentence nodes.
- Reference drawer with rule examples and Smart Fix.
- Fix overlay with per-rule sentence rows and cached AI rewrites.
- Reader overlays for long-form guides.
- Settings modal for provider, model, base URL, and API key.
- Rewrite overlay with source text, issue chips, editable draft, hide/discard, resume button, source snapshot, dirty-edit preservation during LLM completion, and status strip.
- Tauri shell with tray hide/show behavior and keyring-backed API key storage.

Important gaps:

- Chips still behave too much like error counts.
- Chip click should teach before it fixes.
- Rewrite overlay is still framed around AI instead of a user-owned workshop.
- There is no separate "My draft" and "AI suggestion" lane.
- No movement intent bar exists yet.
- Right panel is still a tree, not a Structure Map.
- Fix overlay still needs manual-first behavior and generate-on-demand.
- No positive feedback strip exists.
- Draft persistence across app restart is not yet a first-class trust feature.

## Design Principles

## 1. Check, Do Not Condemn

A highlight means:

> Check this.

It does not mean:

> This is wrong.

Reason:

Words like `in`, `of`, `is`, and `but` can be useful. The app should teach when to keep them and when to rewrite them.

## 2. Diagnose The Thinking Move, Not Only The Grammar

Grammar terms are evidence. They are not the main product language.

Examples:

- Preposition -> Frame / nesting.
- Passive or weak verb -> Hidden action.
- Flow issue -> Missing bridge.
- Noun stack -> Noun pile / scan problem.

Reason:

The user wants clear thinking. "Preposition" does not tell the user what to do. "Frame hiding action" does.

## 3. One Move At A Time

The app should not overwhelm the user with every possible correction.

Reason:

The user is trying to build a mental anchor. A long list of flags teaches counting, not thinking.

Preferred UX:

> Show the top one or two moves worth attention. Let the user expand to all checks.

## 4. User Owns The Final Text

AI is optional and secondary.

Reason:

The product is for learning and thinking. If AI writes the final result, the user loses the training loop.

Preferred UX:

- My draft is primary.
- AI suggestion is secondary.
- AI never silently overwrites user text.
- Manual mode works even when AI fails.

## 5. Truth Before Polish

The app should never optimize for smooth language if that hides the truth.

Preferred structure:

> Reality -> Problem -> Why -> Action -> Constraint

Reason:

The user works in business and execution contexts. The app should help name reality clearly.

## Recommended UX Architecture

## 1. Main Editor

Purpose:

> Write, detect, and choose the next thinking direction.

Recommended UI:

- Editor remains the primary surface.
- Above editor, replace static question with movement intent:

```text
What should your next sentence do?
[Move Up] [Move Down] [Move Wide]     Audience: [Builder]
```

Why better:

- It makes the framework active during writing.
- It gives the user a decision before writing the next sentence.
- It turns communication into movement, not static correction.

## 2. Issue Chips

Purpose:

> Show thinking checks, not grammar errors.

Recommended labels:

| Current | Recommended |
| --- | --- |
| Weak | Hidden action |
| Prep | Frames |
| Nom | Noun not verb |
| Fill | Wind-up |
| Needless | Extra words |
| Spine | Subject-verb gap |
| Stack | Noun pile |
| Flow | Missing bridge |

Click behavior:

1. Teach what was noticed.
2. Explain when to keep it.
3. Explain when to rewrite it.
4. Offer one move.
5. Then offer fix actions.

Why better:

The user learns judgment before automation.

Required behavior: see **Chip Interaction State Machine** under Recommended Implementation Order.

## 3. Rewrite Workshop

Purpose:

> Manual rewrite workspace with optional AI support.

Rename:

- `AI Rewrite — Compare` -> `Rewrite Workshop`
- `AI Rewrite` button -> `Rewrite...` or `Open Rewrite Workshop`
- `Copy Rewrite` -> `Copy my draft`
- `Open Rewrite Draft` -> `Resume rewrite`
- `Discard` -> `Discard workshop`

Recommended layout:

```text
Rewrite Workshop                         [Hide workshop] [Discard workshop]
---------------------------------------------------------------------------
Your source text                         My draft
[issue chips]                            [editable textarea]
[highlighted source]

                                         AI suggestion
                                         [Generate] [Insert into draft]
```

Rules:

- My draft is always primary.
- AI suggestion is optional.
- AI never overwrites My draft without user action.
- If AI fails, the draft remains editable.
- Insert into draft must have explicit semantics:
  - empty My draft: insert can replace all without confirmation.
  - non-empty My draft: replacing all requires confirmation.
  - active selection in My draft: replace selection only.
  - append: add AI suggestion after a blank line.
  - after insert: focus returns to My draft and AI suggestion remains available.
- Hide preserves the workshop session.
- Discard clears the workshop session.

Why better:

This supports learning. The user compares, edits, and decides.

## 4. Movement Controls In Workshop

Add three controls:

- Move Up
- Move Down
- Move Wide

These should not auto-rewrite at first. They should open a scaffold.

Examples:

Move Up:

> This matters because ___

Move Down:

> Do this: ___ in ___

Move Wide:

> Check whether ___ also applies to ___

Why better:

It directly trains the core framework.

## 5. Right Panel: Replace Tree With Structure Map

Current tree is visually interesting but does not teach the framework clearly enough.

Recommended Structure Map:

```text
S1 [Frame]   Locate the Welcome view.            ✓ Clear frame
S2 [Action]  Find the Better Tips section.       ✓ Clear action
S3 [Action]  Sort its list alphabetically.       ✓ Bridge: section -> its list
S4 [Why]     Users need to scan the list quickly.✓ Why added
```

Why better:

- Sentence roles are visible.
- Bridge chains are visible.
- Up / Down / Wide can be shown per sentence.
- It teaches paragraph movement better than abstract SVG glyphs.

The existing tree can remain behind a "Classic tree" toggle if needed.

## 6. Coach Drawer

Purpose:

> Teach in context.

Recommended tabs:

- Learn
- Fix
- Guides

Learn tab should show:

1. What was detected.
2. Why it may matter.
3. When to keep it.
4. When to rewrite it.
5. One move to try.

Fix tab should show:

- editable fix result,
- copy button,
- optional AI generation.

Guides tab should link to long reader overlays.

Why better:

It separates learning, fixing, and reference.

## 7. Fix Overlay

Purpose:

> Repair sentence-level issues without losing user control.

Recommended changes:

- Do not auto-generate AI for every row.
- Show "Generate" per row and "Generate all" with confirmation.
- Make rewrite cells editable.
- Highlight exact matched phrase in original.
- Explain why each row was flagged.

Why better:

It avoids surprise token usage and keeps manual work possible.

## 8. Audience Mode

Purpose:

> Match feedback to communication scenario.

Audience modes:

- Builder / LLM
- Operator / Manager
- Business Owner
- General Reader

Mode structures:

Builder / LLM:

> Location -> Target -> Problem -> Why -> Action -> Constraint

Operator / Manager:

> Process -> Bottleneck -> Cause -> Metric -> Action

Business Owner:

> Area -> Outcome -> Pain -> Impact -> Priority

General Reader:

> Frame -> Point -> Reason -> Bridge

Implementation note:

Audience mode is a **lens**, not a separate product branch. Up / Down / Wide stays constant in every mode. Audience changes the examples, coaching phrasing, and optional scaffold — not the core framework.

Why better:

The same sentence can be correct or incomplete depending on audience. The app should not force one writing model on every situation.

Future slice (after Slice 3):

LLM Task scaffold (Location -> Target -> Action -> Constraint) ships **after** the movement intent bar is validated. Both sit above the editor; building both at once creates competing controls. Movement bar first; LLM scaffold second, scoped to Builder / LLM audience.

## 9. Positive Feedback

Purpose:

> Teach what worked.

Examples:

- Clear action found.
- Specific target named.
- Bridge connects to previous sentence.
- Constraint stated.
- Why added.

Why better:

The user learns patterns by seeing success, not only failure.

## 10. AI Optionalism

Purpose:

> The app must remain useful when AI is unavailable.

Recommended UX:

- Local checks work immediately.
- Setup banner should say AI is optional.
- AI errors should preserve drafts.
- Error messages should offer next action:
  - Open Settings
  - Try again
  - Keep editing manually

Why better:

The app supports thinking first, AI second.

## 11. Persistence As Trust

Purpose:

> A thinking workspace must not lose the user's work.

Recommended UX:

- Auto-save the main editor draft.
- Auto-save the workshop draft separately.
- Restore saved work on cold start with a visible prompt.
- Discard clears the workshop draft only.
- Hide never clears a draft.

Why better:

The learning loop depends on trust. If a restart loses the user's draft, the app stops feeling like a workspace and starts feeling like a temporary tool.

## Accessibility Requirements

Accessibility is not a late audit. It is part of each slice.

Global requirements:

- Every chip label must be text, not color only.
- Every chip needs an `aria-label` that describes the thinking move.
- Status strips for LLM progress and errors should use `role="status"` and `aria-live="polite"`.
- Coach drawer close should return focus to the chip that opened it.
- Movement intent bar should be a radio group or tab list with keyboard navigation.
- My draft and AI suggestion need explicit labels, not visual headings only.
- Structure Map should use list semantics and communicate sentence roles as text.

## Why This UX Is Better For LLM Implementation

This design is clearer for an LLM because it provides:

1. A single north star.
2. A small set of concepts.
3. Clear surface ownership.
4. Priority order.
5. Specific labels and interaction rules.
6. Explicit "do not build" constraints.

An LLM implementing from this document should not need to infer the product direction.

## Recommended Reading Order

For future LLM or human implementers:

1. `THINKING_NOTES.md` — vocabulary and mental model.
2. `UX-ONE.md` — broad product vision.
3. `UX-THREE.md` — why sequence matters and why UX-TWO wins over UX-ONE alone.
4. `UX-TWO.md` — concrete change suggestions tied to current code.
5. `UX.md` — consolidated decision, implementation rules, and first slice.

Without this order, an implementer may treat `UX-ONE.md` and `UX-TWO.md` as competing plans. They are not competing plans. `UX-ONE.md` is the vision. `UX-TWO.md` is the build path.

## LLM Implementation Rules

When implementing, follow these rules:

1. Do not turn the app into a generic grammar checker.
2. Do not imply every highlighted word is wrong.
3. Do not make AI overwrite user text silently.
4. Do not add more rules before the app teaches what to do with existing rules.
5. Prefer user-facing terms from this document over grammar jargon.
6. Keep manual editing available in every AI surface.
7. Preserve drafts before generating AI suggestions.
8. Build in thin slices.
9. User-facing copy must prefer `THINKING_NOTES.md` vocabulary: Frame, Bridge, Move Up, Move Down, Move Wide, Actor, Action, Constraint, Pattern.
10. Paramedic Method terms are reference material first, not primary toolbar labels.

## Vocabulary Rules (User-Facing Copy)

Use in labels, coach content, `aria-label`s, and status messages:

| Use | Do not use as primary label |
| --- | --- |
| Frame | Preposition |
| Hidden action | Weak verb, passive voice |
| Noun not verb | Nominalization |
| Wind-up | Filler |
| Extra words | Needless words |
| Subject-verb gap | Spine |
| Noun pile | Noun stack |
| Missing bridge | Flow issue |
| Move Up | Abstract, zoom out |
| Move Down | Concrete, zoom in |
| Move Wide | Expand, generalize |
| My draft | User text, AI rewrite |
| AI suggestion | Generated text, AI rewrite |
| Rewrite Workshop | AI Rewrite, Compare |
| What's working | Score, quality rating |

Chip relabeling (short labels in toolbar):

| Current | Recommended |
| --- | --- |
| Weak | Hidden action |
| Prep | Frames |
| Nom | Noun not verb |
| Fill | Wind-up |
| Needless | Extra words |
| Spine | Subject-verb gap |
| Stack | Noun pile |
| Flow | Missing bridge |

## Recommended Implementation Order

## Slice 1: Language And Labels

Goal:

> Make the current UI tell the truth about what it does.

Changes:

- Rename AI Rewrite to Rewrite Workshop.
- Rename chips to thinking-move labels.
- Update status messages.
- Add tooltips or `aria-label`s that explain checks.

Why first:

No engine change is required. It improves user trust immediately.

Acceptance checks:

- Toolbar and overlay do not use "AI Rewrite" as the primary feature noun.
- Every chip has user-facing copy that describes a thinking move, not only a grammar term.
- LLM error/status copy keeps manual editing available and does not close the workshop.

## Slice 2: Teach Before Fix

Goal:

> Chip click teaches before it automates.

Changes:

- Chip click opens coach content.
- Coach content shows keep/rewrite guidance.
- Fix action becomes secondary.

Why second:

This changes the app from detection to learning.

Acceptance checks:

- First chip click opens teaching content in the coach drawer (Learn tab), not automatic AI repair or Fix overlay.
- Teaching content includes: what was noticed, when to keep it, when to rewrite it, and one move to try.
- Fix actions remain available but secondary (not the first or only button).
- "Highlight in editor" and "Keep for this session" behave per the chip state machine below.

## Slice 2b: Positive Feedback

Goal:

> Teach what is working, not only what is broken.

Changes:

- Add a compact "What's working" row under the chips.
- Show 0 to 3 positive checks.
- Start with simple heuristics: clear action, specific target, bridge token, explicit constraint.

Why here:

Without early positive feedback, renamed chips can still feel like a softer grammar checker. The user needs evidence of success as well as flags.

Acceptance checks:

- "What's working" appears even when no issues are detected.
- Positive checks use the same framework vocabulary as issue chips.
- Positive feedback never becomes a score or quality percentage.

## Slice 3: Movement Intent Bar

Goal:

> Make Up / Down / Wide active in the writing flow.

Changes:

- Replace static core question.
- Add Move Up / Move Down / Move Wide buttons.
- Show one hint based on selection.

Why third:

This brings the main framework into daily use without requiring advanced NLP.

Acceptance checks:

- Movement intent bar is hidden in the empty editor state. It appears after the user has written at least one sentence.
- When visible, the hint references the written text (e.g. "What should your next sentence do?"), not abstract mode selection.
- Selecting Move Up / Move Down / Move Wide opens a scaffold prompt; it does not auto-generate AI text.
- Move Up scaffold: "This matters because ___"
- Move Down scaffold: "Do this: ___ in ___"
- Move Wide scaffold: "Check whether ___ also applies to ___"
- Audience mode modifies coaching hints; it does not replace the movement bar.

## Slice 4: Workshop Lanes

Goal:

> Separate My draft from AI suggestion.

Changes:

- Add primary editable My draft.
- Add optional AI suggestion area.
- Add Insert into draft action.
- Keep AI from overwriting user text.

Why fourth:

It fixes the biggest AI ownership issue.

Acceptance checks:

- My draft and AI suggestion are visually and semantically separate.
- AI suggestion never overwrites My draft without explicit user action.
- Insert actions preserve focus in My draft after completion.
- Main editor draft saves locally.
- Workshop draft saves locally, separate from the main editor.
- Cold start shows a visible restore prompt when saved work exists.
- Discard clears the workshop draft; it does not clear the main editor.

## Slice 5: Structure Map

Goal:

> Make sentence flow visible.

Changes:

- Add sentence list with roles.
- Show bridge chains.
- Show Up / Down / Wide movement hints.
- Keep or retire the SVG tree after testing.

Why fifth:

It is larger and should be informed by the earlier language/movement work.

Acceptance checks:

- Phase 0 ships first: compact sentence list with sentence number, first words, and issue count.
- Structure Map shows sentence roles as text, not color only.
- Bridge chains are visible where detected.
- Existing tree is not removed until the sentence-list model proves useful.

## Do Not Build Yet

Do not build these until the learning loop is clear:

- grammar score,
- quality percentage,
- more rule categories,
- auto-apply AI rewrite,
- large onboarding course,
- complex personalization system,
- global persistent "ignore forever" behavior.
- Apply to editor during slices 1 to 3.
- LLM Task scaffold before movement intent bar is validated.

Reason:

Apply-to-editor must wait until teach-first chips and two-lane workshop ownership exist. Otherwise users will skip the learning loop and treat AI output as final.

The LLM Task scaffold competes with the movement bar for attention above the editor. Ship movement first; add scaffold as a later slice scoped to Builder / LLM audience.

## Chip Interaction State Machine

Canonical behavior for issue chips (implements Slice 2):

```text
Chip: default
  -> user clicks chip
  -> coach drawer opens, Learn tab active
  -> Learn shows: detected, why it matters, keep when, rewrite when, one move
  -> secondary actions: [Highlight in editor] [Fix sentences] [Keep for this session]

Highlight in editor
  -> matched spans pulse or receive visible focus in main editor
  -> drawer stays open

Fix sentences
  -> Fix overlay opens
  -> AI does not generate automatically
  -> each row has [Generate]; rewrite cells are editable

Keep for this session
  -> spans marked user-approved for this document session
  -> chip shows approved state; coach does not auto-open on repeat click

Same chip while drawer open
  -> drawer closes (toggle)

Different chip while drawer open
  -> Learn content switches to the new chip
```

Slice 1 may ship label and `aria-label` changes before this state machine exists. Slice 2 is not complete until the full machine above works.

## AI Surface Regression Checklist

Before shipping any change to Rewrite Workshop or Fix overlay, verify:

- Manual mode works with no API key.
- LLM failure preserves the draft and shows a next action.
- In-flight LLM request is discarded when the user clicks Discard.
- Hide preserves the session.
- Discard clears the session.
- User edits during an active LLM request are not overwritten when the request completes.
- Source text snapshot is frozen at workshop open and does not drift with the main editor.
- Workshop draft is saved before any LLM call begins.
- Restore prompt appears on cold start if a saved workshop draft exists.

## First UX Slice To Build

The best first slice is:

> Reframe preposition feedback as Frame feedback for `in`, with keep/rewrite guidance and one rewrite move.

Why:

- It matches the user's actual confusion.
- It validates "check, not condemn."
- It can be built from current rule/chip/drawer surfaces.
- It teaches the first useful thinking move.
- It prepares the app for Up / Down / Wide.

Expected user-facing behavior:

When `in` is highlighted, the app should explain:

> This may be a frame. Keep it if it helps the reader locate the action. Rewrite it if it hides the actor, action, or creates too many nested frames.

One move:

> Try turning the frame into an action.

Example:

Current:

> In this URL, find the Better Tips section.

Rewrite:

> Locate this URL. Find the Better Tips section.

Or, for code work:

> Locate the Welcome view. Find the Better Tips section.

Minimum coach copy:

Detected:

> This may be a frame — a boundary that tells the reader where to place the idea.

Keep when:

> Keep it when the frame gives useful location, scope, or role.

Rewrite when:

> Rewrite it when the frame stacks before the main action or hides who does what.

One move:

> Name the target directly, or split into two sentences: frame first, action second.

Success test:

> The user should not leave the interaction asking, "Is every `in` wrong?" The user should know whether this frame helps or hides the action.

Slice 1 ships the labels, `aria-label`s, and workshop rename. Slice 2 ships the coach content and state machine above. The Frame-first content is the first complete teach-before-fix example — not the entire Slice 1 scope.

## Risks During Implementation

Watch these during build; they are common failure modes:

**Movement bar as mode selector**

If the bar appears before the user writes, or auto-generates text on click, users treat Up / Down / Wide as preferences instead of judgment about their text. Keep the bar hidden until at least one sentence exists; scaffolds are manual fill-in, not AI output.

**Audience mode as four products**

Four audience templates must not replace the shared Up / Down / Wide model. Audience adjusts tone and examples only.

**Structure Map before vocabulary**

Sentence roles (Frame, Action, Why, Bridge) need classification not yet in the stack. Ship Phase 0 (compact sentence list) before roles or bridge chains. Do not remove the SVG tree until Phase 0 proves useful.

**Insert into draft ambiguity**

One button, three behaviors: empty draft replaces without confirm; non-empty draft replace-all confirms; selection replaces selection only. After insert: focus in My draft; AI suggestion lane unchanged.

**Slice 1 / Slice 2 boundary**

Slice 1 is copy and naming only. Do not mark Slice 1 done when coach drawer behavior is missing — that is Slice 2. Marking Slice 1 done early hides that teach-before-fix is still absent.

## Final Case

This UX design is better because it aligns the interface with the real job:

> Help the user think clearly, communicate truthfully, and learn repeatable moves.

It is better than a grammar-checker design because it does not stop at detection.

It is better than an AI-rewrite design because it does not remove the user from the thinking loop.

It is better than a guide-heavy design because it teaches in the moment of writing.

It is better for implementation because it gives LLMs precise concepts, labels, priorities, and guardrails.

The final product should feel like a thinking coach:

> It shows what happened in the sentence, helps the user judge whether it matters, and gives one truthful move forward.

## Slice Completion Summary

Use this table to mark slices done. Do not conflate slices.

| Slice | Delivers | Not included |
| --- | --- | --- |
| 1 | Labels, rename workshop, `aria-label`s, status copy | Coach drawer on chip click |
| 2 | Teach-before-fix, chip state machine, Frame coach content for `in` | Two-lane workshop |
| 2b | "What's working" row | Movement bar |
| 3 | Movement intent bar (after first sentence), scaffolds | AI auto-fill |
| 4 | My draft / AI suggestion lanes, insert rules, persistence | Structure Map roles |
| 5 | Phase 0 sentence list; then roles and bridges if validated | Tree removal |

First shippable vertical: **Slice 1 + start of Slice 2** using Frame/`in` as the first complete teach-before-fix example.
