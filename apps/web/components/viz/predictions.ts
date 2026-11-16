import { useSyncExternalStore } from 'react';

/**
 * The bridge between a lesson's Predict blocks and the visualizers it gates. A Predict calls
 * `commitPrediction(id)` once the learner commits; every `<Viz gate={id}>` unlocks.
 */
const committed = new Set<string>();
const gateListeners = new Set<() => void>();

export function commitPrediction(id: string): void {
  if (committed.has(id)) return;
  committed.add(id);
  for (const listener of gateListeners) listener();
}

function subscribeGates(listener: () => void) {
  gateListeners.add(listener);
  return () => gateListeners.delete(listener);
}

/** True when no gate is set, or once its prediction is committed. */
export function useGateOpen(id: string | undefined): boolean {
  return useSyncExternalStore(
    subscribeGates,
    () => id === undefined || committed.has(id),
    () => id === undefined,
  );
}

export type NextFramePrediction = {
  traceId: string;
  step: number;
  /** The learner's choice, as shown on the button. */
  choice: string;
  correct: boolean;
};

const predictionListeners = new Set<(p: NextFramePrediction) => void>();

/** Learner state subscribes here to log "what changes next?" answers from every figure. */
export function onNextFramePrediction(listener: (p: NextFramePrediction) => void): () => void {
  predictionListeners.add(listener);
  return () => predictionListeners.delete(listener);
}

export function recordNextFramePrediction(prediction: NextFramePrediction): void {
  for (const listener of predictionListeners) listener(prediction);
}
