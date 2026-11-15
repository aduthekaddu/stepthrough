import type { ConsoleLine, RunResult, WorkerMessage } from './protocol.ts';

export { formatArgs } from './format.ts';
export type { ConsoleLine, RunResult } from './protocol.ts';

export const DEFAULT_LIMIT_MS = 2000;

/**
 * Runs a snippet as a classic script in a fresh Worker. The worker is always terminated:
 * on completion, on an uncaught error, or when the time limit passes (an infinite loop
 * cannot be interrupted any other way).
 */
export function runInSandbox(
  code: string,
  { limitMs = DEFAULT_LIMIT_MS, createWorker }: { limitMs?: number; createWorker: () => Worker },
): Promise<RunResult> {
  const worker = createWorker();
  const lines: ConsoleLine[] = [];
  return new Promise<RunResult>((resolve) => {
    const finish = (result: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };
    const timer = setTimeout(() => finish({ status: 'timeout', console: lines, limitMs }), limitMs);
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const msg = event.data;
      if (msg.type === 'console') lines.push(msg.line);
      else if (msg.type === 'done') finish({ status: 'ok', console: lines });
      else finish({ status: 'error', console: lines, name: msg.name, message: msg.message });
    };
    worker.onerror = (event) => {
      event.preventDefault();
      finish({ status: 'error', console: lines, name: 'Error', message: event.message });
    };
    worker.postMessage({ code });
  });
}
