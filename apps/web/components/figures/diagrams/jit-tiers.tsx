import figures from '../figures.module.css';
import { Dim, Reveal } from '../parts.tsx';
import type { DiagramProps, DiagramSpec } from '../registry.ts';
import css from './jit.module.css';
import { Tier, VArrow } from './jit-parts.tsx';

/**
 * Steps: 0 the four tiers with `add` on Ignition, 1 feedback records the types seen, 2 `add` is
 * hot and V8 may move it to a compiled tier, 3 Maglev and TurboFan make often speculative code
 * from that feedback, and all of it is V8's choice. Facts: V8 blog posts Sparkplug (2021) and
 * Maglev (2023), and `node --jitless`. The arrow points at the compiled group, not one rung: V8
 * picks the tier, and one measured run took `add` from Ignition straight to Maglev.
 */
function Draw({ step }: DiagramProps) {
  const hot = step >= 2;
  const guessing = step >= 3;
  const speculative = (
    <Reveal show={guessing} className={css.tag}>
      often speculative
    </Reveal>
  );
  return (
    <div className={css.split}>
      <div className={css.ladder}>
        <p className={figures.rowLabel}>V8's four tiers</p>
        <Dim dim={step === 1}>
          <div className={css.group} data-on={hot || undefined}>
            <Tier name="TurboFan" makes="peak machine code" aside={speculative} />
            <Tier name="Maglev" makes="optimized machine code" aside={speculative} />
            <Dim dim={guessing}>
              <Tier name="Sparkplug" makes="quick machine code" />
            </Dim>
            <Reveal show={hot}>
              <p className={css.groupLabel}>Compiled: machine code the CPU runs directly</p>
            </Reveal>
          </div>
        </Dim>
        <Dim dim={guessing}>
          <Reveal show={hot} className={css.climb}>
            <span>
              hot: V8 may move <code>add</code> up
            </span>
            <VArrow dir="up" />
          </Reveal>
        </Dim>
        <div className={css.group}>
          <Tier
            name="Ignition"
            makes="bytecode in an interpreter"
            aside={
              <div className={css.fnWrap}>
                <Reveal show={hot} className={css.tag}>
                  hot
                </Reveal>
                <div className={css.fn}>add</div>
              </div>
            }
          />
        </div>
      </div>
      <div className={css.tiersSide}>
        <Reveal show={step >= 1} className={css.box}>
          <p className={figures.rowLabel}>
            feedback for <code>add</code> · types seen
          </p>
          <p className={css.line}>
            <code>a + b</code>: both small integers
          </p>
          <Reveal show={guessing}>
            <p className={css.line}>Maglev and TurboFan use this to make often speculative code</p>
          </Reveal>
        </Reveal>
        <Reveal show={guessing}>
          <p className={css.caveat}>
            Tiers, thresholds and timing are V8's choices, not language rules.{' '}
            <code>node --jitless</code> runs V8 with the JIT off.
          </p>
        </Reveal>
      </div>
    </div>
  );
}

export const JitTiers: DiagramSpec = { steps: 4, Component: Draw };
