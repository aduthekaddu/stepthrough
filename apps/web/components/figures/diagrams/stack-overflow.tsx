import figures from '../figures.module.css';
import { Reveal } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import css from './jit.module.css';

type Slot = { kind: 'script' } | { kind: 'frame' | 'fold'; label: string } | { kind: 'error' };

/** The stack from the bottom up. Every slot always takes its space, so the box keeps its size. */
const SLOTS: readonly Slot[] = [
  { kind: 'script' },
  { kind: 'frame', label: 'down(3)' },
  { kind: 'frame', label: 'down(2)' },
  { kind: 'frame', label: 'down(1)' },
  { kind: 'frame', label: 'down(0)' },
  { kind: 'frame', label: 'down(-1)' },
  { kind: 'fold', label: '⋮ about 10,000 more frames ⋮' },
  { kind: 'frame', label: 'down(…)' },
  { kind: 'error' },
];

/** How many slots are filled at each step, counted from the bottom. */
const FILLED = [1, 4, 8, 9] as const;

function SlotView({ slot, thrown, top }: { slot: Slot; thrown: boolean; top: boolean }) {
  switch (slot.kind) {
    case 'error':
      return (
        <div className={css.error}>
          <p className={css.errorLabel}>Error</p>
          <p className={css.mono}>RangeError</p>
        </div>
      );
    case 'script':
      return (
        <div className={css.bar} data-running={top || undefined}>
          {thrown ? 'script: catch runs' : 'script: in try'}
        </div>
      );
    default:
      return (
        <div
          className={css.bar}
          data-fold={slot.kind === 'fold' || undefined}
          data-ghost={thrown || undefined}
          data-running={top || undefined}
        >
          {slot.label}
        </div>
      );
  }
}

/**
 * Steps: 0 the empty fixed-size stack with only the script's frame, 1 `down(3)` to `down(1)`
 * pushed and none returned, 2 nearly full after about ten thousand frames, 3 full: RangeError,
 * every `down` frame leaves, the catch prints it. Facts: the lesson's program run on Node, and
 * `node --v8-options` for `--stack-size=984`.
 */
function Draw({ step }: DiagramProps) {
  const filled = FILLED[step] ?? 1;
  const thrown = step === FILLED.length - 1;
  return (
    <div className={css.split}>
      <div className={css.lane}>
        <p className={figures.rowLabel}>stack · fixed size, grows upward</p>
        <div className={css.stackWrap}>
          <div className={css.stackBox}>
            {SLOTS.map((slot, i) => {
              const top = thrown ? i === 0 : i === filled - 1;
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: slots are fixed positions in the box
                <Reveal key={i} show={i < filled}>
                  <SlotView slot={slot} thrown={thrown} top={top} />
                </Reveal>
              );
            })}
          </div>
          <div className={css.measure}>
            <p className={css.measureText}>
              <strong>984 KB</strong>
              <span>V8's default</span>
            </p>
          </div>
        </div>
      </div>
      <div className={css.lane}>
        <p className={figures.rowLabel}>console</p>
        <div className={`${css.box} ${css.console}`}>
          <Reveal show={thrown}>
            <p className={css.mono}>RangeError: Maximum call stack size exceeded</p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

export const StackOverflow: DiagramSpec = { steps: FILLED.length, Component: Draw };
