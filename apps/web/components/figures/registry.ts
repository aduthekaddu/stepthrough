import type { ComponentType } from 'react';
import { BlockedServer } from './diagrams/blocked-server.tsx';
import { BusyLoop } from './diagrams/busy-loop.tsx';
import { CompileVsInterpret } from './diagrams/compile-vs-interpret.tsx';
import { Deopt } from './diagrams/deopt.tsx';
import { EngineRuntime } from './diagrams/engine-runtime.tsx';
import { FactSorter } from './diagrams/fact-sorter.tsx';
import { IgnitionBytecode } from './diagrams/ignition-bytecode.tsx';
import { JitTiers } from './diagrams/jit-tiers.tsx';
import { MachineCode } from './diagrams/machine-code.tsx';
import { MemoryBytes } from './diagrams/memory-bytes.tsx';
import { ParseThenRun } from './diagrams/parse-then-run.tsx';
import { ProcessMemory } from './diagrams/process-memory.tsx';
import { StackOverflow } from './diagrams/stack-overflow.tsx';
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
  'compile-vs-interpret': CompileVsInterpret,
  'engine-runtime': EngineRuntime,
  'parse-then-run': ParseThenRun,
  'ignition-bytecode': IgnitionBytecode,
  'jit-tiers': JitTiers,
  deopt: Deopt,
  'stack-overflow': StackOverflow,
  'fact-sorter': FactSorter,
  'blocked-server': BlockedServer,
} satisfies Record<string, DiagramSpec>;

export type DiagramName = keyof typeof DIAGRAMS;

export const isDiagramName = (name: string): name is DiagramName => Object.hasOwn(DIAGRAMS, name);
