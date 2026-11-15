import type { Metadata } from 'next';
import { Viz, type VizProps } from '@/components/viz/Viz.tsx';
import { GateButton } from './GateButton.tsx';

export const metadata: Metadata = { title: 'Visualizer playground · Stepthrough' };

const FIXTURES: (VizProps & { id: string; heading: string; note: string })[] = [
  {
    id: 'hoisting',
    heading: 'Hoisting and the temporal dead zone',
    note: 'Before line 1 runs, every name already has a binding. let and const start uninitialized.',
    example: 'fixtures/hoisting-tdz',
    view: 'scope',
    title: 'Hoisting',
  },
  {
    id: 'closure',
    heading: 'A record that outlives its call',
    note: 'After make() returns, its record stays because inc still points to it.',
    example: 'fixtures/closure-counter',
    view: 'both',
    title: 'Closure',
  },
  {
    id: 'closure-scope',
    heading: 'The same closure, scope lanes only, with a gate and a next-step prediction',
    note: 'Stepping unlocks after you commit. At step 6 it asks what changes next.',
    example: 'fixtures/closure-counter',
    view: 'scope',
    title: 'Closure, scope chain',
    gate: 'playground-closure',
    pauseAt: [6],
  },
  {
    id: 'aliasing',
    heading: 'Two names, one object',
    note: 'b = a copies the reference, so a change through b is seen through a.',
    example: 'fixtures/aliasing',
    view: 'memory',
    title: 'Aliasing',
  },
  {
    id: 'for-let',
    heading: 'A fresh record per loop iteration',
    note: 'Each arrow function keeps the record of the iteration that made it.',
    example: 'fixtures/for-let-closures',
    view: 'both',
    title: 'for and let',
  },
  {
    id: 'recursion',
    heading: 'Recursion: fact(3)',
    note: 'Every call gets its own record. Each record’s outer link is Global, not the call below.',
    example: 'fixtures/recursion-fact',
    view: 'scope',
    title: 'Recursion',
    phases: [
      { label: 'calls', step: 2 },
      { label: 'returns', step: 7 },
    ],
  },
  {
    id: 'cycle',
    heading: 'Cycles and array holes',
    note: 'box.self points back at box. slots[1] is an empty slot, which is not undefined.',
    example: 'fixtures/cycle-and-holes',
    view: 'memory',
    title: 'Cycle and holes',
  },
];

export default function VizPlayground() {
  return (
    <main className="mx-auto max-w-[1100px] px-4 py-12 [counter-reset:viz-figure]">
      <h1 className="text-3xl">Visualizer playground</h1>
      <p className="mt-2 max-w-[66ch]">
        Every fixture in <code>apps/web/viz-fixtures</code>, traced by the real engine at build
        time. Click a figure’s diagram or a control, then use the arrow keys, space and r.
      </p>
      {FIXTURES.map(({ id, heading, note, ...viz }) => (
        <section key={id} id={id} aria-labelledby={`${id}-heading`} className="mt-12">
          <h2 id={`${id}-heading`} className="text-xl">
            {heading}
          </h2>
          <p className="mt-1 max-w-[66ch]">{note}</p>
          {viz.gate && (
            <p className="mt-3">
              <GateButton id={viz.gate} />
            </p>
          )}
          <Viz {...viz} />
        </section>
      ))}
    </main>
  );
}
