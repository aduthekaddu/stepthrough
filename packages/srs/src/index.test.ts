import { describe, expect, it } from 'vitest';
import {
  buildQueue,
  type CardSpec,
  createScheduler,
  grade,
  newCard,
  type QueueItem,
} from './index.ts';

const now = new Date('2026-11-15T09:00:00Z');
const day = 24 * 60 * 60 * 1000;

describe('scheduling', async () => {
  const scheduler = await createScheduler();

  it('a new card is due immediately', () => {
    expect(newCard(scheduler, now).dueAt.getTime()).toBeLessThanOrEqual(now.getTime());
  });
  it('a card graded good comes back later than one graded again', () => {
    const card = newCard(scheduler, now);
    const good = grade(scheduler, card, 'good', now).card.dueAt.getTime();
    const again = grade(scheduler, card, 'again', now).card.dueAt.getTime();
    expect(good).toBeGreaterThan(again);
  });
  it('successful reviews push the next review further out', () => {
    let card = newCard(scheduler, now);
    let at = now;
    const gaps: number[] = [];
    for (let i = 0; i < 4; i += 1) {
      card = grade(scheduler, card, 'good', at).card;
      gaps.push(card.dueAt.getTime() - at.getTime());
      at = card.dueAt;
    }
    expect(gaps.at(-1)).toBeGreaterThan(gaps[0] ?? 0);
    expect(gaps.at(-1)).toBeGreaterThan(day);
  });
  it('grading does not change the card passed in', () => {
    const card = newCard(scheduler, now);
    const before = JSON.stringify(card);
    grade(scheduler, card, 'easy', now);
    expect(JSON.stringify(card)).toBe(before);
  });
});

describe('buildQueue', async () => {
  const scheduler = await createScheduler();
  const item = (id: string, lessonId: string, dueOffsetDays: number, set?: string): QueueItem => {
    const spec: CardSpec = {
      id,
      lessonId,
      kind: 'recall',
      front: id,
      back: id,
      ...(set ? { set } : {}),
    };
    const state = {
      ...newCard(scheduler, now),
      dueAt: new Date(now.getTime() + dueOffsetDays * day),
    };
    return { spec, state };
  };

  it('leaves out cards that are not due yet', () => {
    const q = buildQueue([item('a', 'l1', -1), item('b', 'l1', 2)], now);
    expect(q.map((x) => x.spec.id)).toEqual(['a']);
  });
  it('caps the day and keeps the most overdue cards', () => {
    const items = Array.from({ length: 40 }, (_, i) => item(`c${i}`, 'l1', -(i + 1)));
    const q = buildQueue(items, now, 30);
    expect(q).toHaveLength(30);
    expect(q.some((x) => x.spec.id === 'c39')).toBe(true);
    expect(q.some((x) => x.spec.id === 'c0')).toBe(false);
  });
  it('alternates lessons', () => {
    const q = buildQueue(
      [item('a1', 'A', -3), item('a2', 'A', -2), item('b1', 'B', -1), item('b2', 'B', -1)],
      now,
    );
    expect(q.map((x) => x.spec.lessonId)).toEqual(['A', 'B', 'A', 'B']);
  });
  it('keeps a discrimination set together', () => {
    const q = buildQueue(
      [item('var-loop', 'A', -3, 'loops'), item('x', 'B', -2), item('let-loop', 'A', -1, 'loops')],
      now,
    );
    const ids = q.map((x) => x.spec.id);
    expect(Math.abs(ids.indexOf('var-loop') - ids.indexOf('let-loop'))).toBe(1);
  });
});
