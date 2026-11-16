import { describe, expect, it } from 'vitest';
import {
  describeStep,
  detachedRecords,
  diffFrames,
  displaySpan,
  eventConcept,
  ranLines,
  recordOwners,
  stateKey,
} from './model.ts';
import { fixture } from './test-traces.ts';

const closure = fixture('closure-counter');
const aliasing = fixture('aliasing');
const hoisting = fixture('hoisting-tdz');
const owners = recordOwners(closure);

const frameAt = (trace: typeof closure, step: number) => {
  const frame = trace.frames[step];
  if (!frame) throw new Error(`no step ${step}`);
  return frame;
};

/** Step where the stack first loses make()'s call. */
const afterMake = closure.frames.findIndex(
  (f, i) => i > 0 && f.stack.length === 1 && f.envs.some((e) => e.label === 'make() call'),
);

describe('diffFrames', () => {
  it('reports the popped call and keeps the record a closure still reaches', () => {
    const changes = diffFrames(frameAt(closure, afterMake - 1), frameAt(closure, afterMake), null);
    expect(changes).toContainEqual(expect.objectContaining({ kind: 'pop' }));
    expect(changes.some((c) => c.kind === 'record-removed')).toBe(false);
    expect(changes).toContainEqual(
      expect.objectContaining({
        kind: 'binding',
        name: 'counter',
        before: { kind: 'uninitialized' },
      }),
    );
  });

  it('sees a property write through an alias as a change to the one shared object', () => {
    const step = aliasing.frames.findIndex((f) => f.span?.startLine === 4);
    const changes = diffFrames(frameAt(aliasing, step - 1), frameAt(aliasing, step), null);
    const slots = changes.filter((c) => c.kind === 'slot');
    expect(slots).toEqual([
      expect.objectContaining({
        slot: 'n',
        before: expect.objectContaining({ text: '1' }),
        after: expect.objectContaining({ text: '2' }),
      }),
    ]);
  });
});

describe('eventConcept', () => {
  const concepts = closure.frames.map((f, i) =>
    eventConcept(diffFrames(closure.frames[i - 1] ?? null, f, closure.uncaught)),
  );

  it('marks calls on the stack lane and binding writes on the record lane', () => {
    const enterSteps = closure.frames.flatMap((f, i) => (f.kind === 'enter' ? [i] : []));
    for (const step of enterSteps) expect(concepts[step]).toBe('stack');
    const countWrite = closure.frames.findIndex((f) =>
      f.envs.some((e) =>
        e.bindings.some((b) => b.name === 'count' && stateKey(b.state) === 'number:1'),
      ),
    );
    expect(concepts[countWrite]).toBe('env');
  });

  it('marks nothing when only the line moves', () => {
    const quiet = diffFrames(frameAt(hoisting, 0), frameAt(hoisting, 0), null);
    expect(eventConcept(quiet)).toBeNull();
  });

  it('marks an uncaught error', () => {
    const frame = { ...frameAt(closure, 3), kind: 'throw' as const };
    expect(eventConcept(diffFrames(frameAt(closure, 3), frame, 'ReferenceError: x'))).toBe('error');
  });
});

describe('displaySpan and ranLines', () => {
  it('keeps the return line highlighted on a return frame', () => {
    const returnStep = closure.frames.findIndex((f) => f.kind === 'return');
    expect(displaySpan(closure.frames, returnStep)?.startLine).toBe(7);
    const spanless = closure.frames.map((f, i) => (i === returnStep ? { ...f, span: null } : f));
    expect(displaySpan(spanless, returnStep)?.startLine).toBe(7);
  });

  it('dots only lines that started before the current step', () => {
    const lines = ranLines(closure.frames, afterMake);
    expect(lines.has(9)).toBe(true);
    expect(lines.has(10)).toBe(false);
  });
});

describe('detachedRecords', () => {
  it('detaches a call record once its call leaves the stack', () => {
    const inside = closure.frames.findIndex((f) => f.kind === 'enter');
    const label = (step: number) =>
      [...detachedRecords(frameAt(closure, step), owners)].map(
        (id) => closure.frames[step]?.envs.find((e) => e.id === id)?.label,
      );
    expect(label(inside)).toEqual([]);
    expect(label(afterMake)).toEqual(['make() call']);
  });
});

describe('stateKey', () => {
  it('keeps uninitialized and holes apart from undefined', () => {
    const undef = stateKey({ kind: 'primitive', type: 'undefined', text: 'undefined' });
    expect(stateKey({ kind: 'uninitialized' })).not.toBe(undef);
    expect(stateKey({ kind: 'hole' })).not.toBe(undef);
  });
});

describe('describeStep', () => {
  it('uses authored narration when the step has it', () => {
    expect(describeStep(closure, afterMake, owners)).toMatch(/^make\(\) has returned/);
  });

  it('names the record a changed binding lives in', () => {
    const countWrite = closure.frames.findIndex((f) =>
      f.envs.some((e) =>
        e.bindings.some((b) => b.name === 'count' && stateKey(b.state) === 'number:1'),
      ),
    );
    expect(describeStep(closure, countWrite, owners)).toContain(
      'count (in make() call) changes from 0 to 1.',
    );
  });

  it('says which bindings start uninitialized before the first line', () => {
    const text = describeStep(hoisting, 1, recordOwners(hoisting));
    expect(text).toContain('name uninitialized');
    expect(text).toContain('greeting = undefined');
    expect(text).toContain('greet = function greet');
  });

  it('names the shared object when a write goes through an alias', () => {
    const step = aliasing.frames.findIndex((f) => f.span?.startLine === 4);
    expect(describeStep(aliasing, step, recordOwners(aliasing))).toBe(
      'Property n of object #0 changes from 1 to 2. Line 4 runs next.',
    );
  });

  it('explains why a record outlives its call when nothing was authored', () => {
    const bare = { ...closure, frames: closure.frames.map((f) => ({ ...f, narration: null })) };
    expect(describeStep(bare, afterMake, owners)).toContain(
      'its record "make() call" stays, because inc still points to it.',
    );
  });
});
