'use client';

import { type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AUTOPLAY_MS,
  initialPanelState,
  lastPreviewable,
  type PanelAction,
  type PanelContext,
  reducePanel,
  stepKeyAction,
} from '../viz/panel-state.ts';
import { useGateOpen } from '../viz/predictions.ts';
import { usePrefersReducedMotion } from '../viz/reduced-motion.ts';

const NO_PAUSES: readonly number[] = [];
const now = () => performance.now();

/** Step state for a figure with `steps` steps, shared with the trace visualizer's reducer. */
export function useSteps(steps: number, gate: string | undefined) {
  const gateOpen = useGateOpen(gate);
  const autoplay = !usePrefersReducedMotion();
  const ctx: PanelContext = useMemo(
    () => ({ last: steps - 1, pauseAt: NO_PAUSES, gateOpen, autoplay }),
    [steps, gateOpen, autoplay],
  );
  const [state, setState] = useState(initialPanelState);
  const dispatch = useCallback(
    (action: PanelAction) => setState((s) => reducePanel(s, action, ctx)),
    [ctx],
  );

  useEffect(() => {
    if (!state.playing) return;
    const id = setInterval(() => dispatch({ type: 'tick', at: now() }), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [state.playing, dispatch]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const type = stepKeyAction(e);
    if (!type) return;
    e.preventDefault();
    dispatch({ type, at: now() });
  };

  const controls = {
    onReset: () => dispatch({ type: 'reset', at: now() }),
    onPrev: () => dispatch({ type: 'prev', at: now() }),
    onNext: () => dispatch({ type: 'next', at: now() }),
    onTogglePlay: () => dispatch({ type: 'toggle-play', at: now() }),
    onSeek: (step: number) => dispatch({ type: 'seek', step, at: now() }),
  };

  return {
    step: Math.min(state.step, steps - 1),
    playing: state.playing,
    gateOpen,
    autoplay,
    lastPreviewable: lastPreviewable(state, ctx),
    onKeyDown,
    controls,
  };
}
