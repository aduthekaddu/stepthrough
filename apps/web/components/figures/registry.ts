import type { ComponentType } from 'react';
import { BlockedServer } from './diagrams/blocked-server.tsx';
import { BusyLoop } from './diagrams/busy-loop.tsx';
import { MachineCode } from './diagrams/machine-code.tsx';
import { MemoryBytes } from './diagrams/memory-bytes.tsx';
import { ProcessMemory } from './diagrams/process-memory.tsx';
import { TextVsChip } from './diagrams/text-vs-chip.tsx';
import { Threads } from './diagrams/threads.tsx';

/** What every diagram receives: the step to draw. Captions live in the lesson, not here. */
export type DiagramProps = { step: number };

/** A drawn figure: how many steps it has and a pure renderer from step to picture. */
export type DiagramSpec = { steps: number; Component: ComponentType<DiagramProps> };

/**
 * Every diagram a lesson can name in `<Figure diagram="...">`. The lesson supplies one
 * `<Step>` caption per step, and the build fails when the counts differ.
 */
export const DIAGRAMS = {
  'text-vs-chip': TextVsChip,
  'machine-code': MachineCode,
  'memory-bytes': MemoryBytes,
  'process-memory': ProcessMemory,
  threads: Threads,
  'busy-loop': BusyLoop,
  'blocked-server': BlockedServer,
} satisfies Record<string, DiagramSpec>;

export type DiagramName = keyof typeof DIAGRAMS;

export const isDiagramName = (name: string): name is DiagramName => Object.hasOwn(DIAGRAMS, name);
