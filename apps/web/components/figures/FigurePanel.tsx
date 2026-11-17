'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Stepper } from '../viz/Stepper.tsx';
import viz from '../viz/viz.module.css';
import styles from './figures.module.css';
import { DIAGRAMS, type DiagramName } from './registry.ts';
import { useSteps } from './use-steps.ts';

type FigurePanelProps = {
  diagram: DiagramName;
  title: string;
  gate: string | undefined;
  captions: readonly ReactNode[];
};

/**
 * A stepped figure as one card: the picture, the caption for the current step beside or under
 * it, and the stepper. Every caption is laid out in one cell so the card never changes height
 * while stepping and the buttons stay under the learner's thumb.
 */
export function FigurePanel({ diagram, title, gate, captions }: FigurePanelProps) {
  const { Component: Diagram } = DIAGRAMS[diagram];
  const last = captions.length - 1;
  const { step, playing, gateOpen, onKeyDown, controls } = useSteps(captions.length, gate);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const moved = useRef(false);

  useEffect(() => {
    if (!moved.current) {
      moved.current = true;
      return;
    }
    const text = captionRefs.current[step]?.textContent ?? '';
    setAnnouncement(`Step ${step + 1} of ${last + 1}. ${text}`);
  }, [step, last]);

  return (
    <figure
      className={`${viz.figure} ${styles.card} breakout`}
      data-visual=""
      onKeyDown={onKeyDown}
    >
      <figcaption className={viz.header}>
        <span className={viz.label}>{title}</span>
      </figcaption>
      <div className={styles.cardBody}>
        {/* biome-ignore lint/a11y/useSemanticElements: a fieldset would announce a form; this groups a diagram */}
        <div
          // biome-ignore lint/a11y/noNoninteractiveTabindex: the picture takes focus so the step keys work without first tabbing to a button
          tabIndex={0}
          role="group"
          className={styles.stage}
          aria-label={`Picture, step ${step + 1} of ${last + 1}`}
          aria-keyshortcuts="ArrowRight ArrowLeft Space R"
        >
          <Diagram step={step} />
        </div>
        <div className={styles.captions}>
          {captions.map((caption, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: captions are fixed, in step order
              key={i}
              ref={(el) => {
                captionRefs.current[i] = el;
              }}
              className={styles.caption}
              data-active={i === step || undefined}
              inert={i !== step}
            >
              {caption}
            </div>
          ))}
        </div>
      </div>
      <p className={viz.srOnly} aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {!gateOpen && <p className={viz.gateNote}>Answer the prediction below to start stepping.</p>}
      <Stepper
        step={step}
        last={last}
        playing={playing}
        locked={!gateOpen}
        gateOpen={gateOpen}
        concepts={captions.map(() => null)}
        narrations={captions}
        phases={[]}
        {...controls}
      />
    </figure>
  );
}
