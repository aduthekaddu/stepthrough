import type { ReactNode } from 'react';
import figures from '../figures.module.css';
import { type Byte, ByteRow, Span } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import css from './engine.module.css';

/** One bytecode instruction: its offset, its bytes and its name as V8 prints it. */
type Instr = { at: number; bytes: readonly string[]; text: string };

const INSTRS: readonly Instr[] = [
  { at: 0, bytes: ['0b', '04'], text: 'Ldar a1' },
  { at: 2, bytes: ['40', '03', '00'], text: 'Add a0, FBV[0]' },
  { at: 5, bytes: ['b7'], text: 'Return' },
];

/** What Ignition holds after each step; step n (from 1) has just run instruction n. */
type State = { acc?: number; feedback?: string; returned?: number };

const AFTER: readonly State[] = [
  {},
  { acc: 3 },
  { acc: 5, feedback: 'both were small integers' },
  { acc: 5, feedback: 'both were small integers', returned: 5 },
];

const SOURCE = 'function add(a, b) { return a + b; }';

function Slot({
  name,
  value,
  changed = false,
}: {
  name: ReactNode;
  value: string | number | undefined;
  changed?: boolean;
}) {
  return (
    <div className={css.slot} data-changed={changed || undefined}>
      <dt>{name}</dt>
      <dd
        data-unset={value === undefined || undefined}
        data-words={typeof value === 'string' || undefined}
      >
        {value ?? 'empty'}
      </dd>
    </div>
  );
}

/**
 * V8's interpreter, Ignition, running add(2, 3) from its bytecode.
 * Steps: 0 the source, the 6 bytecode bytes as three instructions, and the slots (a0 = 2,
 * a1 = 3, an empty accumulator and feedback slot 0); 1 Ldar a1 loads b, 3, into the
 * accumulator; 2 Add a0, FBV[0] adds a to it, leaving 5, and feedback slot 0 notes both were
 * small integers; 3 Return hands the accumulator, 5, back to the caller.
 * Facts: lesson 0.1 engine brief (node --print-bytecode on Node v26, V8 14.6; V8 blog, Maglev).
 */
function Draw({ step }: DiagramProps) {
  const now = AFTER[step] ?? {};
  const before = AFTER[step - 1] ?? {};
  const current = step - 1;
  const bytes: Byte[] = INSTRS.flatMap((instr, i) =>
    instr.bytes.map((text, j) => ({
      text,
      // A blank label keeps every cell at the same height as the labelled ones.
      at: j === 0 ? String(instr.at) : '\u00a0',
      focus: i === current,
      dim: current >= 0 && i !== current,
    })),
  );
  return (
    <div className={css.ignition}>
      <div className={css.source}>
        <p className={figures.rowLabel}>source and call</p>
        <pre className={figures.source}>{SOURCE}</pre>
        <p className={css.call}>
          <code>add(2, 3)</code>
          <span className={css.returned} data-show={now.returned !== undefined || undefined}>
            returns <code>{now.returned ?? 5}</code>
          </span>
        </p>
      </div>
      <div className={css.bytecode}>
        <p className={figures.rowLabel}>bytecode · 6 bytes · offset above · Ignition reads them</p>
        <div className={figures.byteGrid}>
          <ByteRow bytes={bytes} label="Bytecode of add, six bytes" />
          <div className={figures.spans}>
            {INSTRS.map((instr, i) => (
              <Span key={instr.at} cells={instr.bytes.length}>
                <span
                  className={css.instr}
                  data-state={current < 0 ? undefined : i === current ? 'current' : 'other'}
                  aria-current={i === current ? 'step' : undefined}
                >
                  {instr.text}
                </span>
              </Span>
            ))}
          </div>
        </div>
      </div>
      <div className={css.slotsArea}>
        <p className={figures.rowLabel}>Ignition's slots</p>
        <dl className={css.slots}>
          <Slot
            name={
              <>
                <code>a0</code> is a
              </>
            }
            value={2}
          />
          <Slot
            name={
              <>
                <code>a1</code> is b
              </>
            }
            value={3}
          />
          <Slot name="accumulator" value={now.acc} changed={now.acc !== before.acc} />
          <Slot
            name={
              <>
                feedback slot <code>FBV[0]</code>
              </>
            }
            value={now.feedback}
            changed={now.feedback !== before.feedback}
          />
        </dl>
      </div>
    </div>
  );
}

export const IgnitionBytecode: DiagramSpec = { steps: 4, Component: Draw };
