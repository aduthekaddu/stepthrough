import figures from '../figures.module.css';
import { Reveal } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import os from './os.module.css';

/** The plum square of the task concept, with its label. */
function TaskMark() {
  return (
    <span className={os.taskMark}>
      <span className={os.taskSquare} aria-hidden="true" />
      task
    </span>
  );
}

/**
 * The program: setTimeout(() => console.log("timer"), 0), then a while loop that spins for
 * 100 ms, then console.log("loop done"). Real output is `loop done`, then `timer`.
 * Steps: 0 setTimeout leaves the callback waiting, due at 0 ms; 1 the loop holds the thread
 * to about 100 ms while the callback waits; 2 `loop done` prints and the script ends; 3 the
 * callback runs about 100 ms late and prints `timer`. Facts: the lesson 0.1 brief and the
 * ECMAScript rule that a Job runs to completion before any other Job starts. Bar lengths are
 * schematic; the axis names only 0 ms and about 100 ms.
 */
function Draw({ step }: DiagramProps) {
  return (
    <div className={figures.stack}>
      <div>
        <p className={figures.rowLabel}>one thread · runs your JavaScript</p>
        <div className={os.timeline}>
          <span className={os.gridLine} style={{ insetInlineStart: 0 }} aria-hidden="true" />
          <span className={os.gridLine} style={{ insetInlineStart: '70%' }} aria-hidden="true" />
          <div className={os.axis}>
            <span className={os.axisAt}>0 ms</span>
            <span className={os.axisAt} style={{ insetInlineStart: '70%' }}>
              about 100 ms
            </span>
          </div>
          <div className={os.track}>
            <Reveal show={step === 0} className={os.bar} style={{ inlineSize: 'auto' }}>
              <code>setTimeout</code> runs
            </Reveal>
            <Reveal
              show={step >= 1}
              className={`${os.bar} ${step === 3 ? os.barDone : ''}`}
              style={{ inlineSize: 'calc(70% - 6px)' }}
            >
              <code>while</code> loop · busy
            </Reveal>
            <Reveal
              show={step >= 3}
              className={`${os.bar} ${os.taskBar}`}
              style={{ insetInlineStart: 'calc(70% + 3px)', insetInlineEnd: '3px' }}
            >
              <span className={os.taskSquare} aria-hidden="true" />
              callback
            </Reveal>
          </div>
          <div className={os.below}>
            <Reveal show={step === 2} className={os.endNote}>
              script ends
            </Reveal>
            <Reveal show={step === 3} className={os.bracket} style={{ inlineSize: '71%' }}>
              ran about 100 ms late
            </Reveal>
          </div>
        </div>
      </div>
      <div className={os.pairBelow}>
        <div className={os.box}>
          <p className={figures.rowLabel}>waiting</p>
          <Reveal show={step < 3} className={os.waitItem}>
            <TaskMark />
            <span>
              timer callback
              <br />
              {step === 0 ? 'due at 0 ms' : 'due, still waiting'}
            </span>
          </Reveal>
        </div>
        <div className={os.box}>
          <p className={figures.rowLabel}>console</p>
          <div className={os.console}>
            <Reveal show={step >= 2}>loop done</Reveal>
            <Reveal show={step >= 3}>timer</Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

export const BusyLoop: DiagramSpec = { steps: 4, Component: Draw };
