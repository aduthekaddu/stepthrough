import type { ReactNode } from 'react';
import styles from './deeper.module.css';

/** Correct detail that the main path can skip, folded away until the learner opens it. */
export function Deeper({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className={styles.deeper}>
      <summary className={styles.summary}>
        <span className={styles.label}>Go deeper</span>
        <span className={styles.title}>{title}</span>
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
