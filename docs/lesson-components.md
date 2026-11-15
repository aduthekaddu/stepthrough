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

Definition comes from `content/glossary.yaml`. The prose around it must already explain the idea; the popover is a reminder.

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

## Other components

- `<Code runnable code={`...`} />` runs in the browser sandbox; `// → value` comments after a line are output annotations checked by content-check.
- `<Sidenote>text</Sidenote>`
- `<Callout kind="misconception" title="...">text</Callout>` (kinds: misconception, warning, aside)
- `<Card id="..." kind="recall|predict|explain" front="..." back="..." />`
- `<ExplainBack id="..." prompt="..." rubric={["...", "..."]} />`
- `<InterviewQ id="..." question="..." rubric={["...", "..."]} />`
