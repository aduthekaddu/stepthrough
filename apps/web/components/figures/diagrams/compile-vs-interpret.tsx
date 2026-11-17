import type { CSSProperties, ReactNode } from 'react';
import { Dim, Reveal } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import css from './engine.module.css';

type Lane = {
  file: string;
  language: string;
  /** Translates the source before the program starts. */
  compiler?: { tool: string; product: string; note: string };
  /** A program that reads the code and carries it out. */
  interpreter?: { name: string; note: string };
};

const LANES: readonly Lane[] = [
  {
    file: 'add.c',
    language: 'C source',
    compiler: { tool: 'gcc', product: 'machine code', note: 'made before the run' },
  },
  {
    file: 'add.sh',
    language: 'shell script',
    interpreter: { name: 'bash', note: 'interpreter, itself machine code' },
  },
  {
    file: 'Add.java',
    language: 'Java source',
    compiler: { tool: 'javac', product: 'bytecode', note: 'in .class files, made before the run' },
    interpreter: { name: 'JVM', note: 'its interpreter runs the bytecode' },
  },
];

/**
 * Grid lines along a lane. Arrows sit between boxes; a lane with no box at a line skips it.
 * Line 6 holds the JVM's hot-methods box on a phone, so the last arrow spans 6 and 7.
 */
const AT = { source: 1, product: 3, interpreter: 5, cpu: 8 } as const;

type Place = CSSProperties & Record<`--${string}`, string | number>;

const place = (lane: string | number, from: number, to: number): Place => ({
  '--lane': lane,
  '--from': from,
  '--to': to,
});

function Arrow({ label }: { label?: string | undefined }) {
  return (
    <div className={css.arrow}>
      {label && <span className={css.arrowLabel}>{label}</span>}
      <span className={css.shaft} />
      <svg className={css.head} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path d="M6 0v11M1.5 6.5 6 11l4.5-4.5" />
      </svg>
    </div>
  );
}

function Box({
  label,
  title,
  note,
  machine = false,
}: {
  label?: string;
  title: ReactNode;
  note: string;
  machine?: boolean;
}) {
  return (
    <div className={css.box} data-machine={machine || undefined}>
      {label && <p className={css.label}>{label}</p>}
      <p className={css.title}>{title}</p>
      <p className={css.note}>{note}</p>
    </div>
  );
}

function laneBoxes(lane: Lane): { at: number; box: ReactNode }[] {
  const boxes: { at: number; box: ReactNode }[] = [
    { at: AT.source, box: <Box title={<code>{lane.file}</code>} note={lane.language} /> },
  ];
  if (lane.compiler) {
    const { product, note } = lane.compiler;
    boxes.push({
      at: AT.product,
      box: <Box title={product} note={note} machine={product === 'machine code'} />,
    });
  }
  if (lane.interpreter) {
    const { name, note } = lane.interpreter;
    boxes.push({ at: AT.interpreter, box: <Box title={name} note={note} machine /> });
  }
  return boxes;
}

/**
 * Three ways to get source code running, one lane each, all ending at the same CPU. A box with
 * an ink edge is machine code the CPU can run.
 * Steps: 0 C, compiled by gcc to machine code before the run; 1 a shell script carried out by
 * bash, an interpreter that is itself machine code; 2 Java, compiled by javac to bytecode that
 * the JVM's interpreter runs; 3 the JVM also compiles hot (often run) methods to machine code.
 * Facts: lesson 0.1 engine brief and the java command docs, option -Xmixed.
 */
function Draw({ step }: DiagramProps) {
  const focus = Math.min(step, LANES.length - 1);
  return (
    <div className={css.lanes}>
      {LANES.map((lane, i) => {
        const boxes = laneBoxes(lane);
        return boxes.flatMap(({ at, box }, j) => {
          const next = boxes[j + 1]?.at ?? AT.cpu;
          const label = j === 0 ? lane.compiler?.tool : undefined;
          const cells: [number, number, ReactNode][] = [
            [at, at + 1, box],
            [at + 1, next, <Arrow key="arrow" label={label} />],
          ];
          return cells.map(([from, to, content]) => (
            <Reveal
              key={`${lane.file}-${from}`}
              show={step >= i}
              className={css.cell}
              style={place(i + 1, from, to)}
            >
              <Dim dim={i < focus}>{content}</Dim>
            </Reveal>
          ));
        });
      })}
      <Reveal show={step >= 3} className={`${css.cell} ${css.hotCell}`}>
        <Box
          label="JVM also"
          title="compiles hot methods"
          note="run often; to machine code"
          machine
        />
      </Reveal>
      <Reveal show={step >= 3} className={`${css.cell} ${css.hotArrow}`}>
        <Arrow />
      </Reveal>
      <div className={css.cell} style={place('1 / -1', AT.cpu, AT.cpu + 1)}>
        <div className={css.box} data-cpu="">
          <p className={css.label}>the chip</p>
          <p className={css.title}>CPU</p>
          <p className={css.note}>runs machine code</p>
        </div>
      </div>
    </div>
  );
}

export const CompileVsInterpret: DiagramSpec = { steps: 4, Component: Draw };
