export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error';

export type ConsoleLine = { level: ConsoleLevel; text: string };

export type RunRequest = { code: string };

export type WorkerMessage =
  | { type: 'console'; line: ConsoleLine }
  | { type: 'done' }
  | { type: 'error'; name: string; message: string };

export type RunResult =
  | { status: 'ok'; console: ConsoleLine[] }
  | { status: 'error'; console: ConsoleLine[]; name: string; message: string }
  | { status: 'timeout'; console: ConsoleLine[]; limitMs: number };
