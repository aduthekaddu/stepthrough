import { inspect } from 'node:util';
import { describe, expect, it } from 'vitest';
import { formatArgs } from './format.ts';

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

const nodeFormat = (args: unknown[]) =>
  args.map((a) => (typeof a === 'string' ? a : inspect(a, { breakLength: Infinity }))).join(' ');

describe('formatArgs matches Node for single-line values', () => {
  const cases: [string, unknown[]][] = [
    ['top-level string is printed raw', ['hello']],
    ['numbers, -0, NaN', [1, -0, Number.NaN]],
    ['undefined and null', [undefined, null]],
    ['booleans and bigint', [true, 10n]],
    ['symbol', [Symbol('id')]],
    ['named and anonymous functions', [function greet() {}, () => {}]],
    ['class', [Point]],
    ['empty object and array', [{}, []]],
    ['nested strings are quoted', [{ name: 'Ada', tags: ['x', 'y'] }]],
    ['quoted keys', [{ 'first-name': 1 }]],
    ['class instance shows constructor', [new Point(1, 2)]],
    ['map and set', [new Map([['a', 1]]), new Set([1, 2])]],
    ['empty map and set', [new Map(), new Set()]],
    ['null prototype', [Object.assign(Object.create(null), { a: 1 })]],
    ['depth limit', [{ a: { b: { c: { d: 1 } } } }]],
  ];
  for (const [name, args] of cases) {
    it(name, () => {
      expect(formatArgs(args)).toBe(nodeFormat(args));
    });
  }
});
