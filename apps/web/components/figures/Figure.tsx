import { Children, isValidElement, type ReactNode } from 'react';
import { FigurePanel } from './FigurePanel.tsx';
import { DIAGRAMS, isDiagramName } from './registry.ts';

export type FigureProps = {
  diagram: string;
  title: string;
  /** A Predict id. Stepping stays locked until that prediction is committed. */
  gate?: string | undefined;
  children: ReactNode;
};

/** One caption per diagram step, in order. */
export function Step({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Server side of a stepped figure: reads the `<Step>` captions from MDX and fails the build
 * when their number differs from the diagram's steps.
 */
export function Figure({ diagram, title, gate, children }: FigureProps) {
  if (!isDiagramName(diagram)) throw new Error(`<Figure diagram="${diagram}">: no such diagram`);
  const captions = Children.toArray(children)
    .filter(isValidElement)
    .map((el) => {
      if (el.type !== Step)
        throw new Error(`<Figure diagram="${diagram}">: only <Step> may sit inside a figure`);
      return (el.props as { children: ReactNode }).children;
    });
  const { steps } = DIAGRAMS[diagram];
  if (captions.length !== steps)
    throw new Error(
      `<Figure diagram="${diagram}">: ${captions.length} <Step> captions for ${steps} steps`,
    );
  return <FigurePanel diagram={diagram} title={title} gate={gate} captions={captions} />;
}
