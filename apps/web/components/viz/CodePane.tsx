import styles from './viz.module.css';

const NEAR = 2;

/** The traced source with the current line marked and a dot on every line already run. */
export function CodePane({
  source,
  current,
  ran,
}: {
  source: string;
  current: number | null;
  ran: ReadonlySet<number>;
}) {
  const lines = source.replace(/\n$/, '').split('\n');
  const centre = current ?? 1;
  const start = Math.max(1, Math.min(centre - NEAR, lines.length - 2 * NEAR));
  return (
    <pre className={styles.code}>
      <code>
        {lines.map((text, i) => {
          const n = i + 1;
          return (
            <span
              key={n}
              className={styles.line}
              data-current={n === current || undefined}
              data-ran={ran.has(n) || undefined}
              data-near={(n >= start && n <= start + 2 * NEAR) || undefined}
              aria-current={n === current ? 'step' : undefined}
            >
              <span className={styles.ranDot} aria-hidden="true" />
              <span className={styles.lineNo} aria-hidden="true">
                {n}
              </span>
              <span className={styles.lineText}>{text || ' '}</span>
            </span>
          );
        })}
      </code>
    </pre>
  );
}
