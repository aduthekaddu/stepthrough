import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { syntaxHighlighting } from '@codemirror/language';
import { EditorView, keymap } from '@codemirror/view';
import { classHighlighter } from '@lezer/highlight';

/** Loaded on demand so the first paint of a lesson ships no editor code. */
export function mountEditor(parent: HTMLElement, doc: string, label: string, onRun: () => void) {
  return new EditorView({
    parent,
    doc,
    extensions: [
      history(),
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            onRun();
            return true;
          },
        },
        ...defaultKeymap,
        ...historyKeymap,
      ]),
      javascript(),
      syntaxHighlighting(classHighlighter),
      EditorView.contentAttributes.of({ 'aria-label': label }),
    ],
  });
}
