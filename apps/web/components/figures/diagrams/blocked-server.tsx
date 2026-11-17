import type { ReactNode } from 'react';
import figures from '../figures.module.css';
import { Reveal } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import os from './os.module.css';

type Lane = 'main' | 'helper';

/** One stretch of work on a lane. `from` and `to` are percent of the lane; lengths are schematic. */
type Bar = { lane: Lane; from: number; to: number; label: ReactNode; steps: readonly number[] };

const BARS: readonly Bar[] = [
  {
    lane: 'main',
    from: 0,
    to: 60,
    label: (
      <>
        A: <code>pbkdf2Sync</code>
      </>
    ),
    steps: [1, 2],
  },
  { lane: 'main', from: 60, to: 76, label: 'B', steps: [2] },
  { lane: 'main', from: 76, to: 92, label: 'C', steps: [2] },
  { lane: 'main', from: 0, to: 14, label: 'A', steps: [3] },
  { lane: 'main', from: 14, to: 30, label: 'B', steps: [3] },
  { lane: 'main', from: 30, to: 46, label: 'C', steps: [3] },
  { lane: 'main', from: 60, to: 94, label: 'A callback', steps: [3] },
  { lane: 'helper', from: 14, to: 60, label: 'A: key derivation', steps: [3] },
];

const REQUESTS = [
  { id: 'A', what: <code>POST /secrets</code> },
  { id: 'B', what: 'another user' },
  { id: 'C', what: 'another user' },
];

function Track({ lane, label, step }: { lane: Lane; label: string; step: number }) {
  return (
    <div>
      <p className={figures.rowLabel}>{label}</p>
      <div className={os.track}>
        {BARS.filter((bar) => bar.lane === lane).map((bar) => (
          <Reveal
            key={`${bar.from}-${bar.steps.join()}`}
            show={bar.steps.includes(step)}
            className={os.bar}
            style={{
              insetInlineStart: `calc(${bar.from}% + 3px)`,
              inlineSize: `calc(${bar.to - bar.from}% - 6px)`,
            }}
          >
            {bar.label}
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/**
 * Steps: 0 one Express server, its two lanes and requests A, B and C arriving close together;
 * 1 sync version: A's handler runs pbkdf2Sync on the main thread while B and C wait; 2 B and C
 * run only after A finishes; 3 callback version: A's key derivation runs on Node's helper
 * threads, B and C run right away, then A's callback responds. Facts: Node's "Don't block the
 * event loop" guide (crypto.pbkdf2 is a Worker Pool API; the pool never runs your functions).
 */
function Draw({ step }: DiagramProps) {
  return (
    <div className={figures.stack}>
      <div>
        <p className={figures.rowLabel}>requests arrive close together</p>
        <ul className={os.requests}>
          {REQUESTS.map((r) => (
            <li key={r.id} className={os.request}>
              <strong>{r.id}</strong> {r.what}
            </li>
          ))}
        </ul>
      </div>
      <div className={os.layers}>
        <Reveal show={step === 0} className={os.mode}>
          one Express server
        </Reveal>
        <Reveal show={step === 1 || step === 2} className={os.mode}>
          sync version · <code>pbkdf2Sync(...)</code>
        </Reveal>
        <Reveal show={step === 3} className={os.mode}>
          callback version · <code>pbkdf2(..., callback)</code>
        </Reveal>
      </div>
      <div className={os.lanes}>
        <div>
          <Track lane="main" label="main thread · your JavaScript" step={step} />
          <div className={os.below}>
            <Reveal show={step === 1} className={os.waiting}>
              <span className={os.request}>
                <strong>B</strong> waits
              </span>
              <span className={os.request}>
                <strong>C</strong> waits
              </span>
            </Reveal>
            <Reveal show={step === 2} className={os.bracket} style={{ inlineSize: '60%' }}>
              B and C waited for A
            </Reveal>
          </div>
        </div>
        <Track lane="helper" label="helper threads · Node's pool" step={step} />
      </div>
    </div>
  );
}

export const BlockedServer: DiagramSpec = { steps: 4, Component: Draw };
