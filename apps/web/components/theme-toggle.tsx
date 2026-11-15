'use client';

import { useSyncExternalStore } from 'react';
import { THEME_KEY, type ThemeChoice } from '@/lib/theme';

const CHOICES: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/** The `data-theme` attribute is the live state; storage only carries it across loads and tabs. */
function readChoice(): ThemeChoice {
  const theme = document.documentElement.dataset.theme;
  return theme === 'light' || theme === 'dark' ? theme : 'system';
}

function applyChoice(choice: ThemeChoice) {
  if (choice === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
}

function choose(choice: ThemeChoice) {
  applyChoice(choice);
  try {
    if (choice === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Storage can be blocked; the theme still applies to this page.
  }
}

function subscribeChoice(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY) return;
    applyChoice(
      event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : 'system',
    );
  };
  window.addEventListener('storage', onStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener('storage', onStorage);
  };
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');
function subscribeSystem(onChange: () => void) {
  const query = darkQuery();
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribeChoice, readChoice, () => null);
  const systemDark = useSyncExternalStore(
    subscribeSystem,
    () => darkQuery().matches,
    () => null,
  );
  return (
    <fieldset className="theme-toggle segmented ui">
      <legend className="sr-only">Colour theme</legend>
      {CHOICES.map(({ value, label }) => (
        <label key={value}>
          <input
            type="radio"
            name="theme"
            value={value}
            checked={choice === value}
            onChange={() => choose(value)}
          />
          {label}
          {value === 'system' && systemDark !== null && (
            <span className="theme-now">({systemDark ? 'dark' : 'light'})</span>
          )}
        </label>
      ))}
    </fieldset>
  );
}
