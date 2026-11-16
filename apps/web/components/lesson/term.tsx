import { type CSSProperties, type ReactNode, useId } from 'react';
import { glossaryEntry } from '@/lib/content';

/**
 * A toggletip: hover, focus or long-press shows the definition (`interestfor`), and a click or
 * tap shows it too (`popovertarget`). `PopoverSupport` keeps `aria-expanded` in sync.
 */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const entry = glossaryEntry(id);
  const hintId = `term-${useId().replace(/[^\w-]/g, '')}`;
  const anchor = { '--term-anchor': `--${hintId}` } as CSSProperties;
  const invoker = { interestfor: hintId };
  return (
    <>
      <button
        type="button"
        className="term"
        data-term={id}
        popoverTarget={hintId}
        popoverTargetAction="show"
        aria-expanded="false"
        style={anchor}
        {...invoker}
      >
        {children}
      </button>
      <span id={hintId} popover="hint" role="tooltip" className="term-hint" style={anchor}>
        <span className="term-hint-name">{entry.term}</span> {entry.definition}
      </span>
    </>
  );
}
