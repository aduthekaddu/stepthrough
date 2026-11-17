import figures from '../figures.module.css';
import { Dim } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import css from './engine.module.css';

const LINES = 4;
const DECLARED = new Set([3, 4]);
const ERROR_LINE = 4;

type TickState = 'waiting' | 'done' | 'error';

type Phase = {
  no: number;
  name: string;
  spec: string;
  /** What the phase did with each line, in line order, and its one-line status. */
  at: (step: number) => { ticks: TickState[]; status: string; never?: boolean };
};

const all = (state: TickState): TickState[] => Array.from({ length: LINES }, () => state);

const PHASES: readonly Phase[] = [
  {
    no: 1,
    name: 'parse',
    spec: 'ParseScript',
    at: (step) => {
      if (step === 0) return { ticks: all('waiting'), status: 'reads the whole script' };
      if (step === 1)
        return {
          ticks: all('done').map((t, i) => (i + 1 === ERROR_LINE ? 'error' : t)),
          status: 'early error, line 4',
        };
      return { ticks: all('done'), status: 'no early error' };
    },
  },
  {
    no: 2,
    name: 'run',
    spec: 'ScriptEvaluation',
    at: (step) => {
      if (step === 1) return { ticks: all('waiting'), status: 'never starts', never: true };
      if (step === 3) return { ticks: all('done'), status: 'lines 1 to 4, in order' };
      return { ticks: all('waiting'), status: 'starts after parse' };
    },
  },
];

type Output = 'empty' | 'error' | 'logs';

const OUTPUT_AT: readonly Output[] = ['empty', 'error', 'empty', 'logs'];

/**
 * Why this script prints only a SyntaxError: the engine parses all of it before running any of it.
 * Steps: 0 the four lines, the parse and run phases, an empty console; 1 parse reads all four
 * lines and finds an early error on line 4 (the second `let total`), run never starts and the
 * console shows only the SyntaxError; 2 the same file with `var` on lines 3 and 4 parses with no
 * early error; 3 run executes lines 1 to 4 in order and the console shows one, two.
 * Facts: lesson 0.1 engine brief (ECMAScript ParseScript, ScriptEvaluation, early errors; real
 * output of the let and var versions).
 */
function Draw({ step }: DiagramProps) {
  const usesVar = step >= 2;
  const output = OUTPUT_AT[step] ?? 'empty';
  return (
    <div className={css.parseRun}>
      <ol className={css.code} aria-label="The script">
        {Array.from({ length: LINES }, (_, i) => {
          const n = i + 1;
          const error = step === 1 && n === ERROR_LINE;
          return (
            <li key={n} className={css.line} data-error={error || undefined}>
              <span className={css.lineNo}>{n}</span>
              <span>
                {DECLARED.has(n) ? (
                  <>
                    {usesVar ? (
                      <>
                        <del>let</del> <ins>var</ins>
                      </>
                    ) : (
                      'let'
                    )}
                    {` total = ${n - 2};`}
                  </>
                ) : (
                  `console.log("${n === 1 ? 'one' : 'two'}");`
                )}
              </span>
              <span className={css.errorTag} data-show={error || undefined}>
                early error
              </span>
            </li>
          );
        })}
      </ol>
      <div className={`${figures.pair} ${css.phases}`} data-always="">
        {PHASES.map((phase) => {
          const { ticks, status, never = false } = phase.at(step);
          return (
            <section key={phase.no} className={css.phase} data-never={never || undefined}>
              <p className={css.title}>
                <span className={css.phaseNo}>{phase.no}</span> {phase.name}
              </p>
              <p className={css.note}>
                <code>{phase.spec}</code>
              </p>
              <Dim dim={never}>
                <ol className={css.ticks} aria-label={`Lines handled by ${phase.name}`}>
                  {ticks.map((state, i) => (
                    <li
                      // biome-ignore lint/suspicious/noArrayIndexKey: one tick per script line
                      key={i}
                      className={css.tick}
                      data-state={state}
                      aria-label={`line ${i + 1}: ${state}`}
                    >
                      {i + 1}
                    </li>
                  ))}
                </ol>
              </Dim>
              <p className={css.status}>{status}</p>
            </section>
          );
        })}
      </div>
      <section className={css.console} aria-label="Console">
        <p className={css.label}>console</p>
        <div className={css.outputs}>
          <p className={css.output} data-kind="empty" data-show={output === 'empty' || undefined}>
            nothing printed
          </p>
          <p className={css.output} data-kind="error" data-show={output === 'error' || undefined}>
            <span className={css.errorName}>SyntaxError</span>: Identifier 'total' has already been
            declared
          </p>
          <p className={css.output} data-show={output === 'logs' || undefined}>
            {'one\ntwo'}
          </p>
        </div>
      </section>
    </div>
  );
}

export const ParseThenRun: DiagramSpec = { steps: 4, Component: Draw };
