import { DefaultScheduler, Rating } from 'ts-fsrs';

export type Scheduler = Awaited<ReturnType<typeof DefaultScheduler>>;
/** The card shape review() accepts; stored as-is in IndexedDB. */
export type FsrsCard = Parameters<Scheduler['review']>[0]['card'];
export type ReviewResult = ReturnType<Scheduler['review']>;

export type CardKind = 'recall' | 'predict' | 'explain' | 'implement';

/** A card as a lesson declares it. */
export type CardSpec = {
  id: string;
  lessonId: string;
  kind: CardKind;
  front: string;
  back: string;
  /** Cards in one discrimination set (look-alike ideas) are reviewed next to each other. */
  set?: string;
};

export type Grade = 'again' | 'hard' | 'good' | 'easy';

const RATING = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
} as const;

export const DAILY_CAP = 30;

export function createScheduler(): Promise<Scheduler> {
  return DefaultScheduler();
}

export function newCard(scheduler: Scheduler, now: Date): FsrsCard {
  const card = scheduler.newCard({ now });
  // ts-fsrs 6.0.0 types newCard() without stabilityFast, but the value has it (0) and
  // review() requires it. Check rather than trust either side.
  if (!('stabilityFast' in card)) throw new Error('ts-fsrs newCard() returned no stabilityFast');
  return card as FsrsCard;
}

export function grade(scheduler: Scheduler, card: FsrsCard, g: Grade, now: Date): ReviewResult {
  return scheduler.review({ card, grade: RATING[g], now });
}

export type QueueItem = { spec: CardSpec; state: FsrsCard };

/**
 * Today's reviews: due cards, most overdue first, at most `cap`, so a backlog spreads
 * over several days instead of arriving at once. The chosen cards are then ordered so
 * lessons alternate (interleaving), while cards of one discrimination set stay together.
 */
export function buildQueue(items: readonly QueueItem[], now: Date, cap = DAILY_CAP): QueueItem[] {
  const due = items
    .filter((item) => item.state.dueAt.getTime() <= now.getTime())
    .sort(
      (a, b) =>
        a.state.dueAt.getTime() - b.state.dueAt.getTime() || a.spec.id.localeCompare(b.spec.id),
    )
    .slice(0, cap);

  const groups = new Map<string, QueueItem[]>();
  for (const item of due) {
    const key = item.spec.set
      ? `set:${item.spec.set}`
      : `lesson:${item.spec.lessonId}:${item.spec.id}`;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  const byLesson = new Map<string, QueueItem[][]>();
  for (const group of groups.values()) {
    const lesson = group[0]?.spec.lessonId ?? '';
    const list = byLesson.get(lesson) ?? [];
    list.push(group);
    byLesson.set(lesson, list);
  }
  const lanes = [...byLesson.values()];
  const out: QueueItem[] = [];
  for (let round = 0; lanes.some((lane) => round < lane.length); round += 1) {
    for (const lane of lanes) {
      const group = lane[round];
      if (group) out.push(...group);
    }
  }
  return out;
}
