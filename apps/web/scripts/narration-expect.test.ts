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
});
