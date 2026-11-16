import { classHighlighter, highlightCode } from '@lezer/highlight';
import { parser } from '@lezer/javascript';
import type { ReactNode } from 'react';

/** Highlights JavaScript at build time with the same `tok-*` classes the editor uses. */
export function highlightJs(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  highlightCode(
    code,
    parser.parse(code),
    classHighlighter,
    (text, classes) => {
      out.push(
        classes ? (
          <span key={out.length} className={classes}>
            {text}
          </span>
        ) : (
          text
        ),
      );
    },
    () => out.push('\n'),
  );
  return out;
}

export function CodeBlock({ code }: { code: string }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users must be able to scroll code wider than the column (axe scrollable-region-focusable).
    <pre className="code-pre" tabIndex={0}>
      <code>{highlightJs(code)}</code>
    </pre>
  );
}
