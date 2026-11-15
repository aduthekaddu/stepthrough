# Review: lesson 1.2 "Execution context, hoisting and the TDZ"

Status: draft. Only the learner sets `reviewed`.

## How it was checked

- `node packages/content-check/src/cli.ts apps/web/content` (main checkout's checker and schema): 1 error, 0 warnings. The one error is `unknown prerequisite js-values`, expected until lesson 1.1 merges. Every Predict with code ran as a classic script and matched; every `// →` annotation matched; term order, banned phrases, the 250-word rule and Viz examples passed.
- Gauntlet: a script reruns all 15 items with `node -e`, requires the exact output (error name on the throwing line), rejects any wrong answer equal to the real output, and regenerates the MDX blocks from `lab/gauntlet.yaml`. All 15 match Node 26.13.1.
- Traces: all 8 examples bind with the site build's own `bindNarration` (apps/web/scripts/narration.ts) using the main checkout's engine262 generator, and every `expect` holds. The frames are identical under the worktree's older generator. A planted wrong expectation (TDZ shown as `undefined`) failed as it should.
- Every snippet in prose, cards and interview questions was run with `node -e`.

## Reviewer checklist (research/pedagogy.md §4.3)

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | New terms introduced by `<Term>`, never earlier | pass | content-check term-order: 0 findings. 14 terms: declaration (s02), environment-record (s03), execution-context and function-environment (s04), outer-reference and scope-chain (s06), global-environment and global-object (s07), declaration-instantiation (s08), hoisting (s09), tdz (s10), function-expression (s14), strict-mode and implicit-global (s15). |
| 2 | At most 3 new terms per segment | pass | Maximum is 2 (s04, s06, s07, s15). |
| 3 | Hook needs no new term | pass | s01 uses only var, let and console.log. |
| 4 | Earlier terms get a one-clause reminder | pass | engine and binding (s02), call stack and stack frame (s04), typeof (s06), functions are objects (s08), object contents can change (s13). Not machine-checked: the 0.1 and 1.1 glossaries are in other branches. |
| 5 | No run over 250 words without an interaction | pass | content-check prose-run: 0. Fixing it added the call-order Predict (s04), a `typeof double` runnable (s02), a `let b` runnable (s07) and the one-model explain (s16). |
| 6 | At least 8 predictions | pass | 14 Predicts in the lesson, 15 in the lab, 9 next-frame pauses across 8 traces. |
| 7 | One idea per segment | pass | See the `goal` of each of the 21 segments. |
| 8 | Correct answer is the real output | pass | content-check predict-output plus the gauntlet script. |
| 9 | Each wrong option maps to a registry id and is what it predicts | pass after fixes | Codex findings 11 to 13 fixed (see below). All 23 registry entries are used. |
| 10 | Targeted feedback for wrong answers | pass | Every option and typed wrong answer has belief, counterexample and rule; most point to a segment. |
| 11 | Confidence collected, reveal immediate | pass (by component contract) | Predict component behaviour, not lesson content. |
| 12 | Escalation, transfer, modify | pass | Transfer: unreachable (s08), fn-forms (s14). Modify: temporal-moved (s12), strict (s15). Gauntlet levels 1 to 5. |
| 13 | Outcomes backed by mechanism and spec link | pass | Sidenotes quote spec 9.1, 9.4, 9.1.2.1, 14.3, GetBindingValue, 13.5.3.1, 11.2.2; prose names GlobalDeclarationInstantiation and FunctionDeclarationInstantiation. |
| 14 | States a boundary of the model | pass | s03 (records are a spec device), s04 sidenote (one record drawn where the spec may use two; hidden `arguments`), s10 (error wording is per engine), s07 and s15 (modules and CommonJS differ, measured). |
| 15 | Answers "why is it designed this way?" | pass | s13 (Horwat's four options and TC39's choice, HOPL 2020 pp. 111 to 113), s07 (object properties cannot be uninitialized). |
| 16 | Every misconception exposed and refuted | pass | Each of the 23 ids is used by at least one Predict; each registry file has a counterexample. |
| 17 | No rule without a "because" | pass | Each per-kind state in s08 is tied to declaration instantiation; typeof (s11) and implicit globals (s15) are explained by the spec algorithm. |
| 18 | In the wild with concrete code | pass | React, Zod (DevSecret), Express, Java contrast (s18). React, Zod and Express use small runnable stand-ins and say so. |
| 19 | Still, labelled frame before stepping | pass, with a limit | s03 names every part before stepping and asks the learner to study frame 1. There is no separate still-image component. |
| 20 | New visual part in its own segment first | pass, with a limit | record and rows (s03), stack and function record (s04), outer links (s06). The two parts of the global record (s07) are not drawn separately by the visualizer; global object properties show as ordinary rows (`var`, `function`, `implicit`). |
| 21 | Narration beside diagram, one sentence per step | partial (l) | Narration is in the yaml files. Several steps have two or three short sentences. |
| 22 | Stack and environments drawn separately | n/a | Visualizer behaviour; the trace keeps them apart. |
| 23 | Next-frame prediction per trace | pass | `pauseAt` on all 8 Vizes. |
| 24 | Conceptual explain prompts with rubrics | pass | why-tdz (s13), one-model (s16), explain-back (s20). |
| 25 | Cards meet step-10 rules | partial (l) | 5 cards: new-surface predict (tax), var/let typeof discrimination pair, why card (global let), recall (instantiation states). No implement card: the Card component has no implement kind, and this lesson's lab is predict-only. |
| 26 | Lab fades worked example to blank | n/a | Spec §7 defines this lab as a 15-item predict-output gauntlet. It escalates by level (1 to 5) instead. |
| 27 | Plain English, no banned phrases or jargon | pass | content-check banned-phrase: 0, em dash: 0. Prose drafted with agy (Gemini 4 Argon High) and edited by hand. |
| 28 | Every behaviour claim run, quoted or labelled | pass | Outputs are checked in CI; engine-specific wording is labelled; module and CommonJS behaviour is labelled "measured in Node 26". |

## Accuracy review (codex, gpt-6.1-terra, reasoning effort max)

It found no wrong outputs in 29 Predicts, 15 gauntlet items, 3 predict cards and 7 annotations. Every finding below was reproduced with `node -e` or checked against the spec text before it was fixed.

- h1 Setup does not create a block's let/const/class in a block that never runs. Fixed in s02, s08, the glossary and EXC-TOP-TO-BOTTOM. They now say "declarations that belong to the script or function", and the `{ }` block case is deferred to 1.3.
- h2 A var does not always start as undefined (an existing parameter, function or global binding is kept; `typeof Object; var Object;` prints function). Fixed in the s08 list, with a runnable `var a` example that keeps the argument, and in the outline fact.
- h3 typeof is also safe for initialized names. Fixed in s11, its goal, g11, the let card and EXC-TDZ-TYPEOF-SAFE.
- h4 The TDZ ends when the binding is initialized, after the initializer runs (`let x = x;` throws). Fixed in s10 (with that example) and the glossary.
- h5 Parameter defaults. The s08 list now says a missing argument takes its default; the fn-forms explain says "among the declarations in a body".
- m6 A block function declaration line can copy a binding (web legacy). The registry entry is now limited to top-level declarations; blocks are deferred to 1.3.
- m7 "A call runs to its end" holds for ordinary functions only. s04 now says so (async functions and generators come later); the s05 goal says "own local bindings".
- m8 globalThis/window wording. Fixed in s07 and the glossary.
- m9 A sloppy assignment "normally" creates a global property. Fixed in s15 and the registry.
- m10 Narration called records "empty" when the picture hides built-ins and `arguments`. Fixed in two narration files, s03 and the s04 sidenote.
- m11 The s15 distractors needed two beliefs. The sloppy option c is now `42 undefined` with a new EXC-IMPLICIT-NOT-PROPERTY, and the strict Predict is a typed answer.
- m12 The s14 option d and g06 needed two beliefs. Option d was removed and option c's feedback covers both readings; g06's wrong answer is now `undefined\nReferenceError`.
- m13 Four typed wrong answers had no id. temporal and g09 now use the new EXC-LOOKUP-AT-DEFINITION, g04 uses EXC-HOIST-MOVES-CODE (`true\ntrue`), and the untagged g13 answer was dropped.
- m14 Clashing declarations are an early SyntaxError. Added to s08 and to the iq-hoisting rubric.
- m15 "const has one value forever" could suggest frozen objects. s13 and the why-tdz rubric now say "binding cannot be reassigned".
- l16 The sidenote's "full list" missed PrivateEnvironment. Added it, said "lists the others", and removed the edition-specific table numbers from the outline.
- Out of scope (generator, not this lesson): for a function with default parameters, generate.ts can emit `enter` before the parameters are initialized, label a parameter or body var as `let`, and show `arguments` in teaching detail. No example in this lesson has default parameters. Reported to the coordinator.

## Novice QA (opencode, deepseek-v4.1-flash)

It read an earlier draft (before the codex fixes) as a reader who knows only lessons 0.1 and 1.1. It returned about 110 items. Each was checked against the current file.

Fixed:
- "Scope means where a name can be used" conflicts with the TDZ. s06 now says "where a name refers to one particular binding".
- "Classic script" was never defined, and "module" mixed up ES modules and CommonJS. s07 now defines a classic script (a browser `<script>` without `type="module"`, or `node -e`) and names both module kinds by their syntax. The lab intro says `node -e`, so readers can reproduce the outputs.
- "Why not a missing property?" The s07 answer now says a missing property would look like a name that was never declared.
- "Is an execution context a stack frame?" was not answered directly. s04 now says "for this course, yes" and explains the two names.
- The spec does use "hoist" informally, in notes (checked in the full spec text; the exact sentence opencode quoted is not in it). s09 now says the spec does not define the word, uses it only in notes, and names a grammar group HoistableDeclaration.
- s12 "the lines are the same" now says "the statements are the same; only their order changed". s13 now says the TDZ shipped in ES2015, which closes the 2008-to-2015 timeline gap. The JLS 6.3 wording now includes "with its initializer".
- "The binding is still real" now says "still exists in the record". "Trace engine" is now "the visualizer's engine (engine262)". "Shadowing" is now taught in s10, and two Viz titles no longer use words before the lesson explains them.
- g13's explanation now says why `typeof a` is "undefined": the name cannot be found outside `init`. The s20 rubric now includes class and default parameters. The React stand-in now says its last line plays React's part.
- "Confident wrong beliefs are the easiest to fix" (s16) had no evidence in the lesson, so it was removed. "Most Next.js code is modules" was not measured, so it was removed.
- Duplicates of codex findings: block declarations, typeof, `import`, parameter defaults, the const wording, and the full field list.

Not changed, with reasons:
- var/let/const/class/function syntax, `console.log`, `if`, `return`, `new`, Node, V8, React, Express, Java, components, schemas and getters as "unexplained". The learner writes Next.js, Node and Java daily (spec §0). The lesson teaches the semantics, not the syntax. Getters get a one-clause definition where they appear.
- "The prose never shows the greet/page code". Each Viz renders its source code next to the trace.
- Spec algorithm names in sidenotes (GetIdentifierReference, PutValue, IsUnresolvableReference, LexicalBinding). Sidenotes are optional depth that quotes the spec, and the main text explains each step in plain words.
- Title and outcomes use terms before they are defined. Frontmatter is not prose, and the term-order check passes.
- BlockDeclarationInstantiation is not named. Blocks are deferred to lesson 1.3 by design; the lesson says so in s02, s08 and s10.

## Open questions

- EXC-LOOKUP-AT-DEFINITION overlaps CLO-SNAPSHOT, which pedagogy.md §5.1 plans for lesson 1.3. Merge them when 1.3 lands.
- The narration binder anchors on a frame whose span starts on the marked line. `return`, `end` and `throw` frames have no span, so they cannot be narrated, and the final state of each trace has no sentence. A recursive function's second and third `enter` frames cannot be anchored either.
- Example names are prefixed `ec-` because the build requires example names to be unique across lessons.
