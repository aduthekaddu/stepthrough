import styles from '../figures.module.css';
import { type Byte, ByteRow, Flow, Reveal, Span, Unit } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';

const BITS = '10001101'.split('').map((b): Byte => ({ text: b }));

const SOURCE = `int add(int a, int b) {
  return a + b;
}`;

/**
 * Real gcc 13.3 output for add.c (-O1 -fcf-protection=none, x86-64 Linux), as in the lesson.
 * Steps: 0 one byte, 1 gcc turns add.c into four bytes, 2 what the bytes mean, 3 an ARM chip.
 */
function Draw({ step }: DiagramProps) {
  const bytes: Byte[] = ['8d', '04', '37', 'c3'].map((text) => ({ text }));
  return (
    <div className={styles.stack}>
      <div className={styles.byteAnatomy}>
        <ByteRow bytes={BITS} label="Eight bits" />
        <p className={styles.note}>
          8 bits = 1 byte = hex <code>8d</code> = 141
        </p>
      </div>
      <Reveal show={step >= 1}>
        <div className={styles.flowRow}>
          <Unit kind="file" label="add.c" title="C source">
            <pre className={styles.source}>{SOURCE}</pre>
          </Unit>
          <Flow label="gcc compiles it" />
          <Unit kind="plain" label="machine code" title="4 bytes">
            <div className={styles.byteGrid}>
              <ByteRow bytes={bytes} label="Machine code bytes" />
              <Reveal show={step >= 2} className={styles.spans}>
                <Span cells={3}>
                  <code>lea</code> adds a and b
                </Span>
                <Span cells={1}>
                  <code>ret</code> returns
                </Span>
              </Reveal>
            </div>
          </Unit>
        </div>
      </Reveal>
      <Reveal show={step >= 3}>
        <div className={styles.pair}>
          <Unit kind="cpu" label="x86-64 laptop" title="CPU">
            <p className={styles.note}>runs these 4 bytes</p>
          </Unit>
          <Unit kind="cpu" label="ARM phone" title="CPU" focus>
            <p className={styles.note}>
              numbers its instructions differently, so they mean nothing useful
            </p>
          </Unit>
        </div>
      </Reveal>
    </div>
  );
}

export const MachineCode: DiagramSpec = { steps: 4, Component: Draw };
