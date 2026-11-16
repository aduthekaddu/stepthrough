# Stepthrough

Stepthrough is an interactive course that teaches software engineering from first principles, for developers preparing for full-stack TypeScript and AI-engineering interviews. Each lesson asks you to predict what a piece of code does before you see it run. Then you step through the program one statement at a time and watch its call stack, scopes and heap change.

The site is at https://aduthekaddu.github.io/stepthrough/.

The project is early. Three lessons exist, and all three are drafts. The rest of the 30-day plan in [docs/spec.md](docs/spec.md) §7 is not written yet.

## What works today

- Three lessons: 0.1 How a program runs, 1.1 Values and references, and 1.2 Execution context, hoisting and the TDZ. Each has predictions with a confidence rating, runnable code, step-through diagrams and review cards.
- A prediction locks when you commit it. Each wrong option names the mistaken belief behind it, from a shared registry in `apps/web/content/misconceptions/`.
- Code examples run in your browser inside a Web Worker, as classic scripts, with console output formatted like Node's.
- Your predictions, cards and progress stay in your browser's IndexedDB. There is no account and no server.
- Lab 1.1 (`deepEqual` and `deepClone`) runs from a clone of this repo. Its instructions are in `apps/web/content/javascript/values-and-references/lab/README.md`.

## How the diagrams get their state

Nobody draws the diagram states by hand. At build time, `packages/trace` runs each lesson example in [engine262](https://github.com/engine262/engine262), a JavaScript engine written to follow the ECMAScript spec closely. It records the stack, the environment records (including bindings still in the TDZ) and the heap after each step. Only the narration under each step is hand-written.

Four checks keep the traces and examples correct:

1. Unit tests in `packages/trace` assert states worked out by hand from the ECMAScript spec, for hoisting, the TDZ, closures, per-iteration `let` bindings and other cases. They also compare each example's console output with real Node.
2. Lesson examples mark points with `// @mark` comments and state what must be true at each one. The build fails when the generated trace disagrees.
3. content-check runs every runnable code block and every prediction's code with `node -e`. It fails when a `// →` comment or a prediction's answer differs from the real output, or when a wrong option matches it.
4. The generated traces are committed. CI regenerates them and fails on any difference, so a change to the engine or the generator shows up in review.

engine262 is not the engine in your browser. A comparison against Chromium's console output is planned but not built.

## Run it locally

You need Node 24 or later (CI uses Node 26) and pnpm 12.

```sh
pnpm install
pnpm dev
```

Then open http://localhost:3000.

These commands run the same checks as CI:

```sh
pnpm lint
pnpm typecheck
pnpm test
node packages/content-check/src/cli.ts apps/web/content
pnpm --filter @stepthrough/web labs
pnpm --filter @stepthrough/web build
pnpm --filter @stepthrough/web e2e
```

The end-to-end tests use your installed Chrome. To use Playwright's own Chromium instead, run `pnpm --filter @stepthrough/web exec playwright install chromium` once and set `PLAYWRIGHT_CHANNEL=chromium`.

## Repository layout

| Path | Contents |
| --- | --- |
| `apps/web` | The Next.js site, built as a static export |
| `apps/web/content` | Lessons in MDX, their examples and labs, the glossary and the misconception registry |
| `packages/trace` | The trace format and the engine262 trace generator |
| `packages/sandbox` | The Web Worker that runs lesson code |
| `packages/content-check` | The command-line tool that checks lesson content |
| `packages/srs` | FSRS spaced-repetition scheduling, not used by the site yet |
| `docs` | The product spec, the architecture and the design system |

[docs/architecture.md](docs/architecture.md) explains how the parts fit together. [DECISIONS.md](DECISIONS.md) records each change to the spec and the reason for it.

## Known gaps

- Only Chromium is tested. Nobody has checked Safari or Firefox yet.
- The `/review` and `/today` pages do not exist yet, so the site saves review cards but does not schedule them.
- Labs run from a repo clone only.
- A return step in a diagram does not show the returned value.
- Each lesson page loads about 266 KB of gzipped JavaScript, which is over the spec's 200 KB budget.
- All lessons are drafts. A lesson becomes `reviewed` only after a person has studied it and its errors are fixed.

## Licence

The code is under the MIT licence in [LICENSE](LICENSE). The lesson text in `apps/web/content` is under CC BY-SA 4.0, as described in [LICENSE-CONTENT](LICENSE-CONTENT).
