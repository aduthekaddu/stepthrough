# Groundwork: Build Spec

> **For Claude Code.** This is the full spec for **Groundwork** (working name). It's an interactive, first-principles learning site for software engineering. Read the whole document before you write any code. Start with **§12 Build Plan, Phase 0**. When this doc and your instincts disagree, follow the doc. When the doc is silent, choose the simpler option and record it in `DECISIONS.md`.

---

## 0. Context: who this is for and why

**Learner:** Aditya. Graduated with a B.Tech in CSE in May 2026 and has been a Junior Software Developer since April 2026. His current work is Java, OSGi and Adobe Experience Manager. On the side he has done freelance full-stack work with Next.js, Node and MongoDB, and built projects on Postgres, Prisma, Redis, RabbitMQ, WebSockets and Docker. He has solved 500+ LeetCode problems.

**Goal:** About 3.5 focused hours a day for 30 days, then switch jobs to a product company or startup in India, targeting a full-stack TypeScript role with real AI-engineering literacy. He considers his skills rusty, so **teach everything from the ground up, from first principles**. Don't assume he already knows anything.

**Secondary goals:**
1. The project is strong enough to go on his resume as a flagship project.
2. It's open source and useful to other people.

**The market reality this curriculum must respect (late 2026):**
- AI skills now appear in roughly 40–50% of software job postings. General SWE demand has split: AI-capable profiles are rewarded and plain CRUD profiles are being squeezed. Listing "ChatGPT, Copilot, LangChain" under skills no longer differentiates anyone. Built-and-shipped AI features do.
- Interviews have changed. Meta replaced one onsite coding round with a 60-minute AI-assisted round. Google added a code-comprehension round in which you read and modify an existing codebase with AI in the editor. Candidates are graded on how they **direct the AI and verify its output**. DSA rounds without AI still exist, and LeetCode hasn't gone away.
- Indian product companies (Flipkart, Groww, PhonePe and others) still lean heavily on **JavaScript deep-dives, polyfills and machine-coding (UI LLD) rounds** for frontend and full-stack roles. System design follows the usual structure, but LLM/RAG-system prompts are now common.
- So the curriculum is: **fundamentals deep enough to explain from scratch**, plus **the ability to read, review and own AI-written code**, plus **building AI features into ordinary products**.

---

## 1. Product principles (non-negotiable)

1. **Predict → Run → Explain → Retrieve.** Every concept follows this loop. The learner commits to a prediction *before* seeing the answer, watches it play out visually, writes a one-line explanation in his own words, and the concept then enters spaced review. Passive reading is the failure mode we're designing against. That failure mode is "tutorial hell": input without output.
2. **Build the thing to understand the thing.** Every major concept ends in a lab where you implement it yourself: `bind`, `Promise`, a mini-React, an Express-style middleware chain, a token-bucket rate limiter, a RAG pipeline. Labs have automated tests.
3. **One spine, no fragmentation.** A single ordered path. No "choose your own adventure" menu of 200 topics. Each lesson links to *at most* 2–3 primary sources for going deeper.
4. **Visual where it carries meaning, text where it doesn't.** Animations exist to show *state changing over time*: the stack, the heap, queues, packets, locks. They are never decoration.
5. **Every claim is checkable.** Code samples are executed in CI and their output is asserted (see §9). Any number in system design is either sourced or labelled as an assumption.
6. **Local-first, zero-login, free.** Progress lives in IndexedDB. No accounts or backend in v1. Export and import progress as JSON.
7. **Honest about time.** The "Today" page plans a real 3.5-hour session and never shames anyone for missing a day.

### What NOT to build (anti-goals)
- No video. No embedded YouTube.
- No XP, levels, badges, leaderboards or streak-guilt mechanics. The only motivation surface is a quiet heatmap and an honest list of "due for review" items.
- No generic AI chatbot sidebar. AI shows up only where it does a specific, evaluated job (§8).
- No auth, CMS, admin panel or database server in v1.
- No breadth for breadth's sake. If a topic doesn't serve the job switch or the first-principles spine, it doesn't go in.
- No "AI-slop" visuals: no purple-blue gradients, glassmorphism, emoji bullets, stock 3D blobs, generic hero sections with "Unlock your potential", or cards-in-cards-in-cards.

---

## 2. Tech stack

Use the latest stable versions at build time and check them with `npm view <pkg> version`. Don't trust memory.

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router), TypeScript strict**, static export where possible | Matches the job-market stack the learner is studying. Deploys free on Vercel or Cloudflare Pages. |
| Monorepo | **pnpm workspaces + Turborepo** | Lets the engines be separate, publishable packages, which is good for open source and the resume. |
| Content | **MDX** via Velite (or content-collections), with typed frontmatter (Zod) | Lessons are files in git, so contributions are PRs. |
| Styling | **Tailwind CSS v4** + CSS variables for design tokens | |
| Animation | **Motion** (motion.dev, formerly Framer Motion) | Layout animations for stack frames and queue items. |
| Code editor | **CodeMirror 6** | Lighter than Monaco, mobile-friendly. |
| Syntax highlighting | **Shiki** (build time) | |
| Sandbox execution | **Web Worker** with a timeout and kill switch, plus a tiny in-house test runner | Runs JS/TS labs in the browser. TS is transpiled in the worker with `typescript`'s `transpileModule`. |
| Type labs | The `typescript` compiler API in a worker, checking diagnostics | Type-level challenges are graded by "does it compile and do the assertions hold". |
| SQL playground | **PGlite** (`@electric-sql/pglite`): real Postgres compiled to WASM, including `EXPLAIN ANALYZE` and the `pgvector` extension | Lets us teach indexes, transactions and RAG vector search with real Postgres in the browser. |
| Diagrams/sim canvas | **@xyflow/react** (React Flow) | For the system design simulator. |
| State | **Zustand** | |
| Persistence | **Dexie** (IndexedDB) | |
| Spaced repetition | **ts-fsrs** (the FSRS algorithm) | Modern, evidence-based scheduler. |
| Testing | **Vitest** (unit), **Playwright** (e2e + visual snapshots of each visualizer) | |
| Lint/format | ESLint + Prettier, or Biome. Pick one and record it in DECISIONS.md | |
| Licence | **MIT** for code, **CC BY-SA 4.0** for lesson content | |

---

## 3. Repository layout

```
groundwork/
├─ apps/web/                     # Next.js site
│  ├─ app/
│  │  ├─ page.tsx                # landing = the learning path map (not a marketing page)
│  │  ├─ today/                  # daily session planner
│  │  ├─ learn/[track]/[lesson]/ # lesson pages
│  │  ├─ review/                 # spaced-repetition queue
│  │  ├─ labs/[lab]/             # standalone lab view
│  │  ├─ interview/              # mock-question mode
│  │  ├─ resume/                 # "defend your resume" track
│  │  └─ playground/             # free sandboxes (JS, TS, SQL, system-design sim)
│  ├─ components/
│  │  ├─ lesson/                 # Predict, Reveal, Explain, Sidenote, Checkpoint, Callout
│  │  ├─ viz/                    # all visualizers (see §6)
│  │  └─ ui/                     # design-system primitives
│  └─ content/                   # MDX lessons, one folder per track
├─ packages/
│  ├─ trace/                     # execution-trace format + scripted-trace runner (§6.1)
│  ├─ sandbox/                   # worker runner, test harness, TS transpile/typecheck
│  ├─ srs/                       # card model + FSRS wrapper + Dexie schema
│  ├─ sim/                       # discrete-event simulator for system design (§6.6)
│  └─ content-check/             # CI: extract + execute code blocks, validate frontmatter, lint prose
├─ labs/                         # Node-side labs that need a real runtime (HTTP server, streams, queues)
│  └─ 05-http-from-bytes/ { README.md, starter/, tests/ }
├─ CLAUDE.md
├─ DECISIONS.md
├─ CONTRIBUTING.md
└─ README.md
```

---

## 4. Design system: "the engineering notebook"

The look should be calm, editorial and precise, like a well-typeset textbook crossed with an oscilloscope. Reference points for *quality bar and interaction ideas only* (do not copy their visuals): Josh W. Comeau's courses, Bartosz Ciechanowski's explainers, Sam Rose (samwho.dev) on load balancing and hashing, Red Blob Games, Lydia Hallie's "JavaScript Visualized" series, and Dan Abramov's *Just JavaScript* mental-model diagrams.

### 4.1 Typography
- Prose: **Source Serif 4**, 18–19px, line-height 1.6, measure about 66ch.
- UI and labels: **IBM Plex Sans**.
- Code: **IBM Plex Mono**, ligatures off.
- Don't use Inter, and don't use more than three families.

### 4.2 Colour tokens

| Token | Light | Dark |
|---|---|---|
| `--paper` | `#F7F4EE` | `#14130F` |
| `--ink` | `#1B1A17` | `#ECE7DD` |
| `--muted` | `#6B675E` | `#9C978C` |
| `--rule` | `#E4DED3` | `#2A2822` |
| `--accent` (the one brand colour) | `#D94F2B` vermilion | `#F0704C` |

**Semantic concept colours.** These are fixed across the *entire* site, so the colour itself teaches:

| Concept | Colour |
|---|---|
| Call stack / stack frames | `#2F5DA8` blue |
| Heap / objects | `#B7862B` ochre |
| Microtask queue | `#1F7A6E` teal |
| Macrotask / task queue | `#7A3E73` plum |
| Network / I/O | `#4F7A2A` olive |
| Error / failure | `#B3261E` |

Rules: no gradients, no drop shadows heavier than a 1px rule, corner radius 6px maximum. Diagrams use a single 1.5px stroke style.

### 4.3 Layout
- The prose column is centred. Visualizers **break out** to about 1100px wide.
- On desktop ≥1280px, sidenotes sit in the right margin (Tufte-style). On mobile they collapse into tap-to-expand footnotes.
- The lesson header shows: track › lesson, estimated minutes, prerequisites (linked), and a "you'll be able to…" outcome list. Keep it to three bullets or fewer.

### 4.4 Motion
- Animate only meaningful state changes, at 150–250ms ease-out. Stack frames push and pop, queue items slide, arrows re-route.
- Visualizers default to **manual stepping**. Autoplay is opt-in.
- Keyboard: `→`/`l` next step, `←`/`h` previous, `space` play/pause, `r` reset.
- Respect `prefers-reduced-motion`: replace movement with cross-fades.

### 4.5 Accessibility
- WCAG AA contrast. Every visualizer has a text transcript of the current step in an `aria-live="polite"` region. Everything works by keyboard.

---

## 5. Lesson anatomy (the template every lesson follows)

Frontmatter (validated with Zod):
```yaml
id: js-closures
track: javascript
title: Scope and closures
minutes: 75
prereqs: [js-execution-context]
outcomes:
  - Explain a closure in terms of environment records, not "a function remembering things"
  - Predict the classic var-in-loop bug and fix it two ways
  - Implement memoize, once, debounce, throttle
sources:                       # primary sources only
  - https://tc39.es/ecma262/#sec-environment-records
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
interviewTags: [frontend, fullstack]
```

Body sections, in this order:
1. **The hook.** One concrete puzzle (`<Predict>`) the learner can't confidently answer yet. No preamble.
2. **The mental model.** Built step by step, with the visualizer as the centrepiece.
3. **Checkpoints.** 2–4 `<Predict>` blocks with escalating difficulty. A wrong answer reveals a targeted explanation of *that specific* misconception.
4. **Misconceptions.** A short list of the wrong models people actually hold and why they break.
5. **Lab.** Implement it, with tests (browser lab or `labs/` Node lab).
6. **In the wild.** Where this shows up in real code: React hooks, Express, Prisma, the learner's own projects.
7. **Interview lens.** 2–3 questions as they'd actually be asked, each with a rubric of what a strong answer contains. No model essays.
8. **Explain it back.** A free-text box: "Explain X to a junior in 3 sentences." It's stored, and optionally graded (§8).
9. **Cards.** 3–6 spaced-repetition cards declared inline with `<Card front=… back=… />`, auto-registered.

### Lesson MDX components
`<Predict>`, `<Reveal>`, `<Checkpoint>`, `<Sidenote>`, `<Callout kind="misconception|warning|aside">`, `<Code runnable>`, `<Lab id>`, `<Card>`, `<ExplainBack>`, `<InterviewQ>`, plus every visualizer in §6.

---

## 6. Interactive engines (the resume-worthy core)

There are dozens of "event loop visualizer" toy projects online, many of them vibe-coded one-offs. Groundwork stands out by putting **every visualization on a shared, typed trace format** and by **verifying every trace against real execution**.

### 6.1 `packages/trace`: the execution-trace format
```ts
type Frame = {
  step: number;
  line?: number;                       // highlighted source line
  narration: string;                   // one sentence, shown + announced to screen readers
  stack: StackFrame[];                 // { fn, envId, locals }
  heap: HeapObject[];                  // { id, kind, props, proto? }
  envs: EnvRecord[];                   // { id, parentId, bindings }
  queues?: { micro: Task[]; macro: Task[]; webapis: Pending[] };
  console: string[];
};
type Trace = { source: string; frames: Frame[] };
```
- **Phase 1: scripted traces.** Traces are authored as TS data, one file per example. CI runs the `source` in Node and asserts that its real console output equals the final frame's `console`. That catches wrong traces automatically.
- **Phase 2 (stretch, post-month): live traces.** Generate traces for *arbitrary* learner code. Spike two approaches and record the result in DECISIONS.md:
  - (a) A Babel/Acorn AST instrumentation pass that emits events, run in a worker.
  - (b) The **engine262** spec-compliant JS engine, which models job queues and environment records exactly but is slow. That's acceptable for snippets under 50 lines.

### 6.2 Visualizers (React components consuming `Trace`)
| Component | Used for |
|---|---|
| `<MemoryDiagram>` | Values vs references, mutation, equality. Boxes and arrows in the *Just JavaScript* style. |
| `<CallStack>` + `<EnvChain>` | Execution context, hoisting/TDZ, scope, closures, `this` |
| `<ProtoChain>` | Prototype lookup animation, `class` desugaring, `new` |
| `<EventLoop>` | Stack, Web APIs, microtask and macrotask queues, render step. **Includes a "Node mode"** with the libuv phases. |
| `<PromiseStateMachine>` | pending → fulfilled/rejected, reaction lists, chaining |
| `<RenderTree>` | React re-render propagation, memo and keys, reconciliation diff |
| `<RequestTimeline>` | Where code runs in Next.js (build, server, edge, client), RSC payloads |
| `<PacketFlow>` | TCP handshake, an HTTP/1.1 message byte by byte, TLS overview |
| `<BTree>` | Index inserts and lookups, why column order matters in composite indexes |
| `<TxnLanes>` | Two concurrent transactions side by side, showing dirty read, lost update and write skew under each isolation level |
| `<HashRing>` | Consistent hashing, adding and removing nodes |
| `<TokenBucket>` | Rate limiting, with a live request stream |
| `<Tokenizer>` + `<SamplingDial>` | LLM tokens and temperature/top-p, using pre-computed distributions with no API calls |
| `<VectorSpace>` | Embeddings projected to 2D, cosine similarity, top-k retrieval |

Every visualizer needs:
- A Playwright visual snapshot per step for 2 example traces.
- A text transcript.
- Keyboard controls.
- An "Edit this example" button that opens the code in the playground.

### 6.3 `packages/sandbox`: browser lab runner
- Runs learner code in a dedicated Worker, with a hard 2s timeout that terminates the worker. Console is captured.
- A minimal `describe/it/expect` API, compatible with Vitest syntax so labs feel like real work.
- TS labs: transpile, then run. Type-level labs: run `ts.createProgram` in the worker and treat diagnostics as test failures, using `Expect<Equal<A, B>>` helpers.
- Results UI: per-test pass/fail, diff of expected vs actual, and "show hint" (up to 3 progressive hints, never the full solution until the learner clicks "I give up", which is logged).

### 6.4 Node labs (`labs/`)
For topics that need a real runtime (raw TCP, streams, child processes, Redis, RabbitMQ):
- Each lab is a folder with `README.md`, `starter/`, `tests/` and an optional `docker-compose.yml`.
- `pnpm lab <id>` runs its tests. `pnpm lab:report` writes a JSON result, and the site can import it to mark progress.

### 6.5 SQL playground (PGlite)
- Seeded datasets: an e-commerce dataset (users, orders, items, payments) of about 200k rows, generated deterministically in the browser.
- Panels: query editor, result grid, `EXPLAIN (ANALYZE, BUFFERS)` tree rendered as a collapsible plan, and a timing comparison before and after `CREATE INDEX`.
- Two-session mode for transactions: two editors bound to two connections, with `<TxnLanes>` animating the interleaving. If PGlite can't do true concurrent sessions, simulate the interleaving deterministically and **say so in the UI**.

### 6.6 System design simulator (`packages/sim` + `/playground/system-design`)
- A drag-and-drop canvas with these components: client population, DNS/CDN, load balancer (round-robin / least-conn / consistent-hash), app server (capacity, latency distribution), cache (size, TTL, hit-ratio model), DB primary plus read replicas (replication lag), queue plus workers, rate limiter.
- A discrete-event simulation in a worker. Live charts show throughput, p50/p95/p99 latency, error rate, queue depth and cache hit rate.
- Failure injection: kill a node, slow a DB, cache stampede at TTL expiry, traffic spike ×10.
- **Scenario mode:** each system-design lesson loads a starting architecture plus an SLO ("p99 < 300ms at 5k RPS"). The learner modifies the design until the SLO passes. This is the "explorable" version of system design. No static boxes-and-arrows JPEGs.
- Every model parameter has a tooltip stating the assumption, e.g. "Postgres point read on an indexed column, warm cache: ~0.1–1ms — assumption, varies by hardware".

### 6.7 Spaced repetition (`packages/srs`)
- Card types:
  - **Recall:** Q/A.
  - **Predict-output:** a code snippet and a free-text output, auto-checked.
  - **Explain:** self-graded against a rubric.
  - **Implement:** a small lab, for example "write `debounce` from memory", auto-tested.
- Scheduling uses FSRS. Review sessions *interleave* topics. Interleaving and spacing reduce short-term ease but improve retention and transfer, which is what an interview tests.
- Daily cap: 30 reviews by default (configurable). Overdue cards are spread across days, not dumped all at once.

---

## 7. Curriculum: the 30-day spine (~110 hours)

Assumes 3.5 h/day. The **Today** page builds each session as:
- 20 min spaced review
- ~100 min new lesson
- 60 min lab
- 30 min DSA maintenance (external: LeetCode patterns list)
- 10 min "explain it back" journal

Content gets written **one module ahead of the learner**. Never block studying on building.

Each lesson below lists *the interactive centrepiece* and *the lab*.

### Week 1: JavaScript from first principles (~26 h)
| # | Lesson | Centrepiece | Lab |
|---|---|---|---|
| 0.1 | How a program runs: memory, stack vs heap, interpreters & JITs, processes/threads | `<MemoryDiagram>` intro | none |
| 1.1 | Values & types; references vs copies; `===`, `==`, `Object.is`; coercion rules | `<MemoryDiagram>` | `deepEqual`, `deepClone` (cycles, Dates, Maps) vs `structuredClone` |
| 1.2 | Execution context: creation vs execution phase, hoisting, TDZ | `<CallStack>`+`<EnvChain>` | Predict-output gauntlet (15 items) |
| 1.3 | Scope & closures (environment records, the loop bug) | `<EnvChain>` | `once`, `memoize`, `debounce`, `throttle` |
| 1.4 | `this` and the four binding rules; arrows; `call/apply/bind` | `<CallStack>` with a `this` slot | Polyfill `bind` (incl. `new` on bound fns) |
| 1.5 | Prototypes, `class` desugaring, `new`, `instanceof` | `<ProtoChain>` | Implement `myNew`, `myInstanceOf`, `Object.create` |
| 1.6 | Iterators & generators, `Symbol.iterator` | `<CallStack>` with suspended frames | Lazy `range`, `take`, `map` pipeline |
| 1.7 | The event loop (browser), microtasks vs tasks vs rendering | `<EventLoop>` | 20-item predict-output gauntlet |
| 1.8 | Promises from scratch; `async/await` = generators + promises | `<PromiseStateMachine>` | **`MyPromise`** passing a ported Promises/A+ subset; `all/allSettled/race/any`; `promisePool(limit)` |
| 1.9 | Memory & GC: reachability, leaks, `WeakMap`/`WeakRef` | `<MemoryDiagram>` with a GC sweep | Find 4 leaks in a sample app (DevTools heap snapshot guide) |
| 1.10 | Modules: CJS vs ESM, live bindings, what bundlers do | Module-graph diagram | Write a 60-line bundler that resolves and concatenates an ESM graph |
| 1.11 | The browser: DOM, event propagation & delegation, the rendering pipeline (style → layout → paint → composite) | Pipeline animation | Machine coding ×3: autocomplete with debounce + race handling, infinite scroll with IntersectionObserver, accessible modal |

### Week 2: TypeScript, React internals, Node internals (~28 h)
| # | Lesson | Centrepiece | Lab |
|---|---|---|---|
| 2.1 | Types as sets; structural typing; `any`/`unknown`/`never` | Venn-diagram explorer | Type-level challenges (easy) |
| 2.2 | Narrowing, discriminated unions, exhaustiveness | Control-flow narrowing stepper | Model a payment state machine (pending/captured/failed/refunded) |
| 2.3 | Generics, constraints, inference | Inference stepper | Typed `groupBy`, `pipe`, typed event emitter |
| 2.4 | Mapped, conditional, template-literal types, `infer` | Type-evaluation stepper | Rebuild `Partial`, `Pick`, `ReturnType`, `DeepReadonly`, a typed route-params parser |
| 2.5 | Types vanish at runtime → validation | none | **Build a mini-Zod**: `z.object/string/number/array`, `parse`, and `z.infer` |
| 3.1 | Build your own React: elements, render, reconciliation, a simplified fiber, hooks as an array | `<RenderTree>` | **mini-React** with `useState`/`useEffect` passing tests |
| 3.2 | When and why React re-renders; `memo`, keys, stale closures in hooks | `<RenderTree>` | Fix 5 broken components |
| 3.3 | Effects, data fetching, races, Suspense; current React features (verify what's stable now) | Timeline | `useFetch` with abort + race safety |
| 3.4 | Next.js: SSR/SSG/ISR, Server Components, server actions, caching layers | `<RequestTimeline>` | Convert a client-heavy page to RSC and measure |
| 3.5 | Frontend performance & a11y: Core Web Vitals, profiling | Waterfall viz | Fix a slow page (LCP/INP targets) |
| 4.1 | Node internals: V8 + libuv, event-loop phases, thread pool, blocking the loop | `<EventLoop mode="node">` | Detect and fix an event-loop block |
| 4.2 | Streams & backpressure | Pipe/buffer animation | Transform stream: CSV → JSONL over a 1 GB file with constant memory |

### Week 3: Backend, networking, data (~28 h)
| # | Lesson | Centrepiece | Lab |
|---|---|---|---|
| 5.1 | TCP/IP, DNS, TLS overview; HTTP/1.1 as bytes; keep-alive; HTTP/2/3 at a high level | `<PacketFlow>` | **HTTP server on raw `net`**: parse requests, route, respond |
| 5.2 | Build Express-lite: routing tree + middleware chain + error middleware | Middleware onion animation | Pass Express-compatible tests |
| 5.3 | API design: REST semantics, status codes, cursor vs offset pagination, **idempotency keys**, webhooks + signature verification | Retry/duplicate simulation | Idempotent payment endpoint + HMAC webhook verifier (ties to his Razorpay work) |
| 5.4 | Auth: password hashing, sessions vs JWT, refresh rotation, OAuth2/OIDC, CSRF/XSS/CORS | OAuth sequence stepper | Session auth + refresh rotation with reuse detection |
| 5.5 | Applied crypto: symmetric/asymmetric, hashing vs encryption, **envelope encryption**, key rotation | Key-wrapping diagram | Envelope-encrypt secrets (ties to DevSecret) |
| 6.1 | SQL that matters: joins, aggregation, window functions, CTEs | PGlite playground | 25 graded queries |
| 6.2 | Indexes: B-trees, composite order, covering indexes, reading `EXPLAIN` | `<BTree>` + PGlite plans | Speed up 5 slow queries with evidence |
| 6.3 | Transactions, isolation levels, MVCC, locks, anomalies | `<TxnLanes>` | Reproduce and fix a lost-update bug (`SELECT … FOR UPDATE` vs optimistic versioning) |
| 6.4 | Schema design, normalization, N+1 (Prisma), when Mongo fits | Query-count meter | Fix N+1 in a Prisma app |
| 6.5 | Redis: data structures, cache-aside/write-through, TTL, stampedes | Cache sim | **Token-bucket + sliding-window rate limiters** (Lua for atomicity) |
| 6.6 | Queues: RabbitMQ semantics, acks, at-least-once, idempotent consumers, DLQ, the outbox pattern | Message-flow sim with crash injection | Outbox + idempotent consumer (Node lab, docker-compose) |
| 7.1 | Docker from first principles (namespaces, cgroups, layers), CI/CD, AWS core (IAM, EC2, S3, RDS, Lambda), observability (logs/metrics/traces) | Layer-cache viz | Multi-stage Dockerfile + GitHub Actions pipeline for Groundwork itself |

### Week 4: System design + AI engineering + interview readiness (~28 h)
| # | Lesson | Centrepiece | Lab |
|---|---|---|---|
| 8.1 | The design interview method: requirements → estimates → API → data → high-level → deep dives → trade-offs | Interactive estimation worksheet | Back-of-envelope drills |
| 8.2 | Building blocks: LB, caching, CDN, replication, sharding, consistent hashing, CAP/PACELC | Simulator + `<HashRing>` | Hit the SLO in 3 scenarios |
| 8.3 | Case: URL shortener + rate limiter | Simulator scenario | Written design (template) |
| 8.4 | Case: **real-time multiplayer chess at scale** (his LiveChess): WebSocket fan-out, sticky sessions vs pub/sub, reconnection, state authority | Simulator scenario | Written design |
| 8.5 | Case: **secrets manager** (his DevSecret) and **payment system** (idempotency, ledgers, reconciliation) | Simulator scenario | Written design |
| 8.6 | Frontend system design: news feed / autocomplete client (caching, pagination, optimistic UI) | none | Written design |
| 9.1 | LLMs, just enough: tokens, context windows, sampling, embeddings, why models hallucinate | `<Tokenizer>`, `<SamplingDial>`, `<VectorSpace>` | none |
| 9.2 | LLM APIs in TypeScript: streaming (SSE) to a React UI, structured outputs, the tool-calling loop | Agent-loop stepper | Streaming chat with 2 tools |
| 9.3 | RAG: chunking, embeddings, pgvector, hybrid search, reranking, citations | `<VectorSpace>` on Groundwork's own lessons | **RAG over Groundwork content** (PGlite + pgvector) |
| 9.4 | Agents & MCP: when an agent is the wrong answer; build an MCP server | none | **MCP server exposing Groundwork progress + review cards** |
| 9.5 | Evals: golden sets, code-graded vs model-graded, regression tracking; cost & latency | Eval dashboard | Eval suite for the Feynman grader (§8) |
| 9.6 | LLM security: prompt injection, data exfiltration, the OWASP Top 10 for LLM apps | Injection playground | Red-team your own RAG app; add defences |
| 10.1 | **Working with AI coding agents:** reading unfamiliar code fast, reviewing AI-written PRs, verifying rather than trusting | "Spot the bug in this AI PR" drills | 6 code-comprehension drills (multi-file repos with subtle bugs) |
| 10.2 | Mock loops: JS deep-dive, machine coding, AI-assisted round, system design, behavioural | Timer + rubric UI | 2 full mocks |

**DSA maintenance (daily, outside the site):** 30 min/day, pattern-interleaved (two pointers, sliding window, BFS/DFS, heaps, intervals, DP basics, graphs). The site only tracks this as a checkbox plus pattern tags, so we don't rebuild LeetCode.

### Resume defence track (`/resume`)
For each bullet on the learner's resume, generate a page with:
- The likely interview questions (8–15).
- What a strong answer must contain (rubric).
- Which Groundwork lessons back it up.
- Gaps to fill before the interview.

Seed the track with these bullets:
- **DevSecret:** encryption at rest, key management, RBAC model, audit-log integrity, why Redis and RabbitMQ (and failure modes), Zod at boundaries.
- **LiveChess:** WebSocket lifecycle, state sync and authority, reconnection, scaling beyond one server, spectator fan-out, cheating prevention.
- **Razorpay integration:** order/payment flow, webhook verification, idempotency, reconciliation, refunds.
- **AEM/OSGi work:** OSGi services and configs, the DAM governance design, the mail-reminder scheduler (cron vs. workflow), Java fundamentals interviewers will probe (JVM memory, GC, collections, concurrency basics).
- **"500+ LeetCode, 365-day streak":** be ready for patterns, not memorised answers.
- **Groundwork itself:** architecture, trace verification, FSRS, PGlite, sim engine, evals.

Also include a STAR story bank with 6 stories, each mapped to common behavioural prompts.

---

## 8. AI features: built as learning labs, held to an evaluation standard

AI in Groundwork exists only where it does a measurable job, and building it *is* the Week-4 AI curriculum.

1. **Feynman grader.** The learner writes an explanation and it's graded against a per-lesson rubric. The output is structured JSON: `{covered[], missing[], misconceptions[], score}`. It uses a bring-your-own API key stored only in localStorage, has an explicit opt-in, and is off by default. It ships with an eval set of 30+ hand-labelled explanations per seeded lesson, plus a CI command to re-run the evals.
2. **Ask-the-lesson (RAG).** Questions are answered **only** from Groundwork content, with citations to lesson sections. When the content doesn't cover something, it says "not covered" instead of guessing.
3. **MCP server.** Exposes progress, due cards and lesson search, so the learner's own Claude/agent can quiz him.

Not allowed: AI-generated lesson text served at runtime, or AI hints in labs before 2 human-written hints are exhausted.

---

## 9. Content quality rules (the anti-slop contract)

Claude Code will draft most lessons, so these rules are enforced by `packages/content-check` in CI wherever they can be automated:

1. **Every runnable code block executes in CI** and its output matches the `// →` annotations or the `<Predict>` answer. Every scripted trace is verified against real execution (§6.1).
2. **Primary sources only** in `sources`: ECMAScript spec, MDN, TypeScript Handbook, React/Next/Node docs, the WHATWG HTML spec (event loop), the PostgreSQL docs, RFCs (HTTP, OAuth), the OWASP pages, the provider docs for LLM APIs. Prefer linking over paraphrasing at length.
3. **Banned phrases**, enforced by a lint: "delve", "in today's fast-paced", "unlock", "supercharge", "game-changer", "it's important to note", "dive deep", "seamless", "robust" (unless it's about a technical property), "leverage", "in conclusion", and emoji in prose.
4. **No opening fluff.** The first element of every lesson body must be a `<Predict>` or a concrete code or diagram.
5. **Precision over vibes.** Don't write "closures remember variables". Write "the function object holds a reference to the environment record in which it was created". Every lesson has a Misconceptions section.
6. **Numbers carry provenance.** Any latency, throughput or size figure has a source or an "assumption" label.
7. **Dated claims.** Anything version- or market-dependent (React features, interview formats, pricing) carries a `verifiedAt: YYYY-MM` field and is flagged by CI after 6 months.
8. **Human review gate.** A lesson's frontmatter has `status: draft | reviewed`. Only `reviewed` lessons appear in the main path. The learner flips the status after studying it, and any errors he found get fixed first.

---

## 10. Core pages and UX

- **`/` Path map.** One vertical spine of tracks and lessons, with state per lesson (locked / available / in progress / done / due for review), estimated time remaining, and a "Continue" button. There's no marketing hero. The README is the marketing.
- **`/today`.** The 3.5-hour plan: review count, next lesson, the lab, the DSA checkbox and the journal prompt. A session timer with Pomodoro-style 50/10 blocks is optional.
- **`/review`.** The FSRS queue. Predict-output and implement cards run in the sandbox.
- **`/interview`.** A random question from the pool filtered by tag, with a timer, a free-text or "talk out loud" checkbox, then the rubric is revealed for self-grading. Results feed into SRS.
- **`/resume`.** The defence track (§7).
- **`/playground`.** JS/TS sandbox with trace view (Phase 2), SQL, and the system-design sim.
- **Command palette (`⌘K`).** Jump to any lesson, card or playground.
- **Progress export/import.** JSON, so it survives browser wipes.

---

## 11. Quality gates (Definition of Done for any PR)

- `pnpm typecheck && pnpm lint && pnpm test && pnpm content:check && pnpm e2e` all pass.
- Lighthouse: Performance ≥ 90 and Accessibility = 100 on a lesson page. The JS for a lesson without heavy visualizers stays under 200 KB gzipped. Lazy-load PGlite, the TS compiler and the sim.
- Any new visualizer comes with Playwright step snapshots and a transcript.
- Any new lesson passes the §9 checks and includes cards plus interview questions.

---

## 12. Build plan

The learner must be **studying from day 2**. Building happens in short bursts *ahead of* the study path and must never replace it.

### Phase 0: Skeleton (day 1, one Claude Code session)
- Monorepo, Next app, design tokens, fonts, light and dark modes.
- MDX pipeline with Zod frontmatter. The lesson layout with sidenotes.
- Components: `<Predict>`, `<Reveal>`, `<Callout>`, `<Code runnable>` (worker sandbox), `<Card>`.
- Dexie progress store, the path map and lesson state.
- `content-check` v1: runs code blocks and checks the banned-phrase lint.
- Content: lessons **0.1, 1.1, 1.2** fully written, using `<MemoryDiagram>` and `<CallStack>` with scripted traces.
- **Acceptance:** the learner can open lesson 1.1, make predictions, run code, and see cards registered. CI is green. It's deployed to Vercel.

### Phase 1: Learning loop (days 2–3)
- `packages/srs` with ts-fsrs, plus `/review` and `/today`.
- Lab runner (`<Lab>`) with tests and hints.
- `<EnvChain>`, `<ProtoChain>`, `<EventLoop>`, `<PromiseStateMachine>` with trace verification in CI.
- Content: the rest of Week 1.
- **Acceptance:** a full Week-1 day can be done entirely inside Groundwork.

### Phase 2: Rolling content (days 4–20)
Each session:
1. Write the next module's lessons and their visualizers and labs (TS → React → Node → backend → data).
2. Build `labs/` Node labs as needed.
3. Build the PGlite playground before lesson 6.1.

### Phase 3: Systems & AI (days 18–26)
- The `packages/sim` simulator plus scenarios, `<HashRing>`, `<TokenBucket>`.
- AI features (§8) built *together with* the learner as the Week-4 labs. Claude Code scaffolds; the learner implements the core loops himself.

### Phase 4: Open-source launch (after day 30)
- README with GIFs of each visualizer, CONTRIBUTING (how to write a lesson, run content-check), "good first issue" labels on lesson ideas.
- Phase-2 live trace engine spike (§6.1).
- Publish `@groundwork/trace` and `@groundwork/sim` as standalone npm packages.
- A launch write-up: "How I built a verified, explorable JS curriculum".

---

## 13. CLAUDE.md (create this file at the repo root, verbatim)

```markdown
# Groundwork: working agreement

- Read GROUNDWORK_BUILD_SPEC.md before any task. It is the source of truth.
- The learner is studying from this site daily. Shipping usable lessons beats building infrastructure.
- Before writing a lesson: read its sources (fetch the MDN/spec/docs page), then write. Never invent APIs or behaviour.
- Every code example must run in CI. Every trace must pass verification. Never mark content `reviewed`; only the learner does that.
- Follow the design system in §4 exactly. No new colours, fonts, gradients, shadows, or emoji.
- Prefer small PRs/commits per lesson or component. Run all quality gates (§11) before calling something done.
- Record non-obvious choices in DECISIONS.md (one line each: date, decision, reason).
- When unsure about scope, choose the smaller version and leave a TODO with an issue-style note.
```

---

## 14. How this reads on a resume

> **Groundwork**: open-source, interactive CS-fundamentals platform (Next.js, TypeScript, Turborepo).
> - Designed a typed execution-trace format powering 14 visualizers (call stack, closures, event loop, B-tree, transaction isolation); CI verifies every trace against real execution.
> - Built a discrete-event system-design simulator (load balancers, caches, replicas, queues, failure injection) with SLO-driven scenarios.
> - In-browser Postgres (PGlite) labs for indexing/MVCC; FSRS spaced repetition; Web-Worker sandbox with test runner.
> - Shipped RAG (pgvector), an MCP server, and an LLM grader with a 30-case eval suite and prompt-injection defences.

Replace the numbers with the real ones at launch. Every bullet is a talking point that maps to an interview round: JS deep-dive, system design, AI-assisted coding, behavioural ownership.

---

## 15. Decisions taken on the learner's behalf (revisit if wrong)
- Target role: **full-stack TypeScript (Node + React/Next) with AI-engineering literacy** at an Indian product company or startup, *not* a pure ML role and *not* Java/AEM.
- Python is not in the 30-day plan. AI engineering is taught in TypeScript, which is the "product half" of AI engineering and matches the learner's stack.
- Java gets only a "defend your current job" refresher inside the resume track.
- Project name "Groundwork" is a placeholder.
