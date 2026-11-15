import { generateTrace } from '@stepthrough/trace/generate';
import { describe, expect, it } from 'vitest';
import { bindNarration, NarrationFile, stripMarks } from './narration.ts';

const source = ['let n = 1;', 'n = n + 1; // @mark bump', 'n = n * 2;'].join('\n');

describe('stripMarks', () => {
  it('removes the mark comment and keeps every line where it was', () => {
    const { code, marks } = stripMarks(source);
    expect(code.split('\n')).toEqual(['let n = 1;', 'n = n + 1;', 'n = n * 2;']);
    expect(marks.get('bump')).toBe(2);
  });

  it('rejects a mark on a line without code', () => {
    expect(() => stripMarks('// @mark lonely\nlet n = 1;')).toThrow(/no code/);
  });
});

describe('bindNarration', () => {
  const { code, marks } = stripMarks(source);
  const trace = generateTrace({ id: 't', source: code });

  it('puts the sentence on the first matching frame on the marked line', () => {
    const steps = NarrationFile.parse({
      steps: [{ at: { mark: 'bump', kind: 'statement' }, say: 'n becomes 2 next.' }],
    }).steps;
    const frames = bindNarration(trace.frames, steps, marks);
    const narrated = frames.filter((f) => f.narration !== null);
    expect(narrated).toHaveLength(1);
    expect(narrated[0]?.span?.startLine).toBe(2);
    expect(narrated[0]?.narration).toBe('n becomes 2 next.');
  });

  it('fails when no frame of that kind starts on the marked line', () => {
    const steps = [{ at: { mark: 'bump', kind: 'enter' as const }, say: 'x' }];
    expect(() => bindNarration(trace.frames, steps, marks)).toThrow(/no enter frame/);
  });

  it('fails on a mark the source does not have', () => {
    const steps = [{ at: { mark: 'missing', kind: 'statement' as const }, say: 'x' }];
    expect(() => bindNarration(trace.frames, steps, marks)).toThrow(/unknown mark/);
  });
});
