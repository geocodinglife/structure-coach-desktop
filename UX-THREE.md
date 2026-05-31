# UX Three: Why UX-TWO Is The Better Design Direction

Status: Design rationale. Argument document, not an implementation spec.

This document reads [UX-ONE.md](./UX-ONE.md) closely, compares it to [UX-TWO.md](./UX-TWO.md), and makes the case for why the second-pass recommendations are the stronger path to build. It does not replace either document. It explains **why**.

Related docs:

| Document | Role |
|----------|------|
| [THINKING_NOTES.md](./THINKING_NOTES.md) | Mental model — Up / Down / Wide, Frame, Bridge |
| [UX-ONE.md](./UX-ONE.md) | Broad vision — correct north star, wide scope |
| [UX-TWO.md](./UX-TWO.md) | Tactical plan — concrete changes tied to code |
| [UX.md](./UX.md) | Consolidated decision doc for implementation |
| **UX-THREE.md** | **Why UX-TWO wins over UX-ONE alone** |

---

## Short Answer

**UX-ONE is right about where the product should go. UX-TWO is right about how to get there.**

UX-ONE defines a excellent north star: help the user move Up, Down, or Wide, and turn highlights into decisions. But as a build guide it is too broad, too undifferentiated in priority, and not anchored enough in what the app already does today.

UX-TWO keeps every principle from UX-ONE and adds what UX-ONE lacks:

1. **Sequencing** — what to ship first and why
2. **Ground truth** — what is already built vs still missing
3. **Interaction specificity** — exact copy, layout, and click order
4. **Learning loop completion** — Classify → Teach → Rewrite, not just Detect

If you implement from UX-ONE alone, you risk building the right features in the wrong order, or building new surfaces before the app teaches one reliable move.

---

## What UX-ONE Gets Right (And Must Be Preserved)

UX-ONE should not be discarded. It makes several decisions that are correct and non-negotiable:

### 1. The north star is movement, not grammar

UX-ONE states clearly:

> Structure Coach should help the user know when to move: Up, down, or wide.

That aligns with THINKING_NOTES and with how the user actually thinks — business level, operator level, builder level. A grammar checker optimizes prose. This product optimizes **direction of thought**.

**Verdict:** Keep UX-ONE’s north star. UX-TWO does not change it; it operationalizes it.

### 2. Detection must become judgment

UX-ONE’s primary UX problem is precisely stated:

> The app shows signals, but it does not always teach a reliable next move.

The `in` / Better Tips example is the right test case. UX-ONE correctly reframes “Prepositions (Nesting)” into “Frame detected — is this helping or hiding action?”

**Verdict:** UX-ONE diagnosed the disease correctly. UX-TWO prescribes the treatment schedule.

### 3. AI must not own the final text

UX-ONE’s recommendation #7 — “Make AI Rewrite A Workshop, Not A Result” — matches THINKING_NOTES and matches what learning requires. The user must remain the editor.

**Verdict:** UX-TWO’s “My draft primary, AI suggestion secondary” is not a new idea. It is UX-ONE’s idea with a wireframe and implementation rules attached.

### 4. The learning loop is the product

UX-ONE’s loop (Write → Detect → Classify → Teach → Rewrite → Compare) is the right framework for success.

**Verdict:** UX-TWO names which steps are missing today and which slice closes each gap.

---

## Where UX-ONE Falls Short As A Build Guide

UX-ONE is a strong **vision document**. It is a weaker **execution document**. Here is why.

### Problem 1: Twenty recommendations with equal visual weight

UX-ONE lists twenty core improvements, a priority plan of five areas, and detailed opportunities across nine surfaces. Everything is reasonable. Nothing is forced to wait.

Example tension inside UX-ONE itself:

- Priority 2: Add Up / Down / Wide movement panel
- Priority 3: LLM command scaffold
- Priority 4: Replace the tree
- Priority 5: Strengthen AI rewrite workshop

All are good. But an implementer — human or LLM — reading UX-ONE alone cannot know whether to start with the movement panel, the LLM scaffold, or the tree replacement. Each is a multi-week effort.

**UX-TWO fix:** Five named slices with day-range estimates and explicit “no engine change” for Slice 1.

**Why that is better:** The user’s immediate pain is “Prep: 3 — now what?” not “I need a new right panel.” UX-TWO puts language + teach-before-fix before Structure Map because the learning loop breaks at Classify and Teach, not at visualization.

### Problem 2: Priority order puts the workshop too late

UX-ONE Priority 5 is “Strengthen AI Rewrite As A Manual Workspace.”

But the codebase **already has** a rewrite overlay with editable draft, hide/resume, issue chips, and status messaging. That is the most advanced surface in the app. Leaving workshop UX refinement until Priority 5 means:

- The most visible AI feature continues to misrepresent the product (“AI Rewrite” implies automation)
- Users hit the broken part of the experience first (toolbar primary action)
- Partial good implementation (editable draft) stays hidden behind bad framing (AI owns the result)

**UX-TWO fix:** Slice 1 renames and reframes the workshop immediately. Slice 4 separates My draft from AI suggestion lanes.

**Why that is better:** Meet users where they already click. Fix the loudest lie in the UI first: that AI writes for you.

### Problem 3: UX-ONE describes surfaces; UX-TWO describes click paths

Compare how each document handles issue chips.

**UX-ONE says:**

- Add hover/title text
- Add severity categories
- Add “why this matters” inside opened panel
- Use chips as filters and lessons

All correct. None specifies the **first click behavior**.

**UX-TWO says:**

1. What we noticed
2. When to keep it
3. When to rewrite it
4. Try this move
5. Then: Highlight · Fix sentences · Ignore this check

**Why that is better:** UX-TWO defines an interaction contract. An LLM or developer can build a drawer panel from it without inventing flow. UX-ONE leaves flow implicit.

### Problem 4: UX-ONE is not updated for code reality

UX-ONE was written as a planning pass. It lists the compare overlay as “AI Rewrite compare overlay” with recommendations like “Preserve my draft by default” — which is **now partially implemented** (hide/resume, dirty preservation, snapshotted source text).

Without a code-reality section, an implementer might:

- Re-build draft persistence that already exists
- Miss that the real gap is naming and lane separation, not “add editable textarea”
- Ignore the resume button / hide-discard semantics already shipped

**UX-TWO fix:** “What Changed Since UX-ONE” table maps surface → current behavior → UX gap.

**Why that is better:** Avoids duplicate work and focuses effort on what still feels broken to users.

### Problem 5: UX-ONE under-specifies failure and optional AI

UX-ONE mentions provider errors and onboarding in recommendations #14–16, but scattered across 868 lines.

**UX-TWO fix:** AI optionalism, status strip copy table, Settings quick wins, and “Manual mode works without a key” as explicit requirements.

**Why that is better:** The user’s trust breaks when AI fails and the app feels dead. THINKING_NOTES is about thinking clearly — that must work offline, without a key, without Ollama running. UX-TWO treats manual mode as a first-class path, not a fallback footnote.

---

## Head-To-Head: Five Decisions Where UX-TWO Is Stronger

### Decision 1: What ships first?

| UX-ONE | UX-TWO |
|--------|--------|
| Priority 1: Truthful feedback (labels, keep/rewrite) | Slice 1: Language pass (same, but scoped to 1–2 days, no engine) |
| Priority 4: Structure visualization before workshop is finished | Slice 5: Structure Map after movement bar and workshop lanes |

**Why UX-TWO wins:** Slice order follows user pain frequency. Users click AI Rewrite and chips daily. They rarely need a new tree to learn Frame vs action. Visualization helps **after** vocabulary and teach-first flow exist — otherwise the Structure Map shows roles the user has not been taught to name.

### Decision 2: Rewrite overlay architecture

| UX-ONE | UX-TWO |
|--------|--------|
| “Rename to Rewrite Workspace”; add movement controls; preserve draft | Same + explicit two-lane layout ASCII + Insert-into-draft rules + status copy table + Hide/Discard/resume naming |

**Why UX-TWO wins:** UX-ONE’s vision is right but one textarea still collapses “my writing” and “AI output” into one mental bucket. Two lanes make ownership visible. Insert-into-draft with confirm prevents the exact bug class the code already guards against programmatically (`rewriteDirty`, `preserveDirty`) — UX should match that logic in the layout.

### Decision 3: Chip click outcome

| UX-ONE | UX-TWO |
|--------|--------|
| Chips open references or fix overlays; add teaching content somewhere | Chip click = teach first (5-step coach content), fix second |

**Why UX-TWO wins:** Current code opens Fix overlay from chips — automation before judgment. That trains “click to get AI rewrite,” not “click to understand Frame.” UX-TWO reverses the default path to match THINKING_NOTES: *When I see X, I can try Y.*

### Decision 4: Fix overlay AI behavior

| UX-ONE | UX-TWO |
|--------|--------|
| Add Generate per row; manual editable rewrite | Same, stated as Priority E with explicit “stop auto-generate” |

**Why UX-TWO wins:** UX-ONE recommends it; UX-TWO flags that **today’s code auto-calls LLM** — a concrete regression risk and trust break ( surprise token use ). UX-TWO is buildable from current `fix.js` behavior, not aspirational.

### Decision 5: Core question above editor

| UX-ONE | UX-TWO |
|--------|--------|
| Recommendation #1: Movement panel Up / Down / Wide | Priority C: Replace static “Does the other person have enough context?” with movement intent bar + Audience |

**Why UX-TWO wins:** UX-ONE’s static question is good but passive. It asks about the **other person** without connecting to Up / Down / Wide vocabulary THINKING_NOTES already defines. UX-TWO’s selector makes the framework **active before the next sentence** — the smallest UI change that teaches movement without new NLP.

---

## Why UX-TWO Better Serves THINKING_NOTES

THINKING_NOTES is not about Paramedic Method labels. It is about:

- **Frame** — where should the reader place this idea?
- **Bridge** — how does this sentence connect to the last?
- **Up / Down / Wide** — which direction does communication need?
- **Audience levels** — business, operator, builder

UX-ONE references these concepts. UX-TWO **maps each to a surface**:

| THINKING_NOTES concept | UX-ONE | UX-TWO surface |
|------------------------|--------|----------------|
| Frame | Rename Prep; coach drawer | Chip label + teach-first panel + Frame-first slice |
| Bridge | Flow → Missing bridge | Structure Map chain + positive feedback |
| Move Up / Down / Wide | Movement panel (priority 2) | Movement intent bar + workshop scaffolds |
| Audience levels | Audience mode (rec #5) | Audience selector on editor + mode-specific hints |
| LLM command structure | Prompt builder (rec #6) | Positive feedback for Location → Target → Action |

UX-TWO is better because it is a **translation layer** from philosophy to UI — not another layer of philosophy.

---

## Risk Analysis: Following UX-ONE Without UX-TWO

| Risk | Likelihood | Impact |
|------|------------|--------|
| Build Structure Map before teach-first chips | Medium | High — pretty UI that still doesn’t explain Frame |
| Leave “AI Rewrite” naming in place | High | High — contradicts learning-first positioning |
| Auto-generate fix rewrites indefinitely | High (already live) | Medium — cost, surprise, read-only frustration |
| Add LLM scaffold before movement vocabulary | Medium | Medium — new feature using old grammar language |
| Skip positive feedback | High | Medium — app stays anxiety-inducing |
| Tree replacement big-bang | Medium | High — large effort, unclear teaching gain |

UX-TWO’s slice order mitigates every row.

---

## What UX-TWO Should Still Borrow From UX-ONE

UX-TWO is not a complete replacement. These UX-ONE items should stay on the roadmap and are **not** downgraded by UX-TWO:

1. **Focus Mode** (UX-ONE Principle 3) — one learning target at a time; UX-TWO’s “top one or two moves” is the daily version, Focus Mode is the dedicated practice version
2. **LLM Task scaffold** (UX-ONE #6) — prompt builder for daily command writing
3. **Sentence role labels** (UX-ONE #10) — feeds Structure Map
4. **False-positive handling** (UX-ONE #9) — Keep / Rewrite / Ignore; UX-TWO adds affordance, UX-ONE adds persistence questions
5. **Draft persistence across restart** (UX-ONE #17) — UX-TWO mentions trust break; UX-ONE names the feature
6. **Open questions** at end of UX-ONE — audience inference, focus mode scope — still unresolved; UX-TWO adds five more

The case for UX-TWO is not “ignore UX-ONE’s extras.” It is “**do not let UX-ONE’s breadth delay the fixes users feel today.**”

---

## Evidence From The Codebase (Why UX-TWO Is Grounded)

These are not hypothetical gaps. They were observed in the current implementation:

| Code fact | UX-ONE mention | UX-TWO response |
|-----------|----------------|-----------------|
| Toolbar button: “✨ AI Rewrite” | Rename recommended | Slice 1: rename first |
| Compare overlay: editable textarea, hide, resume | Priority 5 workshop | Slice 1 + 4: reframe + two lanes |
| Chips: `Prep`, `Weak`, etc. | Rename in Priority 1 | Slice 1 label table |
| Fix overlay: auto `callLLM` per row | Rec #fix manual path | Priority E: Generate on demand |
| Core question static in `panel.js` | Movement panel rec #1 | Priority C: intent bar |
| Tree: 60% width SVG | Replace with Structure Map | Slice 5, with classic toggle |
| No positive feedback UI | UX-ONE #13 | Priority I |
| Session-only text | UX-ONE #17 | UX-TWO trust / persistence note |

UX-TWO is better because it was written **after** partial workshop implementation — it describes the next layer, not a greenfield app.

---

## The Argument In One Paragraph

UX-ONE correctly defines Structure Coach as a clear-thinking workspace oriented around Up, Down, and Wide. It fails as an execution plan because it spreads twenty good ideas across nine surfaces without a forced sequence, puts workshop refinement late while the AI button remains the primary CTA, and does not reflect what the codebase already ships. UX-TWO preserves UX-ONE’s north star and completes the learning loop with teach-before-fix click paths, workshop lane separation, movement intent at the editor, and five thin slices ordered by user pain and implementation risk. **Build the vision from UX-ONE. Build the product from UX-TWO.**

---

## Recommended Reading Order For Implementers

1. THINKING_NOTES.md — vocabulary and mental model
2. UX-ONE.md — full vision (skim priorities and surface sections)
3. **UX-THREE.md** — this document — understand why sequence matters
4. UX-TWO.md — what to change, in what order
5. UX.md — consolidated decision + LLM rules

---

## Success Test (Same As UX-TWO, Stated As UX-ONE Gap)

UX-ONE asks for highlights that become decisions. UX-TWO adds a pass/fail test:

After Slice 2 ships, the user should **never** be stuck at “Prep: 3” without a next step.

If they can say — *“It flagged a frame; I kept it because it gives location”* — UX-ONE’s vision is alive.

If they still say — *“It flagged a preposition; is that bad?”* — UX-ONE’s vision is documented but not delivered.

**That is why UX-TWO is the better design direction to implement.**
