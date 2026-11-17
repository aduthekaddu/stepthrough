import type { ReactNode } from 'react';
import figures from '../figures.module.css';
import { Reveal } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import css from './jit.module.css';

/** The four kinds of fact, in the order their chips arrive: lane i fills at step i + 1. */
const LANES: readonly { kind: string; facts: readonly ReactNode[] }[] = [
  {
    kind: 'General computing',
    facts: [
      'CPUs run only their own machine code',
      'Memory is bytes with numbered addresses',
      "Processes have separate memory; a process's threads share it",
    ],
  },
  {
    kind: 'JavaScript spec',
    facts: [
      'Early errors stop the whole script',
      'One job runs at a time, to completion',
      'Calls push contexts; the top one runs (a model)',
    ],
  },
  {
    kind: 'Runtime',
    facts: [
      <>
        <code>document</code>, <code>setTimeout</code>, <code>console</code>
      </>,
    ],
  },
  {
    kind: 'V8',
    facts: [
      'Bytecode, the four tiers, deopt',
      '984 KB stack limit and its error message',
      'Where values are stored',
    ],
  },
];

/**
 * Steps: 0 the four empty lanes and the sorting test, then one lane fills per step: 1 general
 * computing, 2 the JavaScript spec, 3 the runtime, 4 V8. Facts: the lesson's own fact table.
 */
function Draw({ step }: DiagramProps) {
  return (
    <div className={css.column}>
      <p className={css.line}>Test: would it still hold in Firefox and in next year's V8?</p>
      <div className={css.lanes}>
        {LANES.map(({ kind, facts }, lane) => (
          <div key={kind} className={css.sortLane}>
            <p className={figures.rowLabel}>{kind}</p>
            <div className={css.chips}>
              {facts.map((fact, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: facts are a fixed list
                <Reveal key={i} show={step > lane}>
                  <span className={css.fact} data-new={step === lane + 1 || undefined}>
                    {fact}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const FactSorter: DiagramSpec = { steps: LANES.length + 1, Component: Draw };
