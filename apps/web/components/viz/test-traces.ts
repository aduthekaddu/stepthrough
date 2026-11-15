import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Trace } from '@stepthrough/trace';

/** Reads a committed fixture trace for tests. */
export function fixture(name: string): Trace {
  const file = join(import.meta.dirname, '../../generated/traces/fixtures', `${name}.json`);
  return JSON.parse(readFileSync(file, 'utf8')) as Trace;
}
