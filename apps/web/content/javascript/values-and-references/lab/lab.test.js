import { describe, expect, it } from 'vitest';
import { deepClone, deepEqual, structuredCloneFacts } from './starter.js';

class Point {
  constructor(x) {
    this.x = x;
  }
}

describe('Task 1: deepEqual', () => {
  it('treats equal primitives as equal and different ones as not equal', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('hi', 'hi')).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual(1, '1'), 'deepEqual must not convert types the way == does').toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it('treats NaN as equal to NaN (rule: SameValue)', () => {
    expect(deepEqual(NaN, NaN), 'with === this would be false; the rule here is Object.is').toBe(true);
    expect(deepEqual([NaN], [NaN])).toBe(true);
  });

  it('treats +0 and -0 as different (rule: SameValue, like Node assert.deepStrictEqual)', () => {
    expect(deepEqual(0, -0)).toBe(false);
    expect(deepEqual({ n: 0 }, { n: -0 })).toBe(false);
  });

  it('compares two separately made objects by their contents', () => {
    expect(deepEqual({ a: 1, b: 'x' }, { b: 'x', a: 1 }), 'key order does not matter').toBe(true);
  });

  it('says objects with different keys are not equal', () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(deepEqual({ a: undefined }, { b: undefined }), 'a missing key is not the same as a key that holds undefined').toBe(false);
    expect(deepEqual({ a: undefined }, {})).toBe(false);
  });

  it('compares nested objects deeply', () => {
    expect(deepEqual({ user: { tags: ['a', 'b'] } }, { user: { tags: ['a', 'b'] } })).toBe(true);
    expect(deepEqual({ user: { tags: ['a', 'b'] } }, { user: { tags: ['a', 'c'] } })).toBe(false);
  });

  it('never treats null as equal to an object', () => {
    expect(deepEqual(null, {})).toBe(false);
    expect(deepEqual({}, null)).toBe(false);
    expect(deepEqual({ a: null }, { a: {} })).toBe(false);
  });

  it('never treats an array as equal to a plain object with the same keys', () => {
    expect(deepEqual([], {})).toBe(false);
    expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
  });

  it('compares arrays item by item, in order', () => {
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('treats Dates as equal when they hold the same time', () => {
    expect(deepEqual(new Date(0), new Date(0))).toBe(true);
    expect(deepEqual(new Date(0), new Date(1)), 'a Date has no own keys, so comparing keys alone says every two Dates are equal').toBe(false);
    expect(deepEqual(new Date(0), {})).toBe(false);
  });

  it('treats Maps as equal when they have the same keys with deeply equal values, in any order', () => {
    const a = new Map([['x', { n: 1 }], ['y', [2]]]);
    const b = new Map([['y', [2]], ['x', { n: 1 }]]);
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, new Map([['x', { n: 1 }]]))).toBe(false);
    expect(deepEqual(a, new Map([['x', { n: 2 }], ['y', [2]]])), 'a Map has no own keys; compare its entries').toBe(false);
  });

  it('treats Sets as equal when they have the same members, in any order', () => {
    expect(deepEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))).toBe(true);
    expect(deepEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
    expect(deepEqual(new Set([1, 2]), new Set([1, 2, 3]))).toBe(false);
    expect(deepEqual(new Set([{ id: 1 }, { id: 2 }]), new Set([{ id: 2 }, { id: 1 }])), 'object members must be matched deeply, not with Set.has').toBe(true);
    expect(deepEqual(new Set([{ id: 1 }, { id: 1 }]), new Set([{ id: 1 }, { id: 2 }])), 'each member can be matched only once').toBe(false);
  });

  it('says a class instance is not equal to a plain object with the same data', () => {
    expect(deepEqual(new Point(1), { x: 1 })).toBe(false);
    expect(deepEqual(new Point(1), new Point(1))).toBe(true);
  });

  it('stops on cyclic structures and compares what is reachable by following properties', () => {
    const a = { name: 'loop' };
    a.self = a;
    const b = { name: 'loop' };
    b.self = b;
    expect(deepEqual(a, b)).toBe(true);
    const c = { name: 'other' };
    c.self = c;
    expect(deepEqual(a, c)).toBe(false);
  });
});

describe('Task 2: deepClone', () => {
  it('returns primitives unchanged', () => {
    for (const v of [1, 'hi', true, null, undefined, 10n]) expect(deepClone(v)).toBe(v);
    expect(Object.is(deepClone(NaN), NaN)).toBe(true);
    expect(Object.is(deepClone(-0), -0)).toBe(true);
  });

  it('returns a new object with equal contents', () => {
    const original = { a: 1, b: { c: [2, 3] } };
    const copy = deepClone(original);
    expect(copy, 'let copy = original copies a reference, not the object').not.toBe(original);
    expect(copy).toEqual(original);
  });

  it('copies nested objects, so a mutation of the clone never reaches the original', () => {
    const original = { name: 'chess', players: ['Asha', 'Ben'], meta: { rated: true } };
    const copy = deepClone(original);
    copy.players.push('Chen');
    copy.meta.rated = false;
    expect(original.players, 'a shallow copy (spread) shares nested arrays').toEqual(['Asha', 'Ben']);
    expect(original.meta.rated).toBe(true);
  });

  it('copies arrays, keeping their length', () => {
    const original = [1, [2, 3]];
    const copy = deepClone(original);
    expect(Array.isArray(copy)).toBe(true);
    expect(copy).toEqual(original);
    expect(copy[1]).not.toBe(original[1]);
  });

  it('copies Dates as new Date objects with the same time', () => {
    const original = { at: new Date(0) };
    const copy = deepClone(original);
    expect(copy.at).toBeInstanceOf(Date);
    expect(copy.at).not.toBe(original.at);
    expect(copy.at.getTime()).toBe(0);
  });

  it('copies Maps and Sets, including the objects inside them', () => {
    const inner = { n: 1 };
    const original = { m: new Map([['k', inner]]), s: new Set([inner]) };
    const copy = deepClone(original);
    expect(copy.m).toBeInstanceOf(Map);
    expect(copy.s).toBeInstanceOf(Set);
    expect(copy.m.get('k')).toEqual({ n: 1 });
    expect(copy.m.get('k')).not.toBe(inner);
    expect([...copy.s][0], 'inner appears twice in the original, so both places get the same copy').toBe(copy.m.get('k'));
  });

  it('keeps cycles: a clone of an object that points to itself points to itself', () => {
    const original = { name: 'loop' };
    original.self = original;
    const copy = deepClone(original);
    expect(copy).not.toBe(original);
    expect(copy.self).toBe(copy);
  });

  it('keeps shared references shared', () => {
    const shared = { tag: 'A' };
    const original = { left: shared, right: shared };
    const copy = deepClone(original);
    expect(copy.left, 'copying a shared object twice would split one object into two').toBe(copy.right);
    expect(copy.left).not.toBe(shared);
  });

  it('keeps the prototype of class instances (structuredClone does not)', () => {
    const copy = deepClone({ p: new Point(1) });
    expect(copy.p).toBeInstanceOf(Point);
    expect(copy.p.x).toBe(1);
  });

  it('shares functions instead of copying them', () => {
    const run = () => 42;
    const copy = deepClone({ run });
    expect(copy.run).toBe(run);
  });
});

describe('Task 3: what structuredClone keeps', () => {
  const measure = {
    keepsCycles: () => {
      const o = {};
      o.self = o;
      const c = structuredClone(o);
      return c.self === c;
    },
    keepsSharedReferences: () => {
      const s = {};
      const c = structuredClone({ a: s, b: s });
      return c.a === c.b;
    },
    keepsClassPrototype: () => structuredClone(new Point(1)) instanceof Point,
    copiesFunctions: () => {
      try {
        structuredClone({ run() {} });
        return true;
      } catch {
        return false;
      }
    },
    keepsDates: () => structuredClone(new Date(0)) instanceof Date,
    keepsSymbolKeys: () => Object.getOwnPropertySymbols(structuredClone({ [Symbol('k')]: 1 })).length === 1,
  };

  for (const [fact, check] of Object.entries(measure)) {
    it(`your prediction for ${fact} matches what structuredClone does`, () => {
      expect(typeof structuredCloneFacts[fact], `set structuredCloneFacts.${fact} to true or false`).toBe('boolean');
      expect(structuredCloneFacts[fact]).toBe(check());
    });
  }
});
