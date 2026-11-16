import { Children, isValidElement, type ReactNode } from 'react';
import { FigurePanel } from './FigurePanel.tsx';
import { FigureStory } from './FigureStory.tsx';
import { DIAGRAMS, isDiagramName } from './registry.ts';

export type FigureProps = {
  diagram: string;
  title: string;
  /** A Predict id. Stepping stays locked until that prediction is committed. */
  gate?: string | undefined;
  layout?: 'card' | 'sticky' | undefined;
  children: ReactNode;
};

/** One caption per diagram step, in order. */
export function Step({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export type StoryItem = { kind: 'step'; caption: ReactNode } | { kind: 'aside'; node: ReactNode };

/**
 * Server side of a stepped figure: reads the `<Step>` captions from MDX and fails the build
 * when their number differs from the diagram's steps.
 */
export function Figure({ diagram, title, gate, layout = 'card', children }: FigureProps) {
  if (!isDiagramName(diagram)) throw new Error(`<Figure diagram="${diagram}">: no such diagram`);
  const items: StoryItem[] = Children.toArray(children)
    .filter(isValidElement)
    .map((el) =>
      el.type === Step
        ? { kind: 'step', caption: (el.props as { children: ReactNode }).children }
        : { kind: 'aside', node: el },
    );
  const captions = items.flatMap((i) => (i.kind === 'step' ? [i.caption] : []));
  const { steps } = DIAGRAMS[diagram];
  if (captions.length !== steps)
    throw new Error(
      `<Figure diagram="${diagram}">: ${captions.length} <Step> captions for ${steps} steps`,
    );
  if (layout === 'sticky')
    return <FigureStory diagram={diagram} title={title} gate={gate} items={items} />;
  if (items.some((i) => i.kind === 'aside'))
    throw new Error(`<Figure diagram="${diagram}">: only <Step> may sit inside a card figure`);
  return <FigurePanel diagram={diagram} title={title} gate={gate} captions={captions} />;
}
