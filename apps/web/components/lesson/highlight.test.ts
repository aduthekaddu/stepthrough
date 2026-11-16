import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CodeBlock } from './highlight.tsx';

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'" };
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#x27);/g, (_, e: string) => ENTITIES[e] ?? '');

describe('CodeBlock', () => {
  const code = 'const a = 1;\n\nfunction f() {\n  return "x" < \'y\';\n}';
  const html = renderToStaticMarkup(createElement(CodeBlock, { code }));

  it('keeps the source text exactly, newlines and blank lines included', () => {
    expect(textOf(html)).toBe(code);
  });

  it('wraps each source line in its own block so a long line can hang its indent', () => {
    expect(html.match(/class="code-line"/g)).toHaveLength(5);
  });
});
