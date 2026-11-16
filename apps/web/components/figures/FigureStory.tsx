'use client';

import { useEffect, useRef, useState } from 'react';
import viz from '../viz/viz.module.css';
import type { StoryItem } from './Figure.tsx';
import styles from './figures.module.css';
import { DIAGRAMS, type DiagramName } from './registry.ts';

type FigureStoryProps = {
  diagram: DiagramName;
  title: string;
  gate: string | undefined;
  items: readonly StoryItem[];
};

/**
 * Layout prototype A: the picture sticks to the screen while the captions scroll past it, and
 * the caption crossing the reading line sets the step. Other blocks (a Predict) scroll with the
 * captions under the same picture.
 */
export function FigureStory({ diagram, title, items }: FigureStoryProps) {
  const { Component: Diagram } = DIAGRAMS[diagram];
  const total = items.filter((i) => i.kind === 'step').length;
  const [step, setStep] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blocks = root.current?.querySelectorAll<HTMLElement>('[data-step]') ?? [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: '-60% 0px -30% 0px' },
    );
    for (const b of blocks) observer.observe(b);
    return () => observer.disconnect();
  }, []);

  let n = -1;
  return (
    <div ref={root} className={`${styles.story} breakout`} data-visual="">
      <figure className={`${viz.figure} ${styles.storyStage}`}>
        <figcaption className={viz.header}>
          <span className={viz.label}>{title}</span>
          <span className={styles.storyCount} aria-hidden="true">
            {String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </figcaption>
        <div className={styles.stage}>
          <Diagram step={step} />
        </div>
      </figure>
      <div className={styles.storySteps}>
        {items.map((item, i) => {
          if (item.kind === 'aside')
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed lesson content
              <div key={i} className={styles.storyAside}>
                {item.node}
              </div>
            );
          n += 1;
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed lesson content
              key={i}
              className={styles.storyStep}
              data-step={n}
              data-active={n === step || undefined}
            >
              <p>{item.caption}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
