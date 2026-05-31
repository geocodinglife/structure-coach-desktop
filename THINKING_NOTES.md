# Thinking Notes: Frames, Prepositions, and Writing Structure

Status: Work in progress.

These notes capture the current thinking before changing the app. They are not final product copy. The goal is to define the mental model first, then later decide what the app should highlight, explain, or teach.

## Paramount Idea: Communication Moves Up, Down, Or Wide

This is the main idea of the framework.

Communication does not only move sentence by sentence. It can move in three directions depending on the situation:

> Up, down, or wide.

Everything else in this document should support this model.

## Move Up: Explain Why

Moving up means moving from detail to reason, outcome, business impact, or purpose.

Use this when people need the bigger reason, the importance, or the decision behind the work.

Pattern:

> Detail -> Reason -> Outcome -> Business Goal

Example:

> Sort the Better Tips list alphabetically.

Move up:

> Users cannot scan the Better Tips section quickly, so we need to make that section easier to navigate.

Move higher:

> The Welcome page should help users find value faster.

Short rule:

> Up explains why.

## Move Down: Explain How

Moving down means moving from goal or problem into action, process, implementation, or exact detail.

Use this when people need execution clarity.

Pattern:

> Goal -> Problem -> Action -> Implementation Detail

Example:

> The Welcome page should help users find value faster.

Move down:

> The Better Tips section is hard to scan.

Move lower:

> Sort the Better Tips list alphabetically.

Move lower:

> Change only the list in `app/views/welcome/index.html`.

Short rule:

> Down explains how.

## Move Wide: Check The Pattern

Moving wide means moving across related cases, areas, pages, modules, or situations.

Use this when the same pattern may exist elsewhere.

Pattern:

> This Case -> Similar Cases -> Pattern Across The System

Example:

> The Better Tips list is hard to scan.

Move wide:

> Are other lists on the Welcome page also hard to scan?

Move wider:

> Do other pages have unordered lists that users need to scan?

Short rule:

> Wide checks where else the pattern applies.

## Core Movement Rule

Use the right movement for the situation:

- Up: purpose, reason, business impact, decision.
- Down: process, action, implementation, exact change.
- Wide: similar cases, repeated pattern, system-wide check.

Example full movement:

Down:

> In `welcome/index.html`, sort the Better Tips list alphabetically.

Up:

> This matters because users need to scan the Welcome page quickly.

Wide:

> Check whether other lists on the Welcome page need the same treatment.

Current priority:

> The app and the writing framework should help me know when to move up, down, or wide without losing the truth.

## Starting Problem

This application was built to help me write better and think more clearly.

The current problem is that highlighting issues is not enough. Nothing sticks unless there is a repeatable structure I can return to. I need a mental anchor that helps me move from noticing a writing issue to knowing what action to take.

The app can show that a word or phrase may be a problem, but I need a strategy like:

> When I find X, I can try Y.

Without that, the highlight does not become learning.

## The Word "In"

The word `in` is not automatically a problem.

Normal uses of `in` are often fine:

- The keys are in the bag.
- She lives in Bogota.
- I will finish in two hours.

The Paramedic Method highlights `in` because it is a preposition, not because every use of `in` is wrong.

The issue appears when `in` creates or contributes to too many nested relationships before the reader reaches the main action.

Example pattern:

> The deadline for submission of proposals in response to an invitation from the National Science Foundation is October 31.

The issue is not one word. The issue is the chain:

- for submission
- of proposals
- in response
- to an invitation
- from the National Science Foundation

The reader has to keep opening one relationship inside another before reaching the point.

## Current Term: Frame

The term `layer` was close, but it may be wrong or too vague.

The better working term is:

> Frame

A frame is a mental boundary that tells the reader where to place an idea.

Words like `in`, `about`, `within`, `under`, `for`, and sometimes `as` can create frames.

Example:

> In this project, we need better rules.

The phrase `in this project` creates a frame. It tells the listener not to think generally, but inside the boundary of this project.

## Working Definition

A frame is a mental container, boundary, or scope that limits, organizes, or positions an idea.

It answers:

> Where should the listener place this idea?

Examples:

- In this app, the problem is clarity.
- In my writing, nothing sticks.
- In business, this would be an SOP issue.

These are not automatically wrong. A frame helps when it gives useful scope. It hurts when it replaces the actor, action, condition, or example.

## Why Frames Become Vague

Humans pick up speaking patterns from their environment. Sometimes those patterns make writing less specific.

A frame can become vague when the writer has not yet found the real structure of the thought.

Possible causes:

## 1. The Actor Is Unknown

When the mind does not know who is doing the action, it creates a frame instead.

Vague:

> In the process, there was confusion.

More specific:

> The team confused the customer during onboarding.

The frame hides the actor.

## 2. The Thought Starts As A Category

The writer may start from a broad domain instead of a specific event.

Vague:

> In communication, context matters.

More specific:

> When a new person joins a conversation, they need context before they can respond.

The frame is broad. The specific version gives a situation.

## 3. The Writer Is Avoiding Commitment

Vague frames can feel safer because they avoid making a direct claim.

Vague:

> In some cases, this may create problems.

More specific:

> This creates problems when the reader does not know the rule.

The specific version names the condition.

## 4. The Thought Starts Too High In Abstraction

Vague:

> In writing, structure is important.

More specific:

> A reader gets lost when the sentence hides the actor and action.

The first version starts at the domain. The second version shows what happens.

## 5. The Writer Has A Feeling Before A Mechanism

Sometimes the brain senses a pattern before it can explain the cause.

Vague:

> This feels like another layer.

More specific:

> This sentence makes the reader understand the context before they understand the action.

The vague frame is not useless. It can be the first draft of the thought.

## Current Rule For "In"

When I see `in`, do not ask first:

> Is this wrong?

Ask:

> What frame am I creating?

Then ask:

> Is this frame helping the reader, or am I using it because I do not yet know the actor, action, condition, or example?

## Draft Thinking Move

A possible thinking sequence:

> Frame -> Actor -> Action -> Condition -> Example

If a sentence starts with a frame, try to find:

- Actor: who is doing something?
- Action: what are they doing?
- Condition: when or why does it happen?
- Example: what does it look like?

Example:

Vague:

> In this situation, the problem is unclear.

Questions:

- What situation?
- Who has the problem?
- What is unclear?
- When does it happen?
- What does it look like?

Clearer:

> When a new person joins the conversation, they cannot respond because they do not know the context.

## Relation To The Paramedic Method

The Paramedic Method does not ban words.

It highlights patterns so the writer can find the main action.

The key question is:

> Who is doing what to whom?

The method asks the writer to:

1. Highlight prepositions.
2. Circle weak `to be` verbs.
3. Find nominalizations.
4. Identify the central action.
5. Put the actor as the subject.
6. Put the action into a strong verb.
7. Move the base clause near the beginning.
8. Remove unnecessary words.

For `in`, the useful question is:

> Is this frame helping the reader understand the action, or is it hiding the action inside another frame?

## Open Questions

- Is `frame` the best term, or should it be `container`, `scope`, `context`, or another word?
- When should the app highlight a preposition as useful versus suspicious?
- How can the app teach a repeatable move instead of only marking an issue?
- What exact rewrite strategies should exist for `in`?
- What does `but` do structurally in conversation?
- How should words like `if`, `or`, `else`, and `otherwise` be described?

## LLM Command Writing Versus Human Communication

The way I write to an LLM often works because it follows a command structure.

Example:

> Omarchy Arch Linux, what is the key binding to take an image of the screen?

Structure:

- Frame: Omarchy Arch Linux
- Task: find the key binding
- Object: screenshot

Another example:

> In this URL www.tips.com/hello-word we have a section called better tips. Make the list in that section alphabetical.

Structure:

- Frame: this URL
- Target: the better tips section
- Action: sort the list
- Constraint: alphabetical order

This works with an LLM because the model needs coordinates and an instruction.

Possible LLM command structure:

> Frame -> Target -> Action -> Constraint

This is useful for task execution, but it is not the same as real-life communication.

Human communication needs more than the command. It often needs the reason, tension, and transition.

Possible human communication structure:

> Frame -> Situation -> Point -> Why it matters -> Next move

## The Problem With Hard Stops

Framing becomes confusing across paragraphs when every sentence opens a new frame but does not carry anything forward.

Example of hard stops:

> In this app, I want better writing.
> In real life, I communicate differently.
> In grammar, sentences stop too hard.
> In transitions, I get confused.

Each sentence opens a new frame, but nothing carries forward. The reader feels reset every time.

The fix is not only grammar. The fix is continuity.

## Current Term: Bridge

A frame tells the reader where the idea belongs.

A bridge carries the reader from one idea to the next.

Working definitions:

- Frame: where are we?
- Bridge: how do we move to the next thought?

What I called "sentence rhyme" may be logic rhyme:

> The next sentence picks up something from the previous sentence.

Example:

> I can command an LLM clearly because the task has coordinates.
> Those coordinates tell the model where to act.
> But real people need more than coordinates.
> They need to understand why the action matters.

The chain is:

> coordinates -> those coordinates -> real people need more -> why it matters

Each sentence carries one piece forward. That prevents the hard stop.

## Types Of Bridges

Repeat the key word:

> LLM commands work because they give coordinates.
> Those coordinates are enough for a machine.

Use a pronoun:

> The sentence creates a frame.
> That frame helps the reader place the idea.

Use cause and effect:

> The frame changes too often.
> Because of that, the paragraph feels disconnected.

Use contrast:

> This works with LLMs.
> But it does not work the same way with people.

Use question and answer:

> So why does it fail in conversation?
> It fails because people need emotional and logical context.

## Draft Flow Structures

For LLM writing:

> Frame -> Target -> Action -> Constraint

For human writing:

> Frame -> Point -> Reason -> Bridge

For paragraphs:

> Frame -> Point -> Bridge

For improving flow:

1. Identify the frame.
2. State the point.
3. Pick one word or idea that should carry into the next sentence.
4. Use a bridge to connect the next sentence.

The long-term question:

> Can I use LLM command writing as a training ground for human writing and speaking?

## Levels Of Communication

The same issue can be described at different levels.

An LLM or builder needs specific implementation details.

A business owner often speaks at a higher level. They may know the business problem, but not the exact file, screen, section, or system detail.

So the framework needs levels.

## Level 1: Business Owner

Use this level for direction, risk, money, customers, operations, and priorities.

Structure:

> Business Area -> Outcome -> Problem -> Impact -> Decision

Example:

> In logistics, delivery delays are increasing. This hurts customer trust and creates support tickets. We need to reduce late deliveries before next quarter.

Breakdown:

- Business Area: logistics
- Outcome: delivery reliability
- Problem: delays are increasing
- Impact: trust and support costs
- Decision: reduce late deliveries

At this level, the person does not need to know the exact UI, database field, or code file. They need to name the business reality clearly.

## Level 2: Manager Or Operator

Use this level to translate the business problem into a process problem.

Structure:

> Process -> Bottleneck -> Cause -> Metric -> Action

Example:

> In the delivery scheduling process, drivers receive routes too late. That causes missed delivery windows. We need to assign routes before 8 AM and track late route assignments.

Breakdown:

- Process: delivery scheduling
- Bottleneck: drivers receive routes too late
- Cause: route assignment happens late
- Metric: missed delivery windows / late route assignments
- Action: assign routes before 8 AM

This level connects business pain to operational behavior.

## Level 3: Builder, LLM, Or Developer

Use this level when changing the system.

Structure:

> Location -> Target -> Problem -> Why -> Action -> Constraint

Example:

> In `logistics/routes.html`, the route list is sorted by creation time. Dispatchers need to scan by delivery window, so sort the list by earliest delivery time. Do not change the filters.

Breakdown:

- Location: `logistics/routes.html`
- Target: route list
- Problem: sorted by creation time
- Why: dispatchers scan by delivery window
- Action: sort by earliest delivery time
- Constraint: do not change filters

This level gives enough detail for execution.

## Translation Between Levels

Business owners speak in outcomes.

Builders speak in changes.

The missing skill is translation:

> Business Area -> Operational Problem -> System Change

Example:

Business level:

> Accounting month-end close is too slow.

Operational level:

> Accountants spend too much time finding pending invoices.

System level:

> In the Accounting module, show pending invoices first and sort them by due date.

The same truth exists at three levels. The wording changes because the audience and action are different.

## Translation Questions

When the speaker is high-level, do not force them into implementation details immediately.

First capture the business frame:

1. What business area is affected?
2. What outcome is failing?
3. What pain appears?
4. What impact does it create?
5. What priority or decision is needed?

Then translate down:

1. What process creates the pain?
2. What bottleneck or cause appears?
3. What metric proves the issue?
4. What system behavior supports or blocks the process?
5. What exact change should be made?

## Current Level Rule

Use the right level for the audience.

For business owners:

> Area -> Outcome -> Pain -> Impact -> Priority

For operators:

> Process -> Bottleneck -> Cause -> Metric -> Action

For builders and LLMs:

> Location -> Target -> Problem -> Why -> Action -> Constraint

The skill is moving up and down the ladder without losing the truth.
