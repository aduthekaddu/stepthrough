import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateTrace } from '@stepthrough/trace/generate';
import { parse as parseYaml } from 'yaml';
import { bindNarration, NarrationFile, stripMarks } from './narration.ts';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(appDir, 'generated', 'traces');

type Example = { id: string; file: string };

function jsFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.js'))
    .sort()
    .map((name) => join(dir, name));
}

function exampleDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      return entry.name === 'examples' ? [path] : exampleDirs(path);
    });
}

/**
 * Fixtures get ids under `fixtures/`. Lesson examples are named by file, so `<Viz example>`
 * needs no lesson path; two examples with one name fail the build.
 */
function findExamples(): Example[] {
  const fixtures = jsFiles(join(appDir, 'viz-fixtures')).map((file) => ({
    id: `fixtures/${basename(file, '.js')}`,
    file,
  }));
  const lessons = exampleDirs(join(appDir, 'content'))
    .flatMap(jsFiles)
    .map((file) => ({ id: basename(file, '.js'), file }));
  const seen = new Map<string, string>();
  for (const { id, file } of lessons) {
    const other = seen.get(id);
    if (other) throw new Error(`example name "${id}" is used by ${other} and ${file}`);
    seen.set(id, file);
  }
  return [...fixtures, ...lessons];
}

function readNarration(file: string): NarrationFile {
  const path = file.replace(/\.js$/, '.narration.yaml');
  if (!existsSync(path)) return NarrationFile.parse({});
  return NarrationFile.parse(parseYaml(readFileSync(path, 'utf8')) ?? {});
}

rmSync(outDir, { recursive: true, force: true });
for (const { id, file } of findExamples()) {
  const where = relative(appDir, file);
  try {
    const { code, marks } = stripMarks(readFileSync(file, 'utf8'));
    const narration = readNarration(file);
    const trace = generateTrace({
      id,
      source: code,
      detail: narration.detail,
      granularity: narration.granularity,
    });
    const frames = bindNarration(trace.frames, narration.steps, marks);
    const out = join(outDir, `${id}.json`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify({ ...trace, frames }, null, 2)}\n`);
    console.log(`trace ${id}: ${frames.length} frames (${where})`);
  } catch (error) {
    throw new Error(`${where}: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
}
