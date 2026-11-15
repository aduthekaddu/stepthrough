import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkContent } from './index.ts';

const root = path.join(import.meta.dirname, 'fixtures/content');
const findings = checkContent(root, new Date('2026-11-15'));
const forLesson = (p: string) => findings.filter((f) => f.lesson === p);
const rules = (p: string) =>
  new Set(
    forLesson(p)
      .filter((f) => f.severity === 'error')
      .map((f) => f.rule),
  );

describe('content-check', () => {
  it('passes a lesson that follows every rule', () => {
    expect(forLesson(path.join('js', 'good'))).toEqual([]);
  });
  it('reports each broken rule in a bad lesson', () => {
    expect(rules(path.join('js', 'bad'))).toEqual(
      new Set([
        'frontmatter',
        'first-element',
        'predict-output',
        'misconception-ref',
        'term-ref',
        'banned-phrase',
        'code-annotation',
        'verified-at',
        'viz-example',
      ]),
    );
  });
  it('explains a wrong Predict answer with the real output', () => {
    const msg = forLesson(path.join('js', 'bad')).find((f) => f.rule === 'predict-output')?.message;
    expect(msg).toBe('Predict p1: answer is "null" but Node prints "object"');
  });
  it('flags a term used in prose before its <Term> introduction', () => {
    expect(forLesson(path.join('js', 'early'))).toEqual([
      {
        lesson: path.join('js', 'early'),
        rule: 'term-order',
        severity: 'error',
        message: '"heap" appears before it is introduced',
        line: 16,
      },
    ]);
  });
});
