# UX Implementation Task List

Source spec: [UX.md](./UX.md)  
Branch: `implement_ux`

Track progress by checking boxes. Each slice maps to UX.md acceptance criteria.

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

**Files:** `panel.js`, `compare.js`, `fix.js`, `chip-defs.js`, `overlays.css`

---

## Slice 2 — Teach Before Fix

- [x] Chip click opens coach drawer Learn tab (not Fix overlay)
- [x] Coach content: detected, why, keep when, rewrite when, one move, example pair
- [x] Secondary actions: Highlight in editor, Fix sentences, Keep for this session
- [x] Same chip toggles drawer closed; different chip switches content
- [x] Fix sentences opens Fix overlay (generate on demand only)
- [x] Frame/`in` coach copy matches UX.md minimum blocks

**Files:** `coach.js`, `chip-defs.js`, `panel.js`, `drawer.js`, `panel.css`

---

## Slice 2b — Positive Feedback

- [x] Add `What's working` row under issue chips
- [x] Show 0–3 positive checks (clear action, bridge, constraint heuristics)
- [x] Visible even when no issues detected

**Files:** `positive.js`, `panel.js`, `panel.css`

---

## Slice 3 — Movement Intent Bar

- [x] Replace static core question with movement bar (hidden until ≥1 sentence)
- [x] Move Up / Move Down / Move Wide as radio group
- [x] Scaffold prompt on selection (manual fill, no AI auto-generate)
- [x] Audience selector (Builder, Operator, Business, Reader) as lens on hints
- [x] Coaching hint line updates with selection

**Files:** `movement.js`, `panel.js`, `panel.css`

---

## Slice 4 — Workshop Lanes

- [x] Separate My draft (primary textarea) and AI suggestion (secondary area)
- [x] Generate button in AI suggestion lane (no silent overwrite)
- [x] Insert into draft: replace all / append / replace selection with confirm rules
- [x] Workshop movement controls (Up / Down / Wide scaffolds in draft)
- [x] Auto-save main editor + workshop draft to localStorage
- [x] Restore prompt on cold start
- [x] Discard clears workshop only; Hide preserves session

**Files:** `compare.js`, `persistence.js`, `panel.js`, `overlays.css`, `main.js`

---

## Slice 5 — Structure Map (Phase 0)

- [x] Compact sentence list: number, preview, issue count
- [x] Classic tree toggle (Structure map | Classic tree)
- [x] Click sentence scrolls editor

**Files:** `structure-map.js`, `panel.js`, `panel.css`

---

## Fix Overlay (cross-slice)

- [x] Remove auto-generate on open
- [x] Per-row Generate button
- [x] Generate all with confirmation
- [x] Editable rewrite cells (textarea)
- [x] Relabeled chip strip and titles

**Files:** `fix.js`, `overlays.css`

---

## Coach Drawer Tabs (cross-slice)

- [x] Learn | Fix | Guides tab bar
- [x] Guides tab: long-form reader links
- [x] Fix tab: sentence Smart Fix (from tree selection)
- [x] Focus return to chip on drawer close

**Files:** `panel.js`, `coach.js`, `drawer.js`, `panel.css`

---

## Accessibility

- [x] Status strip: `role="status"`, `aria-live="polite"`
- [x] Movement bar: radio group + keyboard
- [x] My draft / AI suggestion: explicit `<label for>`
- [x] Structure map: `<ol>` / `<li>` semantics

---

## Regression Checklist (verify after each AI surface change)

- [x] Manual mode works with no API key — local analysis + coach; LLM only on Generate
- [x] LLM failure preserves draft + shows next action — workshop AI lane only; fix keeps `userText`
- [x] Discard invalidates in-flight LLM — `activeRequestId` bump in `closeCompare`
- [x] Hide preserves session; Discard clears — `hideCompare` vs `closeCompare` + flush/clear storage
- [x] User edits during LLM not overwritten — draft lane untouched during Generate
- [x] Source snapshot frozen at workshop open — `compareSourceText` set at open; chips use snapshot
- [x] Workshop draft saved before LLM call — `flushPersistWorkshop()` before Generate
- [x] Restore prompt on cold start — `showRestorePrompt` on mount

Run static verification: `node scripts/ux-regression-check.mjs`

---

## Implementation Order

1. Slice 1 + `chip-defs.js`
2. Slice 2 + `coach.js`
3. Slice 2b + `positive.js`
4. Fix overlay manual-first
5. Slice 3 + `movement.js`
6. Slice 4 + `persistence.js` + workshop refactor
7. Slice 5 + `structure-map.js`
8. Drawer tabs + polish

---

## Status Log

| Date | Slice | Notes |
| --- | --- | --- |
| 2026-05-30 | 1–5 + cross-slice | Full UX.md implementation on `implement_ux`: new modules, panel/compare/fix rewrite, CSS, task list. Manual regression checklist pending. |
| 2026-05-30 | Regression | Flush-before-LLM, fix overlay manual-edit preservation, hidden workshop resume, `scripts/ux-regression-check.mjs`. |

---

## Deferred (per UX.md, not in slices 1–5)

- Apply-to-editor from workshop or fix overlay
- LLM task scaffold in movement bar
- Structure map Phase 1+ (sentence roles, bridge chains)
- Grammar scores / readability metrics
