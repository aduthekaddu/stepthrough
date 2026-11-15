import { describe, expect, it } from 'vitest';
import { diffFrames } from './model.ts';
import {
  type Answer,
  initialPanelState,
  isCorrect,
  isPrompting,
  type PanelAction,
  type PanelContext,
  type PanelState,
  predictTargets,
  reducePanel,
} from './panel-state.ts';
import { fixture } from './test-traces.ts';

const ctx: PanelContext = { last: 10, pauseAt: [4], gateOpen: true };

function run(actions: PanelAction[], context = ctx, from: PanelState = initialPanelState) {
  return actions.reduce((state, action) => reducePanel(state, action, context), from);
}

const answer: Answer = { target: { kind: 'none', label: 'Only the line moves' }, correct: false };

describe('reducePanel', () => {
  it('ignores stepping until the gate opens, but still resets', () => {
    const closed = { ...ctx, gateOpen: false };
    expect(run([{ type: 'next', at: 1 }], closed).step).toBe(0);
    expect(run([{ type: 'toggle-play', at: 1 }], closed).playing).toBe(false);
    const moved = { ...initialPanelState, step: 3 };
    expect(run([{ type: 'reset', at: 1 }], closed, moved).step).toBe(0);
  });

  it('stops at an unanswered pause step, even when seeking past it', () => {
    const state = run([{ type: 'seek', step: 9, at: 1 }]);
    expect(state.step).toBe(4);
    expect(isPrompting(state, ctx)).toBe(true);
    expect(run([{ type: 'next', at: 2 }], ctx, state).step).toBe(4);
    expect(run([{ type: 'prev', at: 2 }], ctx, state).step).toBe(3);
  });

  it('records the answer and reveals the next step', () => {
    const state = run([
      { type: 'seek', step: 4, at: 1 },
      { type: 'answer', answer, at: 2 },
    ]);
    expect(state.step).toBe(5);
    expect(state.answers.get(4)).toEqual(answer);
    expect(
      run(
        [
          { type: 'seek', step: 2, at: 3 },
          { type: 'seek', step: 9, at: 4 },
        ],
        ctx,
        state,
      ).step,
    ).toBe(9);
  });

  it('autoplay pauses at a prompt and at the end', () => {
    let state = run([{ type: 'toggle-play', at: 0 }]);
    for (let t = 1; t <= 6; t++) state = reducePanel(state, { type: 'tick', at: t }, ctx);
    expect(state).toMatchObject({ step: 4, playing: false });
    state = run(
      [
        { type: 'answer', answer, at: 7 },
        { type: 'toggle-play', at: 8 },
      ],
      ctx,
      state,
    );
    for (let t = 9; t <= 20; t++) state = reducePanel(state, { type: 'tick', at: t }, ctx);
    expect(state).toMatchObject({ step: 10, playing: false });
  });

  it('keeps the time of the previous move so fast input can skip animation', () => {
    const state = run([
      { type: 'next', at: 100 },
      { type: 'next', at: 150 },
    ]);
    expect(state.movedAt - state.prevMovedAt).toBe(50);
  });
});

describe('predict targets', () => {
  const closure = fixture('closure-counter');
  const countWrite = closure.frames.findIndex((f) =>
    f.envs.some((e) =>
      e.bindings.some(
        (b) => b.name === 'count' && b.state.kind === 'primitive' && b.state.text === '1',
      ),
    ),
  );
  const before = closure.frames[countWrite - 1];
  const after = closure.frames[countWrite];

  it('offers the bindings in scope and marks the one that changes as correct', () => {
    if (!before || !after) throw new Error('fixture changed');
    const targets = predictTargets(before);
    const changes = diffFrames(before, after, null);
    const right = targets.filter((t) => isCorrect(t, changes)).map((t) => t.label);
    expect(right).toEqual(['count in make() call']);
    expect(targets.map((t) => t.label)).toContain('Only the line moves');
  });
});
