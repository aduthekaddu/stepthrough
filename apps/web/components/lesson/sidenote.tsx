'use client';

import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Placement = { slot: HTMLElement; number: number };

/**
 * At 1280px and wider the note floats into the margin level with its number. Narrower, the
 * number is a button that opens the note under its paragraph, in a slot added at the end of it.
 */
export function Sidenote({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const noteId = `${useId()}-note`;

  useEffect(() => {
    const self = ref.current;
    const block = self?.closest('p, li');
    if (!self || !block) return;
    const slot = document.createElement('span');
    slot.className = 'sidenote-slot';
    block.append(slot);
    const number = Array.from(document.querySelectorAll('.sidenote')).indexOf(self) + 1;
    setPlacement({ slot, number });
    return () => slot.remove();
  }, []);

  return (
    <span ref={ref} className="sidenote">
      <sup className="sidenote-mark" aria-hidden="true" />
      <button
        type="button"
        className="sidenote-toggle"
        aria-expanded={open}
        aria-controls={noteId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">Sidenote </span>
      </button>
      <span className="sidenote-note" role="note">
        {children}
      </span>
      {placement &&
        createPortal(
          <span
            id={noteId}
            className="sidenote-below"
            data-n={placement.number}
            hidden={!open}
            role="note"
          >
            {children}
          </span>,
          placement.slot,
        )}
    </span>
  );
}
