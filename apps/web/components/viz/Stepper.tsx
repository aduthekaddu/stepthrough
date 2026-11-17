'use client';

import { type CSSProperties, type ReactNode, useState } from 'react';
import type { Concept } from './model.ts';
import styles from './viz.module.css';

export type Phase = { label: string; step: number };

type StepperProps = {
  step: number;
  last: number;
  playing: boolean;
  /** Forward moves are locked (gate closed or a prediction pending); back and reset still work. */
  locked: boolean;
  gateOpen: boolean;
  /** Off under reduced motion: play does nothing and says why. */
  autoplay: boolean;
  /** Hovering the ruler previews captions up to this step and no further, so none gives an answer away. */
  lastPreviewable: number;
  concepts: readonly (Concept | null)[];
  narrations: readonly ReactNode[];
  phases: readonly Phase[];
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSeek: (step: number) => void;
};

const pad = (n: number, width: number) => String(n).padStart(width, '0');

function Icon({ d }: { d: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

const ICONS = {
  reset: 'M7 2a5 5 0 1 1-4.6 3h1.7A3.5 3.5 0 1 0 7 3.5V5L4 2.75 7 .5V2Z',
  prev: 'M3 2h1.5v10H3V2Zm2 5 6-5v10L5 7Z',
  next: 'M9.5 2H11v10H9.5V2ZM9 7l-6 5V2l6 5Z',
  play: 'M4 2l8 5-8 5V2Z',
  pause: 'M3.5 2H6v10H3.5V2Zm4.5 0h2.5v10H8V2Z',
};

/** Reset, previous, play/pause and next, then the tick ruler with its needle and readout. */
export function Stepper(props: StepperProps) {
  const { step, last, playing, locked, gateOpen, autoplay, concepts, narrations, phases } = props;
  const [hover, setHover] = useState<number | null>(null);
  const width = Math.max(2, String(last).length);
  const at = (n: number) => ({ '--at': last === 0 ? 0 : n / last }) as CSSProperties;
  const ignoreWhen = (blocked: boolean, run: () => void) => () => {
    if (!blocked) run();
  };

  return (
    <div className={styles.stepper}>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.button}
          aria-label="Reset"
          title="Reset (r)"
          aria-keyshortcuts="r"
          onClick={props.onReset}
        >
          <Icon d={ICONS.reset} />
        </button>
        <button
          type="button"
          className={styles.button}
          aria-label="Previous step"
          title="Previous step (← or h)"
          aria-keyshortcuts="ArrowLeft h"
          aria-disabled={!gateOpen || step === 0}
          onClick={ignoreWhen(!gateOpen || step === 0, props.onPrev)}
        >
          <Icon d={ICONS.prev} />
        </button>
        <button
          type="button"
          className={styles.button}
          aria-label={playing ? 'Pause' : 'Play'}
          title={
            playing
              ? 'Pause (space)'
              : autoplay
                ? 'Play (space)'
                : 'Autoplay is off with reduced motion'
          }
          aria-keyshortcuts="Space"
          aria-disabled={!playing && (locked || !autoplay)}
          onClick={ignoreWhen(!playing && (locked || !autoplay), props.onTogglePlay)}
        >
          <Icon d={playing ? ICONS.pause : ICONS.play} />
        </button>
        <button
          type="button"
          className={styles.button}
          aria-label="Next step"
          title="Next step (→ or l)"
          aria-keyshortcuts="ArrowRight l"
          aria-disabled={locked || step === last}
          onClick={ignoreWhen(locked || step === last, props.onNext)}
        >
          <Icon d={ICONS.next} />
        </button>
      </div>

      <div className={styles.ruler} data-phases={phases.length > 0 || undefined}>
        {phases.map((phase) => (
          <button
            key={phase.label}
            type="button"
            className={styles.phase}
            style={at(phase.step)}
            aria-disabled={!gateOpen}
            onClick={ignoreWhen(!gateOpen, () => props.onSeek(phase.step))}
          >
            {phase.label}
          </button>
        ))}
        {hover !== null && hover <= props.lastPreviewable && (
          <p className={styles.preview} aria-hidden="true">
            <strong>{pad(hover, width)}</strong> {narrations[hover]}
          </p>
        )}
        <div className={styles.marks} aria-hidden="true">
          {concepts.map((concept, n) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: one tick per step, never reordered
            <span key={n}>
              <span className={styles.tick} data-fifth={n % 5 === 0 || undefined} style={at(n)} />
              {concept && <span className={styles.dot} data-concept={concept} style={at(n)} />}
            </span>
          ))}
        </div>
        <input
          type="range"
          className={styles.range}
          min={0}
          max={last}
          step={1}
          value={step}
          aria-label="Step"
          aria-valuetext={`Step ${step} of ${last}`}
          aria-disabled={!gateOpen || undefined}
          onChange={(e) => {
            if (gateOpen) props.onSeek(Number(e.currentTarget.value));
          }}
          onPointerMove={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - box.left) / box.width;
            setHover(Math.max(0, Math.min(last, Math.round(ratio * last))));
          }}
          onPointerLeave={() => setHover(null)}
        />
      </div>

      <span className={styles.readout} aria-hidden="true">
        {pad(step, width)} / {pad(last, width)}
      </span>
    </div>
  );
}
