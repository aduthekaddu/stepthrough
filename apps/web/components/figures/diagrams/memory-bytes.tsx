import styles from '../figures.module.css';
import { type Byte, ByteRow, Reveal, Span } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';

const VALUES = [12, 200, 0, 255, 61, 7, 128, 3];
const READ_AT = 3;

/**
 * 1000 = 3 × 256 + 232 takes two bytes. x86-64 stores the low byte first, so it sits in
 * addresses 6 and 7 as 232, 3 (checked: new Uint8Array(new Uint16Array([1000]).buffer)).
 * Steps: 0 a row of bytes, 1 a read by address, 2 a number that needs two bytes, 3 a Uint8Array.
 */
function Draw({ step }: DiagramProps) {
  const values = step >= 2 ? [...VALUES.slice(0, 6), 232, 3] : VALUES;
  const ram: Byte[] = values.map((v, i) => ({
    text: String(v),
    at: String(i),
    focus: (step === 1 && i === READ_AT) || (step === 2 && i >= 6),
    dim: (step === 1 && i !== READ_AT) || (step === 2 && i < 6),
  }));
  return (
    <div className={styles.stack}>
      <div>
        <p className={styles.rowLabel}>memory · address above, value inside</p>
        <div className={styles.byteGrid}>
          <ByteRow bytes={ram} label="Memory, eight bytes" />
          <div className={styles.spans}>
            <Reveal
              show={step === 1}
              className={styles.spanAt}
              style={{ gridColumn: '4 / span 1' }}
            >
              <Span cells={1}>read</Span>
            </Reveal>
            <Reveal
              show={step === 2}
              className={styles.spanAt}
              style={{ gridColumn: '7 / span 2' }}
            >
              <Span cells={2}>1000</Span>
            </Reveal>
          </div>
        </div>
      </div>
      <Reveal show={step >= 3}>
        <p className={styles.rowLabel}>
          <code>new Uint8Array(4)</code> · index above
        </p>
        <ByteRow
          bytes={[0, 1, 2, 3].map((i) => ({ text: '0', at: String(i) }))}
          label="A Uint8Array of four bytes"
        />
      </Reveal>
    </div>
  );
}

export const MemoryBytes: DiagramSpec = { steps: 4, Component: Draw };
