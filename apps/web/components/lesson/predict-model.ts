import type { MisconceptionId, PredictId, Verdict } from '@/lib/learner';

export type ChoiceOption = {
  id: string;
  text: string;
  feedback: string;
  misconception?: MisconceptionId | undefined;
};

export type KnownWrong = {
  match: string;
  feedback: string;
  misconception?: MisconceptionId | undefined;
};

/** A parsed `<Predict>` (docs/lesson-components.md). `answer` is an option id or the exact output. */
export type PredictSpec = {
  id: PredictId;
  prompt: string;
  code?: string | undefined;
  explain: string;
} & (
  | { kind: 'choice'; answer: string; options: ChoiceOption[] }
  | { kind: 'text'; answer: string; wrong: KnownWrong[] }
);

/** Feedback is null when the answer matches nothing written for it; `explain` still shows. */
export type Judgement = { verdict: Verdict; feedback: string | null };

export const normalizeOutput = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/^\n+|\n+$/g, '');

export function judge(spec: PredictSpec, answer: string): Judgement {
  if (spec.kind === 'choice') {
    const option = spec.options.find((o) => o.id === answer);
    if (!option) throw new Error(`Predict "${spec.id}" has no option "${answer}"`);
    return {
      verdict:
        answer === spec.answer
          ? { correct: true }
          : { correct: false, misconceptionId: option.misconception ?? null },
      feedback: option.feedback,
    };
  }
  const given = normalizeOutput(answer);
  if (given === normalizeOutput(spec.answer)) return { verdict: { correct: true }, feedback: null };
  const known = spec.wrong.find((w) => normalizeOutput(w.match) === given);
  return {
    verdict: { correct: false, misconceptionId: known?.misconception ?? null },
    feedback: known?.feedback ?? null,
  };
}
