import figures from '../figures.module.css';
import { Dim, Reveal } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import css from './jit.module.css';
import { Swap, Tier, VArrow } from './jit-parts.tsx';

type Moment = {
  call: 'add(sum, 1)' | 'add("ab", "cd")';
  runs: 'ignition' | 'maglev';
  ignition: 'start' | 'hot' | 'idle' | 'resume' | 'finish';
  maglev: 'none' | 'compiling' | 'pass' | 'fail' | 'dropped';
  move: 'none' | 'up' | 'down';
  helper: 'idle' | 'compiling' | 'done';
  printed: 0 | 1 | 2;
};

/**
 * Steps: 0 `add` runs as bytecode and feedback says Smi, 1 V8 marks it hot and stable and Maglev
 * compiles it on a helper thread, 2 the Maglev code runs, its Smi check passes, `100000` prints,
 * 3 `add("ab", "cd")` fails the check and V8 deoptimizes to Ignition at that point, 4 Ignition
 * finishes by the language rules and `abcd` prints. Facts: Node's --trace-opt --trace-deopt
 * output for the lesson's program, and the V8 Sparkplug post on tiering down.
 */
const MOMENTS: readonly Moment[] = [
  {
    call: 'add(sum, 1)',
    runs: 'ignition',
    ignition: 'start',
    maglev: 'none',
    move: 'none',
    helper: 'idle',
    printed: 0,
  },
  {
    call: 'add(sum, 1)',
    runs: 'ignition',
    ignition: 'hot',
    maglev: 'compiling',
    move: 'none',
    helper: 'compiling',
    printed: 0,
  },
  {
    call: 'add(sum, 1)',
    runs: 'maglev',
    ignition: 'idle',
    maglev: 'pass',
    move: 'up',
    helper: 'done',
    printed: 1,
  },
  {
    call: 'add("ab", "cd")',
    runs: 'maglev',
    ignition: 'resume',
    maglev: 'fail',
    move: 'down',
    helper: 'done',
    printed: 1,
  },
  {
    call: 'add("ab", "cd")',
    runs: 'ignition',
    ignition: 'finish',
    maglev: 'dropped',
    move: 'none',
    helper: 'done',
    printed: 2,
  },
];

const CHECK = 'a, b are Smi?';

function Running({ on }: { on: boolean }) {
  return (
    <Reveal show={on} className={css.tag}>
      running
    </Reveal>
  );
}

function Draw({ step }: DiagramProps) {
  const now = MOMENTS[step];
  if (!now) return null;
  return (
    <div className={css.split}>
      <div className={css.lane}>
        <p className={figures.rowLabel}>main thread · runs your code</p>
        <p className={css.line}>
          now: <code>{now.call}</code>
        </p>
        <Dim dim={now.maglev === 'none'}>
          <Tier
            name="Maglev"
            makes="optimized machine code"
            running={now.runs === 'maglev'}
            aside={<Running on={now.runs === 'maglev'} />}
          >
            <Swap
              show={now.maglev}
              parts={{
                none: <p className={`${css.line} ${css.quiet}`}>no code yet</p>,
                compiling: (
                  <p className={`${css.line} ${css.quiet}`}>being compiled on the helper thread</p>
                ),
                pass: (
                  <p className={css.check}>
                    <span>{CHECK}</span>
                    <span>yes</span>
                  </p>
                ),
                fail: (
                  <div className={css.error}>
                    <p className={css.errorLabel}>check failed</p>
                    <p className={css.check}>
                      <span>{CHECK}</span>
                      <span>no: not a Smi</span>
                    </p>
                  </div>
                ),
                dropped: <p className={`${css.line} ${css.quiet}`}>optimized code dropped</p>,
              }}
            />
          </Tier>
        </Dim>
        <Swap
          show={now.move}
          parts={{
            none: null,
            up: (
              <div className={css.move}>
                <VArrow dir="up" />
                later calls run the Maglev code
              </div>
            ),
            down: (
              <div className={css.move} data-failed="">
                <VArrow dir="down" failed />
                deoptimize: back to Ignition at the failed check
              </div>
            ),
          }}
        />
        <Dim dim={now.ignition === 'idle'}>
          <Tier
            name="Ignition"
            makes="bytecode in an interpreter"
            running={now.runs === 'ignition'}
            aside={<Running on={now.runs === 'ignition'} />}
          >
            <Dim dim={step >= 2}>
              <p className={css.line}>feedback: small integers (Smi)</p>
            </Dim>
            <Swap
              show={now.ignition}
              parts={{
                start: null,
                hot: (
                  <p className={css.line}>
                    V8 marks <code>add</code> <span className={css.tag}>hot and stable</span>
                  </p>
                ),
                idle: null,
                resume: <p className={css.line}>takes over at the failed check</p>,
                finish: (
                  <p className={css.line}>
                    <code>"ab" + "cd"</code> is <code>"abcd"</code>, by the language rules
                  </p>
                ),
              }}
            />
          </Tier>
        </Dim>
      </div>
      <div className={css.column}>
        <div className={css.lane}>
          <p className={figures.rowLabel}>helper thread · compiles code</p>
          <Swap
            show={now.helper}
            parts={{
              idle: null,
              compiling: (
                <div className={css.box}>
                  <p className={css.line}>
                    Maglev compiles <code>add</code>
                  </p>
                </div>
              ),
              done: (
                <div className={css.box}>
                  <p className={`${css.line} ${css.quiet}`}>
                    done: Maglev code for <code>add</code>
                  </p>
                </div>
              ),
            }}
          />
        </div>
        <div className={css.lane}>
          <p className={figures.rowLabel}>console</p>
          <div className={`${css.box} ${css.console}`}>
            <Reveal show={now.printed >= 1}>
              <p className={css.mono}>100000</p>
            </Reveal>
            <Reveal show={now.printed >= 2}>
              <p className={css.mono}>abcd</p>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Deopt: DiagramSpec = { steps: MOMENTS.length, Component: Draw };
