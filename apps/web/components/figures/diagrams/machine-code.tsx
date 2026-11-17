import styles from '../figures.module.css';
import { type Byte, ByteRow, Dim, Flow, Reveal, Span, Unit } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';

const BITS = '10001101'.split('').map((b): Byte => ({ text: b }));

const SOURCE = `int add(int a, int b) {
  return a + b;
}`;

/**
 * Real gcc 13.3 output for add.c (-O1 -fcf-protection=none, x86-64 Linux), re-checked with
 * objdump. Steps: 0 one byte up close, 1 gcc made these bytes, 2 what they mean, 3 an ARM chip.
 */
function Draw({ step }: DiagramProps) {
  const bytes: Byte[] = ['8d', '04', '37', 'c3'].map((text, i) => ({
    text,
    focus: step === 0 && i === 0,
    dim: step === 0 && i > 0,
  }));
  return (
    <div className={styles.stack}>
      <Dim dim={step === 0}>
        <div className={styles.flowRow}>
          <Unit kind="file" label="add.c" title="C source">
            <pre className={styles.source}>{SOURCE}</pre>
          </Unit>
          <Flow label="gcc compiles it" />
        </div>
      </Dim>
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
        <Dim dim={step > 0}>
          <div className={styles.bits}>
            <span className={styles.note}>
              <code>8d</code> =
            </span>
            <div className={styles.byteGrid} data-small="">
              <ByteRow bytes={BITS} label="The byte 8d as eight bits" />
            </div>
            <span className={styles.note}>= 141</span>
          </div>
        </Dim>
      </Unit>
      <Reveal show={step >= 3}>
        <div className={styles.pair} data-always="">
          <Unit kind="cpu" label="x86-64 laptop" title="CPU">
            <p className={styles.note}>runs these bytes</p>
          </Unit>
          <Unit kind="cpu" label="ARM phone" title="CPU" focus>
            <p className={styles.note}>other numbers: no use</p>
          </Unit>
        </div>
      </Reveal>
    </div>
  );
}

export const MachineCode: DiagramSpec = { steps: 4, Component: Draw };
