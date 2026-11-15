import type { Frame } from '@stepthrough/trace';
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

export const NarrationFile = z.strictObject({
  detail: z.enum(['teaching', 'spec']).default('teaching'),
  granularity: z.enum(['statement', 'expression']).default('statement'),
  steps: z
    .array(
      z.strictObject({
        at: z.strictObject({ mark: z.string().min(1), kind: FrameKindSchema }),
        say: z.string().min(1),
        // TODO(lesson pipeline): check each expectation against the bound frame and fail the
        // build on a mismatch. Parsed here so a malformed list already fails.
        expect: z.array(z.record(z.string(), z.unknown())).optional(),
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
  for (const { at, say } of steps) {
    const line = marks.get(at.mark);
    if (line === undefined) throw new Error(`narration names unknown mark "${at.mark}"`);
    const frame = bound.find((f) => f.kind === at.kind && f.span?.startLine === line);
    if (!frame) throw new Error(`no ${at.kind} frame starts on line ${line} (mark "${at.mark}")`);
    frame.narration = say;
  }
  return bound;
}
