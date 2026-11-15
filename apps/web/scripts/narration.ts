import type { Binding, Frame } from '@stepthrough/trace';
import { z } from 'zod';

const MARK = /\s*\/\/\s*@mark\s+(\S+)\s*$/;

/**
 * Removes `// @mark name` comments from the ends of lines. Lines are kept, so trace spans
 * still match the displayed code.
 */
export function stripMarks(source: string): { code: string; marks: Map<string, number> } {
  const marks = new Map<string, number>();
  const lines = source.split('\n').map((line, index) => {
    const match = MARK.exec(line);
    if (!match?.[1]) return line;
    const name = match[1];
    const code = line.slice(0, match.index);
    if (code.trim() === '') throw new Error(`@mark ${name} on line ${index + 1} has no code`);
    if (marks.has(name)) throw new Error(`@mark ${name} appears twice`);
    marks.set(name, index + 1);
    return code;
  });
  return { code: lines.join('\n'), marks };
}

const FrameKindSchema = z.enum([
  'start',
  'enter',
  'statement',
  'expression',
  'return',
  'end',
  'throw',
]);

/**
 * Hand-written facts about one step, derived from the spec rather than from the generator,
 * so a wrong trace fails the build. A binding value is the primitive's text ("0", "\"hi\""),
 * "uninitialized" for the TDZ, or "function name" / "array" / "object" for a reference.
 */
const Expectation = z.union([
  z.strictObject({ record: z.string().min(1), binding: z.string().min(1), value: z.string() }),
  z.strictObject({ stackDepth: z.number().int().min(0) }),
  z.strictObject({ record: z.string().min(1), exists: z.boolean() }),
  z.strictObject({ console: z.array(z.string()) }),
]);
export type Expectation = z.infer<typeof Expectation>;

function describeValue(frame: Frame, state: Binding['state']): string {
  if (state.kind === 'uninitialized') return 'uninitialized';
  if (state.kind === 'primitive') return state.text;
  const obj = frame.heap.find((h) => h.id === state.heapId);
  if (!obj) return 'ref';
  return obj.kind === 'function' ? `function ${obj.name}` : obj.kind;
}

/** Returns why the frame breaks the expectation, or null when it holds. */
export function checkExpectation(frame: Frame, e: Expectation): string | null {
  if ('stackDepth' in e) {
    return frame.stack.length === e.stackDepth
      ? null
      : `stack depth is ${frame.stack.length}, expected ${e.stackDepth}`;
  }
  if ('console' in e) {
    const actual = JSON.stringify(frame.console);
    return actual === JSON.stringify(e.console)
      ? null
      : `console is ${actual}, expected ${JSON.stringify(e.console)}`;
  }
  const record = frame.envs.find((r) => r.label === e.record);
  if ('exists' in e) {
    return Boolean(record) === e.exists
      ? null
      : `record "${e.record}" ${record ? 'exists' : 'is missing'}`;
  }
  if (!record)
    return `no record "${e.record}" (records: ${frame.envs.map((r) => r.label).join(', ')})`;
  const binding = record.bindings.find((b) => b.name === e.binding);
  if (!binding) return `no binding ${e.binding} in "${e.record}"`;
  const actual = describeValue(frame, binding.state);
  return actual === e.value
    ? null
    : `${e.binding} in "${e.record}" is ${actual}, expected ${e.value}`;
}

export const NarrationFile = z.strictObject({
  detail: z.enum(['teaching', 'spec']).default('teaching'),
  granularity: z.enum(['statement', 'expression']).default('statement'),
  steps: z
    .array(
      z.strictObject({
        at: z.strictObject({ mark: z.string().min(1), kind: FrameKindSchema }),
        say: z.string().min(1),
        expect: z.array(Expectation).optional(),
      }),
    )
    .default([]),
});
export type NarrationFile = z.infer<typeof NarrationFile>;

/**
 * Puts each authored sentence on the first frame whose kind matches and whose span starts on
 * the marked line. Throws when a mark is unknown or no frame matches, so the build fails.
 */
export function bindNarration(
  frames: readonly Frame[],
  steps: NarrationFile['steps'],
  marks: ReadonlyMap<string, number>,
): Frame[] {
  const bound = frames.map((frame) => ({ ...frame }));
  for (const { at, say, expect = [] } of steps) {
    const line = marks.get(at.mark);
    if (line === undefined) throw new Error(`narration names unknown mark "${at.mark}"`);
    const frame = bound.find((f) => f.kind === at.kind && f.span?.startLine === line);
    if (!frame) throw new Error(`no ${at.kind} frame starts on line ${line} (mark "${at.mark}")`);
    frame.narration = say;
    const broken = expect.map((e) => checkExpectation(frame, e)).filter((m) => m !== null);
    if (broken.length) {
      throw new Error(
        `step ${frame.step} (mark "${at.mark}") breaks its expectations: ${broken.join('; ')}`,
      );
    }
  }
  return bound;
}
