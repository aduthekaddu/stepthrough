'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useId, useRef, useState } from 'react';
import {
  type CardKind,
  cardIdFor,
  db,
  type ExplainId,
  registerCard,
  saveExplanation,
} from '@/lib/learner';
import { Inline } from './inline';
import { useLesson } from './lesson-scope';

const CARD_KIND_LABEL: Record<CardKind, string> = {
  recall: 'Recall',
  predict: 'Predict the output',
  explain: 'Explain',
};

export function Card({
  id,
  kind,
  front,
  back,
}: {
  id: string;
  kind: CardKind;
  front: string;
  back: string;
}) {
  const { lessonId } = useLesson();
  const cardId = cardIdFor(lessonId, id);
  const saved = useLiveQuery(() => db.cards.get(cardId), [cardId]);

  useEffect(() => {
    void registerCard({ cardId, lessonId, kind, front, back, createdAt: Date.now() });
  }, [cardId, lessonId, kind, front, back]);

  return (
    <section className="review-card" data-interaction="" data-card-id={cardId}>
      <p className="panel-label">
        Card · {CARD_KIND_LABEL[kind]}
        <span className="card-status" aria-live="polite">
          {saved ? 'In your review deck' : ''}
        </span>
      </p>
      <p className="card-front">
        <Inline text={front} />
      </p>
      <details className="reveal">
        <summary className="ui">Show the answer</summary>
        <p>
          <Inline text={back} />
        </p>
      </details>
    </section>
  );
}

const SAVE_DELAY_MS = 400;

type SaveState = 'idle' | 'pending' | 'saved';

export function ExplainBack({
  id,
  prompt,
  rubric,
}: {
  id: string;
  prompt: string;
  rubric: string[];
}) {
  const { lessonId } = useLesson();
  const explainId = id as ExplainId;
  const fieldId = useId();
  const stored = useLiveQuery(
    () => db.explanations.get([lessonId, explainId]),
    [lessonId, explainId],
  );
  const [text, setText] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = text ?? stored?.text ?? '';

  function onChange(next: string) {
    setText(next);
    setSave('pending');
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveExplanation({ lessonId, explainId, text: next, updatedAt: Date.now() });
      setSave('saved');
    }, SAVE_DELAY_MS);
  }

  return (
    <section className="explain-back" data-interaction="">
      <p className="panel-label">Explain it back</p>
      <label htmlFor={fieldId} className="explain-prompt">
        <Inline text={prompt} />
      </label>
      <textarea
        id={fieldId}
        className="explain-text"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${fieldId}-status`}
      />
      <p id={`${fieldId}-status`} className="explain-status ui">
        {save === 'pending'
          ? 'Saving…'
          : save === 'saved' || stored
            ? 'Saved in this browser.'
            : 'Saved in this browser as you type.'}
      </p>
      <details className="reveal">
        <summary className="ui">Compare with the rubric</summary>
        <ul>
          {rubric.map((point) => (
            <li key={point}>
              <Inline text={point} />
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
