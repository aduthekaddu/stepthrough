import { Dim, Reveal, Unit } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import os from './os.module.css';
import { DownArrow } from './os-parts.tsx';

const THREADS = ['thread 1', 'thread 2', 'thread 3'];
const CORES = 2;

/** One path through the code, instruction after instruction, with the thread's own stack. */
function Thread({ label }: { label: string }) {
  return (
    <div className={os.thread}>
      <p className={os.threadLabel}>{label}</p>
      <svg className={os.path} viewBox="0 0 20 56" aria-hidden="true" focusable="false">
        <path d="M10 2v50M4 46l6 6 6-6M6 12h8M6 22h8M6 32h8" />
      </svg>
      <p className={os.stackBar}>stack</p>
    </div>
  );
}

/**
 * Steps: 0 one process with shared memory and three threads, each with its own stack; 1 two CPU
 * cores each running a thread at the same moment; 2 your JavaScript's agent with its one thread,
 * and a worker you start as a separate agent with its own thread and memory. Sources: pthreads(7)
 * ("share the same global memory ..., but each thread has its own stack"), the ECMAScript agent
 * definition and MDN's "analogous to a thread".
 */
function Draw({ step }: DiagramProps) {
  return (
    <div className={os.layers}>
      <Reveal show={step < 2}>
        <div className={os.cores}>
          {THREADS.map((thread, i) => (
            <Reveal key={thread} show={step === 1 && i < CORES} className={os.core}>
              <Unit kind="cpu" title={`core ${i + 1}`} />
              <DownArrow />
            </Reveal>
          ))}
        </div>
        <Unit kind="plain" label="process">
          <div className={os.threads}>
            {THREADS.map((thread, i) => (
              <Dim key={thread} dim={step === 1 && i >= CORES}>
                <Thread label={thread} />
              </Dim>
            ))}
          </div>
          <p className={os.memory}>shared memory</p>
        </Unit>
      </Reveal>
      <Reveal show={step === 2} className={os.agentLayer}>
        <Unit kind="plain" label="agent" title="your JavaScript">
          <Thread label="your code's thread" />
          <p className={os.memory}>its memory</p>
        </Unit>
        <Unit kind="plain" label="agent" title="a worker you start">
          <Thread label="its own thread" />
          <p className={os.memory}>its own memory</p>
        </Unit>
      </Reveal>
    </div>
  );
}

export const Threads: DiagramSpec = { steps: 3, Component: Draw };
