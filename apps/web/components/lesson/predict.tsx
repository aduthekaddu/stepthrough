import { parsePredict } from '@stepthrough/content-check/schema';
import { z } from 'zod';
import { misconceptions } from '@/lib/content';
import type { MisconceptionId, PredictId } from '@/lib/learner';
import { CodeBlock } from './highlight';
import type { PredictSpec } from './predict-model';
import { PredictView } from './predict-view';

function toSpec(props: unknown): PredictSpec {
  const result = parsePredict(props);
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
  const registry = misconceptions();
  const ids =
    spec.kind === 'choice'
      ? spec.options.map((o) => o.misconception)
      : spec.wrong.map((w) => w.misconception);
  // The belief behind each wrong answer, in words, from the misconception registry.
  const beliefs: Record<string, string> = {};
  for (const id of ids) {
    const belief = id ? registry.get(id)?.belief : undefined;
    if (id && belief) beliefs[id] = belief;
  }
  return (
    <PredictView
      spec={spec}
      beliefs={beliefs}
      code={spec.code ? <CodeBlock code={spec.code} /> : null}
    />
  );
}
