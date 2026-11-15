import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const Frontmatter = z.object({
  id: z.string(),
  track: z.string(),
  title: z.string(),
  minutes: z.number().int().positive(),
});
export type Frontmatter = z.infer<typeof Frontmatter>;

export async function readLesson(track: string, lesson: string): Promise<Frontmatter> {
  const raw = await readFile(path.join(CONTENT_DIR, track, `${lesson}.mdx`), 'utf8');
  const match = /^---\n([\s\S]*?)\n---/.exec(raw);
  if (!match?.[1]) throw new Error(`${track}/${lesson}.mdx has no frontmatter`);
  return Frontmatter.parse(parse(match[1]));
}

export async function listLessons(): Promise<{ track: string; lesson: string }[]> {
  const tracks = await readdir(CONTENT_DIR);
  const all = await Promise.all(
    tracks.map(async (track) =>
      (await readdir(path.join(CONTENT_DIR, track)))
        .filter((f) => f.endsWith('.mdx'))
        .map((f) => ({ track, lesson: f.slice(0, -4) })),
    ),
  );
  return all.flat();
}
