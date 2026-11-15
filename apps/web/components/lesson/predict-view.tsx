'use client';

import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { CONFIDENCE, type Confidence, commitPrediction, type PredictionRow } from '@/lib/learner';
import { Inline } from './inline';
import { FastPathOffer, qualifiesForFastPath, useLesson } from './lesson-scope';
import { judge, type PredictSpec } from './predict-model';

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  sure: 'Sure',
  'think-so': 'Think so',
  guessing: 'Guessing',
};

type Missing = 'answer' | 'confidence' | 'both';
const MISSING_TEXT: Record<Missing, string> = {
  answer: 'Give your answer first.',
  confidence: 'Say how sure you are first.',
  both: 'Give your answer and say how sure you are.',
};

/** Form state before the commit. After it, the stored PredictionRow is the only state. */
type Draft = {
  answer: string;
  confidence: Confidence | null;
  missing: Missing | null;
  committing: boolean;
};

export function PredictView({ spec, code }: { spec: PredictSpec; code: ReactNode }) {
  const lesson = useLesson();
  const record = lesson.predictions?.get(spec.id);
  const uid = useId();

  return (
    <section className="predict" data-interaction="" data-predict-id={spec.id}>
      <p className="panel-label">Predict</p>
      <p className="predict-prompt">
        <Inline text={spec.prompt} />
      </p>
      {code}
      {record ? (
        <Revealed spec={spec} record={record} showOffer={offerHere(lesson, spec)} />
      ) : (
        <PredictForm spec={spec} uid={uid} />
      )}
    </section>
  );
}

function offerHere(lesson: ReturnType<typeof useLesson>, spec: PredictSpec) {
  return (
    lesson.fastPath === 'undecided' &&
    lesson.predictOrder[2] === spec.id &&
    qualifiesForFastPath(lesson)
  );
}

function PredictForm({ spec, uid }: { spec: PredictSpec; uid: string }) {
  const { lessonId } = useLesson();
  const [draft, setDraft] = useState<Draft>({
    answer: '',
    confidence: null,
    missing: null,
    committing: false,
  });
  const errorId = `${uid}-error`;
  const update = (patch: Partial<Draft>) =>
    setDraft((d) => {
      const next = { ...d, ...patch };
      // Clear the message once the learner has fixed what it named.
      return next.missing && checkDraft(next).kind === 'ready' ? { ...next, missing: null } : next;
    });

  async function commit(event: FormEvent) {
    event.preventDefault();
    if (draft.committing) return;
    const check = checkDraft(draft);
    if (check.kind === 'missing') {
      setDraft((d) => ({ ...d, missing: check.missing }));
      return;
    }
    setDraft((d) => ({ ...d, committing: true }));
    sessionCommits.add(spec.id);
    await commitPrediction({
      lessonId,
      predictId: spec.id,
      answer: draft.answer,
      confidence: check.confidence,
      at: Date.now(),
      ...judge(spec, draft.answer).verdict,
    });
  }

  const answerInvalid = draft.missing === 'answer' || draft.missing === 'both';
  const confidenceInvalid = draft.missing === 'confidence' || draft.missing === 'both';

  return (
    <form className="predict-form" onSubmit={commit} noValidate>
      {spec.kind === 'choice' ? (
        <fieldset
          className="predict-options"
          aria-invalid={answerInvalid || undefined}
          aria-describedby={answerInvalid ? errorId : undefined}
        >
          <legend className="sr-only">Your answer</legend>
          {spec.options.map((option) => (
            <label key={option.id} className="option">
              <input
                type="radio"
                name={`${uid}-answer`}
                value={option.id}
                checked={draft.answer === option.id}
                onChange={() => update({ answer: option.id })}
              />
              <span>
                <Inline text={option.text} />
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <TypedAnswer
          spec={spec}
          uid={uid}
          value={draft.answer}
          invalid={answerInvalid}
          errorId={errorId}
          onChange={(answer) => update({ answer })}
        />
      )}
      <fieldset
        className="confidence"
        aria-invalid={confidenceInvalid || undefined}
        aria-describedby={confidenceInvalid ? errorId : undefined}
      >
        <legend className="ui">How sure are you?</legend>
        <div className="segmented">
          {CONFIDENCE.map((c) => (
            <label key={c} className="ui">
              <input
                type="radio"
                name={`${uid}-confidence`}
                value={c}
                checked={draft.confidence === c}
                onChange={() => update({ confidence: c })}
              />
              {CONFIDENCE_LABEL[c]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="predict-actions">
        <button type="submit" className="btn btn-primary" disabled={draft.committing}>
          Commit answer
        </button>
        <p id={errorId} className="predict-missing ui" aria-live="polite">
          {draft.missing ? MISSING_TEXT[draft.missing] : ''}
        </p>
      </div>
    </form>
  );
}

type DraftCheck = { kind: 'ready'; confidence: Confidence } | { kind: 'missing'; missing: Missing };

function checkDraft({ answer, confidence }: Draft): DraftCheck {
  const noAnswer = answer.trim() === '';
  if (noAnswer && !confidence) return { kind: 'missing', missing: 'both' };
  if (noAnswer) return { kind: 'missing', missing: 'answer' };
  if (!confidence) return { kind: 'missing', missing: 'confidence' };
  return { kind: 'ready', confidence };
}

function TypedAnswer({
  spec,
  uid,
  value,
  invalid,
  errorId,
  onChange,
}: {
  spec: Extract<PredictSpec, { kind: 'text' }>;
  uid: string;
  value: string;
  invalid: boolean;
  errorId: string;
  onChange: (value: string) => void;
}) {
  const lines = spec.answer.split('\n').length;
  const shared = {
    id: `${uid}-typed`,
    className: 'typed-answer',
    value,
    spellCheck: false,
    autoComplete: 'off',
    autoCapitalize: 'off',
    'aria-invalid': invalid || undefined,
    'aria-describedby': `${uid}-typed-hint${invalid ? ` ${errorId}` : ''}`,
  };
  return (
    <div className="typed">
      <label htmlFor={`${uid}-typed`} className="ui">
        Your answer
      </label>
      <p id={`${uid}-typed-hint`} className="typed-hint ui">
        {lines > 1 ? `Type the exact output, ${lines} lines.` : 'Type the exact output, one line.'}
      </p>
      {lines > 1 ? (
        <textarea {...shared} rows={lines} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...shared} type="text" onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

/** Predicts committed in this page view. Only these move focus to their feedback. */
const sessionCommits = new Set<string>();

function Revealed({
  spec,
  record,
  showOffer,
}: {
  spec: PredictSpec;
  record: PredictionRow;
  showOffer: boolean;
}) {
  const feedbackRef = useRef<HTMLDivElement>(null);
  const { verdict, feedback } = judge(spec, record.answer);

  useEffect(() => {
    if (sessionCommits.delete(spec.id)) feedbackRef.current?.focus();
  }, [spec.id]);

  return (
    <>
      {spec.kind === 'choice' ? (
        <ul className="predict-options revealed" aria-label="Options">
          {spec.options.map((option) => {
            const chosen = option.id === record.answer;
            const right = option.id === spec.answer;
            return (
              <li
                key={option.id}
                className="option"
                data-chosen={chosen || undefined}
                data-right={right || undefined}
              >
                <span>
                  <Inline text={option.text} />
                </span>
                <span className="option-tags ui">
                  {chosen && <span className="tag tag-chosen">Your answer</span>}
                  {right && <span className="tag tag-right">Correct answer</span>}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="typed-reveal">
          <div>
            <p className="panel-label">Your answer</p>
            <pre className="code-pre">{record.answer}</pre>
          </div>
          <div>
            <p className="panel-label">Real output</p>
            <pre className="code-pre">{spec.answer}</pre>
          </div>
        </div>
      )}
      <div
        ref={feedbackRef}
        tabIndex={-1}
        className="predict-feedback"
        data-correct={verdict.correct}
      >
        <p className="feedback-head ui">
          {verdict.correct ? 'Right' : 'Not what happens'}
          <span className="feedback-confidence">
            You said: {CONFIDENCE_LABEL[record.confidence]}
          </span>
        </p>
        {!verdict.correct && verdict.misconceptionId && (
          <p className="misconception-id panel-label">
            Misconception <code>{verdict.misconceptionId}</code>
          </p>
        )}
        {!verdict.correct && record.confidence === 'sure' && (
          <p className="hypercorrection">
            You were sure, and many people are sure of this too. A confident mistake is the easiest
            kind to fix once you see the mechanism.
          </p>
        )}
        {feedback && (
          <p>
            <Inline text={feedback} />
          </p>
        )}
        <p className="explain">
          <Inline text={spec.explain} />
        </p>
      </div>
      {showOffer && <FastPathOffer />}
    </>
  );
}
