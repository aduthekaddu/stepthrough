import figures from '../figures.module.css';
import { Dim, Reveal, Unit } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import os from './os.module.css';
import { DownArrow } from './os-parts.tsx';

type Range = readonly [start: string, end: string];

/** The same command ran twice; each `node` process printed these lines of its /proc/self/maps. */
const RUNS: readonly { name: string; heap: Range; stack: Range }[] = [
  {
    name: 'run 1',
    heap: ['63fbdd2b8000', '63fbdd520000'],
    stack: ['7fffa371a000', '7fffa373c000'],
  },
  {
    name: 'run 2',
    heap: ['62a12068b000', '62a1208f3000'],
    stack: ['7ffd5c40c000', '7ffd5c42e000'],
  },
];

/**
 * RAM as twelve cells. An empty string is one free cell; a run's name is that run's part, two
 * cells wide, placed under the run's column so its arrow points straight down at it.
 */
const RAM = ['', '', 'run 1', '', '', '', '', 'run 2', '', ''];

function AddressRange({ range: [start, end] }: { range: Range }) {
  return (
    <dd>
      {start}-<wbr />
      {end}
    </dd>
  );
}

/**
 * Steps: 0 the OS holding processes, 1 each `node` process with its own address map, 2 the OS
 * mapping each one to its own part of RAM. Addresses are real output from two runs of the same
 * command on Linux (lesson 0.1, segment "process").
 */
function Draw({ step }: DiagramProps) {
  return (
    <div className={figures.stack}>
      <Unit kind="plain" label="operating system">
        <p className={figures.note}>such as Linux, Windows or macOS</p>
        <Dim dim={step >= 1}>
          <div className={os.others}>
            <span className={os.othersLabel}>other programs</span>
            <span className={os.other}>browser</span>
            <span className={os.other}>editor</span>
          </div>
        </Dim>
        <div className={os.runs}>
          {RUNS.map((run) => (
            <Unit
              key={run.name}
              kind="plain"
              label="process"
              title={
                <>
                  <span className={os.mono}>node</span> {run.name}
                </>
              }
            >
              <Reveal show={step >= 1}>
                <p className={os.mapLabel}>virtual addresses</p>
                <dl className={os.map}>
                  <dt>[heap]</dt>
                  <AddressRange range={run.heap} />
                  <dt>[stack]</dt>
                  <AddressRange range={run.stack} />
                </dl>
              </Reveal>
            </Unit>
          ))}
        </div>
      </Unit>
      <Reveal show={step >= 2} className={os.ramPart}>
        <div className={os.ramArrows}>
          {RUNS.map((run) => (
            <DownArrow key={run.name} />
          ))}
        </div>
        <ol className={os.ram} aria-label="RAM">
          {RAM.map((owner, i) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: cells are positions in a fixed strip
              key={i}
              data-run={owner ? '' : undefined}
            >
              {owner}
            </li>
          ))}
        </ol>
        <p className={figures.rowLabel}>RAM · real memory</p>
      </Reveal>
    </div>
  );
}

export const ProcessMemory: DiagramSpec = { steps: 3, Component: Draw };
