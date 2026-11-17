'use client';

import type { Trace } from '@stepthrough/trace';
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CodePane } from './CodePane.tsx';
import { Diagram } from './Diagram.tsx';
import { layoutScene, type View } from './layout.ts';
import {
  type Concept,
  describeStep,
  detachedRecords,
  diffFrames,
  displaySpan,
  eventConcept,
  ranLines,
  recordOwners,
} from './model.ts';
import {
  AUTOPLAY_MS,
  initialPanelState,
  isCorrect,
  isPrompting,
  lastPreviewable,
  type PanelAction,
  type PanelContext,
  predictTargets,
  reducePanel,
  stepKeyAction,
} from './panel-state.ts';
import {
  GATE_NOTE,
  type NextFramePrediction,
  recordNextFramePrediction,
  useGateOpen,
} from './predictions.ts';
import { usePrefersReducedMotion } from './reduced-motion.ts';
import { type Phase, Stepper } from './Stepper.tsx';
import styles from './viz.module.css';

export type VizPanelProps = {
  trace: Trace;
  view: View;
  title: string;
  /** A Predict id. Stepping stays locked until that prediction is committed. */
  gate?: string | undefined;
  /** Steps that ask "what changes next?" before moving on. */
  pauseAt?: readonly number[] | undefined;
  phases?: readonly Phase[] | undefined;
  onPredictNext?: ((prediction: NextFramePrediction) => void) | undefined;
};

/** A step that arrives sooner than this after the last one skips the animation. */
const INSTANT_MS = 400;
const DEFAULT_WIDTH = 640;

const LEGEND: { concept: Exclude<Concept, 'error'>; label: string; shape: ReactNode }[] = [
  {
    concept: 'stack',
    label: 'Call stack',
    shape: (
      <rect
        x="0.75"
        y="3.75"
        width="14.5"
        height="8.5"
        rx="1.5"
        fill="none"
        stroke="var(--stack)"
        strokeWidth="1.5"
      />
    ),
  },
  {
    concept: 'env',
    label: 'Record',
    shape: (
      <rect
        x="0.75"
        y="0.75"
        width="14.5"
        height="14.5"
        rx="2"
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5"
      />
    ),
  },
  {
    concept: 'heap',
    label: 'Heap object',
    shape: (
      <rect
        x="0.75"
        y="0.75"
        width="14.5"
        height="14.5"
        rx="4"
        fill="none"
        stroke="var(--heap)"
        strokeWidth="1.5"
      />
    ),
  },
];

const now = () => performance.now();

export function VizPanel({
  trace,
  view,
  title,
  gate,
  pauseAt = [],
  phases = [],
  onPredictNext = recordNextFramePrediction,
}: VizPanelProps) {
  const gateOpen = useGateOpen(gate);
  const last = trace.frames.length - 1;
  const reduced = usePrefersReducedMotion();
  const ctx: PanelContext = useMemo(
    () => ({ last, pauseAt, gateOpen, autoplay: !reduced }),
    [last, pauseAt, gateOpen, reduced],
  );
  const [state, setState] = useState(initialPanelState);
  const dispatch = useCallback(
    (action: PanelAction) => setState((s) => reducePanel(s, action, ctx)),
    [ctx],
  );

  const owners = useMemo(() => recordOwners(trace), [trace]);
  const narrations = useMemo(
    () => trace.frames.map((_, i) => describeStep(trace, i, owners)),
    [trace, owners],
  );
  const concepts = useMemo(
    () =>
      trace.frames.map((f, i) =>
        eventConcept(diffFrames(trace.frames[i - 1] ?? null, f, trace.uncaught)),
      ),
    [trace],
  );

  const step = Math.min(state.step, last);
  const frame = trace.frames[step] ?? trace.frames[0];
  if (!frame) throw new Error(`trace ${trace.id} has no frames`);
  const prev = trace.frames[step - 1] ?? null;
  const changes = useMemo(
    () => diffFrames(prev, frame, trace.uncaught),
    [prev, frame, trace.uncaught],
  );

  const lanesRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  useLayoutEffect(() => {
    const el = lanesRef.current;
    if (!el) return;
    const measure = () => {
      const style = getComputedStyle(el);
      const inner =
        el.clientWidth -
        Number.parseFloat(style.paddingLeft) -
        Number.parseFloat(style.paddingRight);
      setWidth((w) => (Math.abs(w - inner) < 1 ? w : Math.floor(inner)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scene = useMemo(
    () => layoutScene({ frame, changes, view, width, detached: detachedRecords(frame, owners) }),
    [frame, changes, view, width, owners],
  );

  useEffect(() => {
    if (!state.playing) return;
    const id = setInterval(() => dispatch({ type: 'tick', at: now() }), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [state.playing, dispatch]);

  const mode = { reduced, instant: state.movedAt - state.prevMovedAt < INSTANT_MS };
  const prompting = isPrompting(state, ctx);
  const locked = !gateOpen || prompting;
  const span = displaySpan(trace.frames, step);
  const answered = state.answers.get(step - 1);
  const [focus, setFocus] = useState<Concept | null>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const type = stepKeyAction(e);
    if (!type) return;
    e.preventDefault();
    dispatch({ type, at: now() });
  };

  const answer = (index: number) => {
    const target = predictTargets(frame)[index];
    const next = trace.frames[step + 1];
    if (!target || !next) return;
    const correct = isCorrect(target, diffFrames(frame, next, trace.uncaught));
    onPredictNext({ traceId: trace.id, step, choice: target.label, correct });
    dispatch({ type: 'answer', answer: { target, correct }, at: now() });
  };

  return (
    <figure
      className={styles.figure}
      data-interaction=""
      data-focus={focus ?? undefined}
      onKeyDown={onKeyDown}
    >
      <figcaption className={styles.header}>
        <span className={styles.label}>{title}</span>
        <ul className={styles.legend} aria-label="Key">
          {LEGEND.filter((item) => item.concept !== 'stack' || view !== 'memory')
            .filter((item) => item.concept !== 'heap' || view !== 'scope')
            .map((item) => (
              <li
                key={item.concept}
                className={styles.chip}
                onPointerEnter={() => setFocus(item.concept)}
                onPointerLeave={() => setFocus(null)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  {item.shape}
                </svg>
                {item.label}
              </li>
            ))}
        </ul>
      </figcaption>

      <div className={styles.body}>
        <CodePane
          source={trace.source}
          current={span?.startLine ?? null}
          ran={ranLines(trace.frames, step)}
        />
        <div className={styles.lanes} ref={lanesRef}>
          {/* biome-ignore lint/a11y/useSemanticElements: a fieldset would announce a form; this groups a diagram */}
          <div
            // biome-ignore lint/a11y/noNoninteractiveTabindex: the diagram takes focus so the step keys work without first tabbing to a button
            tabIndex={0}
            role="group"
            className={styles.diagram}
            aria-label={`Diagram, step ${step} of ${last}`}
            aria-keyshortcuts="ArrowRight ArrowLeft Space R"
          >
            <Diagram scene={scene} frame={frame} changes={changes} step={step} mode={mode} />
          </div>
        </div>
      </div>

      <div className={styles.narration} aria-live="polite" aria-atomic="true">
        <span className={styles.srOnly}>
          Step {step} of {last}.{' '}
        </span>
        {answered && (
          <span className={styles.feedback} data-correct={answered.correct || undefined}>
            You predicted: {answered.target.label}.{' '}
            {answered.correct ? 'Right.' : 'Not this time. Here is what changed.'}
          </span>
        )}
        {narrations[step]}
      </div>

      {prompting && (
        <fieldset className={styles.prompt}>
          <legend className={styles.promptQuestion}>
            What changes next? Pick one to see the next step.
          </legend>
          <div className={styles.choices}>
            {predictTargets(frame).map((target, i) => (
              <button
                key={target.label}
                type="button"
                className={styles.choice}
                onClick={() => answer(i)}
              >
                {target.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {!gateOpen && <p className={styles.gateNote}>{GATE_NOTE}</p>}

      <Stepper
        step={step}
        last={last}
        playing={state.playing}
        locked={locked}
        gateOpen={gateOpen}
        autoplay={!reduced}
        lastPreviewable={lastPreviewable(state, ctx)}
        concepts={concepts}
        narrations={narrations}
        phases={phases}
        onReset={() => dispatch({ type: 'reset', at: now() })}
        onPrev={() => dispatch({ type: 'prev', at: now() })}
        onNext={() => dispatch({ type: 'next', at: now() })}
        onTogglePlay={() => dispatch({ type: 'toggle-play', at: now() })}
        onSeek={(n) => dispatch({ type: 'seek', step: n, at: now() })}
      />
    </figure>
  );
}
