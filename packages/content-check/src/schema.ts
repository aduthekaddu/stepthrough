import { z } from 'zod';

/** Tracks that build pages (for tests and demos) but stay out of the learning path and content-check. */
export const HIDDEN_TRACKS: readonly string[] = ['demo'];

const Id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'kebab-case id');

export const Frontmatter = z.object({
  id: Id,
  track: Id,
  title: z.string().min(1),
  minutes: z.number().int().positive(),
  prereqs: z.array(Id),
  outcomes: z.array(z.string().min(1)).min(1).max(3),
  sources: z.array(z.url()).min(1).max(6),
  interviewTags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'reviewed']),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}$/, 'YYYY-MM'),
});
export type Frontmatter = z.infer<typeof Frontmatter>;

export const GlossaryEntry = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  spec: z.string().optional(),
  introducedIn: Id,
});
export type GlossaryEntry = z.infer<typeof GlossaryEntry>;
export const GlossaryFile = z.record(Id, GlossaryEntry);

export const Misconception = z.object({
  id: z.string().regex(/^[A-Z]+(-[A-Z0-9]+)+$/, 'UPPER-KEBAB id like VAL-COPY'),
  belief: z.string().min(1),
  predicts: z.string().min(1),
  truth: z.string().min(1),
  counterexample: z.string().min(1),
  sources: z.array(z.string()).default([]),
  lessons: z.array(Id).default([]),
});
export type Misconception = z.infer<typeof Misconception>;

const MISCONCEPTION_ID = /^[A-Z]+(-[A-Z0-9]+)+$/;
export const MisconceptionId = z.string().regex(MISCONCEPTION_ID, 'UPPER-KEBAB id like VAL-COPY');

export const PredictOption = z.object({
  id: z.string().min(1),
  text: z.string(),
  misconception: MisconceptionId.optional(),
  feedback: z.string().min(1),
});

const predictCommon = {
  id: Id,
  prompt: z.string().min(1),
  code: z.string().optional(),
  /** The mechanism sentence shown after every reveal, right or wrong. */
  explain: z.string().min(1),
};

const ChoicePredict = z
  .object({
    ...predictCommon,
    kind: z.literal('choice').default('choice'),
    answer: z.string(),
    options: z.array(PredictOption).min(3).max(4),
  })
  .check((ctx) => {
    const { options, answer } = ctx.value;
    const issue = (message: string) =>
      ctx.issues.push({ code: 'custom', input: ctx.value, message });
    const ids = options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) issue('option ids repeat');
    const right = options.find((o) => o.id === answer);
    if (!right) issue(`answer "${answer}" is not an option id`);
    else if (right.misconception) issue('the answer option names a misconception');
  });

const TextPredict = z.object({
  ...predictCommon,
  kind: z.literal('text'),
  answer: z.string().min(1),
  wrong: z
    .array(
      z.object({
        match: z.string(),
        misconception: MisconceptionId.optional(),
        feedback: z.string().min(1),
      }),
    )
    .default([]),
});

/** One schema for Predict props: the build renders with it and content-check lints with it. */
export const PredictProps = z.union([TextPredict, ChoicePredict]);

/** Parses Predict props with the schema their kind selects, so errors name the real problem. */
export function parsePredict(props: unknown) {
  const kind = (props as { kind?: unknown } | null)?.kind;
  return kind === 'text' ? TextPredict.safeParse(props) : ChoicePredict.safeParse(props);
}
export type PredictProps = z.infer<typeof PredictProps>;
