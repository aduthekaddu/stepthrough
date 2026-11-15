# Groundwork stack: fact check

Checked on 2026-11-15 with npm 11.20.0 and Node 26.13.1.
Spec sections read: §2 (tech stack), §6.3 (browser sandbox), §6.5 (SQL playground), §11 (quality gates).

Labels used below:
- **verified by command** = I ran `npm view`, inspected the published tarball, or ran the package in a throwaway folder under `/tmp`.
- **from docs: URL** = I read that page and the sentence says what I report.
- **unverified** = I could not confirm it, with the reason.

Today is 2026-11-15, so "months" below are counted from that date.

---

## 1. Versions

`latest` is the npm `latest` dist-tag. "major since" is the first publish date of the current major line, not the date of the newest patch.

| package | latest version | latest publish date | notes |
|---|---|---|---|
| next | 16.4.6 | 2026-11-09 | major 16 since 2025-10-22. Turbopack is the default bundler for `dev` and `build`. |
| react | 19.3.1 | 2026-10-14 | major 19 since 2024-12-05. |
| react-dom | 19.3.1 | 2026-10-14 | same line as react. |
| typescript | 7.0.2 | 2026-07-08 | major 7 since 2026-07-08. Native Go compiler. `require('typescript')` exposes only version fields. See §2a. |
| @typescript/native-preview | 7.0.0-dev.20260707.2 | 2026-07-07 | nightly tag of the 7.0 codebase. Superseded: nightlies now ship as `typescript@next`. |
| turbo | 2.11.11 | 2026-11-11 | major 2 since 2024-06-04. |
| pnpm | 12.21.0 | 2026-11-13 | major 12 since 2026-08-26 (breaking major, 2.6 months old). |
| velite | 0.4.0 | 2026-06-17 | still 0.x. `1.0.0-alpha.3` published 2026-06-19. No release for 5 months. Bundles Zod 3. |
| @content-collections/core | 0.15.3 | 2026-09-21 | 0.x. Repo last pushed 2026-11-06. |
| @content-collections/mdx | 0.2.2 | 2025-03-10 | 20 months without a release. Depends on `mdx-bundler` (last publish 2025-03-05). |
| fumadocs-mdx | 15.6.2 | 2026-11-14 | major 15 since 2026-05-07. Peers: `next ^15.3 \|\| ^16`, `fumadocs-core ^16.18.3`. ESM only. |
| @next/mdx | 16.4.6 | 2026-11-09 | version-locked to `next`. |
| @mdx-js/mdx | 3.1.1 | 2025-08-29 | 14.5 months quiet. Low-churn, stable 3.x. |
| zod | 4.6.7 | 2026-10-12 | major 4 since 2025-07-09. |
| tailwindcss | 4.3.5 | 2026-11-06 | major 4 since 2025-01-21. CSS-first config. |
| @tailwindcss/postcss | 4.3.5 | 2026-11-06 | same version as tailwindcss. |
| motion | 14.14.0 | 2026-11-13 | major 14 since 2026-10-02 (breaking major, 1.4 months old). |
| @codemirror/view | 6.43.15 | 2026-10-19 | 6.x, stable. |
| @codemirror/state | 6.7.6 | 2026-09-22 | 6.x, stable. |
| codemirror | 6.0.2 | 2025-06-19 | meta package that only re-exports the `@codemirror/*` packages. 17 months old but not the code you use. |
| shiki | 4.6.0 | 2026-11-02 | major 4 since 2026-02-27. |
| @electric-sql/pglite | 0.5.16 | 2026-11-09 | Postgres 18.6 in WASM. Still 0.x. 26,334,107 bytes unpacked. |
| @electric-sql/pglite-react | 0.4.16 | 2026-11-09 | 0.x, versioned separately from the core package. |
| @xyflow/react | 12.12.1 | 2026-11-02 | `13.0.0-next.3` published 2026-11-08, so a major is imminent. |
| zustand | 5.1.0 | 2026-11-06 | major 5 since 2024-10-14. |
| dexie | 4.4.7 | 2026-10-19 | major 4 since 2024-03-26. |
| dexie-react-hooks | 4.4.0 | 2026-03-18 | 8 months quiet. |
| ts-fsrs | 6.0.0 | 2026-10-28 | brand-new breaking major (18 days old). Declares `engines.node >= 24`. See §2f. |
| vitest | 5.1.0 | 2026-11-02 | major 5 since 2026-09-03 (breaking major, 2.4 months old). |
| @playwright/test | 1.65.1 | 2026-11-13 | 1.x, weekly releases. |
| @biomejs/biome | 2.6.7 | 2026-11-11 | major 2 since 2025-06-17. |
| eslint | 10.15.0 | 2026-11-13 | major 10 since 2026-02-06. Next.js 16 removed `next lint`. |
| prettier | 3.10.1 | 2026-11-12 | 3.x stable. |
| engine262 | — | — | **does not exist on npm** (`E404`). |
| @engine262/engine262 | 0.0.1-46acc94625794d30f81b7a83dd608887530163a6 | 2026-11-13 | version is a commit hash; every publish is a new `0.0.1-<sha>`. See §2g. |
| sucrase | 3.35.1 | 2025-11-19 | about 12 months quiet. |
| esbuild-wasm | 0.28.2 | 2026-08-08 | 0.x, tracks esbuild 0.28. |
| @babel/standalone | 8.1.2 | 2026-11-11 | major 8 since 2026-06-16 (breaking major, 5 months old). |
| acorn | 8.19.0 | 2026-10-05 | 8.x stable. |
| quickjs-emscripten | 0.32.0 | 2026-02-16 | 9 months quiet, 0.x. |
| ai | 7.0.173 | 2026-11-13 | major 7 since 2026-06-25. Very frequent patches. |
| @anthropic-ai/sdk | 1.8.0 | 2026-11-10 | major 1 since 2026-10-21 (breaking major, under 1 month old). |
| @modelcontextprotocol/sdk | 1.32.2 | 2026-10-23 | 1.x. |
| @fontsource-variable/source-serif-4 | 5.3.1 | 2026-10-11 | static font files, no runtime code. |
| @fontsource/ibm-plex-sans | 5.3.0 | 2026-07-19 | static font files. |
| @fontsource/ibm-plex-mono | 5.3.0 | 2026-07-19 | static font files. |

Every row above is **verified by command** (`npm view <pkg> version`, `npm view <pkg> time --json`, `npm view <pkg> dist-tags --json`). No `latest` version of any listed package carries an npm `deprecated` flag (verified by command).

---

## 2. Feasibility questions

### a. TypeScript 7, and a compiler API inside a browser Worker

**Is TypeScript 7 stable?** Yes. 7.0 was announced on 2026-07-08 as a stable release, a native Go port that is 8–12× faster on large builds. — from docs: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/

**Does `typescript@latest` still expose `ts.transpileModule` and `ts.createProgram` in JavaScript?** **No.** The 7.0 release post says: "While TypeScript 7.0 is here, it does not ship with an API. We expect TypeScript 7.1 to ship with a new (and different) API." — from docs: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/

I confirmed it on the published package (verified by command):

- `require('typescript')` at 7.0.2 returns exactly `['version', 'versionMajorMinor']`. Its `exports["."]` points at `lib/version.cjs`.
- The package is a thin JS shim (`365 KB` tarball, `2,497,498` bytes unpacked, 416 files) that pulls a per-platform Go binary from optional dependencies such as `@typescript/typescript-linux-x64`.
- The only API entry points are `typescript/unstable/{sync,async,ast,fs,proto}`. They spawn/attach to that native binary and `lib/getExePath.js` imports `node:fs`, `node:module`, `node:path`, `node:url`, so they cannot run in a browser Worker.

**Unpacked size of `typescript` latest:** `2,497,498` bytes (about 2.4 MiB). — verified by command: `npm view typescript dist.unpackedSize`

**What still works in a browser:** the last JS compiler is 6.x. I pulled `typescript@6.0.3` and ran it: `ts.transpileModule` and `ts.createProgram` are both functions, `ts.version` is `6.0.3`. `lib/typescript.js` is 9.1 MB raw / **1.6 MB gzipped**; its `lib/` folder is 24 MB because it carries 110 `lib.*.d.ts` files that `createProgram` needs for type checking. — verified by command (tarball inspection)

The official side-by-side package is `@typescript/typescript6@6.0.2` (published 2026-07-06). It is only a shim: its `dependencies` are `{"@typescript/old": "npm:typescript@^6"}` and its `lib/typescript.js` is `module.exports = require("@typescript/old")`. — verified by command

Consequence for §6.3: the spec's plan ("transpile with `typescript`'s `transpileModule`", "run `ts.createProgram` in the worker") **cannot use `typescript@7`**. It needs a pinned `typescript@6.0.3` (or the alias above) as a separate dependency. 1.6 MB gzip is well above §11's 200 KB lesson budget, which is why §11 says to lazy-load the compiler.

There is also a WASM option, `@tsrs/wasm@0.25.0-ts7.1.0-beta` (a Rust port of the TS 7 compiler as WASM, 10,072,199 bytes unpacked, "tsc for Node and browsers"). — verified by command: `npm view @tsrs/wasm`. I did not evaluate its correctness: **unverified**.

### b. PGlite: connections, multi-tab, pgvector, size, EXPLAIN

**Concurrent sessions in one instance: no.** PGlite has one exclusive connection. The docs say: "As PGlite only has a single exclusive connection to the database, we provide a multi-tab worker to enable sharing a PGlite instance between multiple browser tabs." — from docs: https://pglite.dev/docs/

I also measured it (verified by command): I opened `db.transaction()` and inserted a row, then slept 600 ms inside the transaction, and issued a separate `SELECT` from the same instance. The `SELECT` returned after **603 ms**, i.e. only after the transaction committed. Queries are serialized on one connection.

The public API reflects this: `.transaction(callback)` takes an exclusive callback, and there is no pool or `connect()` method. Next "concurrent" transaction on the same instance just queues. — from docs: https://pglite.dev/docs/api

So §6.5's "two-session mode" cannot be true concurrency. The spec already allows the fallback: simulate the interleaving deterministically and say so in the UI. Two separate `PGlite` instances (or two workers) are technically possible but are two separate databases, not two sessions on one database.

**What PGliteWorker / multi-tab does:** each tab starts a worker, the workers run a **leader election**, and only the leader starts PGlite and handles all queries. When the leader tab closes, a new election runs and a new instance starts. `PGliteWorker` offers `isLeader`, `onLeaderChange`, and otherwise the same interface as `PGlite`. It is a share-one-instance proxy, not a connection pool. — from docs: https://pglite.dev/docs/multi-tab-worker

**pgvector:** available, as a separate package `@electric-sql/pglite-pgvector` (not bundled in core). Load it through the constructor and then create the extension:

```js
import { PGlite } from '@electric-sql/pglite'
import { vector } from '@electric-sql/pglite-pgvector'
const pg = new PGlite({ extensions: { vector } })
await pg.exec('CREATE EXTENSION IF NOT EXISTS vector;')
```

— from docs: https://pglite.dev/extensions/ (extension bundle size listed there: 42.9 KB)

I ran that exact flow (verified by command): `vector` 0.8.7 installed, `vector(3)` column, `<->` distance ordering returned the right rows, and `CREATE INDEX ... USING hnsw (embedding vector_l2_ops)` succeeded. Postgres reports `PostgreSQL 18.6 (PGlite 0.5.16) on wasm32-unknown-emscripten`.

**Download size:** measured from the published tarball (verified by command):

| file | raw | gzipped |
|---|---|---|
| `pglite.wasm` | 8.7 MB | 3.2 MB |
| `pglite.data` | 6.0 MB | 1.8 MB |
| `initdb.wasm` | 0.3 MB | — |
| whole `dist/` | 27 MB | — |

So expect roughly **5 MB compressed** for the core engine plus data, plus 43 KB for pgvector. The package README claims "only 3mb gzipped", which is the compressed engine size without the data file. Either way, it must be lazy-loaded per §11.

**Does `EXPLAIN (ANALYZE, BUFFERS)` work?** **Yes.** — verified by command, output on PGlite 0.5.16:

```
Seq Scan on users  (cost=0.00..799.54 rows=196 width=36) (actual time=0.060..5.669 rows=1.00 loops=1)
  Rows Removed by Filter: 49999
  Buffers: shared hit=309
Planning Time: 0.383 ms
Execution Time: 5.793 ms
```

and after `CREATE INDEX` the same query returned a `Bitmap Heap Scan` with `Index Searches: 1`, `Buffers: shared hit=1 read=2`, `Execution Time: 0.061 ms`. That is exactly the before/after-index comparison §6.5 wants.

Practical note for the 200k-row seed (verified by command with 50k rows): the insert, both `EXPLAIN` calls and `CREATE INDEX` all completed in one local run, so the dataset size is feasible. I did not time it on a 200k-row set, and seeding on the main thread will jank the page; do it in the worker.

### c. Velite vs content-collections vs fumadocs-mdx

**Velite: last release and maintenance.**
Last stable release: `0.4.0`, **2026-06-17** (5 months ago). A `1.0.0-alpha.3` came out 2026-06-19 and has not moved since. Last commit on `main`: **2026-08-03** (a copyright-year change), before that 2026-07-13. 827 stars, 34 open issues, no archive flag. — verified by command: `npm view velite time`, GitHub API for `zce/velite`
Reading: alive but slow, one maintainer, and the 1.0 line has been in alpha since 2025-12-15 (11 months).

**Does Velite work with Next.js 16?** Not confirmed. Velite's own Next.js guide says the `VeliteWebpackPlugin` "does not function correctly when Turbopack is enabled" and recommends calling `build()` from `next.config`. But open issue **#408** (2026-09-09, no replies, still open) reports that on `next@16.3.4` with the Turbopack production build, Turbopack starts bundling `.velite/index.js` after `clean: true` deletes the JSON and before the async Velite build recreates it, failing with `Module not found: Can't resolve './mainContents.json'`. The reporter's workaround is to run Velite synchronously first: `"build": "velite --clean && next build"`. — from docs: https://velite.js.org/guide/with-nextjs and https://github.com/zce/velite/issues/408

So: Velite is framework-agnostic and works as a prebuild step; explicit Next 16 support is **unverified**, and the documented `next.config` integration has a known race under Turbopack.

**Comparison for MDX + Zod frontmatter + App Router static export:**

| | Velite 0.4.0 | content-collections 0.15.3 | fumadocs-mdx 15.6.2 |
|---|---|---|---|
| Zod frontmatter | yes, but through **its own bundled Zod 3** (`s` and `z` exports) | yes, you install `zod` yourself | yes, `schema` option; depends on `zod ^4.6.7` |
| Next 16 | no confirmed support; open issue #408 | yes — changelog 0.2.9: "Add support for Next.js 16" | yes — peer `next ^15.3 \|\| ^16` |
| Turbopack | documented `next.config` hook races the build; prebuild CLI is the workaround | safe: the plugin `await`s its builder inside the next config function and never touches the bundler | plugin-shaped (`createMDX()`), no webpack dependency |
| Static export | yes, output is build-time JSON | yes, output is build-time data | yes, documented, with caveats (no search server, no Ask AI, no MCP, no `proxy.ts`) |
| Last release | 2026-06-17 | core 2026-09-21, mdx 2025-03-10 | 2026-11-14 |
| Extras | none | none | pulls `fumadocs-core`, brings a docs UI/loader you may not want |

Sources: https://github.com/zce/velite (bundle contents checked locally), https://content-collections.dev/docs/adapter/next and https://content-collections.dev/docs/content/mdx (read from raw files in `sdorra/content-collections`, `docs/adapter/next.mdx` and `docs/content/mdx.mdx`), https://fumadocs.dev/docs/mdx, https://fumadocs.dev/docs/mdx/next, https://fumadocs.dev/docs/next/deploying/static

Extra facts I checked:
- Velite 0.4.0 has **no** `zod` dependency or peer dependency; it bundles Zod into `dist/`, and the bundled code contains `ZodFirstPartyTypeKind` and `ZodIssueCode`, i.e. the Zod 3 API. It re-exports it as `z` and `s`. So a Velite site has Zod 3 inside content schemas and Zod 4.6.7 in the app. — verified by command
- `@content-collections/mdx` 0.2.2 depends on `mdx-bundler ^10.0.3` (last publish 2025-03-05) and `esbuild ^0.25`, while the current esbuild line is 0.28. — verified by command
- `@content-collections/next` 0.2.11 has peer `next: "^12 \|\| ^13 \|\| ^14 \|\| ^15 \|\| ^16"` and runs the builder from `next.config`, so it is bundler-agnostic. — verified by command (package source)
- fumadocs-mdx is ESM-only and its Next.js guide requires `fumadocs-core`. Using it without the rest of Fumadocs is **unverified** (no docs path for that).

Judgement (opinion, not a fact): for a custom learning site with its own layouts, content-collections fits the "Zod frontmatter in, MDX out" job with the least extra framework, provided the stale `@content-collections/mdx` is acceptable; fumadocs-mdx is the safest maintenance-wise but couples you to Fumadocs' source/loader model; Velite is the simplest to reason about but has the Next 16 build race and a Zod 3 island.

### d. Next.js 16: static export and Turbopack

**Does `output: 'export'` still work with the App Router?** Yes. Set `output: 'export'` in `next.config`, run `next build`, and Next writes `out/` with one HTML file per route. Server Components run at build time; Client Components are prerendered to HTML then hydrate. — from docs: https://nextjs.org/docs/app/guides/static-exports

**What it disables** (same page, verbatim list): dynamic routes with `dynamicParams: true`; dynamic routes without `generateStaticParams()`; Route Handlers that rely on `Request`; `cookies`; rewrites; redirects; headers; `proxy.ts`; Incremental Static Regeneration; Image Optimization with the default loader (a custom loader works); Draft Mode; Server Actions; Intercepting Routes. Using any of them in `next dev` errors out like `dynamic = 'error'`.

**Is Turbopack the default for build?** Yes. The CLI reference lists `--turbopack` as "Force enable Turbopack (enabled by default)" for `next build`, and `--webpack` as the opt-out. Next 16's release post says the same: "Turbopack is now the default bundler for all apps; opt out with `next build --webpack`". — from docs: https://nextjs.org/docs/app/api-reference/cli/next (last updated 2026-10-15) and https://nextjs.org/blog/next-16

Other Next 16 facts that matter for §11: `next lint` was removed (lint with Biome or ESLint directly, and `next build` no longer lints); `middleware.ts` is deprecated in favour of `proxy.ts` (and `proxy.ts` cannot be used with static export anyway); minimum Node 20.9 and TypeScript 5.1. — from docs: https://nextjs.org/blog/next-16

### e. Tailwind v4 CSS-first config and light/dark tokens

**`@theme` is the config.** Theme variables are CSS variables defined in `@theme`, and each namespace maps to utility classes: `--color-*` → `bg-*`/`text-*`, `--font-*` → `font-*`, `--spacing-*` → `p-*`, and so on. Values are emitted as real CSS variables on `:root`, so `var(--color-x)` works in custom CSS and inline styles. — from docs: https://tailwindcss.com/docs/theme

**Token pattern for light/dark.** Two documented pieces combine: define plain CSS variables on `:root`/selector, then map them into the theme with `@theme inline` so the utilities use the variable's value rather than copying it. `inline` is the documented fix for "theme variable references another variable". — from docs: https://tailwindcss.com/docs/theme#referencing-other-variables

```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  --paper: oklch(0.98 0.005 90);
  --ink: oklch(0.22 0.01 260);
}
[data-theme="dark"] {
  --paper: oklch(0.19 0.01 260);
  --ink: oklch(0.94 0.005 90);
}

@theme inline {
  --color-paper: var(--paper);
  --color-ink: var(--ink);
}
```

Then `bg-paper text-ink` follows the attribute. The `dark` variant override to a class or `data-theme` attribute is documented, as is the three-way system/light/dark toggle with `matchMedia`. — from docs: https://tailwindcss.com/docs/dark-mode

I did not run a Tailwind build with this snippet: the pattern is assembled from two documented features, so treat the snippet itself as **unverified** (the features are documented, the combination is not tested here).

### f. ts-fsrs

**Which FSRS version?** `ts-fsrs` 6.0.0 implements **FSRS-3, 4, 4.5, 5, 6 and 7**, and `DefaultScheduler()` defaults to **FSRS-7** when `version` is omitted. The README states "the library version and the FSRS model version are independent". — from docs: https://github.com/open-spaced-repetition/ts-fsrs/blob/main/packages/fsrs/README.md

**Scheduling API (v6):**

```ts
import { DefaultScheduler, Rating } from 'ts-fsrs'

const scheduler = await DefaultScheduler()          // FSRS-7 by default
const card = scheduler.newCard({ now })

// preview all four grades before the learner answers
for (const { grade, card: next, revlog } of scheduler.preview({ card, now })) { /* ... */ }

// apply the chosen grade
const { card: updated, revlog } = scheduler.review({ card, grade: Rating.Good, now })
```

`DefaultScheduler({ version: 'FSRS-7' })` pins the model; `scheduler.model.forgettingCurve(memoryState, elapsedDays)` returns recall probability; `defineScheduler({ model, chrono })` builds a custom one. — from docs: same README

**Risks I confirmed by command:** 6.0.0 was published 2026-10-28 (18 days before this check), it is a breaking major, and its `package.json` declares `"engines": {"node": ">=24.0.0"}`. The published ESM/CJS bundles contain no `node:` imports, so it looks browser-safe, but browser support is not documented: **unverified**. The separate `@open-spaced-repetition/binding` package (parameter training) is the part that needs WASI/Node.

### g. engine262

- **`engine262` on npm: does not exist** (`E404`). — verified by command
- Published as **`@engine262/engine262`**, latest `0.0.1-46acc94625794d30f81b7a83dd608887530163a6`, published **2026-11-13**. Versions are commit hashes, so every CI publish is a new patch under `0.0.1-<sha>`. — verified by command
- **Size:** 24,976,033 bytes unpacked (25 MB), 1268 files. That figure is mostly `declaration/*.d.mts.map` and `src/`. The actual engine is `lib/engine262.mjs` at 4,359,694 bytes raw, **738 KB gzipped**; the CJS build `lib/engine262.js` is 4,549,039 bytes raw. — verified by command
- **Runs in browsers:** the ESM bundle imports no `node:` builtins, the package exports a browser-usable `import` condition, and the repo ships a `website/` playground (engine262.js.org). — verified by command (bundle inspection, repo tree)
- **Last commit:** `2026-11-13` (editorial ECMA-262 fixes; three commits that day), so the repo is active. 950 stars, not archived. — verified by command: GitHub API
- Reading: it is a spec-compliance engine, and its own goals say "non-goal: speed". Expect it to be slow for learner code, which matters if it is used as the sandbox interpreter rather than `typescript`+`new Function`/QuickJS.

---

## 3. Risks

Ordered by how much they affect the spec.

**Blocks a spec assumption**
1. **TypeScript 7 has no JS API.** §6.3 assumes `ts.transpileModule` and `ts.createProgram` from the `typescript` package. At `typescript@7.0.2` the default export is only `{ version, versionMajorMinor }`, and the new API is not due until 7.1. Fix: pin `typescript@6.0.3` (or `@typescript/typescript6`) for the worker, keep 7.x only as the CLI `tsc`. Budget 1.6 MB gzip, lazy-loaded, and it needs its 110 `lib.*.d.ts` files shipped for `createProgram`.
2. **Velite + Next 16 Turbopack race** (open issue #408, 2026-09-09). The documented `next.config` integration can fail the production build; use `velite --clean && next build` as separate steps, or pick a different content layer. Explicit Next 16 support is unverified.

**Medium**
3. **PGlite is single-connection**, so §6.5's two-session transaction view must be simulated and labelled in the UI (the spec permits this). PGlite is also 0.x (first published 2024-02-22, still 0.5.16), 26 MB unpacked, and about 5 MB compressed to download.
4. **ts-fsrs 6.0.0 is 18 days old and a breaking major**, declares Node >= 24, and changed the scheduling API (`DefaultScheduler`, `preview`, `review`). Pin it and write the wrapper against v6, not v5 examples.
5. **`@content-collections/mdx` 0.2.2 has had no release for 20 months** and sits on `mdx-bundler` (last publish 2025-03-05) and `esbuild ^0.25`. The core and Next adapter are current; only the MDX piece is stale.
6. **Two Zods if you pick Velite**: Velite bundles Zod 3 and exports it as `z`/`s`, while the app would use `zod@4.6.7`. Content schemas and app schemas would not share types out of the box.
7. **Recent breaking majors across the toolchain**: @anthropic-ai/sdk 1.x (2026-10-21), ts-fsrs 6 (2026-10-28), motion 14 (2026-10-02), vitest 5 (2026-09-03), pnpm 12 (2026-08-26), typescript 7 (2026-07-08), ai 7 (2026-06-25), @babel/standalone 8 (2026-06-16). All are inside the six-month window. fumadocs-mdx 15 (2026-05-07) is 6.3 months, just outside it. Tutorials and examples written before those dates will not match.
8. **@xyflow/react 13 is in prerelease** (`13.0.0-next.3`, 2026-11-08). Building on 12.12.1 is fine now, but expect a migration inside the project's life.

**Low**
9. **Quiet but stable packages**: `@mdx-js/mdx` 3.1.1 (14.5 months), `sucrase` 3.35.1 (11.8 months), `quickjs-emscripten` 0.32.0 (8.9 months), `dexie-react-hooks` 4.4.0 (7.9 months), `codemirror` meta 6.0.2 (17 months — the real `@codemirror/*` packages are current).
10. **Deprecated/removed in Next 16**: `next lint` is gone; `middleware.ts` is deprecated for `proxy.ts`; synchronous `params`/`cookies()`/`headers()` are removed; `revalidateTag(tag)` single-argument form is deprecated. None of these matter for a static export except `next lint` (choose Biome or ESLint directly).
11. **`@typescript/native-preview` is superseded** — nightlies moved to `typescript@next`. Do not add it to a new project.
12. No listed package is flagged `deprecated` on npm (verified by command).

---

## 4. What I could not verify

- **Explicit Velite support for Next.js 16** — no statement in the repo, docs, changelog or releases; issue #408 is open and unanswered. Reason: it does not exist yet.
- **Velite's `next.config` integration under Turbopack on 16.4.6** — I did not build a Next app (research only). The failure is reported by a third party against 16.3.4.
- **fumadocs-mdx used without Fumadocs** — its docs only describe the Fumadocs integration. Reason: no documented standalone path.
- **ts-fsrs in a browser** — the bundle has no Node builtins, but nothing documents browser support and `engines` says Node >= 24. Reason: no authoritative statement; not run in a browser.
- **pgvector inside an actual browser tab** — I ran it in Node with the same WASM package and the same API. Browser-only concerns (IndexedDB persistence, worker memory limits) were not exercised.
- **`@tsrs/wasm` correctness as a browser TS type-checker** — package exists, not evaluated.
- **Tailwind snippet in §2e** — composed from two documented features, not built.
