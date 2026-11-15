import type { ReactNode } from 'react';
import { Inline } from './inline';

const CALLOUT_LABEL = {
  misconception: 'Misconception',
  warning: 'Warning',
  aside: 'Aside',
} as const;

export function Callout({
  kind,
  title,
  children,
}: {
  kind: keyof typeof CALLOUT_LABEL;
  title?: string | undefined;
  children: ReactNode;
}) {
  return (
    <aside className="callout" data-kind={kind}>
      <p className="panel-label">{CALLOUT_LABEL[kind]}</p>
      {title && <p className="callout-title">{title}</p>}
      <div className="callout-body">{children}</div>
    </aside>
  );
}

export function InterviewQ({
  id,
  question,
  rubric,
}: {
  id: string;
  question: string;
  rubric: string[];
}) {
  return (
    <section className="interview" id={`interview-${id}`} data-interaction="">
      <p className="panel-label">Interview question</p>
      <p className="interview-question">
        <Inline text={question} />
      </p>
      <details className="reveal">
        <summary className="ui">Show what a strong answer covers</summary>
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
