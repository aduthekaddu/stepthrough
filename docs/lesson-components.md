# Lesson MDX components (contract)

Lessons live in `apps/web/content/<track>/<lesson>/index.mdx`. This file is the contract between lesson authors and the components. content-check reads these props from the MDX syntax tree, so props are plain literals (strings, numbers, arrays and objects of literals, template literals without `${}`).

## Structure

```mdx
<Segment id="s03-lookup" goal="A lookup walks from the current record outward">
  ...prose and one interaction...
</Segment>
```

Every interaction sits inside a segment. `goal` is one sentence. The expertise fast path collapses a segment to its goal and keeps its interaction.

## Predict

```mdx
<Predict
  id="hook"
  prompt="What does this print?"
  code={`let a = { n: 1 };
let b = a;
b.n = 2;
console.log(a.n);`}
  answer="b"
  options={[
    { id: "a", text: "1", misconception: "assignment-copies-object", feedback: "You read `let b = a` as making a copy. ..." },
    { id: "b", text: "2", feedback: "Both names point at one object, so a change through b is a change seen through a." },
    { id: "c", text: "undefined", misconception: "..." , feedback: "..." }
  ]}
/>
```

Typed answer variant (`kind="text"`): `answer` is the exact expected output (one string, lines joined by `\n`), compared after trimming trailing whitespace on each line. `wrong` lists known wrong answers: `[{ match: "1", misconception: "...", feedback: "..." }]`. Any other wrong answer shows the generic mechanism text in `explain`.

Common props: `explain` (the mechanism sentence shown after every reveal), `code` (shown above the question; content-check runs it in Node and requires the correct option text or `answer` to equal the real output when `prompt` asks what it prints, logs or outputs).

The learner commits an answer and a confidence (`sure`, `think-so`, `guessing`) before the reveal. Misconception ids refer to `content/misconceptions/<id>.yaml`.

## Term

```mdx
<Term id="environment-record">environment record</Term>
```

Definition comes from `content/glossary.yaml` or a per-lesson file `content/glossary/<lesson-id>.yaml` (`<term-id>: { term, definition, aliases?, spec?, introducedIn }`); an unknown id or a term defined twice fails the build. The prose around it must already explain the idea; the popover is a reminder.

## Viz

```mdx
<Viz example="closure-counter" view="scope" gate="hook" pauseAt={[6]} title="Scope chain" />
```

`example` names `content/<track>/<lesson>/examples/<example>.js`, traced at build time. `view` is `scope`, `memory` or `both`. `gate` names a Predict id that must be answered before stepping. `pauseAt` lists steps that ask "what changes next?". Narration and expectations live in `examples/<example>.narration.yaml`:

```yaml
detail: teaching          # or spec
granularity: statement    # or expression
steps:
  - at: { mark: after-make, kind: statement }   # `// @mark after-make` on a source line
    say: "make() has returned, but its record is still reachable through inc."
    expect:
      - { record: "make() call", binding: count, value: "0" }
      - { stackDepth: 1 }
```

The build checks every expectation against the generated trace and fails with the step number on a mismatch. Write them from the spec, not from the trace. Shapes:

- `{ record, binding, value }`: value is the primitive text as the trace shows it (`"0"`, `"\"hi\""`, `"-0"`), `"uninitialized"` for the TDZ, or `"function <name>"` / `"array"` / `"object"` for a reference.
- `{ record, binding, sameAs: { record, binding } }`: both names point at one object.
- `{ record, binding, prop, value }`: a property of the plain object the binding points at.
- `{ record, exists }`: a record is (or is not) visible.
- `{ stackDepth }`: the script itself counts as 1.
- `{ console: [...] }`: console output so far.

Record labels: `Global`, `<fn>() call`, `<fn>() call #2`, `head of the loop at line N`, `iteration K of the loop at line N`, `<name>'s own name`, otherwise `block`. Anchors: `at: { mark, kind, occurrence? }`. Kinds: `enter` (a call after declaration instantiation, including any default-parameter code), `statement`, `return` (on the last line the call ran), and `end` / `throw`, which need no mark. `occurrence: n` picks the n-th matching frame, for recursion and loops.

## Figure

```mdx
<Figure diagram="busy-loop" title="A timer waits for a busy loop" gate="p-busy">
  <Step>What step 0 shows, and why it matters.</Step>
  <Step>What step 1 adds.</Step>
</Figure>
```

A stepped picture for ideas a trace cannot show: bytes and addresses, processes and threads, compilers and tiers. `diagram` names an entry in `apps/web/components/figures/registry.ts`; each diagram in `components/figures/diagrams/` draws one step at a time from facts written in its doc comment. There is one `<Step>` caption per diagram step, in order, and the build fails when the counts differ. `gate` works as on `Viz`. `/playground/figures` draws every registered diagram at every step.

Captions are the lesson's prose, so content-check reads them like any paragraph: a term is introduced with `<Term>` inside a caption, and banned phrases and term order apply. Keep each caption to about 35 words: what this step shows and why it matters. Step 0 names the parts before anything moves.

## Deeper

```mdx
<Deeper title="The rule in the specification">
...markdown...
</Deeper>
```

Correct but optional depth, folded into a native `<details>`: source quotes, measured details, edge cases. Its text stays findable with find-in-page. Prose inside it still counts for term order, banned phrases and the 250-word prose run.

## Visual-first segments

Lesson 0.1 is the first lesson in this shape (DECISIONS.md, 2026-11-16 and 2026-11-17):

- Every idea segment opens with a `Figure` or a `Viz`. The hook stays a bare `Predict`.
- Prose is the captions plus at most a sentence or two around the interaction. Everything else moves into `Deeper`, with its citations.
- A figure that explains a prediction's answer sits above that `Predict` with `gate`. Its step 0 must not give the answer away, and no prose after a `Predict` states its answer.

## Other components

- `<Code runnable code={`...`} />` runs in the browser sandbox; `// → value` comments after a line are output annotations checked by content-check.
- `<Sidenote>text</Sidenote>`
- `<Callout kind="misconception" title="...">text</Callout>` (kinds: misconception, warning, aside)
- `<Card id="..." kind="recall|predict|explain" front="..." back="..." />`
- `<ExplainBack id="..." prompt="..." rubric={["...", "..."]} />`
- `<InterviewQ id="..." question="..." rubric={["...", "..."]} />`
