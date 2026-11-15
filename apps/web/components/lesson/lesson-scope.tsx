'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { createContext, type ReactNode, use, useEffect, useMemo, useRef, useState } from 'react';
import {
  db,
  type FastPath,
  type LessonId,
  type PredictId,
  type PredictionRow,
  recordVisit,
  setFastPath,
} from '@/lib/learner';

type LessonState = {
  lessonId: LessonId;
  /** Undefined until IndexedDB answers. */
  predictions: ReadonlyMap<PredictId, PredictionRow> | undefined;
  fastPath: FastPath;
  /** Predict ids in document order. The first three decide the fast-path offer. */
  predictOrder: readonly PredictId[];
};

const LessonContext = createContext<LessonState | null>(null);

export function useLesson(): LessonState {
  const state = use(LessonContext);
  if (!state) throw new Error('Lesson components must render inside <LessonScope>');
  return state;
}

const predictIdsIn = (root: HTMLElement) =>
  Array.from(
    root.querySelectorAll<HTMLElement>('[data-predict-id]'),
    (el) => el.dataset.predictId as PredictId,
  );

export function LessonScope({ lessonId, children }: { lessonId: LessonId; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [predictOrder, setPredictOrder] = useState<readonly PredictId[]>([]);
  const rows = useLiveQuery(
    () => db.predictions.where('lessonId').equals(lessonId).toArray(),
    [lessonId],
  );
  const progress = useLiveQuery(() => db.lessonProgress.get(lessonId), [lessonId]);

  useEffect(() => {
    void recordVisit(lessonId);
  }, [lessonId]);

  useEffect(() => {
    if (root.current) setPredictOrder(predictIdsIn(root.current));
  }, []);

  const state = useMemo<LessonState>(
    () => ({
      lessonId,
      predictions: rows && new Map(rows.map((row) => [row.predictId, row])),
      fastPath: progress?.fastPath ?? 'undecided',
      predictOrder,
    }),
    [lessonId, rows, progress?.fastPath, predictOrder],
  );

  return (
    <LessonContext value={state}>
      <div ref={root} className="lesson-grid prose-body">
        {children}
      </div>
    </LessonContext>
  );
}

/** True once the hook and the next two Predicts are all right and answered "sure". */
export function qualifiesForFastPath({ predictions, predictOrder }: LessonState) {
  const firstThree = predictOrder.slice(0, 3);
  return (
    firstThree.length === 3 &&
    firstThree.every((id) => {
      const row = predictions?.get(id);
      return row?.correct === true && row.confidence === 'sure';
    })
  );
}

export function Segment({ id, goal, children }: { id: string; goal: string; children: ReactNode }) {
  const { fastPath, predictions } = useLesson();
  const ref = useRef<HTMLElement>(null);
  const [ownPredicts, setOwnPredicts] = useState<readonly PredictId[]>([]);

  useEffect(() => {
    if (ref.current) setOwnPredicts(predictIdsIn(ref.current));
  }, []);

  const missed = ownPredicts.some((p) => predictions?.get(p)?.correct === false);
  const view = fastPath === 'summary' && !missed ? 'summary' : 'full';

  return (
    <section ref={ref} id={id} className="segment" data-view={view}>
      <p className="segment-goal">{goal}</p>
      {children}
    </section>
  );
}

export function FastPathOffer() {
  const { lessonId } = useLesson();
  return (
    <div className="fast-path-offer">
      <p>You seem to know the basics. Collapse explanations to summaries?</p>
      <div className="button-row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setFastPath(lessonId, 'summary')}
        >
          Show summaries
        </button>
        <button type="button" className="btn" onClick={() => setFastPath(lessonId, 'full')}>
          Keep the full lesson
        </button>
      </div>
    </div>
  );
}

export function FastPathBar() {
  const { lessonId, fastPath } = useLesson();
  if (fastPath !== 'summary') return null;
  return (
    <div className="fast-path-bar ui" role="status">
      <span>
        Showing a one-line summary of each segment. Segments with a missed prediction open.
      </span>
      <button type="button" className="btn" onClick={() => setFastPath(lessonId, 'full')}>
        Show the full lesson
      </button>
    </div>
  );
}
