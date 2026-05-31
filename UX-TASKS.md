# UX Implementation Task List

Source spec: [UX.md](./UX.md)  
Branch: `implement_ux`

**Status: complete** — all slices and deferred items implemented.

Run verification: `npm run check:ux`

---

## Slice 1 — Language And Labels

- [x] Rename toolbar button: `Rewrite…` (not AI Rewrite)
- [x] Rename overlay: `Rewrite Workshop`
- [x] Rename workshop actions: Copy my draft, Hide workshop, Discard workshop, Resume rewrite
- [x] Relabel issue chips (Hidden action, Frames, Noun not verb, Wind-up, Extra words, Subject-verb gap, Noun pile, Missing bridge)
- [x] Add `aria-label` on every chip describing the thinking move
- [x] Update workshop status copy (manual editing path on LLM error)
- [x] Update setup banner: AI optional, local checks work without key
- [x] Centralize labels in `src/ui/chip-defs.js`

---

## Slice 2 — Teach Before Fix

- [x] Chip click opens coach drawer Learn tab (not Fix overlay)
- [x] Coach content: detected, why, keep when, rewrite when, one move, example pair
- [x] Secondary actions: Highlight in editor, Fix sentences, Keep for this session
- [x] Same chip toggles drawer closed; different chip switches content
- [x] Fix sentences opens Fix overlay (generate on demand only)
- [x] Frame/`in` coach copy matches UX.md minimum blocks

---

## Slice 2b — Positive Feedback

- [x] Add `What's working` row under issue chips
- [x] Show 0–3 positive checks (clear action, bridge, constraint heuristics)
- [x] Visible even when no issues detected

---

## Slice 3 — Movement Intent Bar

- [x] Replace static core question with movement bar (hidden until ≥1 sentence)
- [x] Move Up / Move Down / Move Wide as radio group
- [x] Scaffold prompt on selection (manual fill, no AI auto-generate)
- [x] Audience selector (Builder, Operator, Business, Reader) as lens on hints
- [x] Coaching hint line updates with selection

---

## Slice 4 — Workshop Lanes

- [x] Separate My draft (primary textarea) and AI suggestion (secondary area)
- [x] Generate button in AI suggestion lane (no silent overwrite)
- [x] Insert into draft: replace all / append / replace selection with confirm rules
- [x] Workshop movement controls (Up / Down / Wide scaffolds in draft)
- [x] Auto-save main editor + workshop draft to localStorage
- [x] Restore prompt on cold start
- [x] Discard clears workshop only; Hide preserves session

---

## Slice 5 — Structure Map (Phase 0)

- [x] Compact sentence list: number, preview, issue count
- [x] Classic tree toggle (Structure map | Classic tree)
- [x] Click sentence scrolls editor

---

## Slice 6 — Structure Map Phase 1

- [x] Sentence roles as text badges (Frame, Action, Why, ?)
- [x] Bridge chains between sentences
- [x] Movement hints on gaps (missing bridge)
- [x] Click opens coach Learn for flagged sentence

**Files:** `sentence-roles.js`, `structure-map.js`, `panel.css`

---

## Slice 7 — Apply To Editor

- [x] Diff modal: current editor vs proposed text
- [x] Default action: Copy to clipboard
- [x] Replace editor text with undo toast
- [x] Workshop: Apply to editor button
- [x] Fix overlay: Apply to editor per row

**Files:** `apply-editor.js`, `compare.js`, `fix.js`, `panel.js`, `overlays.css`

---

## Slice 8 — LLM Task Scaffold

- [x] Builder audience only — collapsible block under movement bar
- [x] Fields: Location, Target, Action, Constraint
- [x] Insert scaffold (manual)
- [x] Generate with AI (optional)

**Files:** `movement.js`, `prompts.js`, `client.js`, `panel.js`, `panel.css`

---

## Slice 9 — Structure Signals (not grammar score)

- [x] Thinking-focused summary: clear roles + bridge count
- [x] Shown in toolbar and structure map header
- [x] No grammar percentage or quality score (per UX.md do-not-build)

**Files:** `structure-signals.js`, `sentence-roles.js`, `panel.js`

---

## Fix Overlay (cross-slice)

- [x] Remove auto-generate on open
- [x] Per-row Generate button
- [x] Generate all with confirmation
- [x] Editable rewrite cells (textarea)
- [x] Relabeled chip strip and titles
- [x] Highlight matched phrase in original
- [x] Why flagged line from coach copy

---

## Coach Drawer Tabs (cross-slice)

- [x] Learn | Fix | Guides tab bar
- [x] Guides tab: long-form reader links + reference examples
- [x] Fix tab: sentence Smart Fix (from tree selection)
- [x] Focus return to chip on drawer close

---

## Accessibility

- [x] Status strip: `role="status"`, `aria-live="polite"`
- [x] Movement bar: radio group + keyboard
- [x] My draft / AI suggestion: explicit `<label for>`
- [x] Structure map: `<ol>` / `<li>` semantics + role text labels

---

## Regression Checklist

- [x] Manual mode works with no API key
- [x] LLM failure preserves draft + shows next action
- [x] Discard invalidates in-flight LLM
- [x] Hide preserves session; Discard clears
- [x] User edits during LLM not overwritten
- [x] Source snapshot frozen at workshop open
- [x] Workshop draft saved before LLM call (flush)
- [x] Restore prompt on cold start

---

## Status Log

| Date | Slice | Notes |
| --- | --- | --- |
| 2026-05-30 | 1–5 + cross-slice | Core UX.md implementation |
| 2026-05-30 | Regression | Flush-before-LLM, fix manual-edit preservation |
| 2026-05-30 | 6–9 | Structure map Phase 1, apply-to-editor, LLM scaffold, structure signals |
| 2026-05-30 | 10 | Onboarding, settings test, workshop indicator, polish quick wins |

---

## Slice 10 — Polish (UX-TWO priorities G–I, quick wins)

- [x] Setup banner: Continue without AI + updated copy
- [x] Settings: Test connection + provider status line
- [x] Workshop draft indicator in toolbar
- [x] Hide workshop toast (Escape / Hide)
- [x] Word + sentence count in toolbar
- [x] Chip severity styling (heavy / repeat patterns)
- [x] Learn tab framework primer when no chip selected
- [x] Smart Fix result as editable textarea
- [x] Full sentence shown in Fix tab target

---

## Explicitly excluded (UX.md “Do Not Build Yet”)

- Grammar score / quality percentage
- Auto-apply AI rewrite without diff
- Global persistent ignore forever
- Large onboarding course
