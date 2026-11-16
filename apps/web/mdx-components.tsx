import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ComponentType, ReactNode } from 'react';
import { z } from 'zod';
import { Figure, Step } from '@/components/figures/Figure';
import { Callout, InterviewQ } from '@/components/lesson/blocks';
import { Code } from '@/components/lesson/code';
import { Deeper } from '@/components/lesson/deeper';
import { Segment } from '@/components/lesson/lesson-scope';
import { Predict } from '@/components/lesson/predict';
import { Card, ExplainBack } from '@/components/lesson/review';
import { Sidenote } from '@/components/lesson/sidenote';
import { Term } from '@/components/lesson/term';
import { Viz } from '@/components/viz/Viz';

const slug = z.string().regex(/^[a-z0-9-]+$/);
const children = z.custom<ReactNode>(() => true);

/** Lesson props are authored data: parse them at build time so a typo fails the build. */
function parsed<P extends object>(name: string, schema: z.ZodType<P>, Component: ComponentType<P>) {
  return function Parsed(props: unknown) {
    const result = schema.safeParse(props);
    if (!result.success) throw new Error(`<${name}>: ${z.prettifyError(result.error)}`);
    return <Component {...result.data} />;
  };
}

const components = {
  Predict,
  Segment: parsed('Segment', z.object({ id: slug, goal: z.string().min(1), children }), Segment),
  Term: parsed('Term', z.object({ id: slug, children }), Term),
  Sidenote: parsed('Sidenote', z.object({ children }), Sidenote),
  Callout: parsed(
    'Callout',
    z.object({
      kind: z.enum(['misconception', 'warning', 'aside']),
      title: z.string().optional(),
      children,
    }),
    Callout,
  ),
  Code: parsed('Code', z.object({ code: z.string(), runnable: z.boolean().optional() }), Code),
  Card: parsed(
    'Card',
    z.object({
      id: slug,
      kind: z.enum(['recall', 'predict', 'explain']),
      front: z.string().min(1),
      back: z.string().min(1),
    }),
    Card,
  ),
  ExplainBack: parsed(
    'ExplainBack',
    z.object({ id: slug, prompt: z.string().min(1), rubric: z.array(z.string()).min(1) }),
    ExplainBack,
  ),
  InterviewQ: parsed(
    'InterviewQ',
    z.object({ id: slug, question: z.string().min(1), rubric: z.array(z.string()).min(1) }),
    InterviewQ,
  ),
  Viz,
  Figure: parsed(
    'Figure',
    z.object({
      diagram: slug,
      title: z.string().min(1),
      gate: slug.optional(),
      layout: z.enum(['card', 'sticky']).optional(),
      children,
    }),
    Figure,
  ),
  /** Unwrapped: Figure finds its captions by this exact component. */
  Step,
  Deeper: parsed('Deeper', z.object({ title: z.string().min(1), children }), Deeper),
  /** Fenced blocks are text diagrams whose columns must line up, so they scroll instead of wrapping. */
  pre: (props: ComponentProps<'pre'>) => (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users must be able to scroll a diagram wider than the column (axe scrollable-region-focusable).
    <pre {...props} className="text-pre" tabIndex={0} />
  ),
} satisfies MDXComponents;

export function useMDXComponents(inherited: MDXComponents): MDXComponents {
  return { ...inherited, ...components };
}
