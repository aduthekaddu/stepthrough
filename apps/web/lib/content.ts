import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  Frontmatter,
  GlossaryEntry,
  HIDDEN_TRACKS,
  Misconception,
} from '@stepthrough/content-check/schema';
import { parse } from 'yaml';
import { z } from 'zod';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// One schema for the build and for content-check, so the two cannot drift.
export { Frontmatter };

export type Lesson = { track: string; slug: string; href: string; meta: Frontmatter };

function readFrontmatter(file: string): Frontmatter {
  const match = /^---\n([\s\S]*?)\n---/.exec(readFileSync(file, 'utf8'));
  if (!match?.[1]) throw new Error(`${file} has no frontmatter`);
  const result = Frontmatter.safeParse(parse(match[1]));
  if (!result.success) throw new Error(`${file}: ${z.prettifyError(result.error)}`);
  return result.data;
}

const subdirs = (dir: string) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

function loadLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (const track of subdirs(CONTENT_DIR)) {
    for (const slug of subdirs(path.join(CONTENT_DIR, track))) {
      const file = path.join(CONTENT_DIR, track, slug, 'index.mdx');
      if (!existsSync(file)) continue;
      const meta = readFrontmatter(file);
      if (meta.track !== track) throw new Error(`${file}: track "${meta.track}" is not "${track}"`);
      lessons.push({ track, slug, href: `/learn/${track}/${slug}/`, meta });
    }
  }
  const ids = new Set<string>();
  for (const { meta } of lessons) {
    if (ids.has(meta.id)) throw new Error(`Two lessons use the id "${meta.id}"`);
    ids.add(meta.id);
  }
  for (const { meta } of lessons) {
    const unknown = meta.prereqs.filter((id) => !ids.has(id));
    if (unknown.length) throw new Error(`${meta.id}: unknown prerequisites ${unknown.join(', ')}`);
  }
  return lessons;
}

let lessonCache: Lesson[] | undefined;
export function listLessons(): Lesson[] {
  lessonCache ??= loadLessons();
  return lessonCache;
}

/** Lessons on the learning path: everything except hidden tracks such as the component demo. */
export function listPathLessons(): Lesson[] {
  return listLessons().filter((l) => !HIDDEN_TRACKS.includes(l.track));
}

let misconceptionCache: Map<string, Misconception> | undefined;
/** The misconception registry, content/misconceptions/<ID>.yaml, parsed once per build. */
export function misconceptions(): Map<string, Misconception> {
  if (misconceptionCache) return misconceptionCache;
  const dir = path.join(CONTENT_DIR, 'misconceptions');
  misconceptionCache = new Map();
  if (existsSync(dir)) {
    for (const name of readdirSync(dir)
      .filter((n) => n.endsWith('.yaml'))
      .sort()) {
      const file = path.join(dir, name);
      const result = Misconception.safeParse(parse(readFileSync(file, 'utf8')));
      if (!result.success) throw new Error(`${file}: ${z.prettifyError(result.error)}`);
      misconceptionCache.set(result.data.id, result.data);
    }
  }
  return misconceptionCache;
}

export function findLesson(track: string, slug: string): Lesson {
  const lesson = listLessons().find((l) => l.track === track && l.slug === slug);
  if (!lesson) throw new Error(`No lesson at content/${track}/${slug}/index.mdx`);
  return lesson;
}

export function lessonById(id: string): Lesson {
  const lesson = listLessons().find((l) => l.meta.id === id);
  if (!lesson) throw new Error(`No lesson with id "${id}"`);
  return lesson;
}

export type { GlossaryEntry };

const GlossaryFile = z.record(z.string(), GlossaryEntry);

// Terms live in content/glossary.yaml or one file per lesson in content/glossary/*.yaml.
function loadGlossary(): Map<string, GlossaryEntry> {
  const single = path.join(CONTENT_DIR, 'glossary.yaml');
  const dir = path.join(CONTENT_DIR, 'glossary');
  const files = [
    ...(existsSync(single) ? [single] : []),
    ...(existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith('.yaml'))
          .sort()
          .map((f) => path.join(dir, f))
      : []),
  ];
  const glossary = new Map<string, GlossaryEntry>();
  for (const file of files) {
    const result = GlossaryFile.safeParse(parse(readFileSync(file, 'utf8')) ?? {});
    if (!result.success) throw new Error(`${file}: ${z.prettifyError(result.error)}`);
    for (const [id, entry] of Object.entries(result.data)) {
      if (glossary.has(id)) throw new Error(`${file}: glossary term "${id}" is defined twice`);
      glossary.set(id, entry);
    }
  }
  return glossary;
}

let glossaryCache: Map<string, GlossaryEntry> | undefined;
export function glossaryEntry(id: string): GlossaryEntry {
  glossaryCache ??= loadGlossary();
  const entry = glossaryCache.get(id);
  if (!entry) throw new Error(`Term "${id}" is not in the glossary`);
  return entry;
}
