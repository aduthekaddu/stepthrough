# Architecture

Status: proposed, 2026-11-15. This file is the developer-facing copy of the design. `GROUNDWORK_BUILD_SPEC.md` is the product spec; where this file departs from it, the reason is in `DECISIONS.md`.

## What the first slice delivers

The learner opens a lesson, answers predictions before seeing results, steps through visualizers whose state comes from a real JavaScript engine, runs code in a sandbox, and gets review cards saved in the browser. Lessons 0.1, 1.1 and 1.2 ship first. CI proves every code block and every trace.

## Repository

```
apps/web                 Next.js 16 App Router, static export (output: 'export')
  app/                   routes: / (path map), /learn/[track]/[lesson], /review, /today, /playground
  components/lesson      Predict, Reveal, Callout, Sidenote, Term, Code, Card, ExplainBack, InterviewQ
  components/viz         MemoryDiagram, CallStack, EnvChain, ... (consume a projected Trace)
  content/<track>/*.mdx  lessons, frontmatter validated by Zod at build
packages/trace           Trace types, engine262 generator, teaching projection, narration binder
packages/sandbox         Web Worker runner, describe/it/expect, TS transpile (typescript@6)
packages/srs             card model, ts-fsrs 6 wrapper, Dexie schema
packages/content-check   CLI: run code blocks, check // → annotations and Predict answers, banned phrases, frontmatter
examples/<id>/           source.js + narration.ts + generated trace.json (golden file)
```

Package scope is `@stepthrough/*`. pnpm workspaces and Turborepo. Biome for lint and format.

## Trace pipeline

The spec (§6.1) asks for hand-written traces checked only by their final console output. That check passes a trace whose intermediate states are wrong. We generate the state instead.

1. An author writes `examples/<id>/source.js` and `examples/<id>/narration.ts`.
2. `pnpm trace:build` runs the source in engine262 (`@engine262/engine262`, pinned commit build) inside Node. A hook on `onNodeEvaluation` takes a snapshot before each statement: the execution context stack, every reachable environment record with each binding's state (uninitialized = TDZ, primitive, or reference to a heap id), reachable heap objects, and console output. The engine's real job queue supplies microtask state for async examples later.
3. A projection step turns engine detail into the teaching view: hide `arguments` unless an example opts in, merge a function's separate lexical record into its function record when it adds nothing, drop empty block records, rename records to readable labels. Every projection rule is a named, tested function. A lesson can ask for `detail: 'spec'` to show the raw records.
4. Narration is a list of `{ at: Anchor, say: string }`. An anchor matches a frame by line, node type and occurrence count. The build fails when an anchor matches no frame or two frames.
5. Output is `trace.json`, committed. CI regenerates it and fails on any diff, so a change to engine262 or the projection shows up in review.
6. CI also runs `source.js` in real Node (Node-host examples) and in Playwright Chromium (browser-host examples) and compares console output with the trace's final frame. Examples whose order is not deterministic in real hosts (for example `setTimeout(0)` against `setImmediate` in Node's main module) are rejected by a 20-run stability check.

Trace types are a discriminated union so a binding cannot be both uninitialized and hold a value:

```ts
type BindingValue =
  | { kind: 'uninitialized' }
  | { kind: 'primitive'; type: 'undefined' | 'null' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol'; text: string }
  | { kind: 'ref'; heapId: string };
type EnvRecord = { id: string; label: string; kind: 'global' | 'function' | 'block' | 'module'; parentId: string | null; bindings: Record<string, BindingValue> };
type StackFrame = { fn: string; lexEnvId: string; varEnvId: string; line: number | null };
type HeapObject = { id: string; kind: 'object' | 'array' | 'function' | 'map' | 'set' | 'date' | 'promise' | 'error'; props: Record<string, BindingValue>; protoId: string | null; label?: string };
type Frame = { step: number; line: number | null; stack: StackFrame[]; envs: EnvRecord[]; heap: HeapObject[]; console: string[]; narration: string | null };
type Trace = { id: string; host: 'node' | 'browser' | 'neutral'; source: string; frames: Frame[] };
```

Later, the same generator runs in a lazy-loaded Web Worker for learner code (spec Phase 2), with a node-count budget and the 2 s kill switch.

## Lesson content

MDX files with YAML frontmatter, validated by a Zod schema at build time. The content layer (content-collections, fumadocs-mdx, or `@mdx-js/mdx` compiled in a small build step) is chosen by a spike against Next 16 + Turbopack + static export; Velite is out because of its open Turbopack build race (velite#408) and its bundled Zod 3.

Components the MDX can use:

- `Predict`: multiple choice or free text. The learner must commit before the answer shows. Each wrong option names the misconception it reveals and shows a targeted explanation. Free-text predict-output answers are normalised and compared.
- `Term`: an inline technical term with a definition popover (`interestfor` + `popover="hint"`, with the polyfill). Every term is defined in a glossary file; content-check fails a lesson that uses a glossary term before its first `Term` or a prerequisite lesson defined it.
- `Stepper` visualizers: manual stepping by default, keyboard `→ l ← h space r`, an `aria-live` transcript of the current frame's narration, reduced motion swaps movement for cross-fades.
- `Code runnable`: CodeMirror 6, runs in the sandbox worker with a 2 s terminate.
- `Card`, `ExplainBack`, `InterviewQ`, `Callout`, `Sidenote`.

## Learner state

Dexie (IndexedDB) tables: `predictions` (lessonId, predictId, answer, correct, at), `cards` (cardId, lessonId, FSRS card state), `reviews` (FSRS review log), `explanations` (lessonId, text, at), `lessonProgress` (lessonId, state, updatedAt). Lesson state is derived, not stored as free booleans: `locked | available | inProgress | done | dueForReview`. Export and import is one JSON file with a schema version.

## Verification

- Vitest: trace projection rules, narration binding, frontmatter schema, FSRS wrapper, sandbox runner.
- content-check: every runnable block executes; `// →` annotations and Predict answers match real output; banned phrases; first element of a lesson is a Predict or code or diagram; glossary order.
- Playwright: lesson flow (predict, reveal, step a visualizer, run code, card saved, survives reload), keyboard control, a screenshot per visualizer step for two traces, axe accessibility scan.
- Lighthouse on a lesson page: performance at least 90, accessibility 100.

## Lesson writing pipeline

1. Claude writes the outline, the code examples, the Predict items with misconceptions, the trace narration and the cards, after reading the lesson's primary sources.
2. Gemini 4 Argon (agy) drafts the prose for each segment against the outline.
3. Claude edits for accuracy and voice.
4. DeepSeek v4.1 Flash (opencode) runs content-check and reads the lesson as a novice, listing every term used before it is explained and every step that skips reasoning.
5. GPT-6.1 Terra (codex) reviews technical accuracy against the sources.
6. The learner studies it and flips `status: reviewed`.

## CI

GitHub Actions, every job `runs-on: ${{ vars.CI_RUNNER || 'ubuntu-latest' }}` per the global decision for private repos. Jobs: typecheck, lint, unit, content-check + trace regenerate-and-diff, e2e.
