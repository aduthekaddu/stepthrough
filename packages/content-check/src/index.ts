import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { parseLesson } from './mdx.ts';
import { type Context, type Finding, type LessonInput, RULES } from './rules.ts';
import { Frontmatter, GlossaryFile, Misconception } from './schema.ts';

export type { Finding } from './rules.ts';

function lessonDirs(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (!statSync(full).isDirectory()) continue;
      if (existsSync(path.join(full, 'index.mdx'))) out.push(full);
      else walk(full);
    }
  };
  walk(root);
  return out.sort();
}

function readYamlDir(dir: string): [string, unknown][] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith('.yaml'))
    .sort()
    .map((n) => [path.join(dir, n), parseYaml(readFileSync(path.join(dir, n), 'utf8'))]);
}

/** Checks every lesson under `contentRoot` (e.g. apps/web/content). */
export function checkContent(contentRoot: string, today = new Date()): Finding[] {
  const findings: Finding[] = [];
  const ctx: Context = {
    glossary: new Map(),
    misconceptions: new Map(),
    prereqs: new Map(),
    today,
  };

  for (const [file, data] of readYamlDir(path.join(contentRoot, 'glossary'))) {
    const parsed = GlossaryFile.safeParse(data);
    if (!parsed.success) {
      findings.push({
        lesson: path.relative(contentRoot, file),
        rule: 'term-ref',
        severity: 'error',
        message: parsed.error.message,
      });
      continue;
    }
    for (const [id, entry] of Object.entries(parsed.data)) {
      if (ctx.glossary.has(id)) {
        findings.push({
          lesson: path.relative(contentRoot, file),
          rule: 'term-ref',
          severity: 'error',
          message: `term ${id} is defined twice`,
        });
      }
      ctx.glossary.set(id, entry);
    }
  }
  for (const [file, data] of readYamlDir(path.join(contentRoot, 'misconceptions'))) {
    const parsed = Misconception.safeParse(data);
    if (!parsed.success) {
      findings.push({
        lesson: path.relative(contentRoot, file),
        rule: 'misconception-ref',
        severity: 'error',
        message: parsed.error.message,
      });
      continue;
    }
    ctx.misconceptions.set(parsed.data.id, parsed.data);
  }

  const lessons: LessonInput[] = [];
  const ids = new Map<string, string>();
  for (const dir of lessonDirs(contentRoot)) {
    const rel = path.relative(contentRoot, dir);
    let parsed: ReturnType<typeof parseLesson>;
    try {
      parsed = parseLesson(readFileSync(path.join(dir, 'index.mdx'), 'utf8'));
    } catch (error) {
      findings.push({
        lesson: rel,
        rule: 'frontmatter',
        severity: 'error',
        message: `MDX does not parse: ${(error as Error).message}`,
      });
      continue;
    }
    const fm = Frontmatter.safeParse(parsed.frontmatter);
    if (!fm.success) {
      findings.push({
        lesson: rel,
        rule: 'frontmatter',
        severity: 'error',
        message: fm.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      });
      continue;
    }
    const other = ids.get(fm.data.id);
    if (other)
      findings.push({
        lesson: rel,
        rule: 'frontmatter',
        severity: 'error',
        message: `id ${fm.data.id} is also used by ${other}`,
      });
    ids.set(fm.data.id, rel);
    ctx.prereqs.set(fm.data.id, fm.data.prereqs);
    const examplesDir = path.join(dir, 'examples');
    const exampleNames = new Set(
      existsSync(examplesDir)
        ? readdirSync(examplesDir)
            .filter((n) => n.endsWith('.js'))
            .map((n) => n.slice(0, -3))
        : [],
    );
    lessons.push({ path: rel, frontmatter: fm.data, parsed, exampleNames });
  }

  for (const lesson of lessons) {
    for (const p of lesson.frontmatter.prereqs) {
      if (!ids.has(p))
        findings.push({
          lesson: lesson.path,
          rule: 'frontmatter',
          severity: 'error',
          message: `unknown prerequisite ${p}`,
        });
    }
    for (const rule of RULES) findings.push(...rule(lesson, ctx));
  }
  return findings;
}
