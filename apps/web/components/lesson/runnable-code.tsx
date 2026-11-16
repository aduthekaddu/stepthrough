'use client';

import type { EditorView } from '@codemirror/view';
import { type RunResult, runInSandbox } from '@stepthrough/sandbox';
import { type ReactNode, useEffect, useRef, useState } from 'react';

type RunState = { kind: 'idle' } | { kind: 'running' } | { kind: 'done'; result: RunResult };

const createWorker = () =>
  new Worker(new URL('./sandbox.worker.ts', import.meta.url), { type: 'module' });

export function RunnableCode({ code, highlighted }: { code: string; highlighted: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const inFlight = useRef(false);
  const [editorReady, setEditorReady] = useState(false);
  const [run, setRun] = useState<RunState>({ kind: 'idle' });

  async function execute() {
    if (inFlight.current) return;
    inFlight.current = true;
    setRun({ kind: 'running' });
    const result = await runInSandbox(view.current?.state.doc.toString() ?? code, {
      createWorker,
    });
    inFlight.current = false;
    setRun({ kind: 'done', result });
  }
  const executeRef = useRef(execute);
  executeRef.current = execute;

  useEffect(() => {
    let cancelled = false;
    let editor: EditorView | undefined;
    void import('./editor').then(({ mountEditor }) => {
      if (cancelled || !host.current) return;
      editor = mountEditor(host.current, code, 'Code editor', () => void executeRef.current());
      view.current = editor;
      setEditorReady(true);
    });
    return () => {
      cancelled = true;
      editor?.destroy();
      view.current = null;
    };
  }, [code]);

  function reset() {
    const editor = view.current;
    if (!editor) return;
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: code } });
    setRun({ kind: 'idle' });
  }

  return (
    <figure className="runnable" data-interaction="">
      <div className="runnable-bar">
        <p className="panel-label">JavaScript · runs in your browser</p>
        <div className="button-row">
          {editorReady && (
            <button type="button" className="btn" onClick={reset}>
              Reset
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void execute()}
            disabled={run.kind === 'running'}
          >
            Run
          </button>
        </div>
      </div>
      {!editorReady && highlighted}
      <div ref={host} className="editor-host" hidden={!editorReady} />
      <div className="console" aria-live="polite" aria-busy={run.kind === 'running'}>
        {run.kind === 'running' && <p className="console-status ui">Running…</p>}
        {run.kind === 'done' && <RunOutput result={run.result} />}
      </div>
    </figure>
  );
}

function RunOutput({ result }: { result: RunResult }) {
  return (
    <>
      <p className="panel-label">Console</p>
      {result.console.length > 0 && (
        <ol className="console-lines">
          {result.console.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: console lines never reorder
            <li key={i} data-level={line.level}>
              {line.text}
            </li>
          ))}
        </ol>
      )}
      {result.status === 'ok' && (
        <p className="console-status ui">
          {result.console.length ? 'Finished.' : 'Finished with no console output.'}
        </p>
      )}
      {result.status === 'error' && (
        <p className="run-error">
          Uncaught {result.name}: {result.message}
        </p>
      )}
      {result.status === 'timeout' && (
        <p className="run-error">
          Stopped after {result.limitMs / 1000} s. The code was still running, so the sandbox ended
          it. A loop that never ends, such as <code>while (true) {'{}'}</code>, runs until something
          stops it.
        </p>
      )}
    </>
  );
}
