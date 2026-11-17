import type { CSSProperties, ReactNode } from 'react';
import styles from './figures.module.css';

/**
 * Shared drawing parts for figures. A part that is not shown yet keeps its space, so the
 * picture never jumps between steps; it fades in when its step arrives.
 */
export function Reveal({
  show,
  children,
  className,
  style,
}: {
  show: boolean;
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}) {
  return (
    <div
      className={`${styles.reveal} ${className ?? ''}`}
      style={style}
      data-show={show || undefined}
    >
      {children}
    </div>
  );
}

/** Keeps a part on screen but fades it back, so the eye goes to what the step is about. */
export function Dim({ dim, children }: { dim: boolean; children: ReactNode }) {
  return (
    <div className={styles.dimmable} data-dim={dim || undefined}>
      {children}
    </div>
  );
}

export type UnitKind = 'cpu' | 'file' | 'unknown' | 'plain';

/** A labelled box. The CPU gets a dashed outer ring for its pins; an unknown box is dashed. */
export function Unit({
  kind,
  label,
  title,
  children,
  focus,
}: {
  kind: UnitKind;
  label?: string | undefined;
  title?: ReactNode;
  children?: ReactNode;
  focus?: boolean | undefined;
}) {
  return (
    <div className={styles.unit} data-kind={kind} data-focus={focus || undefined}>
      {label && <p className={styles.unitLabel}>{label}</p>}
      {title && <p className={styles.unitTitle}>{title}</p>}
      {children}
    </div>
  );
}

/** An arrow from the previous part to the next one: down on a phone, right on a wide panel. */
export function Flow({
  label,
  blocked = false,
  show = true,
}: {
  label?: ReactNode;
  blocked?: boolean;
  show?: boolean;
}) {
  return (
    <div className={styles.flow} data-blocked={blocked || undefined} data-show={show || undefined}>
      <svg className={styles.flowArrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path className={styles.flowShaft} d="M12 2v18" />
        <path className={styles.flowHead} d="M6 14l6 6 6-6" />
        {blocked && <path className={styles.flowCross} d="M6 5l12 10M18 5L6 15" />}
      </svg>
      {label && <span className={styles.flowLabel}>{label}</span>}
    </div>
  );
}

export type Byte = {
  /** The byte as shown, usually two hex digits or a decimal number. */
  text: string;
  /** An address or index shown above the cell. */
  at?: string | undefined;
  focus?: boolean | undefined;
  dim?: boolean | undefined;
};

/** A row of byte cells, the picture of memory used throughout the lesson. */
export function ByteRow({ bytes, label }: { bytes: readonly Byte[]; label: string }) {
  return (
    <ol className={styles.bytes} aria-label={label}>
      {bytes.map((b, i) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: cells are positions in a fixed row
          key={i}
          className={styles.byte}
          data-focus={b.focus || undefined}
          data-dim={b.dim || undefined}
        >
          {b.at !== undefined && <span className={styles.byteAt}>{b.at}</span>}
          <span className={styles.byteValue}>{b.text}</span>
        </li>
      ))}
    </ol>
  );
}

/** A bracket under a run of cells, naming what the run means. */
export function Span({ cells, children }: { cells: number; children: ReactNode }) {
  return (
    <div className={styles.span} style={{ gridColumn: `span ${cells}` }}>
      {children}
    </div>
  );
}
