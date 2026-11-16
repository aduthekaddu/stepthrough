import { generateTrace } from '@stepthrough/trace/generate';
import { describe, expect, it } from 'vitest';
import { bindNarration, stripMarks } from './narration.ts';

const source = `function make() {
  let count = 0;
  return function inc() { return ++count; };
}
const counter = make(); // @mark made
counter(); // @mark called`;

const { code, marks } = stripMarks(source);
const frames = generateTrace({ id: 't', source: code }).frames;
const at = (mark: string) => ({ mark, kind: 'statement' as const });

describe('narration expectations', () => {
  it('passes when the frame matches what the spec says', () => {
    expect(() =>
      bindNarration(
        frames,
        [
          {
            at: at('called'),
            say: 'make() has returned.',
            expect: [
              { stackDepth: 1 },
              { record: 'make() call', binding: 'count', value: '0' },
              { record: 'Global', binding: 'counter', value: 'function inc' },
              { record: 'make() call', exists: true },
              { console: [] },
            ],
          },
        ],
        marks,
      ),
    ).not.toThrow();
  });
  it('fails the build on a wrong value and names the step', () => {
    expect(() =>
      bindNarration(
        frames,
        [
          {
            at: at('called'),
            say: 'x',
            expect: [{ record: 'make() call', binding: 'count', value: '1' }],
          },
        ],
        marks,
      ),
    ).toThrow(/count in "make\(\) call" is 0, expected 1/);
  });
  it('treats the temporal dead zone as uninitialized, not undefined', () => {
    expect(() =>
      bindNarration(
        frames,
        [
          {
            at: at('made'),
            say: 'x',
            expect: [{ record: 'Global', binding: 'counter', value: 'uninitialized' }],
          },
        ],
        marks,
      ),
    ).not.toThrow();
  });
  it('checks aliasing and object properties', () => {
    const { code: c, marks: m } = stripMarks(
      'const a = { n: 1 };\nconst b = a;\nb.n = 2;\nconst c = { n: 2 }; // @mark end',
    );
    const f = generateTrace({ id: 'alias', source: c }).frames;
    const step = (expectations: Parameters<typeof bindNarration>[1][number]['expect']) => () =>
      bindNarration(
        f,
        [{ at: { mark: 'end', kind: 'statement' }, say: 'x', expect: expectations }],
        m,
      );
    expect(
      step([{ record: 'Global', binding: 'b', sameAs: { record: 'Global', binding: 'a' } }]),
    ).not.toThrow();
    expect(step([{ record: 'Global', binding: 'a', prop: 'n', value: '2' }])).not.toThrow();
    expect(step([{ record: 'Global', binding: 'a', prop: 'n', value: '1' }])).toThrow(
      /a\.n is 2, expected 1/,
    );
  });
  it('anchors the end frame without a mark and the n-th call by occurrence', () => {
    const src =
      'function fact(n) {\n  return n <= 1 ? 1 : n * fact(n - 1); // @mark body\n}\nfact(3);';
    const { code: c, marks: m } = stripMarks(src);
    const f = generateTrace({ id: 'rec', source: c }).frames;
    const bound = bindNarration(
      f,
      [
        {
          at: { mark: 'body', kind: 'enter', occurrence: 3 },
          say: 'third call',
          expect: [{ stackDepth: 4 }],
        },
        { at: { kind: 'end' }, say: 'done' },
      ],
      m,
    );
    expect(bound.filter((x) => x.narration).map((x) => x.narration)).toEqual([
      'third call',
      'done',
    ]);
  });
});
