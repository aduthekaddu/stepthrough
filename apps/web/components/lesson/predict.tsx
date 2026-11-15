import { z } from 'zod';
import type { MisconceptionId, PredictId } from '@/lib/learner';
import { CodeBlock } from './highlight';
import type { PredictSpec } from './predict-model';
import { PredictView } from './predict-view';

const common = {
  id: z.string().regex(/^[a-z0-9-]+$/),
  prompt: z.string().min(1),
  code: z.string().optional(),
  explain: z.string().min(1),
};
const misconception = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .optional();

const ChoiceProps = z
  .object({
    ...common,
    kind: z.literal('choice').optional(),
    answer: z.string(),
    options: z
      .array(z.object({ id: z.string(), text: z.string(), feedback: z.string(), misconception }))
      .min(3)
      .max(4),
  })
  .check((ctx) => {
    const { options, answer } = ctx.value;
    const ids = options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) ctx.issues.push(issue(ctx.value, 'option ids repeat'));
    const right = options.find((o) => o.id === answer);
    if (!right) ctx.issues.push(issue(ctx.value, `answer "${answer}" is not an option id`));
    else if (right.misconception)
      ctx.issues.push(issue(ctx.value, 'the answer option has a misconception'));
  });

const TextProps = z.object({
  ...common,
  kind: z.literal('text'),
  answer: z.string().min(1),
  wrong: z.array(z.object({ match: z.string(), feedback: z.string(), misconception })).default([]),
});

const issue = (input: unknown, message: string) => ({ code: 'custom' as const, input, message });

function toSpec(props: unknown): PredictSpec {
  const kind = (props as { kind?: unknown }).kind;
  const result = (kind === 'text' ? TextProps : ChoiceProps).safeParse(props);
  if (!result.success) {
    const id = (props as { id?: unknown }).id;
    throw new Error(`<Predict id="${String(id)}">: ${z.prettifyError(result.error)}`);
  }
  const p = result.data;
  const base = { id: p.id as PredictId, prompt: p.prompt, code: p.code, explain: p.explain };
  return p.kind === 'text'
    ? {
        ...base,
        kind: 'text',
        answer: p.answer,
        wrong: p.wrong.map((w) => ({
          ...w,
          misconception: w.misconception as MisconceptionId | undefined,
        })),
      }
    : {
        ...base,
        kind: 'choice',
        answer: p.answer,
        options: p.options.map((o) => ({
          ...o,
          misconception: o.misconception as MisconceptionId | undefined,
        })),
      };
}

export function Predict(props: Record<string, unknown>) {
  const spec = toSpec(props);
  return <PredictView spec={spec} code={spec.code ? <CodeBlock code={spec.code} /> : null} />;
}
