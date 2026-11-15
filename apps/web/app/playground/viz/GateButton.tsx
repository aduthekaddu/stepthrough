'use client';

import { commitPrediction, useGateOpen } from '@/components/viz/predictions.ts';

/** Stands in for a lesson's Predict block: committing unlocks the gated figure. */
export function GateButton({ id }: { id: string }) {
  const open = useGateOpen(id);
  return (
    <button
      type="button"
      className="rounded border border-[var(--muted)] px-3 py-1.5 text-sm"
      aria-disabled={open}
      onClick={() => commitPrediction(id)}
    >
      {open ? 'Prediction committed' : 'Commit my prediction'}
    </button>
  );
}
