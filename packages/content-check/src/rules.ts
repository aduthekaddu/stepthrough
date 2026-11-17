import type { JsxElement, ParsedLesson } from './mdx.ts';
import { runSnippet } from './run.ts';
import {
  type Frontmatter,
  type GlossaryEntry,
  type Misconception,
  parsePredict,
} from './schema.ts';

export type Severity = 'error' | 'warning';
export type RuleId =
  | 'frontmatter'
  | 'first-element'
  | 'predict-shape'
  | 'predict-output'
  | 'misconception-ref'
  | 'term-ref'
  | 'term-order'
  | 'banned-phrase'
  | 'prose-run'
  | 'code-annotation'
  | 'sources'
  | 'verified-at'
  | 'viz-example'
  | 'segment';

export type Finding = {
  lesson: string;
  rule: RuleId;
  severity: Severity;
  message: string;
  line?: number;
};

export type LessonInput = {
  /** Folder path relative to the content root, e.g. javascript/values-and-references. */
  path: string;
  frontmatter: Frontmatter;
  parsed: ParsedLesson;
  exampleNames: Set<string>;
};

export type Context = {
  glossary: Map<string, GlossaryEntry>;
  misconceptions: Map<string, Misconception>;
  /** Lesson id → its prerequisites, for term-order checks across lessons. */
  prereqs: Map<string, string[]>;
  today: Date;
};

type Rule = (lesson: LessonInput, ctx: Context) => Finding[];

const BANNED = [
  'delve',
  "in today's fast-paced",
  'unlock',
  'supercharge',
  'game-changer',
  "it's important to note",
  'it is important to note',
  'dive deep',
  'seamless',
  'leverage',
  'in conclusion',
];
const EMOJI = /\p{Extended_Pictographic}/u;
const INTERACTIONS = new Set([
  'Predict',
  'Viz',
  'Figure',
  'Code',
  'ExplainBack',
  'InterviewQ',
  'Card',
]);
const OUTPUT_PROMPT = /\b(print|prints|log|logs|output|outputs|show|shows)\b/i;
const PRIMARY_SOURCES = [
  'tc39.es',
  'developer.mozilla.org',
  'v8.dev',
  'nodejs.org',
  'html.spec.whatwg.org',
  'react.dev',
  'nextjs.org',
  'www.typescriptlang.org',
  'www.postgresql.org',
  'www.rfc-editor.org',
  'datatracker.ietf.org',
  'owasp.org',
  'docs.anthropic.com',
  'platform.openai.com',
  'web.dev',
  'learn.microsoft.com',
  'man7.org',
];

const f = (
  lesson: LessonInput,
  rule: RuleId,
  message: string,
  line?: number,
  severity: Severity = 'error',
): Finding =>
  line === undefined
    ? { lesson: lesson.path, rule, severity, message }
    : { lesson: lesson.path, rule, severity, message, line };

const predicts = (lesson: LessonInput) =>
  lesson.parsed.elements.filter((e) => e.name === 'Predict');

function predictProps(el: JsxElement) {
  return parsePredict(el.props);
}

const firstElement: Rule = (lesson) => {
  const first = lesson.parsed.firstElement;
  return first === 'Predict' ||
    first === 'Code' ||
    first === 'Viz' ||
    first === 'Figure' ||
    first === 'code'
    ? []
    : [
        f(
          lesson,
          'first-element',
          `the lesson must open with a Predict, code or diagram, found ${first}`,
        ),
      ];
};

const predictShape: Rule = (lesson) => {
  const out: Finding[] = [];
  const ids = new Set<string>();
  for (const el of predicts(lesson)) {
    const parsed = predictProps(el);
    if (!parsed.success) {
      out.push(
        f(
          lesson,
          'predict-shape',
          `Predict is malformed: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
          el.line,
        ),
      );
      continue;
    }
    const p = parsed.data;
    if (ids.has(p.id))
      out.push(f(lesson, 'predict-shape', `duplicate Predict id ${p.id}`, el.line));
    ids.add(p.id);
    if (p.kind === 'choice') {
      if (!p.options.some((o) => o.id === p.answer)) {
        out.push(
          f(
            lesson,
            'predict-shape',
            `Predict ${p.id}: answer ${p.answer} is not an option id`,
            el.line,
          ),
        );
      }
      for (const o of p.options) {
        if (o.id !== p.answer && !o.misconception) {
          out.push(
            f(
              lesson,
              'predict-shape',
              `Predict ${p.id}: wrong option ${o.id} names no misconception`,
              el.line,
              'warning',
            ),
          );
        }
      }
    }
  }
  return out;
};

const predictOutput: Rule = (lesson) => {
  const out: Finding[] = [];
  for (const el of predicts(lesson)) {
    const parsed = predictProps(el);
    if (!parsed.success || !parsed.data.code || !OUTPUT_PROMPT.test(parsed.data.prompt)) continue;
    const p = parsed.data;
    const run = runSnippet(p.code ?? '');
    const printed =
      run.status === 'threw' ? [...run.lines, run.error].join('\n') : run.lines.join('\n');
    if (run.status === 'timeout') {
      out.push(f(lesson, 'predict-output', `Predict ${p.id}: code did not finish`, el.line));
      continue;
    }
    const expected =
      p.kind === 'choice' ? (p.options.find((o) => o.id === p.answer)?.text ?? '') : p.answer;
    // Option text may be written as inline code (`2`) so it renders in monospace.
    const norm = (s: string) =>
      s
        .replace(/^`([^`]*)`$/, '$1')
        .split('\n')
        .map((l) => l.trimEnd())
        .join('\n')
        .trim();
    const matches =
      norm(expected) === norm(printed) ||
      (run.status === 'threw' && norm(printed).includes(norm(expected)));
    if (!matches) {
      out.push(
        f(
          lesson,
          'predict-output',
          `Predict ${p.id}: answer is ${JSON.stringify(expected)} but Node prints ${JSON.stringify(printed)}`,
          el.line,
        ),
      );
    }
    if (p.kind === 'choice') {
      for (const o of p.options) {
        if (o.id !== p.answer && norm(o.text) === norm(printed)) {
          out.push(
            f(
              lesson,
              'predict-output',
              `Predict ${p.id}: wrong option ${o.id} equals the real output`,
              el.line,
            ),
          );
        }
      }
    }
  }
  return out;
};

const misconceptionRef: Rule = (lesson, ctx) => {
  const out: Finding[] = [];
  for (const el of predicts(lesson)) {
    const parsed = predictProps(el);
    if (!parsed.success) continue;
    const refs =
      parsed.data.kind === 'choice'
        ? parsed.data.options.map((o) => o.misconception)
        : parsed.data.wrong.map((w) => w.misconception);
    for (const id of refs) {
      if (id && !ctx.misconceptions.has(id)) {
        out.push(
          f(
            lesson,
            'misconception-ref',
            `Predict ${parsed.data.id}: unknown misconception ${id}`,
            el.line,
          ),
        );
      }
    }
  }
  return out;
};

function lessonAncestors(id: string, ctx: Context, seen = new Set<string>()): Set<string> {
  for (const p of ctx.prereqs.get(id) ?? []) {
    if (seen.has(p)) continue;
    seen.add(p);
    lessonAncestors(p, ctx, seen);
  }
  return seen;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const terms: Rule = (lesson, ctx) => {
  const out: Finding[] = [];
  const lessonId = lesson.frontmatter.id;
  const ancestors = lessonAncestors(lessonId, ctx);
  const termEls = lesson.parsed.elements.filter((e) => e.name === 'Term');
  const firstIntro = new Map<string, number>();
  for (const el of termEls) {
    const id = String(el.props.id ?? '');
    const entry = ctx.glossary.get(id);
    if (!entry) {
      out.push(f(lesson, 'term-ref', `unknown glossary term ${id}`, el.line));
      continue;
    }
    if (entry.introducedIn !== lessonId && !ancestors.has(entry.introducedIn)) {
      out.push(
        f(
          lesson,
          'term-order',
          `term ${id} is introduced in ${entry.introducedIn}, which is not a prerequisite`,
          el.line,
        ),
      );
    }
    if (!firstIntro.has(id)) firstIntro.set(id, el.order);
  }
  // A term this lesson introduces must not appear in prose before its first <Term>.
  for (const [id, entry] of ctx.glossary) {
    if (entry.introducedIn !== lessonId) continue;
    const intro = firstIntro.get(id);
    if (intro === undefined) {
      out.push(
        f(
          lesson,
          'term-order',
          `term ${id} is listed as introduced here but never marked with <Term id="${id}">`,
          undefined,
          'warning',
        ),
      );
      continue;
    }
    const words = [entry.term, ...entry.aliases].map(
      (w) => new RegExp(`\\b${escapeRe(w)}\\b`, 'i'),
    );
    const early = lesson.parsed.prose.find(
      (r) => r.order < intro && words.some((re) => re.test(r.text)),
    );
    if (early)
      out.push(
        f(lesson, 'term-order', `"${entry.term}" appears before it is introduced`, early.line),
      );
  }
  return out;
};

const bannedPhrases: Rule = (lesson) => {
  const out: Finding[] = [];
  for (const run of lesson.parsed.prose) {
    const lower = run.text.toLowerCase();
    for (const phrase of BANNED)
      if (lower.includes(phrase))
        out.push(f(lesson, 'banned-phrase', `banned phrase "${phrase}"`, run.line));
    if (EMOJI.test(run.text)) out.push(f(lesson, 'banned-phrase', 'emoji in prose', run.line));
    if (run.text.includes('—'))
      out.push(f(lesson, 'banned-phrase', 'em dash in prose', run.line, 'warning'));
  }
  return out;
};

const proseRuns: Rule = (lesson) => {
  const out: Finding[] = [];
  const events = [
    ...lesson.parsed.prose.map((p) => ({
      order: p.order,
      words: p.text.split(/\s+/).filter(Boolean).length,
      line: p.line,
    })),
    ...lesson.parsed.elements
      .filter((e) => INTERACTIONS.has(e.name))
      .map((e) => ({ order: e.order, words: -1, line: e.line })),
  ].sort((a, b) => a.order - b.order);
  let run = 0;
  let start = 0;
  for (const e of events) {
    if (e.words < 0) {
      run = 0;
      continue;
    }
    if (run === 0) start = e.line;
    run += e.words;
    if (run > 250) {
      out.push(
        f(
          lesson,
          'prose-run',
          `more than 250 words without an interaction (from line ${start})`,
          e.line,
        ),
      );
      run = -100_000;
    }
  }
  return out;
};

const codeAnnotations: Rule = (lesson) => {
  const out: Finding[] = [];
  for (const el of lesson.parsed.elements.filter((e) => e.name === 'Code' && e.props.runnable)) {
    const code = String(el.props.code ?? '');
    const expected = [...code.matchAll(/\/\/ → (.*)$/gm)].map((m) => (m[1] ?? '').trim());
    if (!expected.length) continue;
    const run = runSnippet(code);
    const actual = run.lines.map((l) => l.trim());
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      out.push(
        f(
          lesson,
          'code-annotation',
          `// → annotations ${JSON.stringify(expected)} differ from Node output ${JSON.stringify(actual)}`,
          el.line,
        ),
      );
    }
  }
  return out;
};

const sources: Rule = (lesson) =>
  lesson.frontmatter.sources
    .filter((s) => !PRIMARY_SOURCES.includes(new URL(s).hostname))
    .map((s) => f(lesson, 'sources', `not a known primary source: ${s}`, undefined, 'warning'));

const verifiedAt: Rule = (lesson, ctx) => {
  const [y, m] = lesson.frontmatter.verifiedAt.split('-').map(Number);
  const months = (ctx.today.getFullYear() - (y ?? 0)) * 12 + (ctx.today.getMonth() + 1 - (m ?? 0));
  return months > 6
    ? [
        f(
          lesson,
          'verified-at',
          `verifiedAt ${lesson.frontmatter.verifiedAt} is ${months} months old`,
        ),
      ]
    : [];
};

const vizExamples: Rule = (lesson) =>
  lesson.parsed.elements
    .filter((e) => e.name === 'Viz' && !lesson.exampleNames.has(String(e.props.example ?? '')))
    .map((e) =>
      f(
        lesson,
        'viz-example',
        `Viz example ${String(e.props.example)} has no examples/${String(e.props.example)}.js`,
        e.line,
      ),
    );

const segmentShape: Rule = (lesson) => {
  const out: Finding[] = [];
  const ids = new Set<string>();
  for (const s of lesson.parsed.segments) {
    if (!s.id || !s.goal) out.push(f(lesson, 'segment', 'Segment needs id and goal', s.line));
    if (ids.has(s.id)) out.push(f(lesson, 'segment', `duplicate Segment id ${s.id}`, s.line));
    ids.add(s.id);
  }
  for (const el of lesson.parsed.elements) {
    if (INTERACTIONS.has(el.name) && el.name !== 'Card' && el.segment < 0) {
      out.push(f(lesson, 'segment', `<${el.name}> is outside any Segment`, el.line, 'warning'));
    }
  }
  return out;
};

export const RULES: Rule[] = [
  firstElement,
  segmentShape,
  predictShape,
  predictOutput,
  misconceptionRef,
  terms,
  bannedPhrases,
  proseRuns,
  codeAnnotations,
  sources,
  verifiedAt,
  vizExamples,
];
