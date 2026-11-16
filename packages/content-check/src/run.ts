import { spawnSync } from 'node:child_process';

export type RunOutcome =
  | { status: 'ok'; lines: string[] }
  | { status: 'threw'; lines: string[]; error: string }
  | { status: 'timeout'; lines: string[] };

/**
 * Runs a snippet the way every lesson snippet runs: as a classic script (`node -e`),
 * so top-level var lands on the global object as it does in a browser <script>.
 */
export function runSnippet(code: string, timeoutMs = 5000): RunOutcome {
  const result = spawnSync(process.execPath, ['-e', code], {
    encoding: 'utf8',
    timeout: timeoutMs,
  });
  const lines = result.stdout ? result.stdout.replace(/\n$/, '').split('\n') : [];
  if (result.error && (result.error as NodeJS.ErrnoException).code === 'ETIMEDOUT') {
    return { status: 'timeout', lines };
  }
  if (result.status !== 0) {
    const errorLine =
      result.stderr.split('\n').find((l) => /^\w*Error\b|^Uncaught/.test(l)) ??
      result.stderr.trim();
    return { status: 'threw', lines, error: errorLine };
  }
  return { status: 'ok', lines };
}
