# Review: 0.1 How a program runs (`fnd-how-programs-run`)

Status: draft. Reviewed 2026-11-15 by the author (Claude), a novice-reader pass (DeepSeek v4.1 Flash through opencode) and an accuracy pass (GPT-6.1 Terra through codex, read-only). Only the learner sets `reviewed`.

## Automated checks

- `node packages/content-check/src/cli.ts apps/web/content` (main checkout's checker on this worktree): `0 errors, 0 warnings`. It ran all 8 output Predicts as classic scripts (`p-hook`, `p-byte`, `p-busy`, `p-host`, `p-parse-first`, `p-deopt`, `p-overflow`, `p-survive`) and both annotated runnable blocks.
- Both narration files bound with the site build's own `bindNarration` and `NarrationFile` schema (`apps/web/scripts/narration.ts`): every `expect` holds. A planted wrong value (`result = 7`) was caught.
- Every other output in the lesson was measured on Node v26.13.1 / V8 14.6.202.34 (see `outline.yaml` `facts.measured`): the gcc bytes, the bytecode listing, lazy bytecode, the `--trace-opt --trace-deopt` lines, the 12,517-frame depth, the strict-mode tail call overflow, `/proc/self/maps`, the out-of-heap message, every card answer.

## Checklist (research/pedagogy.md §4.3)

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | New terms introduced by `<Term>` first, never earlier | pass | content-check `term-order` clean for all 20 terms and their aliases |
| 2 | At most 3 new terms per segment | pass | s02 and s03 have 3, the rest 2 or fewer (outline `vocabulary`) |
| 3 | Hook needs no new term | pass | `p-hook` and s01 prose use no glossary word |
| 4 | Earlier-lesson terms get a reminder | n/a | no prerequisites; forward links to 1.1, 1.2, 1.3, 1.7, 1.9 |
| 5 | No run over 250 words without an interaction | pass | content-check `prose-run`; longest run 249 words |
| 6 | At least 8 predictions | pass | 12 Predicts plus next-frame pauses in s13 (step 4) and s14 (step 8) |
| 7 | One idea per segment | pass | segment goals in `outline.yaml` |
| 8 | Correct answer is the real output | pass | content-check for the 8 output Predicts; `p-lazy` backed by measured `m-lazy`; `p-tabs`, `p-faster`, `p-which-rule` are conceptual and cite sources |
| 9 | Wrong options map to registry ids | pass, one note | every choice option maps; two typed wrong answers (`p-byte` "200 255", `p-host` "object undefined undefined") carry feedback without an id because no registry belief fits (l) |
| 10 | Targeted feedback | pass, partial links | every wrong option names the belief, gives the rule and a counterexample; only some name the segment that shows it (m) |
| 11 | Confidence and immediate reveal | n/a | Predict component behaviour |
| 12 | Escalation, transfer, modify | pass | `p-parse-first` modifies `p-hook`; `p-deopt` and `p-survive` are new code; `p-which-rule` sorts facts |
| 13 | Mechanism with a spec link per outcome | pass | early errors (spec 17, ParseScript) s09; execution context stack (9.4) s13; Jobs run to completion (9.5) s06; hosts (4.1) s08; V8 posts for tiers s10 to s12 |
| 14 | States a boundary of the model | pass | s10 to s12 labelled V8; s13 sidenote (abstract model, inlining); s15 (limit is engine behaviour, tail calls); s16 (heap is an engine model, escape analysis); s17 table |
| 15 | Answers "why is it designed this way" | pass | s09 (no half-run script), s10 (lazy compilation saves startup), s11 (why not compile everything), s15 (fixed stack) |
| 16 | Every misconception exposed and refuted | pass | 16 FND ids, each used by at least one option, each with a counterexample in feedback and registry |
| 17 | Rules re-derivable from mechanism | pass | each rule in the s19 table traces to a mechanism segment |
| 18 | In the wild with concrete snippets | pass | s18: Express `pbkdf2Sync` vs `pbkdf2`, a `ws` handler with a synchronous search, Java vs Node flags and errors |
| 19 | Parts pre-trained with a still frame | partial (m) | s13 describes both columns before stepping, but there is no separate still labelled frame component to show it |
| 20 | New visual part gets its own segment | pass | stack frames s13 before any trace; recursion s14 adds no new part. The variable boxes are named in 1.2 |
| 21 | Narration beside the diagram, one sentence per step | pass | 6 and 5 narrated steps, all bound by the build |
| 22 | Stack and environments drawn separately | pass | `view="scope"` |
| 23 | Next-frame prediction per trace | pass | `pauseAt={[4]}` and `pauseAt={[8]}` |
| 24 | Explain prompts conceptual with rubric | pass | `e-cpu`, `e-compile`, `e-deopt`, `e-final` |
| 25 | Cards follow step 10 | partial (l) | 6 cards: 3 predict (new surface), 1 explain (why), 2 recall (one is "write it" since the contract has no implement kind). The discrimination pair (`c-early-const`, `c-late-missing`) is inside this lesson, not against another lesson's look-alike |
| 26 | Lab fades | n/a | spec §7 row 0.1 has no lab |
| 27 | Plain English, no banned phrases | pass | content-check banned phrases and em dash clean; prose drafted by agy, then edited line by line |
| 28 | Every behaviour claim run, quoted or labelled | pass | `outline.yaml` `facts` lists a URL or a measurement for each |

Deviations: 16 misconception ids instead of the recipe's 4 to 8, because this survey lesson covers six topics and every id backs a real option. In the wild comes before the misconceptions table, as in the §5 worked outline, because the other order put 349 words between interactions.

## Accuracy review (codex, GPT-6.1 Terra, max effort)

25 findings, verdict "not ready until the h findings are fixed". What I checked and changed:

- h1 workers run JavaScript in parallel. Confirmed (Node `worker_threads`). s06 now says no other JavaScript runs on that thread and names workers as separate agents; s12 says only workers run JavaScript on other threads; `FND-JS-PREEMPTED` updated.
- h2 `p-tabs` assumed tab B had no `score`. Prompt now says tab B's code has no variable named `score`.
- h3 opener rule omitted ancestors and other channels. `explain` and the sidenote now say "no opener or parent-frame link" and "exchange copies of data, for example with `postMessage()`".
- h4 parsing presented a full tree as a language rule. s09 now separates the required early-error check from the engine's representation.
- h5 lazy compilation stated too absolutely. Reproduced: a parenthesized uncalled function got bytecode (`m-pife`); read the V8 Lite post on bytecode flushing. `p-lazy` feedback, s10 and `FND-JS-COMPILED-AHEAD` now say "most functions" and mention both exceptions.
- h6 objects "never inside a frame". Read the V8 escape analysis post. s16 now calls the heap the usual engine model and notes V8 can skip creating an object that never leaves its function.
- h7 "local variables go away" conflicts with closures. s16 and `FND-RETURN-FREES-ALL` now say they can no longer be reached through the call, with a pointer to 1.3.
- h8 overflow presented as a language rule. s15 says the overflow is engine behaviour; the summary row says "In V8"; the tail-call sidenote stays.
- m9 execution context is abstract. s13 sidenote now says so and mentions inlining; the s17 row reads "JS spec (a model)".
- m10 frames also leave on throw; generators. One sentence added in s13.
- m11 timer "as soon as the thread is free"; synchronous callbacks. Feedback and `explain` fixed.
- m12 virtual addresses and shared mappings. s05 now says addresses are virtual and processes can share a region on purpose.
- m13 984 KB is V8's allowed region, not the OS stack. s15, `p-overflow` feedback, the summary row and `FND-STACK-IS-ALL-MEMORY` fixed, with the flag's own description quoted.
- m14 `--max-old-space-size` limits only old space; error text varies. s18 fixed.
- m15 collection is not guaranteed; leaks. s16 says "eligible" and gives a growing-cache example.
- m16 a byte as 256 patterns, signed vs unsigned. s03, s04, glossary and `FND-BYTE-ANY-NUMBER` fixed, with Java's signed `byte` named.
- m17 compiler defined as ahead-of-time only. s07 now defines a compiler generally and ahead-of-time as one case.
- m18 `p-faster` said "probably". Correct option now leads with "the language promises nothing"; feedback mentions `--jitless`.
- m19 "every call computes" too strong. s11, `p-faster` b and `FND-JIT-CACHES-RESULTS` now say observable effects still happen.
- m20 deopt resumes without repeating work. Reproduced (`m-deopt-effects`: counter 100001). One sentence added in s12.
- m21 `p-lazy` option c tag. Option text now states the line-by-line belief.
- m22 the factorial trace's frame 7 points at `env4`, which teaching detail folded away. Confirmed with `show.ts`. Not fixable inside this lesson (generator code); reported to the coordinator as an out-of-scope finding.
- m23 `c-ping-pong` named V8's error without naming Node. Fixed, Firefox's message added.
- l24 "each runtime provides console". Fixed.
- l25 `eval` code is parsed separately. Not added: it would need eval, which no earlier lesson covers. Left for lesson 1.2.

## Novice-reader review (opencode, DeepSeek v4.1 Flash)

The run read `index.mdx` while the codex fixes were being applied, so it quotes both old and new text; items already fixed above are not repeated. It read as a reader who knows no CS theory, which is stricter than the intended reader (a working developer).

Fixed:
- s03 said gcc -O1 gives four bytes. Ubuntu's gcc adds `endbr64` unless `-fcf-protection=none` is passed, which the author had used (reproduced both). The flag is now in the code block and the prose explains the extra instruction. `lea` is no longer described as an add instruction.
- s10 said `Add a0` adds `a` to the accumulator, which reads as `b + a`. Now it says the instruction computes `a + b`. "The whole function is 6 bytes" now says the bytecode is. The three confusing header lines (`Parameter count 3` counts a hidden receiver) are trimmed from the listing.
- s10 said "everything in the next three segments is V8", which wrongly covered the call stack in s13. Now "from here to segment 12".
- s17 promised three kinds of fact and the table used six labels. It now names four kinds (general computing, JavaScript spec, runtime, V8) and the table uses exactly those. The thread row now says a process's threads share its memory.
- s18 showed two `app.post` handlers for one route, so the second was dead code. Labelled "Before" and "After: the same route, rewritten". The event loop is now defined as the loop that picks the next waiting callback and runs it.
- s20 rubrics expected untaught terms (type feedback, libuv, tail recursion, an array as a stack, async APIs). Reworded to the lesson's terms.
- s22 card used "baseline compiler". Reworded.
- s04 "the software in between" now points to segments 5 and 8; s05 "gives each one turns" fixed; s08 explains that ECMAScript is the official JavaScript standard; s16 says a variable holds a way to reach an object (lesson 1.1).

Not changed, with reason:
- `SyntaxError`, `ReferenceError`, callback, `var`, scope, `Date.now`, Express, React, WebSocket, Java. The intended reader (a working developer) has used these before; the persona was told to know none of them.
- The code for s13 and s14 is not repeated in prose. The visualizer shows the traced source beside the frames.
- Hexadecimal digits, the MDN and WHATWG names, the word "tree" in s09. Optional (l).
- "Agent" stays the spec's word with a plain gloss; it is not a glossary term in the vocabulary plan.

## Open items

- m: no still, labelled pre-training frame component exists (checklist 19). s13 describes the two columns in prose before stepping.
- m: the trace generator gives the base-case frame of `factorial` an `envId` (`env4`) for a block record that teaching detail folds away. Out of scope here; reported to the coordinator.
- l: wrong-option feedback links to the segment that shows the rule only in some options.
