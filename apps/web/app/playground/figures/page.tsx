import type { Metadata } from 'next';
import figures from '@/components/figures/figures.module.css';
import { DIAGRAMS } from '@/components/figures/registry';
import viz from '@/components/viz/viz.module.css';

export const metadata: Metadata = { title: 'Figure gallery · Stepthrough' };

/**
 * Every registered diagram at every step, side by side, so a reviewer (and the phone test)
 * sees each state without stepping. Lessons add the captions.
 */
export default function FigureGallery() {
  return (
    <main id="main" className="mx-auto max-w-[1100px] px-4 py-12">
      <h1 className="text-3xl">Figure gallery</h1>
      <p className="mt-2 max-w-[66ch] [overflow-wrap:anywhere]">
        Each diagram in <code>apps/web/components/figures/diagrams</code>, drawn at every step.
      </p>
      {Object.entries(DIAGRAMS).map(([name, { steps, Component }]) => (
        <section key={name} id={name} aria-labelledby={`${name}-heading`} className="mt-12">
          <h2 id={`${name}-heading`} className="text-xl">
            {name}
          </h2>
          {Array.from({ length: steps }, (_, step) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: one figure per step
            <figure key={step} className={viz.figure} data-step={step}>
              <figcaption className={viz.header}>
                <span className={viz.label}>
                  {name}, step {step + 1} of {steps}
                </span>
              </figcaption>
              <div className={figures.stage}>
                <Component step={step} />
              </div>
            </figure>
          ))}
        </section>
      ))}
    </main>
  );
}
