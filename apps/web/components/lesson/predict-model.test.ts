import { describe, expect, it } from 'vitest';
import type { MisconceptionId, PredictId } from '@/lib/learner';
import { judge, type PredictSpec } from './predict-model';

const choice: PredictSpec = {
  kind: 'choice',
  id: 'hook' as PredictId,
  prompt: 'What does this print?',
  explain: 'Both names refer to one object.',
  answer: 'b',
  options: [
    {
      id: 'a',
      text: '1',
      feedback: 'You read the assignment as a copy.',
      misconception: 'assignment-copies-object' as MisconceptionId,
    },
    { id: 'b', text: '2', feedback: 'One object, two names.' },
    { id: 'c', text: 'undefined', feedback: 'b.n exists after the assignment.' },
  ],
};

const text: PredictSpec = {
  kind: 'text',
  id: 'typeof-null' as PredictId,
  prompt: 'What does this print?',
  explain: 'typeof null is "object", a choice kept from the first version of JavaScript.',
  answer: 'object\nnumber',
  wrong: [
    { match: 'null\nnumber', feedback: 'null is its own type, but typeof reports "object".' },
  ],
};

describe('judge', () => {
  it('marks the answer option right and returns its confirmation', () => {
    expect(judge(choice, 'b')).toEqual({
      verdict: { correct: true },
      feedback: 'One object, two names.',
    });
  });

  it('names the misconception of a wrong option', () => {
    expect(judge(choice, 'a')).toEqual({
      verdict: { correct: false, misconceptionId: 'assignment-copies-object' },
      feedback: 'You read the assignment as a copy.',
    });
  });

  it('keeps a wrong option without a misconception id as wrong', () => {
    expect(judge(choice, 'c').verdict).toEqual({ correct: false, misconceptionId: null });
  });

  it('rejects an option id the Predict does not have', () => {
    expect(() => judge(choice, 'z')).toThrow(/no option "z"/);
  });

  it('accepts typed output that differs only in trailing whitespace and blank edges', () => {
    expect(judge(text, '\nobject  \nnumber\n\n').verdict.correct).toBe(true);
  });

  it('treats different leading whitespace as a different output', () => {
    expect(judge(text, ' object\nnumber').verdict.correct).toBe(false);
  });

  it('matches a known wrong typed answer to its feedback', () => {
    expect(judge(text, 'null\nnumber  ')).toEqual({
      verdict: { correct: false, misconceptionId: null },
      feedback: 'null is its own type, but typeof reports "object".',
    });
  });

  it('gives no specific feedback to an unknown wrong typed answer', () => {
    expect(judge(text, 'string')).toEqual({
      verdict: { correct: false, misconceptionId: null },
      feedback: null,
    });
  });
});
