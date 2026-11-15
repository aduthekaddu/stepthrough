# Review: 1.1 Values and references (`js-values`)

Status: draft. Reviewed 2026-11-15 by the authoring agent against research/pedagogy.md §4.3, plus a novice-reader pass (opencode, DeepSeek v4.1 Flash) and an accuracy pass (codex, GPT-6.1 Terra). Findings and fixes from those two passes are at the end.

## Automated checks run

- content-check (`node packages/content-check/src/cli.ts apps/web/content`): 1 error, 0 warnings. The error is `unknown prerequisite fnd-how-programs-run`, expected until lesson 0.1 is merged.
- 12 Predicts: every answer to an output question (11 of them) is compared with real Node output by content-check; the conceptual one (`stack-heap`) has no code to run. Every wrong option was checked to differ from the real output.
- 11 runnable code blocks: every `// →` annotation matches Node output (content-check `code-annotation`).
- 5 traced examples (`values-*.js`): a scratch runner calls the build's own `stripMarks`, `NarrationFile` and `bindNarration` (apps/web/scripts/narration.ts) on traces from the engine262 generator. 27 narrated steps, 54 expectations, all hold. A planted wrong value (`b` as an array) fails with the build's message. Limits: the supported shapes cannot say that two bindings share one object or what a property holds, and end and return frames have no source line, so they cannot be narrated. `values-pass-object.js` therefore adds `return user.name;` to get a step right after the reassignment; s10 tells the reader.
- 20 misconception counterexamples: each was run in Node and prints what the registry file says.
- Lab: `solution.js` passes 30 of 30 tests; `starter.js` fails 22 of 30 (the 8 that pass are "not equal" cases that a do-nothing function also satisfies). Three planted bugs (=== instead of Object.is, registering a clone after its children, no cycle tracking) each fail at least one test. `deepEqual` agrees with Node's `util.isDeepStrictEqual` on all 40 test pairs.

## Checklist (§4.3)

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | New terms in the vocabulary list, `<Term>` on first use, never earlier | pass | 16 terms, one `<Term>` each (s02 to s17); content-check `term-order` clean, aliases included. |
| 2 | At most three new terms per segment | pass | s02 has 3 (value, primitive, object); s12 and s14 have 2; others 1 or 0. |
| 3 | Hook needs no new term | pass | s01 prompt, options, feedback and prose use none of the 16 terms. |
| 4 | Earlier-lesson terms get a one-clause reminder | pass, with a note | engine (s02), memory (s04), stack frame and garbage collector (s10), call stack and heap (s11). Plain-text reminders, not `<Term>`, because lesson 0.1's glossary is not in this branch; add `<Term>` after merge. |
| 5 | No run over 250 words without an interaction | pass | content-check `prose-run` clean. |
| 6 | At least 8 Predicts or next-frame predictions | pass | 12 Predicts plus 6 next-frame pauses in 5 traces. |
| 7 | One idea per segment | pass | Each `goal` is one sentence; see outline.yaml. |
| 8 | Each correct answer is the real output | pass | content-check `predict-output`. |
| 9 | Each wrong option maps to a registry id and is what that belief predicts | pass | Every wrong option names one of 20 ids; each id's `predicts` field states the same output. |
| 10 | Targeted feedback on each wrong option | pass | Each names the belief, the smallest counterexample or rule, and where it is shown (segment or diagram). |
| 11 | Confidence collected; immediate reveal | n/a | Behaviour of the `<Predict>` component, not lesson content. |
| 12 | Escalation: transfer and modify-and-predict | pass | Modify: `reassign` (s08). Transfer: `pass` (s10, new code), `to-primitive` (s15, new object), `structured` (s17). |
| 13 | Mechanism with spec link for each outcome | pass | Outcome 1: s06, s08, s10 (13.15.2, 5.2.8, 13.3.8.1). Outcome 2: s12 to s15 (7.2.14, 6.1.6.1.13, 7.2.11, 7.2.9, 7.2.13, 7.1.1, 7.1.1.1, 7.1.19). Outcome 3: s16, s17 and the lab (MDN). |
| 14 | States a boundary of its model | pass | s04 (primitives drawn in rows is a drawing choice), s06 sidenote (spec Reference Record is a different idea), s11 (storage is an engine choice; V8 facts labelled as engine behaviour). |
| 15 | Answers "why is it designed this way?" | pass | s03 (typeof null history), s09 (what const is for), s11 (spec leaves storage to engines), s12 (NaN from IEEE 754), s15 (no hint means number). |
| 16 | Every misconception exposed by a Predict and refuted | pass | 20 ids, each on a Predict option; s18 lists counterexamples and a runnable block. |
| 17 | Rules come with a "because" | pass | e.g. null == 0 is false because no rule converts null (s14); valueOf first because no hint means number (s15). |
| 18 | In the wild with concrete code | pass | s20: React `setObj` and Object.is, LiveChess board shallow-copy bug (runnable), Zod deep clone, Java equals. |
| 19 | Parts pre-trained before stepping | partial (l) | s04 lists the diagram parts in prose before the first trace; s06 and s10 name the new parts before their trace. There is no separate still frame; the trace's first frame is static until stepped. |
| 20 | Each new visual part gets its own segment first | partial (l) | Object box and arrow are named in s06 prose just before the alias trace; the call box in s10 prose just before its trace. Same segment, but before the trace depends on them. |
| 21 | Narration beside the diagram, one sentence per step | pass | Every `say:` is one sentence. Placement is the component's job. |
| 22 | Control and environments drawn separately | n/a | Memory view layout belongs to the MemoryDiagram component. |
| 23 | At least one next-frame prediction per trace | pass | pauseAt on all 5 traces (6 pauses), step numbers checked against real frames. |
| 24 | Explain prompts conceptual, with rubrics | pass | e1-hook (s10), e2-zero-false (s14), e3-before-lab (s19), explain-values (s22). |
| 25 | Cards meet the step-10 rules | partial (m) | Predict-output on new surface (3), why card (1), implement card (1, as kind recall because the contract has no implement kind), discrimination pair (assign new array vs push into shared array). The contract has no `contrastsWith` prop, so the pair is only adjacent. |
| 26 | Lab fades worked example to blank, Parsons distractors encode misconceptions | pass, with a note | Worked example (shallowEqual with prompts), completion (deepEqual), Parsons with 3 misconception distractors (VAL-ASSIGN-COPIES-OBJECT, COPY-SPREAD-DEEP twice), extend (Date, Map, Set), predict-and-verify (structuredClone). No fully blank task; Part B is closest. |
| 27 | Plain English, no banned phrases or unexplained jargon | see below | content-check banned-phrase clean; novice pass findings below. |
| 28 | Every behaviour claim run, quoted or labelled | pass | Outputs run in Node; spec and MDN quotes in sidenotes with links; V8 labelled as engine behaviour. |

## Tools (scratch, not committed)

- `check-narration.ts`: runs the build's narration binding and expectation check on the lesson examples.
- `run-split.mjs`: runs snippets as classic scripts, as content-check does.
- `diff-node.mjs`: compares the lab's `deepEqual` with `util.isDeepStrictEqual`.

## Accuracy review (codex, GPT-6.1 Terra, read-only)

23 findings: 6 h, 14 m, 3 l. Each claim that could be run was reproduced in Node 26.13.1 before fixing (scratch scripts `codex-claims.js`, `codex-lab-claims.mjs`). All 23 were confirmed; all were fixed or documented.

| # | Sev | Finding | Fix |
|---|---|---|---|
| 1 | h | s07 and glossary said primitives have no identity; symbols are primitives with identity. | s07 and the `identity` glossary entry now list the identity-less types and name symbols as the exception. |
| 2 | h | s14 said `==` converts "until the types match"; rules 2, 8 and 9 decide directly (`1n == 1`, `null == 0`). | s14 prose, goal and outline: an ordered list of rules that convert and retry or decide directly. |
| 3 | h | "valueOf, then toString" stated without the `Symbol.toPrimitive` case (Predict explain, goal, interview rubric). | All three qualified; s15 adds that `Symbol.toPrimitive` alone decides and must return a primitive. |
| 4 | h | s12 said every calculation without a real answer gives NaN and all arithmetic with NaN gives NaN (`1 / 0` is Infinity, `NaN ** 0` is 1). | Reworded around the concrete operations, "usually spreads", with the `NaN ** 0` exception. |
| 5 | h | Lab rule 6 vs solution: a `"__proto__"` own key is not copied as a property. | README rule 6 states the assignment-based copy, explains the `__proto__` trap and offers `Object.defineProperty` as a stretch. Solution unchanged (matches the documented rule). |
| 6 | h | s20 said Zod always returns a new object; `z.unknown()`/`z.any()` pass references through (reproduced). | s20 limits the claim to object schemas and names the exception. |
| 7 | m | s06/s10 presented "the value is a reference" as the spec's model. | s06 now says the spec never makes a new object on assignment and the arrow pictures that behaviour; s10 says the object is never copied, the parameter gets a copy of the reference. |
| 8 | m | s15 said any object compared with a primitive is converted (not with null/undefined; booleans convert first). | s15 opening restricted to string, number, bigint, symbol, with both exceptions. |
| 9 | m | s10 "the box disappears" reads as a general rule; closures keep bindings. | Frame leaves the stack; forward pointer to lesson 1.3. |
| 10 | m | Heap reminder "data that must outlive a single call" and the JVM rule were imprecise. | Heap reminder reworded; s11 adds that even in the JVM a primitive in a field or array lives on the heap. |
| 11 | m | `Object.freeze` does not stop Map/Set entries (reproduced). | s09 says so. |
| 12 | m | `instanceof` described as "made by a class". | s17 describes the prototype-chain check, with the informal reading labelled. |
| 13 | m | `Object.assign` mutates its target; only own enumerable properties copy. | s16 states both, with a new runnable block (verified by content-check). |
| 14 | m | Deep copy "shares nothing". | s17 and glossary: no object in the copy is an object in the original. |
| 15 | m | structuredClone "drops prototypes" too broad; built-ins come back as themselves; symbol values throw. | s17 and the interview rubric say custom class prototypes, list built-ins, symbol values, symbol keys. |
| 16 | m | Lab deepClone keeps the prototype but not private fields (reproduced TypeError). | README rule 6 states the limit. |
| 17 | m | Lab: a Map with object keys is not deepEqual to its deepClone (reproduced; Node says equal). | README rule 5 explains the trade-off. |
| 18 | m | Lab cycle rule is "same reachable contents", not "same cycle shape" (reproduced; Node differs). | README rule 8 explains; test renamed to say what it checks. |
| 19 | m | s02 "undefined before anything is assigned" ignores the TDZ; `typeof` on a TDZ name throws. | s02 reworded around `let x;`; s03 notes the TDZ exception with a pointer to lesson 1.2. |
| 20 | m | s20 "does nothing": the mutation still happened. | s20 says React skips the update while the state object has changed. |
| 21 | l | "Every string method works this way" (some return booleans or arrays). | "No string method changes the original string." |
| 22 | l | VAL-EVERYTHING-IS-OBJECT `predicts` omitted the heap claim its option makes. | `predicts` updated. |
| 23 | l | `a == b` and `b == a` are symmetric only for the same values (evaluation order). | "for the same two values". |

Codex also confirmed: all 25 executable snippets and cards and all 36 inline annotations matched Node; the s14 rule list handles booleans, bigint strings, finite Number/BigInt and `document.all` correctly. It did not rerun Vitest (it relied on the stated solution result).
