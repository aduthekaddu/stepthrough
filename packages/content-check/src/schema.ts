import { z } from 'zod';

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

export const PredictOption = z.object({
  id: z.string(),
  text: z.string(),
  misconception: z.string().optional(),
  feedback: z.string().min(1),
});

export const PredictProps = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('choice'),
    id: z.string(),
    prompt: z.string(),
    code: z.string().optional(),
    answer: z.string(),
    options: z.array(PredictOption).min(2).max(5),
    explain: z.string().optional(),
  }),
  z.object({
    kind: z.literal('text'),
    id: z.string(),
    prompt: z.string(),
    code: z.string().optional(),
    answer: z.string(),
    wrong: z
      .array(
        z.object({ match: z.string(), misconception: z.string().optional(), feedback: z.string() }),
      )
      .default([]),
    explain: z.string().optional(),
  }),
]);
export type PredictProps = z.infer<typeof PredictProps>;
