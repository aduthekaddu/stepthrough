import styles from '../figures.module.css';
import { Flow, Reveal, Unit } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';

const SOURCE = `function add(a, b) {
  return a + b;
}`;

/** Steps: 0 the source file, 1 the CPU that cannot read it, 2 a missing piece in between. */
function Draw({ step }: DiagramProps) {
  const missing = step >= 2;
  return (
    <div className={styles.flowRow}>
      <Unit kind="file" label="add.js" title="your text">
        <pre className={styles.source}>{SOURCE}</pre>
      </Unit>
      <Reveal show={step >= 1} className={styles.flowMiddle}>
        <Flow blocked={!missing} label={missing ? undefined : 'cannot read text'} />
        <Reveal show={missing}>
          <Unit kind="unknown" title="?">
            <p className={styles.note}>translates it, or carries it out</p>
          </Unit>
        </Reveal>
        <Flow show={missing} />
      </Reveal>
      <Reveal show={step >= 1}>
        <Unit kind="cpu" label="the chip" title="CPU">
          <p className={styles.note}>runs instructions written as numbers</p>
        </Unit>
      </Reveal>
    </div>
  );
}

export const TextVsChip: DiagramSpec = { steps: 3, Component: Draw };
