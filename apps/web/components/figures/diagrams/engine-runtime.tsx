import { Reveal } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import css from './engine.module.css';

/** A name in a list of parts: code (`fs`) or a plain word (numbers), with an optional gloss. */
type Part = { name: string; code?: boolean; note?: string; absent?: boolean };

const LANGUAGE: readonly Part[] = [
  { name: 'numbers' },
  { name: 'strings' },
  { name: 'objects' },
  { name: 'functions' },
  { name: 'Math', code: true },
  { name: 'Array', code: true },
  { name: 'JSON', code: true },
];

const CONSOLE: Part = { name: 'console', code: true, note: 'not in ECMAScript' };

type Runtime = { name: string; step: number; adds: readonly Part[] };

const RUNTIMES: readonly Runtime[] = [
  {
    name: 'browser (Chrome)',
    step: 1,
    adds: [
      { name: 'document', code: true, note: 'the page' },
      { name: 'setTimeout', code: true, note: 'timers' },
      { name: 'fetch', code: true },
      CONSOLE,
    ],
  },
  {
    name: 'Node',
    step: 2,
    adds: [
      { name: 'document', code: true, note: 'no page', absent: true },
      { name: 'fs', code: true, note: 'files' },
      { name: 'net', code: true, note: 'sockets' },
      { name: 'process', code: true, note: 'its own process' },
      { name: 'setTimeout', code: true, note: 'its own timers' },
      CONSOLE,
    ],
  },
];

function Parts({ parts, label }: { parts: readonly Part[]; label: string }) {
  return (
    <ul className={css.chips} aria-label={label}>
      {parts.map((p) => (
        <li key={p.name} className={css.chip} data-absent={p.absent || undefined}>
          {p.code ? <code>{p.name}</code> : p.name}
          {p.note && <span>{p.note}</span>}
        </li>
      ))}
    </ul>
  );
}

function Engine() {
  return (
    <div className={css.engine}>
      <p className={css.label}>engine</p>
      <p className={css.title}>V8</p>
      <p className={css.note}>knows the language; parses and runs your code</p>
      <Parts parts={LANGUAGE} label="What V8 knows" />
    </div>
  );
}

/**
 * The same engine inside two runtimes. A runtime's outline appears when its step arrives; on a
 * phone Node replaces the browser in step 2, on a wide stage they stand side by side.
 * Steps: 0 V8 alone with what the language has (numbers, strings, objects, functions, Math,
 * Array, JSON); 1 a browser runtime around it adding document, setTimeout, fetch and console;
 * 2 Node around the same engine adding fs, net, process, setTimeout and console, with no
 * document. Facts: lesson 0.1 engine brief (MDN, ECMAScript, the WHATWG Console Standard).
 */
function Draw({ step }: DiagramProps) {
  return (
    <div className={css.runtimes}>
      {RUNTIMES.map((r) => (
        <div key={r.name} data-replaced={step > r.step || undefined}>
          <Reveal show={r.step === 1 || step >= r.step}>
            <section
              className={css.runtime}
              data-show={step >= r.step || undefined}
              aria-label={step >= r.step ? `Runtime: ${r.name}` : 'Engine'}
            >
              <Reveal show={step >= r.step}>
                <p className={css.label}>runtime (host)</p>
                <p className={css.title}>{r.name}</p>
              </Reveal>
              <Engine />
              <Reveal show={step >= r.step}>
                <p className={css.label}>adds the outside world</p>
                <Parts parts={r.adds} label={`What ${r.name} adds`} />
              </Reveal>
            </section>
          </Reveal>
        </div>
      ))}
    </div>
  );
}

export const EngineRuntime: DiagramSpec = { steps: 3, Component: Draw };
