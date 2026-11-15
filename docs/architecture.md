# Architecture

Status: accepted for the first slice, 2026-11-15, after an independent review by GPT-6.1 Terra (findings in `DECISIONS.md`). `GROUNDWORK_BUILD_SPEC.md` is the product spec; where this file departs from it, `DECISIONS.md` says why.

## First slice

The learner opens lessons 0.1, 1.1 and 1.2, commits to predictions before seeing results, steps through visualizers whose state comes from a real JavaScript engine, runs code in a sandbox, and gets review cards saved in the browser. Only synchronous examples are traced in this slice. Async jobs, generators, the browser and Node event loops, live tracing of learner code, and the review pages come later.

## Repository

```
apps/web                    Next.js 16 App Router, static export
  app/                      / (path map), /learn/[track]/[lesson]
  components/lesson         Predict, Term, Sidenote, Callout, Code, Card, ExplainBack, InterviewQ
  components/viz            Viz (MDX, reads a generated trace), VizPanel, Diagram (scope, memory, both)
  scripts/build-traces.ts   traces fixtures and lesson examples into generated/traces before next build
  content/<track>/<lesson>/ index.mdx, outline.yaml, examples/*.js
  content/glossary/         every technical term, its definition and the lesson that introduces it
                            (one <lesson-id>.yaml per lesson; content/glossary.yaml also read)
  content/misconceptions/   registry of wrong beliefs, each with what it predicts
packages/trace              Trace types and the engine262 generator
packages/sandbox            Worker runner for runnable code
packages/content-check      CLI for the content rules
```

Package scope `@stepthrough/*`, pnpm workspaces, Turborepo, Biome. Imports use explicit `.ts` extensions so build scripts run directly on Node 26.

## Content

Lessons are MDX compiled by `@next/mdx` (with `remark-frontmatter`). A small reader parses each lesson's YAML frontmatter with Zod at build time. Required fields: `id`, `track`, `title`, `minutes`, `prereqs`, `outcomes` (at most 3), `sources` (primary only), `interviewTags`, `status` (`draft` or `reviewed`), `verifiedAt`. The build fails on duplicate ids, unknown prerequisites or a malformed field.

Drafts are visible to the learner with a "draft" label, because the learner reviews a lesson by studying it. Only the learner changes `status` to `reviewed`.

Each lesson follows the recipe in `research/pedagogy.md` §4: an `outline.yaml` (segments with one idea each, word budgets, terms introduced and used, the interaction that ends each segment), 8 to 12 predictions with confidence, misconception-coded wrong options, and a closing set of cards.

### Terms

The prose explains each new idea in visible words before naming it. `<Term>` then marks the first use and gives a definition popover as a reminder; the popover never replaces the explanation. content-check fails a lesson when a glossary term (or alias) appears before the segment that introduces it or a prerequisite lesson that defines it. A novice-reader review (DeepSeek through opencode) lists jargon the glossary does not know.

## Traces

`packages/trace/src/types.ts` is the contract. Key rules:

- A `Binding` has a `decl` kind (`var`, `let`, `const`, `function`, `class`, `param`, `implicit`) and a `state` that may be `uninitialized` (the TDZ). Object properties and array items hold a `Value`, which cannot be uninitialized. Array holes are their own item kind. Symbols carry an id so two symbols with one description stay distinct.
- Each stack frame has a `callId`, so recursive calls stay distinct. Every function heap object carries `envId`, its `[[Environment]]`.
- Frame kinds: `start`, `enter` (after declaration instantiation, before the first step), `statement`, `expression` (only in expression-level traces: before calls, assignments and updates), `return` (the call is still on the stack), `end`, `throw`.
- The global record is always shown, so the final frame shows final values. Records reachable only through a function's `[[Environment]]` are shown, which is what makes a closure visible after its call returns.

`generateTrace()` runs the snippet in engine262 (pinned build) at build time. Teaching detail hides `arguments`, folds the extra record that sloppy-mode functions create for top-level `let`/`const`, and folds block records with no bindings. It never folds when parameters contain expressions, because the engine then keeps parameters in a separate record that changes lookup. Spec detail keeps everything. A frame cap and an evaluated-node cap stop runaway examples.

### Proof

- Unit tests assert states derived by hand from the ECMAScript spec (TDZ, hoisting, call records, closures, per-iteration `let` records, symbols, holes, aliases, cycles) and compare console output with real Node. Planted bugs in the TDZ and terminal-frame handling were caught.
- Each lesson example carries explicit expectations at named markers (`// @mark name` comments, stripped from displayed code), checked in CI against the generated trace, plus the real-Node console comparison.
- Generated traces are committed and regenerated in CI; a diff fails the build so an engine or generator change shows in review.

## Learner state

Dexie (IndexedDB), shapes in `apps/web/lib/learner.ts`: `predictions` (lesson, predict id, answer, confidence, correct, misconception id, at; the first commit is final), `cards` (id, lesson, kind, front, back, created; FSRS state comes with the review page), `reviews` (with the review page), `explanations`, `lessonProgress` (visits and the expertise fast-path choice `undecided | summary | full`). Lesson state is derived (`locked | available | inProgress | done | dueForReview`). Export and import is one versioned JSON file.

## Sandbox

`runInSandbox(code)` runs code as a classic script (indirect eval) in a fresh Worker, captures console output formatted like Node (tested against `util.inspect`), waits until no timer is pending, and terminates the worker after 2 s. The worker can reach IndexedDB and `fetch`; acceptable because it only runs the learner's own code and reviewed lesson code. TypeScript labs will pin `typescript@6` in a lazy-loaded worker with a virtual file system and the standard `lib.*.d.ts` files.

## CI (planned: no workflow exists yet)

Until the workflow lands, the gates run locally (see `.audit/STATE.md`). The plan:


Every job `runs-on: ${{ vars.CI_RUNNER || 'ubuntu-latest' }}`. A private repo also needs the owner to grant the romper runner access (Notion decision "Run private repos' CI on romper"). Jobs: typecheck, lint, unit, content-check (code runs, predictions match real output, terms, banned phrases, primary sources, `verifiedAt` age, trace expectations and regenerate-diff), production static build with a 200 KB gzip budget for lesson JavaScript, Playwright e2e with step snapshots and transcripts, and Lighthouse. Node is pinned to 24 or later (ts-fsrs 6 requires it).
