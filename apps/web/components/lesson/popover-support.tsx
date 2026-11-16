'use client';

import { useEffect } from 'react';

const isHint = (el: EventTarget | null): el is HTMLElement =>
  el instanceof HTMLElement && el.getAttribute('popover') === 'hint';

/** Loads the `interestfor` polyfill where needed and keeps toggletip triggers' `aria-expanded` in sync. */
export function PopoverSupport() {
  useEffect(() => {
    if (!('interestForElement' in HTMLButtonElement.prototype)) void import('interestfor');

    // Where `hint` is unsupported it falls back to `manual`, which a tap would never close.
    const probe = document.createElement('div');
    probe.setAttribute('popover', 'hint');
    const hintSupported = probe.popover === 'hint';
    const onBeforeToggle = (event: Event) => {
      if (isHint(event.target) && (event as ToggleEvent).newState === 'open') {
        event.target.popover = 'auto';
      }
    };

    const onToggle = (event: Event) => {
      const hint = event.target;
      if (!(hint instanceof HTMLElement) || !hint.id) return;
      const open = (event as ToggleEvent).newState === 'open';
      for (const trigger of document.querySelectorAll(
        `[popovertarget="${CSS.escape(hint.id)}"][aria-expanded]`,
      )) {
        trigger.setAttribute('aria-expanded', String(open));
      }
    };

    // Neither event bubbles, so listen in the capture phase.
    if (!hintSupported) document.addEventListener('beforetoggle', onBeforeToggle, true);
    document.addEventListener('toggle', onToggle, true);
    return () => {
      document.removeEventListener('beforetoggle', onBeforeToggle, true);
      document.removeEventListener('toggle', onToggle, true);
    };
  }, []);
  return null;
}
