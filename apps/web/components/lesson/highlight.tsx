import { classHighlighter, highlightCode } from '@lezer/highlight';
import { parser } from '@lezer/javascript';
import type { ReactNode } from 'react';

/**
 * Highlights JavaScript at build time with the same `tok-*` classes the editor uses. Each
 * source line is its own block, so a line that wraps on a narrow screen can hang its indent.
 */
export function highlightJs(code: string): ReactNode[] {
  const lines: ReactNode[][] = [[]];
  highlightCode(
    code,
    parser.parse(code),
    classHighlighter,
    (text, classes) => {
      const line = lines.at(-1);
      line?.push(
        classes ? (
          <span key={line.length} className={classes}>
            {text}
          </span>
        ) : (
          text
        ),
      );
    },
    () => lines.push([]),
  );
  // Each line keeps its newline so copied text and the accessible text match the source.
  return lines.map((tokens, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: lines of a fixed string never reorder.
    <span key={i} className="code-line">
      {tokens}
      {i < lines.length - 1 && '\n'}
    </span>
  ));
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="code-pre">
      <code>{highlightJs(code)}</code>
    </pre>
  );
}
