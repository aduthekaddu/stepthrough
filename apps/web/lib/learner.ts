import Dexie, { type Table } from 'dexie';

declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

export type LessonId = Brand<string, 'LessonId'>;
export type PredictId = Brand<string, 'PredictId'>;
export type MisconceptionId = Brand<string, 'MisconceptionId'>;
export type CardId = Brand<string, 'CardId'>;
export type ExplainId = Brand<string, 'ExplainId'>;

export const CONFIDENCE = ['sure', 'think-so', 'guessing'] as const;
export type Confidence = (typeof CONFIDENCE)[number];

/** The judgement of one answer. A misconception id exists only on a wrong answer. */
export type Verdict =
  | { correct: true }
  | { correct: false; misconceptionId: MisconceptionId | null };

/** One committed prediction. The first commit is final; the key is [lessonId+predictId]. */
export type PredictionRow = {
  lessonId: LessonId;
  predictId: PredictId;
  answer: string;
  confidence: Confidence;
  at: number;
} & Verdict;

export type CardKind = 'recall' | 'predict' | 'explain';

/** A review card registered by a lesson. FSRS scheduling state is added with the review page. */
export type CardRow = {
  cardId: CardId;
  lessonId: LessonId;
  kind: CardKind;
  front: string;
  back: string;
  createdAt: number;
};

export type ExplanationRow = {
  lessonId: LessonId;
  explainId: ExplainId;
  text: string;
  updatedAt: number;
};

/**
 * The expertise fast path (research/pedagogy.md §4.2 step 9). `undecided` may show the offer;
 * `summary` collapses segments to their goals; `full` is the learner's choice to keep everything.
 */
export type FastPath = 'undecided' | 'summary' | 'full';

export type LessonProgressRow = {
  lessonId: LessonId;
  firstVisitedAt: number;
  lastVisitedAt: number;
  fastPath: FastPath;
};

class LearnerDb extends Dexie {
  predictions!: Table<PredictionRow, [LessonId, PredictId]>;
  cards!: Table<CardRow, CardId>;
  explanations!: Table<ExplanationRow, [LessonId, ExplainId]>;
  lessonProgress!: Table<LessonProgressRow, LessonId>;

  constructor() {
    super('stepthrough');
    this.version(1).stores({
      predictions: '[lessonId+predictId], lessonId, at',
      cards: 'cardId, lessonId, createdAt',
      explanations: '[lessonId+explainId], lessonId',
      lessonProgress: 'lessonId, lastVisitedAt',
    });
  }
}

export const db = new LearnerDb();

export const cardIdFor = (lessonId: LessonId, id: string) => `${lessonId}/${id}` as CardId;

export function recordVisit(lessonId: LessonId, now = Date.now()) {
  return db.transaction('rw', db.lessonProgress, async () => {
    const row = await db.lessonProgress.get(lessonId);
    await db.lessonProgress.put(
      row
        ? { ...row, lastVisitedAt: now }
        : { lessonId, firstVisitedAt: now, lastVisitedAt: now, fastPath: 'undecided' },
    );
  });
}

export function setFastPath(lessonId: LessonId, fastPath: FastPath) {
  return db.lessonProgress.update(lessonId, { fastPath });
}

/** Adds the card once; a reload or a second render leaves the first registration in place. */
export function registerCard(card: CardRow) {
  return db.transaction('rw', db.cards, async () => {
    if (!(await db.cards.get(card.cardId))) await db.cards.add(card);
  });
}

export function commitPrediction(row: PredictionRow) {
  return db.transaction('rw', db.predictions, async () => {
    if (!(await db.predictions.get([row.lessonId, row.predictId]))) await db.predictions.add(row);
  });
}

export function saveExplanation(row: ExplanationRow) {
  return db.explanations.put(row);
}
