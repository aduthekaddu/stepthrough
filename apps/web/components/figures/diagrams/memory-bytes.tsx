import styles from '../figures.module.css';
import { type Byte, ByteRow, Reveal, Span } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';

const VALUES = [12, 200, 0, 255, 61, 7, 128, 3];
const READ_AT = 3;

/** 1000 needs ten bits, so it takes two bytes: 00000011 and 11101000 (3 × 256 + 232). */
const BIG = ['00000011', '11101000'].map((text): Byte => ({ text }));

/** Steps: 0 a row of bytes, 1 a read by address, 2 a number that needs two bytes, 3 a Uint8Array. */
function Draw({ step }: DiagramProps) {
  const ram: Byte[] = VALUES.map((v, i) => ({
    text: String(v),
    at: String(i),
    focus: step === 1 && i === READ_AT,
    dim: step === 1 && i !== READ_AT,
  }));
  return (
    <div className={styles.stack}>
      <div>
        <p className={styles.rowLabel}>memory · address above, value inside</p>
        <ByteRow bytes={ram} label="Memory, eight bytes" />
        <Reveal show={step === 1}>
          <p className={styles.note}>
            read address {READ_AT} → {VALUES[READ_AT]}
          </p>
        </Reveal>
      </div>
      <Reveal show={step >= 2}>
        <p className={styles.rowLabel}>1000 is bigger than 255</p>
        <div className={styles.byteGrid} data-wide="">
          <ByteRow bytes={BIG} label="1000 as two bytes" />
          <div className={styles.spans}>
            <Span cells={2}>one number, two bytes side by side</Span>
          </div>
        </div>
      </Reveal>
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
