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

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const url = URL.createObjectURL(new Blob([event.data.code], { type: 'text/javascript' }));
  try {
    await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url);
    evaluated = true;
    checkDone();
  } catch (error) {
    fail(error);
  } finally {
    URL.revokeObjectURL(url);
  }
};
