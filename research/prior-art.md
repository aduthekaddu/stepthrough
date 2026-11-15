# Groundwork prior art and trace-engine research

Research date: 2026-11-15. Status: research only, no app code.

**Goal of this note.** Aditya wants Groundwork to be a free, open-source learning site that is clearly better than existing tools, not one more event-loop toy. This note answers four questions. What already exists? What gap is left? How do execution visualizers get their data? Which trace engine should Groundwork use?

**How to read the evidence.** Every claim links to a page I opened, or names a command I ran. "Measured" means I ran it on this machine (Node v26.13.1, Linux). "Inferred" means I reasoned from the evidence without running it. Pages I could not open are listed in [Gaps in this research](#gaps-in-this-research).

## 1. Summary

1. **The gap is integration, not technology.** Strong tools exist for each separate piece: runtime visualizers, predict-the-output drills with spaced repetition, explorable essays, build-it-yourself labs, interview question banks, and system-design simulators. I found no single free, open-source path that joins predict, verified visual, explain, spaced review and a build lab across the JS runtime, databases and system design. That join is Groundwork's real gap.
2. **"Every trace verified against real execution" is not novel.** Python Tutor has built its traces from real execution since 2010. JS Visualizer 9000 records events from a real Node process. A project from October 2026, [ngocsangyem/event-loop-viz](https://github.com/ngocsangyem/event-loop-viz), already runs code in engine262 inside a Web Worker and checks its output against real Chrome with differential tests. Groundwork should not claim to be first. It can honestly claim one shared, typed trace format, checked against several kinds of oracle: Node, Chromium, engine262, real Postgres and queueing formulas. That breadth is uncommon.
3. **Trace engine.** Use engine262 for every JS-runtime visual. In Phase 1, run it at build time in Node to *generate* the state frames, and keep only the narration hand-written. In Phase 2, run the same generator in a browser Worker for live code. engine262 runs in a real Chrome module Worker (measured). It exposes the job queue, the execution-context stack and environment records (read from its type declarations). It is slow: a 100,000-iteration loop took 3.85 s (measured). That is fine for teaching snippets and too slow for big loops.
4. **The most important pitfalls.** (a) A patched `Promise.prototype.then` never sees `await` (measured), so a Babel or Acorn instrumentation approach cannot show `await` faithfully. (b) In Node, `process.nextTick` and promise callbacks run in a different order in CommonJS than in ES modules (measured). (c) `setTimeout(0)` against `setImmediate` is not deterministic in Node's main module (measured: 29 of 30 runs printed "immediate" first). (d) Checking only the final console output lets a trace with a wrong queue picture pass CI. (e) PGlite has a single connection, so two real concurrent transactions cannot run in one browser database.

## 2. Products and projects

### 2.1 Comparison table

| Product | What it does well | What it does poorly (for Groundwork's learner) | Price and licence | Source |
|---|---|---|---|---|
| Python Tutor (JS mode) | Real step-by-step traces with forward and back stepping. Claims 25M+ users. Free. | The JS backend was built for Node v6 through the old V8 debugger, and its own header calls it "very brittle". The site gives a 10-second run limit. I found no event-loop or queue view. | Free with donations. The original repo URL now returns 404. A mirror carries GPL-3.0 text. | [pythontutor.com](https://pythontutor.com/), [javascript.html](https://pythontutor.com/javascript.html), [mirror README](https://github.com/hcientist/OnlinePythonTutor), [jslogger.js](https://github.com/cmattey/OnlinePythonTutor/blob/master/v4-cokapi/backends/javascript/jslogger.js) |
| JS Visualizer 9000 | Shows microtasks and tasks separately, driven by real Node events. | Needs a server running Node 11. Last commit was 2021-08-19. No licence file. | Free. No licence. | [client](https://github.com/Hopding/js-visualizer-9000-client), [server](https://github.com/Hopding/js-visualizer-9000-server) |
| Loupe | The classic talk demo for stack, Web APIs and callback queue. Runs in the browser. | Last commit 2014-11-17. Uses esprima 1.2 (ES5). Its models cover timers and DOM events, and I found no promise or microtask model in the files I read. | ISC (package.json). | [repo](https://github.com/latentflip/loupe) |
| ngocsangyem/event-loop-viz | engine262 in a Worker, a hand-written HTML host, a virtual clock, one immutable trace, differential tests against Chrome 155, three views, keyboard and accessibility e2e tests. The closest technical prior art. | Created 2026-10-20, at least 100 commits by 2026-10-23, 0 stars, "not deployed yet". Event loop only. No curriculum or review loop. | No licence file (the GitHub API reports none), so its code cannot be reused. | [README](https://github.com/ngocsangyem/event-loop-viz), [engine research](https://github.com/ngocsangyem/event-loop-viz/blob/HEAD/docs/research/execution-engine.md) |
| Just JavaScript (Abramov, Appleton) | Best mental-model teaching for values, references and properties. Quizzes explain why a wrong answer is wrong. | Ten episodes. Stops before async, Node, databases and system design. | Free, no account. | [justjavascript.com](https://justjavascript.com/) |
| Lydia Hallie, JavaScript Visualized | Very shareable animated GIFs. | Static GIFs you cannot step through. The event-loop post shows one queue and no microtasks or rendering. A commenter corrected a `setTimeout` return-value error. | Free blog posts. | [dev.to post](https://dev.to/lydiahallie/javascript-visualized-event-loop-3dif) |
| Execute Program | The closest product prior art. You predict what each example evaluates to or whether it type-checks, and lessons come back on a spaced-repetition schedule. Three TS courses, 129 lessons. | Paid. The pages I could open describe code examples, not runtime diagrams. Closed source. Its own site renders client-side, so I could not read it directly. | $39/month or $235/year, 16 free lessons. | [Boot.dev review](https://www.boot.dev/blog/javascript/best-typescript-courses) |
| GreatFrontEnd | Large interview bank, strong for UI and machine-coding rounds. Free open-source question repos. | Its site returned HTTP 429 to me, so I could not check counts or prices. The open repos are text Q&A. | Paid product. Open repos: the handbook is MIT, two question repos list no licence. | [front-end-interview-handbook](https://github.com/yangshun/front-end-interview-handbook), [top-javascript-interview-questions](https://github.com/greatfrontend/top-javascript-interview-questions) |
| BigFrontEnd.dev | 600+ questions: 170+ JS coding, 130+ JS quiz, 60+ TypeScript puzzles, 20+ front-end system design. | Practice only. No visual model of why an answer is right. | Pricing not shown on the home page. | [bigfrontend.dev](https://bigfrontend.dev/) |
| NamasteDev / Namaste JavaScript | Big Indian audience. Covers execution context, closures and the event loop. | Video. I could not open any NamasteDev page (HTTP 403). | Not verified. | [Gaps](#gaps-in-this-research) |
| Codecrafters | Build Redis, Git, HTTP server, shell and more. Tests run on `git push`. Redis has 97 stages. | No visuals. Not a fundamentals path. | Pricing not shown on the home page. | [codecrafters.io](https://codecrafters.io/) |
| Frontend Masters (now master.dev) | Deep video workshops, such as JavaScript: The Hard Parts v3 (9.7 h). | Video only, no graded exercises. | $39/month or $390/year. `frontendmasters.com/pricing/` now 301-redirects to master.dev. | [Boot.dev review](https://www.boot.dev/blog/javascript/best-javascript-courses) |
| Boot.dev | Code against tests in the browser. A 105-lesson TypeScript course. | Mostly paid after 3 chapters. Shows leaderboards and guilds, which Groundwork's anti-goals reject. | $59/month or $399/year. | [Boot.dev review](https://www.boot.dev/blog/javascript/best-typescript-courses) |
| Scrimba | "Scrims": screencasts where you pause and edit the instructor's code. Has an 11.4 h AI Engineer path. | Video first. | Pro $49/month, or $24.50/month billed yearly, with regional discounts. | [Scrimba article](https://scrimba.com/articles/comparing-scrimba-pro-and-scrimba-bootcamp-plans/) |
| Brilliant | Active-learning STEM courses, 90+ courses. | Uses weekly XP leagues. I could not read its programming course pages. | Freemium, about US$45/month. | [Wikipedia](https://en.wikipedia.org/wiki/Brilliant_(website)) |
| javascript.info | Thorough free text with runnable examples. Explains macrotasks, microtasks and rendering correctly. | Static SVG diagrams. The Boot.dev review notes most examples are read-and-run. | Free. "© Ilya Kantor", no open content licence stated. | [event-loop page](https://javascript.info/event-loop) |
| roadmap.sh | 31 role and 62 skill roadmaps, 372K GitHub stars. | A map of topics, not teaching. | Free. | [roadmap.sh](https://roadmap.sh/) |
| Hello Interview | Clear system-design delivery framework, quizzes, an AI tutor. | Static images. Premium sections are locked. | Prices not shown. | [System Design in a Hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction) |
| ByteByteGo | Illustrated courses on system design, ML and GenAI system design. | Text and images. No refunds. | Prices not shown. | [bytebytego.com](https://bytebytego.com/) |
| Supabase database.build | Real Postgres in the browser with PGlite, plus AI help. Open source. | Notes PGlite's single-connection limit. | Free, Apache-2.0. | [blog](https://supabase.com/blog/database-build-v2) |
| Kleppmann's Hermitage | Exact, reproducible two-session scripts for ten isolation anomalies, with a results table per database. | Manual, in terminals. Not visual. | CC BY 4.0. | [repo](https://github.com/ept/hermitage) |
| Sam Rose (samwho.dev) | Interactive essays on load balancing, queueing, retries, hashing and Bloom filters. | Essays, not a path. Each takes one to three months to make. | Code is MIT. | [samwho.dev](https://samwho.dev/), [visualisations repo](https://github.com/samwho/visualisations) |

### 2.2 What this means

- **Visualizers** (Python Tutor, JSV9000, Loupe, event-loop-viz) each show one runtime surface. None has a prediction step, a review schedule or a lab.
- **Execute Program** has the predict and spaced-review loop. The sources I could read do not show runtime state diagrams.
- **Explainers** (Just JavaScript, Lydia Hallie, Sam Rose) build mental models but have no practice loop. Lydia Hallie's event-loop GIF also simplifies to a single queue.
- **Interview banks** (GreatFrontEnd, BigFrontEnd, Hello Interview, ByteByteGo) give volume and frameworks, mostly with static images.
- **Build-it labs** (Codecrafters, Boot.dev) test what you build but do not show runtime state.

## 3. The gap and the novelty question

**The gap Groundwork can fill.** One ordered, free, open-source path in which each concept has four parts. First, a prediction. Second, a visual whose state is machine-checked. Third, a one-line explanation in the learner's words. Fourth, FSRS review and a lab with tests. The path runs from the JS runtime through Postgres to system design and AI features. It also targets the Indian interview format (polyfills, machine coding). I found no product that joins these parts. This is a claim about the absence of evidence. My search covered the products above and the event-loop visualizers listed in a web search for engine262 traces.

**Is "every trace verified against real execution" novel? No.**

- Python Tutor traces *are* real executions. The JS logger drives a real Node debugger ([jslogger.js](https://github.com/cmattey/OnlinePythonTutor/blob/master/v4-cokapi/backends/javascript/jslogger.js)).
- JSV9000 runs the submitted code in real Node and records events from `async_hooks` ([worker.js](https://github.com/Hopding/js-visualizer-9000-server/blob/master/src/worker/worker.js)).
- event-loop-viz says its output "matches what Chrome 155 produces", checked by differential tests that run each fixture in real Chrome and in the simulator ([README](https://github.com/ngocsangyem/event-loop-viz)).

**What is less common, and honest to claim.**

1. One typed trace format shared by about 14 visualizers, where each visualizer has a named oracle (see §6.3).
2. Checking *intermediate* states (queue contents, environment records), not only final console output.
3. Hand-written narration tied to engine-generated state, so the words and the picture cannot drift apart.

**Resume wording to prefer.** "Typed trace format for 14 visualizers; JS traces generated by a spec-compliant engine (engine262) and differentially tested against Node and Chromium; transaction traces checked against real Postgres." Avoid wording that implies Groundwork invented verified traces. An interviewer who knows Python Tutor will ask about it.

## 4. How existing visualizers get their trace data

| Tool | Mechanism | Evidence |
|---|---|---|
| Python Tutor (JS) | Runs `node --expose-debug-as=Debug jslogger.js`, which steps the user script through the old V8 debugger API. Built for Node v0.10, ported to Node v6.0.0. Its header says it is "*very* sensitive to Node version". Pinned to `typescript` 1.4. | [jslogger.js header](https://github.com/cmattey/OnlinePythonTutor/blob/master/v4-cokapi/backends/javascript/jslogger.js), [backend README](https://github.com/cmattey/OnlinePythonTutor/blob/master/v4-cokapi/backends/javascript/README) |
| JS Visualizer 9000 | A Node 11 server. It rewrites the source with `falafel` and Babel to emit `EnterFunction` and `ExitFunction` events, uses `async_hooks.createHook({ init, before, after, promiseResolve })` for promise and timer lifecycles, and runs the code in a `vm2` sandbox inside a worker thread. | [server README](https://github.com/Hopding/js-visualizer-9000-server), [package.json](https://github.com/Hopding/js-visualizer-9000-server/blob/master/package.json), [worker.js](https://github.com/Hopding/js-visualizer-9000-server/blob/master/src/worker/worker.js) |
| Loupe | Rewrites `CallExpression` and `BinaryExpression` nodes with `falafel` (esprima 1.2) to insert before and after hooks, then runs the code in a Web Worker with an artificial delay (default 750 ms). The Web API models are written by hand. | [instrument-code.js](https://github.com/latentflip/loupe/blob/master/lib/instrument-code.js), [models/code.js](https://github.com/latentflip/loupe/blob/master/models/code.js) |
| event-loop-viz | engine262 plus a hand-written HTML host on a virtual clock, in a Worker. It produces one immutable trace, and the UI only replays it. Its research compared engine262, QuickJS-wasm, instrumented native code, Sval and JS-Interpreter, and picked engine262. | [README](https://github.com/ngocsangyem/event-loop-viz), [execution-engine.md](https://github.com/ngocsangyem/event-loop-viz/blob/HEAD/docs/research/execution-engine.md) |

### 4.1 Candidate engines, measured

All rows were measured on this machine on 2026-11-15 unless marked otherwise. Probe scripts are in the scratchpad (see [Reproduce](#reproduce-the-measurements)).

| Engine | Version and date | Size | Speed: `for` loop of 1e5 additions | ES support | Introspection |
|---|---|---|---|---|---|
| engine262 (`@engine262/engine262`) | `0.0.1-46acc946…`, published 2026-11-13 (`npm view`). No semver. At least 7 publishes between 2026-10-23 and 2026-11-13. The unscoped name `engine262` returns 404. MIT. | `lib/engine262.mjs` 4.36 MB. Bundled for the browser with esbuild and minified, 2.24 MB, or 476 KB with gzip -9 (measured). event-loop-viz reports 1.76 MB min and 370 KB gzip with Vite. | 3,851 ms for 1,000,015 node evaluations, about 260k nodes per second (measured). event-loop-viz measured 3,407 ms (median of 5, Node 20). | Aims at "100% Spec Compliance" ([README](https://github.com/engine262/engine262)). | `Agent.executionContextStack`, `Agent.jobQueue` with `onNewJob` and `enqueuePromiseJob`, `ExecutionContext.LexicalEnvironment` and `VariableEnvironment`, `DeclarativeEnvironmentRecord.bindings: Map`, an `onNodeEvaluation(node, realm)` hook, and `pauseAt: 'step-over' \| 'step-in' \| 'step-out'` (read from its `.d.mts` files). |
| QuickJS via `quickjs-emscripten` | 0.32.0, published 2026-02-16. MIT. | Release-sync WASM is 492 KB on disk (measured). The README gives about 1.3 MB for a minimal setup. | 22.9 ms (measured). | Modern ES. | Interrupt handler, memory limit, `executePendingJobs`, `getPromiseState`. The README shows no way to read scopes or the call stack ([README](https://github.com/justjake/quickjs-emscripten)). |
| Neil Fraser's JS-Interpreter | 6.0.2, published 2026-06-01. Apache-2.0. | 958 KB unpacked. | 274 ms for 2,000,021 steps (measured). | ES5 only. `typeof Promise` is `"undefined"`, and arrow functions and `let` are syntax errors (measured). The docs confirm ES5 and say it is "about 200 times slower than native" ([docs](https://neil.fraser.name/software/JS-Interpreter/docs.html)). | `step()` per operation, `getStatus()`. |
| Babel or Acorn instrumentation of native code | `@babel/core` 8.1.2, `acorn` 8.19.0 (`npm view`). | Small. | Native speed. | Whatever the host engine supports. | Only what you insert. It cannot see `await` (see §5.1). |

**engine262 in a browser Worker.** I bundled a probe with esbuild, loaded it with `new Worker('worker.js', { type: 'module' })` in headless Google Chrome, and it printed `["'sync'","'t1'","'a1'"]` with `typeof document === "undefined"`. That is the correct order. So engine262 runs in a real browser module Worker (measured).

**engine262 is only the language, not the host.** `queueMicrotask` made my probe throw, because `queueMicrotask`, `setTimeout` and `console` are host APIs, not ECMA-262 (measured). engine262's own example defines a timer by hand through `surroundingAgent.eventLoop.enqueueAsync('timers', job, …)` ([example.mts](https://github.com/engine262/engine262/blob/main/lib-src/node/example.mts)). Groundwork must write its own small HTML host and a separate Node host. event-loop-viz did the same ("a hand-written HTML event-loop host").

**Tick agreement.** For a snippet that compares `return value`, `return await p` and `return p` against a reference `.then` chain, Node 26, engine262 and QuickJS all printed `t1, return-value, t2, return-await, t3, return-promise` (measured).

## 5. Correctness pitfalls when modelling the event loop

### 5.1 Instrumentation cannot see `await`

The spec's `Await` calls `PromiseResolve` and then `PerformPromiseThen` directly. It never reads `then`. I patched `Promise.prototype.then` in Node and ran `await p`, `p.then()` and `return p`. The patch recorded the explicit `.then` and the later `return p` adoption, but not the `await` (measured: `["then@explicit","then@"]`). event-loop-viz reached the same conclusion: "a `then` wrapper sees builtins and `return` but not `await`" ([execution-engine.md §3.1](https://github.com/ngocsangyem/event-loop-viz/blob/HEAD/docs/research/execution-engine.md)). **Consequence.** Approach (a) in spec §6.1 would need to rewrite every `await` and replace `Promise`. At that point you are writing an interpreter, and engine262 already is one.

### 5.2 `await` tick counts changed, and may change again

- Before tc39/ecma262 PR #1250, `await` on a native promise took at least three microticks. After it, it takes one. V8 enabled the change by default in v7.2 (Chrome 72). Node 8 printed a different order from Node 10 for the same code ([V8 blog](https://v8.dev/blog/fast-async)).
- `return promise` from an async function still takes more ticks than `return await promise`. Issue #2770 is open, with an open fix PR #2772 ([issue](https://github.com/tc39/ecma262/issues/2770)). The Stage 1 proposal-faster-promise-adoption would change adoption tick counts again ([proposal](https://github.com/tc39/proposal-faster-promise-adoption)).
- The issue and the proposal count ticks from different starting points (3 against 2, and 2 against 1). **Rule for lessons.** Teach order relative to a reference `.then` chain, as in §4.1, not absolute tick numbers. Run CI on more than one Node version, so a future spec change fails loudly instead of leaving a stale lesson.

### 5.3 Node is not the browser, and Node is not one thing

- **CommonJS against ES modules.** With the same three lines, a `.cjs` file printed `sync, nextTick, promise` and a `.mjs` file printed `sync, promise, nextTick` (measured). Every Node trace must record its module type.
- **`setTimeout(0)` against `setImmediate`.** The order is non-deterministic in the main module and deterministic inside an I/O callback ([Node docs](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)). Measured: 29 of 30 runs printed `immediate` first. A CI check that runs such a snippet once would be flaky.
- **libuv changed.** Since libuv 1.45.0 (Node 20), timers run after the poll phase in each iteration ([Node docs](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)). Older diagrams of the libuv phases may be out of date.
- **`process.nextTick` is not part of the event loop.** Its queue drains after the current operation, whatever the phase ([Node docs](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)). engine262 has no libuv, so Node mode cannot come from engine262 alone.

### 5.4 Rendering steps are not deterministic

The HTML spec says a navigable "has a rendering opportunity if the user agent is currently able to present the contents", accounting for "hardware refresh rate constraints and user agent throttling". It also lets the browser skip "unnecessary rendering" ([HTML Standard, event loop processing model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)). So `requestAnimationFrame` against `setTimeout` ordering depends on frame timing. The render step should be drawn as "may happen between tasks" and never asserted as a fixed position in CI. event-loop-viz uses a virtual clock for the same reason.

### 5.5 Browsers have disagreed before, and click events differ

In 2015, Edge, Firefox 40 and Safari 8.0.8 ran promise callbacks as tasks, not microtasks. A real user click runs microtasks between listeners, while a scripted `el.click()` runs them after both listeners ([Jake Archibald](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)). A browser trace must state its host profile, for example "Chromium, version N", as event-loop-viz does with `chrome-155`.

### 5.6 A final-console check is too weak for Groundwork's claim

Spec §6.1 asserts only that Node's console equals the last frame's `console`. A trace can draw the microtask queue in the wrong order and still print the right lines. The spec's resume bullet ("CI verifies every trace against real execution") is only honest if CI checks the frames too.

## 6. Recommendation

The data shape stays the spec's `Trace` type. The change is *who writes the state fields*. It applies **principle-redesign-from-first-principles**: if live traces were the goal from day one, the Phase 1 generator would be the same code as the Phase 2 engine, not a separate hand-written path.

### 6.1 Phase 1, scripted traces, with three options

| Option | What CI checks | Cost | Risk |
|---|---|---|---|
| A. The spec as written. Hand-written frames, Node console equals the last frame. | Final output only. | Lowest. | A wrong queue picture passes (§5.6). Browser-only snippets run in the wrong host. |
| B. Hand-written frames, plus a differential check against engine262. | Final output, and queue and stack contents at each marked step. | Medium. You still hand-write every frame. | Hand-writing about 20 frames per example is slow and is where errors come from. |
| **C. Generate state with engine262 at build time, and hand-write only the narration.** | The generated trace is committed as a golden file. CI regenerates it and diffs it. CI also runs the source in the real host and compares console output. | Medium up front (an engine262-to-`Trace` adapter plus an HTML host). Cheaper per example afterwards. | engine262 API churn (no semver). Mitigation: pin the exact version and wrap it in one adapter module. |

**Recommended: C for the JS-runtime visualizers** (`MemoryDiagram`, `CallStack`, `EnvChain`, `ProtoChain`, `EventLoop` browser mode, `PromiseStateMachine`). Concretely:

1. A build script runs each example in engine262 under Node, with the Groundwork HTML host. It records frames from `onNodeEvaluation`, `executionContextStack`, environment record `bindings` and `jobQueue.onNewJob`.
2. Authors write narration as `{ atStep or atLine: sentence }`. The build fails if a narration anchor matches no frame.
3. CI regenerates every trace and fails on a diff against the committed golden file. A reviewer then sees the state change in the PR.
4. CI also runs each example in its declared real host. Browser-mode examples run in Playwright Chromium, which is already in the stack. Node-mode examples run in pinned Node with a declared `cjs` or `esm` type. CI compares console output with the engine262 trace.
5. CI runs each real-host example several times, for example 20, and fails if the output varies. This catches the `setTimeout` against `setImmediate` case (§5.3).
6. CI runs on Node LTS and Node current (§5.2).

**`EventLoop` Node mode** cannot be generated by engine262, because engine262 has no libuv. Keep those few traces hand-written, as in option A, and add checks 4 to 6 against real Node.

**Non-JS visualizers** keep hand-written or simulated traces, each with its own oracle:

| Visualizer | Oracle in CI |
|---|---|
| `TxnLanes` | Run the same two-session script against real Postgres (a CI service container). Assert the outcome given in Hermitage's PostgreSQL table, for example "repeatable read" allows G2-item write skew and prevents P4 lost update ([Hermitage](https://github.com/ept/hermitage)). |
| `BTree` | Compare each frame with a small reference B-tree implementation that has property tests. |
| `HashRing`, `TokenBucket` | Property tests on a pure reference implementation. |
| System design simulator | Compare against closed-form queueing results within stated tolerances (see §8). |

### 6.2 Phase 2, live traces

- Run the same engine262 adapter and HTML host inside a dedicated module Worker. This is proven in Chrome (§4.1).
- Lazy-load it only on the playground route, because the bundle is about 476 KB gzip (measured).
- Enforce a budget by counting `onNodeEvaluation` calls. At the measured speed of about 260k nodes per second, a cap of 200k nodes is about 0.8 s (inferred from the measurement). Keep the spec's 2 s `worker.terminate()` as the hard stop.
- When the learner only needs output and not a visual, run QuickJS (23 ms for the same loop, measured) or the plain sandbox Worker.
- Reject JS-Interpreter (ES5 only) and source instrumentation for the event loop (it cannot see `await`).
- Before building, read event-loop-viz's public research docs for host-API details. Do not copy its code, because it has no licence.

### 6.3 Cost note

The Phase 1 generator is more work than option A. How many days it takes is a guess I cannot back with a number. The payoff is that Phase 2 becomes mostly "move the generator into a Worker". This is **principle-build-the-lever**: the generator is the tool that proves every trace, and a reviewer can rerun it.

## 7. How the great explainers build interactives

| Author | Stack | Source |
|---|---|---|
| Josh Comeau | Next.js App Router, React, MDX through next-mdx-remote, Linaria, Shiki, Sandpack. React Spring "to smoothly interpolate between values" and Framer Motion for layout animations. SVG icons. | [How I built my blog v2](https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/) |
| Sam Rose | PixiJS for 2D rendering and GSAP for animation. The repo builds with Bun and uses `lit` Web Components. MIT. | [HN comment](https://news.ycombinator.com/item?id=39439505), [visualisations repo](https://github.com/samwho/visualisations) |
| Bartosz Ciechanowski | Hand-written WebGL and JavaScript, no framework or 3D library. Source is not minified. One HN thread hints some code was generated. | [HN thread](https://news.ycombinator.com/item?id=31262720) |
| Red Blob Games (Amit Patel) | Chooses SVG "because DOM-manipulating libraries like D3 and Vue make HTML and SVG easier". Builds each diagram as layers with create and update code, plus draggable handles and scrubbable numbers. Says he has no generic layer system across tutorials. | [Making of: line drawing](https://www.redblobgames.com/making-of/line-drawing/) |
| USFCA (David Galles) | Canvas plus an "animation manager" that takes an array of command strings. Undo resets and replays all earlier actions. FreeBSD-style licence. | [source page](https://www.cs.usfca.edu/~galles/visualization/source.html) |

**Implications for Groundwork** (inferred from the table):

- The spec's choice of Motion fits stack frames and queue chips, which are DOM layout animations. Comeau uses Framer Motion for the same job.
- Use SVG for diagrams with tens of objects (`MemoryDiagram`, `BTree`, `HashRing`), as Red Blob does.
- Use canvas (or PixiJS) only where hundreds of moving dots appear, such as request particles in the system-design simulator. Sam Rose's load-balancing posts draw many requests and use PixiJS.
- Galles's "list of commands, replay from start" model is the same idea as replaying an immutable `Trace`. It shows that step-back can be "replay to step n-1" instead of an inverse operation per step.

## 8. System-design simulators and database teaching

**Simulators found:**

- **StackMonkey.** Deterministic event clock ("same design, same result"). It publishes its models (M/M/1, M/M/c, M/M/c/K, Erlang-B, M/G/1) and arrival and service distributions. It states validation tolerances: mean latency within about 5% of the formula and utilization within 2 percentage points. It also lists what it does not model. Free, and open source status is not stated. ([stackmonkey.dev](https://stackmonkey.dev/))
- **Tracewire.** React, Vite, @xyflow/react, Zustand and Recharts, client-side only, MIT. It calls itself "Realistic" but documents no validation. 1 star. ([repo](https://github.com/perumallavishnu/tracewire))
- **Sam Rose, Load Balancing.** A teaching simulation that states its limits: "They aren't realistic benchmarks to be taken at face value." ([post](https://samwho.dev/load-balancing/))
- **RaftScope.** "A Raft cluster running in your browser", next to the more guided The Secret Lives of Data. ([raft.github.io](https://raft.github.io/))

**Database visualizers found:**

- **USFCA B-tree.** Canvas, animated, FreeBSD-style licence ([source](https://www.cs.usfca.edu/~galles/visualization/source.html)).
- **codingpancake isolation "simulator".** A cautionary example. Its simulator text says "Under Read Committed, Transaction 2 reads uncommitted modifications, leading to a dirty read." The same page's FAQ says "dirty reads are impossible in PostgreSQL under any isolation level." ([page](https://www.codingpancake.com/2026/07/database-transaction-isolation-levels.html)) This is exactly the kind of error Groundwork's checks should make impossible.
- **PGlite limit.** PGlite is "single connection only", and multi-tab use elects one leader tab that runs every query ([PGlite multi-tab docs](https://pglite.dev/docs/multi-tab-worker)). Spec §6.5 already plans for this. Two-session mode must be a scripted interleaving that says so in the UI, and its correctness comes from the real-Postgres CI check in §6.1.

**What makes the credible ones credible** (inferred from the examples above):

1. They state the model, its distributions and its limits next to the numbers (StackMonkey, Sam Rose).
2. They validate against something outside themselves: queueing formulas (StackMonkey), a real database (Hermitage), or a real browser (event-loop-viz).
3. They are deterministic and replayable: an event clock, a seeded random source, replay from the start.
4. They are honest about what is simulated. The non-credible example contradicts itself on the same page.

Spec §6.6 already asks for assumption tooltips. Add a seeded random source, a published model page, and a CI test per component that compares simulated mean latency and utilization with the M/M/c formula within a stated tolerance.

## 9. Should taught state machines be model-checked with TLA+?

**Verdict.** Worth it for one or two lessons where the lesson *is* a bad path through states. Overkill as a rule for every state machine.

| Machine | Value of TLA+ model checking | Why |
|---|---|---|
| Promise states | Low | Three states with one-shot transitions. The authority is the spec, tested by test262 and runnable in engine262. The "build your own Promise" lab is better graded by the Promises/A+ test suite ([promises-tests](https://github.com/promises-aplus/promises-tests)). |
| Payment flow with retries and idempotency keys | High | The bug a learner must see is a path: timeout, retry, double charge. The statechart skill's report gives "the shortest path to each state that breaks a rule" (kaddu-kit `statechart` SKILL.md). That path becomes the lesson's animation and a predict question. It also shows the "verify what the AI wrote" skill from spec §0. |
| Transaction anomalies | Medium to low | Real Postgres is the better oracle for "what Postgres does" (Hermitage). TLA+ would only prove the model matches itself. Use it only if a lesson teaches snapshot isolation in general. |
| TCP states | Low | The diagram comes from the RFC. Model checking proves the drawing matches the model, not that the model matches TCP. |

**Cost** (from the statechart skill): TLC needs Java, installed through mise on first run, so network access is needed in CI. Each spec is one more file to maintain. Spectacle, an MIT-licensed TLA+ interpreter in JavaScript, could later let learners step through a spec in the browser ([spectacle](https://github.com/will62794/spectacle)). That is a stretch goal, not a v1 need.

## 10. Gaps in this research

- **Execute Program.** Its site renders client-side and WebFetch returned only the title. Facts come from a Boot.dev review, and Boot.dev is a competitor. I could not confirm whether it has runtime diagrams, or the status of its JS concurrency course.
- **NamasteDev and Namaste JavaScript.** Every page I tried returned HTTP 403, including a Class Central listing. No claims about it are verified here.
- **GreatFrontEnd.** The site returned HTTP 429 twice. Only its GitHub repos were checked.
- **Brilliant, Scrimba, Codecrafters and ByteByteGo pricing.** The pages I could open did not show prices, except Scrimba through its own article and Brilliant through Wikipedia.
- **Python Tutor.** The "unsupported features" Google Doc returned no body text. I did not confirm whether today's live JS backend is still the Node v6 logger.
- **Bartosz Ciechanowski.** His about page returned 404. The stack comes from an HN thread, not from him directly.
- **engine262 test262 pass rate.** Not measured. event-loop-viz also lists it as unknown.
- **engine262 in Firefox and Safari Workers.** Only Chrome was tested.
- **Notion memory.** I did not read or write the Notion memory for this research.

## Reproduce the measurements

The probe scripts are in `/tmp/claude-1001/-home-ubuntu-stepthrough/a64c6066-a053-473c-a5e7-16a641a7386f/scratchpad/scripts/`. That is a temporary scratchpad, not part of the repo.

- `e262probe.mjs`: ordering, hooks and timing in engine262.
- `qjs.mjs`: the same checks in QuickJS.
- `jsi.cjs`: ES support and steps in JS-Interpreter.
- `order.cjs` and `order.mjs`: `nextTick` against promise in CommonJS and ES modules.
- `ti.cjs`: `setTimeout` against `setImmediate`.

The engine packages were installed with `npm i --ignore-scripts @engine262/engine262 quickjs-emscripten js-interpreter esbuild`. The browser Worker test bundled a probe with esbuild, served it from a local static server, and loaded it in `google-chrome --headless=new --dump-dom`.
