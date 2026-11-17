import type { ReactNode } from 'react';
import { Reveal } from '../parts.tsx';
import css from './jit.module.css';

/**
 * One V8 tier as a box: its name with something at its right edge, what it makes on the full
 * width below (so a long line never squeezes the aside on a phone), then a body.
 */
export function Tier({
  name,
  makes,
  aside,
  running,
  children,
}: {
  name: string;
  makes: string;
  aside?: ReactNode;
  running?: boolean | undefined;
  children?: ReactNode;
}) {
  return (
    <div className={css.tier} data-running={running || undefined}>
      <div>
        <div className={css.tierHead}>
          <p className={css.tierName}>{name}</p>
          {aside}
        </div>
        <p className={css.tierMakes}>{makes}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * One version of a part per state, all in one cell: the tallest sets the height, so the
 * picture does not jump, and the record type makes every state draw something.
 */
export function Swap<K extends string>({
  show,
  parts,
}: {
  show: K;
  parts: Readonly<Record<K, ReactNode>>;
}) {
  return (
    <div className={css.swap}>
      {(Object.keys(parts) as K[]).map((key) => (
        <Reveal key={key} show={key === show}>
          {parts[key]}
        </Reveal>
      ))}
    </div>
  );
}

/** A short arrow between tiers stacked one above the other. */
export function VArrow({ dir, failed = false }: { dir: 'up' | 'down'; failed?: boolean }) {
  return (
    <svg
      className={css.varrow}
      data-failed={failed || undefined}
      viewBox="0 0 20 28"
      aria-hidden="true"
      focusable="false"
    >
      {dir === 'up' ? (
        <>
          <path d="M10 26V3" />
          <path d="M4 9l6-6 6 6" />
        </>
      ) : (
        <>
          <path d="M10 2v23" />
          <path d="M4 19l6 6 6-6" />
        </>
      )}
    </svg>
  );
}
