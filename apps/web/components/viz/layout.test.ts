import type { Trace } from '@stepthrough/trace';
import { describe, expect, it } from 'vitest';
import { type Arrow, layoutScene, METRICS, type Rect, type Scene, type View } from './layout.ts';
import { detachedRecords, diffFrames, recordOwners } from './model.ts';
import { fixture } from './test-traces.ts';

function sceneAt(trace: Trace, step: number, view: View, width: number): Scene {
  const frame = trace.frames[step];
  if (!frame) throw new Error(`no step ${step}`);
  return layoutScene({
    frame,
    changes: diffFrames(trace.frames[step - 1] ?? null, frame, trace.uncaught),
    view,
    width,
    detached: detachedRecords(frame, recordOwners(trace)),
  });
}

/** The end point of an arrow path, `M x0 y0 C ... x y`. */
function end(arrow: Arrow | undefined): { x: number; y: number } {
  const numbers = (arrow?.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  return { x: numbers.at(-2) ?? Number.NaN, y: numbers.at(-1) ?? Number.NaN };
}

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const closure = fixture('closure-counter');
const recursion = fixture('recursion-fact');
const aliasing = fixture('aliasing');
const cycle = fixture('cycle-and-holes');
const afterMake = closure.frames.findIndex(
  (f, i) => i > 0 && f.stack.length === 1 && f.envs.some((e) => e.label === 'make() call'),
);
const deepest = recursion.frames.reduce(
  (best, f, i) => (f.stack.length > (recursion.frames[best]?.stack.length ?? 0) ? i : best),
  0,
);

describe('layoutScene', () => {
  it('makes a narrow scene tall enough for every lane label, even before the heap has objects', () => {
    const scene = sceneAt(aliasing, 0, 'both', 340);
    expect(scene.narrow).toBe(true);
    expect(scene.heap).toHaveLength(0);
    for (const lane of scene.lanes) {
      expect(lane.y + METRICS.laneLabel, lane.label).toBeLessThanOrEqual(scene.height);
    }
  });

  it('grows the stack upward from the oldest call', () => {
    const { frames } = sceneAt(recursion, deepest, 'scope', 640);
    expect(frames.map((f) => f.frame.fn)).toEqual(['(script)', 'fact', 'fact', 'fact']);
    const ys = frames.map((f) => f.rect.y);
    expect([...ys].sort((a, b) => b - a)).toEqual(ys);
    expect(frames.at(-1)?.running).toBe(true);
  });

  it('links every recursive call record to Global, not to the call below it', () => {
    const scene = sceneAt(recursion, deepest, 'scope', 640);
    const global = scene.records.find((r) => r.env.label === 'Global');
    const factRecords = scene.records.filter((r) => r.env.label.startsWith('fact()'));
    expect(factRecords).toHaveLength(3);
    for (const r of factRecords) {
      const outer = scene.arrows.find((a) => a.id === `outer:${r.id}`);
      expect(end(outer).y).toBe((global?.rect.y ?? 0) + (global?.rect.h ?? 0));
    }
  });

  it('keeps a record whose call ended, unlinked from every stack frame', () => {
    const scene = sceneAt(closure, afterMake, 'scope', 640);
    const make = scene.records.find((r) => r.env.label === 'make() call');
    expect(make?.detached).toBe(true);
    const frameTargets = scene.arrows.filter((a) => a.kind === 'frame').map(end);
    expect(frameTargets).not.toContainEqual({
      x: make?.rect.x,
      y: (make?.rect.y ?? 0) + METRICS.header / 2,
    });
    const closureArrow = scene.arrows.find((a) => a.kind === 'env');
    expect(end(closureArrow)).toEqual({
      x: (make?.rect.x ?? 0) + (make?.rect.w ?? 0),
      y: (make?.rect.y ?? 0) + METRICS.header / 2,
    });
  });

  it('draws two wires into one box when two names hold one object', () => {
    const last = aliasing.frames.length - 1;
    const scene = sceneAt(aliasing, last, 'memory', 640);
    expect(scene.heap).toHaveLength(2);
    const wires = scene.arrows.filter((a) => a.kind === 'ref');
    const a = end(wires.find((w) => w.id.endsWith(':a')));
    const b = end(wires.find((w) => w.id.endsWith(':b')));
    const c = end(wires.find((w) => w.id.endsWith(':c')));
    expect(a).toEqual(b);
    expect(c).not.toEqual(a);
  });

  it('loops a self reference back into its own box', () => {
    const scene = sceneAt(cycle, cycle.frames.length - 1, 'memory', 640);
    const self = scene.arrows.find((a) => a.id.endsWith(':self'));
    const box = scene.heap.find((h) => h.obj.kind === 'object');
    expect(end(self)).toEqual({
      x: (box?.rect.x ?? 0) + (box?.rect.w ?? 0),
      y: (box?.rect.y ?? 0) + METRICS.header / 2,
    });
  });

  it('shows the call that just returned as a ghost above the stack', () => {
    const scene = sceneAt(closure, afterMake, 'both', 640);
    expect(scene.ghostFrames.map((g) => g.frame.fn)).toEqual(['make']);
    const top = scene.frames.at(-1);
    expect(scene.ghostFrames[0]?.rect.y).toBeLessThan(top?.rect.y ?? 0);
  });

  it.each(['scope', 'memory', 'both'] as const)('fits a 358px phone panel in %s view', (view) => {
    for (const trace of [closure, aliasing, recursion, cycle]) {
      trace.frames.forEach((_, step) => {
        const scene = sceneAt(trace, step, view, 358);
        const boxes = [...scene.frames, ...scene.records, ...scene.heap].map((n) => n.rect);
        for (const r of boxes) expect(r.x + r.w).toBeLessThanOrEqual(358);
        for (const [i, r] of boxes.entries())
          for (const other of boxes.slice(i + 1)) expect(overlaps(r, other)).toBe(false);
      });
    }
  });
});
