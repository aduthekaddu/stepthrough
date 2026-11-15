import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Trace } from '@stepthrough/trace';
import type { View } from './layout.ts';
import type { Phase } from './Stepper.tsx';
import { VizPanel } from './VizPanel.tsx';

export type VizProps = {
  /** A lesson example name, or `fixtures/<name>` for apps/web/viz-fixtures. */
  example: string;
  view?: View;
  title?: string;
  gate?: string;
  pauseAt?: number[];
  phases?: Phase[];
};

const EXAMPLE_ID = /^(fixtures\/)?[a-z0-9][a-z0-9-]*$/;

const DEFAULT_TITLE: Record<View, string> = {
  scope: 'Scope chain',
  memory: 'Memory',
  both: 'Scope and memory',
};

/**
 * Server component for MDX: reads the trace that scripts/build-traces.ts generated at build
 * time and hands it to the client panel.
 */
export async function Viz({ example, view = 'scope', title, gate, pauseAt, phases }: VizProps) {
  if (!EXAMPLE_ID.test(example)) throw new Error(`<Viz example="${example}">: not an example name`);
  const file = path.join(process.cwd(), 'generated', 'traces', `${example}.json`);
  const trace = JSON.parse(await readFile(file, 'utf8')) as Trace;
  if (trace.id !== example || trace.frames.length === 0)
    throw new Error(`${file} does not hold the trace for "${example}"; run pnpm traces`);
  return (
    <VizPanel
      trace={trace}
      view={view}
      title={title ?? DEFAULT_TITLE[view]}
      gate={gate}
      pauseAt={pauseAt}
      phases={phases}
    />
  );
}
