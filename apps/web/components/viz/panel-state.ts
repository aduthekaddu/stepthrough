import type { Frame } from '@stepthrough/trace';
import type { Change } from './model.ts';

/** A "what changes next?" answer the learner can click. */
export type PredictTarget =
  | { kind: 'binding'; envId: string; name: string; label: string }
  | { kind: 'push'; label: string }
  | { kind: 'pop'; label: string }
  | { kind: 'heap'; label: string }
  | { kind: 'none'; label: string };

export type Answer = { target: PredictTarget; correct: boolean };

export type PanelState = {
  step: number;
  playing: boolean;
  /** Answers to pause steps, by step. A pause step with no answer blocks forward moves. */
  answers: ReadonlyMap<number, Answer>;
  /** When the step last changed and the time before that, to skip animation on fast input. */
  movedAt: number;
  prevMovedAt: number;
};

export type PanelContext = {
  last: number;
  pauseAt: readonly number[];
  gateOpen: boolean;
};

export type PanelAction =
  | { type: 'next'; at: number }
  | { type: 'prev'; at: number }
  | { type: 'seek'; step: number; at: number }
  | { type: 'reset'; at: number }
  | { type: 'toggle-play'; at: number }
  | { type: 'tick'; at: number }
  | { type: 'answer'; answer: Answer; at: number };

export const initialPanelState: PanelState = {
  step: 0,
  playing: false,
  answers: new Map(),
  movedAt: Number.NEGATIVE_INFINITY,
  prevMovedAt: Number.NEGATIVE_INFINITY,
};

/** The first unanswered pause step in [from, to), where forward motion must stop. */
function firstPause(state: PanelState, ctx: PanelContext, from: number, to: number) {
  return ctx.pauseAt
    .filter((p) => p >= from && p < to && !state.answers.has(p))
    .reduce<number | null>((min, p) => (min === null || p < min ? p : min), null);
}

export function isPrompting(state: PanelState, ctx: PanelContext): boolean {
  return ctx.gateOpen && ctx.pauseAt.includes(state.step) && !state.answers.has(state.step);
}

function moveTo(state: PanelState, ctx: PanelContext, target: number, at: number): PanelState {
  const wanted = Math.max(0, Math.min(ctx.last, target));
  const stop = wanted > state.step ? firstPause(state, ctx, state.step, wanted) : null;
  const step = stop ?? wanted;
  if (step === state.step) return state;
  const next = { ...state, step, movedAt: at, prevMovedAt: state.movedAt };
  const blocked = ctx.pauseAt.includes(step) && !state.answers.has(step);
  return step === ctx.last || blocked ? { ...next, playing: false } : next;
}

export function reducePanel(state: PanelState, action: PanelAction, ctx: PanelContext): PanelState {
  if (action.type === 'reset')
    return { ...state, step: 0, playing: false, movedAt: action.at, prevMovedAt: state.movedAt };
  if (!ctx.gateOpen) return state;
  switch (action.type) {
    case 'next':
    case 'tick':
      return moveTo(state, ctx, state.step + 1, action.at);
    case 'prev':
      return moveTo({ ...state, playing: false }, ctx, state.step - 1, action.at);
    case 'seek':
      return moveTo({ ...state, playing: false }, ctx, action.step, action.at);
    case 'toggle-play': {
      if (state.playing) return { ...state, playing: false };
      if (isPrompting(state, ctx)) return state;
      if (state.step === ctx.last)
        return { ...state, step: 0, playing: true, movedAt: action.at, prevMovedAt: state.movedAt };
      return { ...state, playing: true };
    }
    case 'answer': {
      const answers = new Map(state.answers).set(state.step, action.answer);
      return moveTo({ ...state, answers }, ctx, state.step + 1, action.at);
    }
  }
}

const MAX_BINDING_TARGETS = 6;

/** Choices for "what changes next?" at this frame. */
export function predictTargets(frame: Frame): PredictTarget[] {
  const bindings = frame.envs
    .flatMap((env) =>
      env.bindings.map(
        (b): PredictTarget => ({
          kind: 'binding',
          envId: env.id,
          name: b.name,
          label: env.kind === 'global' ? b.name : `${b.name} in ${env.label}`,
        }),
      ),
    )
    .slice(0, MAX_BINDING_TARGETS);
  return [
    ...bindings,
    { kind: 'push', label: 'A new call starts' },
    ...(frame.stack.length > 0 ? [{ kind: 'pop' as const, label: 'The running call ends' }] : []),
    { kind: 'heap', label: 'An object is created or changed' },
    { kind: 'none', label: 'Only the line moves' },
  ];
}

export function isCorrect(target: PredictTarget, changes: readonly Change[]): boolean {
  switch (target.kind) {
    case 'binding':
      return changes.some(
        (c) => c.kind === 'binding' && c.envId === target.envId && c.name === target.name,
      );
    case 'push':
      return changes.some((c) => c.kind === 'push');
    case 'pop':
      return changes.some((c) => c.kind === 'pop');
    case 'heap':
      return changes.some((c) => c.kind === 'heap-added' || c.kind === 'slot');
    case 'none':
      return !changes.some((c) => c.kind !== 'console');
  }
}
