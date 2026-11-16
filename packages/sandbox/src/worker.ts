/// <reference lib="webworker" />
import { formatArgs } from './format.ts';
import type { ConsoleLevel, RunRequest, WorkerMessage } from './protocol.ts';

const post = (message: WorkerMessage) => self.postMessage(message);

for (const level of ['log', 'info', 'warn', 'error'] as const satisfies ConsoleLevel[]) {
  console[level] = (...args: unknown[]) =>
    post({ type: 'console', line: { level, text: formatArgs(args) } });
}

const fail = (error: unknown) =>
  post({
    type: 'error',
    name: error instanceof Error ? error.name : 'Uncaught',
    message: error instanceof Error ? error.message : formatArgs([error]),
  });

self.addEventListener('unhandledrejection', (event) => fail(event.reason));

// The run is finished when the module has evaluated and no timer is still pending.
// A snippet with a live setInterval never finishes and hits the caller's time limit.
const realSetTimeout = self.setTimeout.bind(self);
const realClearTimeout = self.clearTimeout.bind(self);
const realSetInterval = self.setInterval.bind(self);
const realClearInterval = self.clearInterval.bind(self);
const pending = new Set<number>();
let evaluated = false;

function checkDone() {
  // A zero-delay hop lets microtasks queued by the last callback run first.
  realSetTimeout(() => {
    if (evaluated && pending.size === 0) post({ type: 'done' });
  }, 0);
}

const timerApi = {
  setTimeout(handler: TimerHandler, delay?: number, ...args: unknown[]): number {
    const id = realSetTimeout(() => {
      pending.delete(id);
      try {
        if (typeof handler === 'function') handler(...args);
      } catch (error) {
        fail(error);
        return;
      }
      checkDone();
    }, delay);
    pending.add(id);
    return id;
  },
  clearTimeout(id?: number) {
    if (id === undefined) return;
    pending.delete(id);
    realClearTimeout(id);
    checkDone();
  },
  setInterval(handler: TimerHandler, delay?: number, ...args: unknown[]): number {
    const id = realSetInterval(() => {
      try {
        if (typeof handler === 'function') handler(...args);
      } catch (error) {
        fail(error);
      }
    }, delay);
    pending.add(id);
    return id;
  },
  clearInterval(id?: number) {
    if (id === undefined) return;
    pending.delete(id);
    realClearInterval(id);
    checkDone();
  },
};
Object.assign(self, timerApi);

// Snippets run as a classic script (indirect eval): sloppy mode, top-level var and
// function declarations become global properties. This matches how content-check runs
// them in Node (`node -e`) and how the trace generator evaluates them.
// biome-ignore lint/security/noGlobalEval: running the learner's code is this worker's job.
const evaluateScript = eval;

self.onmessage = (event: MessageEvent<RunRequest>) => {
  try {
    evaluateScript(event.data.code);
    evaluated = true;
    checkDone();
  } catch (error) {
    fail(error);
  }
};
