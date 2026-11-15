import { readFileSync } from 'node:fs';
import { generateTrace } from '../src/generate.ts';
import type { ArrayItem, BindingState } from '../src/types.ts';

const [file = '', detail = 'teaching', granularity = 'statement'] = process.argv.slice(2);
const trace = generateTrace({
  id: 'show',
  source: readFileSync(file, 'utf8'),
  detail: detail as 'teaching' | 'spec',
  granularity: granularity as 'statement' | 'expression',
});
const show = (v: BindingState | ArrayItem) =>
  v.kind === 'primitive'
    ? v.type === 'symbol'
      ? `${v.text}#${v.symbolId}`
      : v.text
    : v.kind === 'ref'
      ? `→${v.heapId}`
      : v.kind === 'hole'
        ? '<hole>'
        : '<TDZ>';
for (const f of trace.frames) {
  console.log(
    `#${f.step} ${f.kind} L${f.span?.startLine ?? '-'} stack=[${f.stack.map((s) => `${s.fn}:${s.callId}@${s.envId}`).join(' > ')}] console=${JSON.stringify(f.console)}`,
  );
  for (const e of f.envs)
    console.log(
      `    ${e.id} ${e.label} ^${e.parentId}: ${e.bindings.map((b) => `${b.decl} ${b.name}=${show(b.state)}`).join(', ')}`,
    );
  for (const h of f.heap)
    console.log(
      `    ${h.id} ${h.kind === 'function' ? `fn ${h.name}${h.arrow ? ' (arrow)' : ''} [[Env]]=${h.envId}` : h.kind === 'array' ? `[${h.items.map(show).join(', ')}]` : `${h.className ?? ''}{${h.props.map((p) => `${p.key}:${show(p.value)}`).join(', ')}}`}`,
    );
}
console.log('uncaught:', trace.uncaught);
