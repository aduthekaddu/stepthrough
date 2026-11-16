import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { type GenerateOptions, generateTrace } from './generate.ts';
import type { BindingState, EnvRecord, Frame, Trace } from './types.ts';

// Expected states below come from the ECMAScript spec's rules, written by hand,
// not copied from the generator's output.

// Classic-script semantics (`node -e`), the same as the generator, content-check and the
// browser sandbox; a .cjs file would keep top-level var off the global object.
function nodeOutput(source: string): string[] {
  return execFileSync(process.execPath, ['-e', source], { encoding: 'utf8' })
    .split('\n')
    .slice(0, -1);
}

function trace(source: string, options: Partial<GenerateOptions> = {}): Trace {
  return generateTrace({ id: 'test', source, ...options });
}

const env = (frame: Frame, label: string): EnvRecord => {
  const found = frame.envs.find((e) => e.label === label);
  if (!found) throw new Error(`no record "${label}" in step ${frame.step}`);
  return found;
};
const state = (frame: Frame, label: string, name: string): BindingState => {
  const b = env(frame, label).bindings.find((x) => x.name === name);
  if (!b) throw new Error(`no binding ${name} in "${label}" at step ${frame.step}`);
  return b.state;
};
const text = (s: BindingState) => (s.kind === 'primitive' ? s.text : s.kind);
const atLine = (t: Trace, line: number, kind: Frame['kind'] = 'statement') => {
  const f = t.frames.find((x) => x.kind === kind && x.span?.startLine === line);
  if (!f) throw new Error(`no ${kind} frame at line ${line}`);
  return f;
};
const last = (t: Trace) => t.frames.at(-1) as Frame;

describe('console output matches real Node', () => {
  const programs = [
    'console.log(a);\nvar a = 1;\nconsole.log(a);',
    'let x = 0;\nfunction f(a, b) { return a + b; }\nconsole.log(f(x++, x++));',
    'console.log(false, NaN, -0, "text", 10n);',
    'const fns = [];\nfor (let i = 0; i < 3; i++) fns.push(() => i);\nconsole.log(fns[0](), fns[2]());',
    'const fns = [];\nfor (var i = 0; i < 3; i++) fns.push(() => i);\nconsole.log(fns[0](), fns[2]());',
    'var g = 1;\nconsole.log(globalThis.g, typeof globalThis.h);\nvar h = 2;',
  ];
  for (const source of programs) {
    it(source.split('\n')[0] ?? source, () => {
      expect(last(trace(source)).console).toEqual(nodeOutput(source));
    });
  }
});

describe('hoisting and the temporal dead zone', () => {
  const t = trace('console.log(a);\nvar a = 1;\nlet b = 2;\nconst c = 3;\nfunction f() {}');
  const first = atLine(t, 1);

  it('var is created and set to undefined before the first line runs', () => {
    expect(text(state(first, 'Global', 'a'))).toBe('undefined');
  });
  it('let and const exist but are uninitialized until their line runs', () => {
    expect(state(first, 'Global', 'b').kind).toBe('uninitialized');
    expect(state(first, 'Global', 'c').kind).toBe('uninitialized');
    expect(text(state(atLine(t, 4), 'Global', 'b'))).toBe('2');
  });
  it('a function declaration already holds its function object', () => {
    expect(state(first, 'Global', 'f').kind).toBe('ref');
  });
  it('labels each binding with how it was declared', () => {
    const kinds = Object.fromEntries(env(first, 'Global').bindings.map((b) => [b.name, b.decl]));
    expect(kinds).toEqual({ a: 'var', b: 'let', c: 'const', f: 'function' });
  });
  it('lists every name in a multi-name var declaration', () => {
    const g = last(trace('var p = 1, q = 2;'));
    expect(text(state(g, 'Global', 'p'))).toBe('1');
    expect(text(state(g, 'Global', 'q'))).toBe('2');
  });
  it('an assignment to an undeclared name in sloppy mode creates an implicit global', () => {
    const g = last(trace('y = 3;'));
    expect(env(g, 'Global').bindings).toContainEqual({
      name: 'y',
      decl: 'implicit',
      state: { kind: 'primitive', type: 'number', text: '3' },
    });
  });
});

describe('function calls', () => {
  const source = 'function outer(x) {\n  var v;\n  let y = x + 1;\n  return y;\n}\nouter(5);';
  const t = trace(source);
  const enter = t.frames.find((f) => f.kind === 'enter') as Frame;

  it('on entry, params are bound, var is undefined and let is uninitialized', () => {
    expect(text(state(enter, 'outer() call', 'x'))).toBe('5');
    expect(text(state(enter, 'outer() call', 'v'))).toBe('undefined');
    expect(state(enter, 'outer() call', 'y').kind).toBe('uninitialized');
  });
  it('shows the call on the stack until it returns', () => {
    expect(enter.stack.map((s) => s.fn)).toEqual(['(script)', 'outer']);
    const ret = t.frames.find((f) => f.kind === 'return') as Frame;
    expect(ret.stack.map((s) => s.fn)).toEqual(['(script)', 'outer']);
    expect(text(state(ret, 'outer() call', 'y'))).toBe('6');
    expect(last(t).stack).toEqual([]);
  });
  it('the call record points to the record the function was defined in', () => {
    expect(env(enter, 'outer() call').parentId).toBe(env(enter, 'Global').id);
  });
  it('recursive calls get separate records and call ids', () => {
    const r = trace(
      'function fact(n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}\nfact(3);',
    );
    const deepest = r.frames.reduce((a, b) => (b.stack.length > a.stack.length ? b : a));
    expect(deepest.stack.map((s) => s.fn)).toEqual(['(script)', 'fact', 'fact', 'fact']);
    expect(new Set(deepest.stack.map((s) => s.callId)).size).toBe(4);
    expect(text(state(deepest, 'fact() call #3', 'n'))).toBe('1');
  });
  it('expression granularity shows each argument being evaluated', () => {
    const e = trace('let x = 0;\nfunction f(a, b) { return a + b; }\nf(x++, x++);', {
      granularity: 'expression',
    });
    const xs = e.frames.filter((f) => f.envs.length).map((f) => text(state(f, 'Global', 'x')));
    expect(xs).toContain('1');
  });
});

describe('closures', () => {
  const source =
    'function make() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = make();\ninc();\ninc();';
  const t = trace(source);
  const end = last(t);

  it("the returned function's [[Environment]] is the finished call's record", () => {
    const incState = state(end, 'Global', 'inc');
    if (incState.kind !== 'ref') throw new Error('inc should hold a function');
    const fn = end.heap.find((h) => h.id === incState.heapId);
    expect(fn?.kind).toBe('function');
    if (fn?.kind !== 'function') return;
    expect(fn.envId).toBe(env(end, 'make() call').id);
    expect(fn.arrow).toBe(true);
  });
  it('the record outlives the call and keeps changing', () => {
    expect(end.stack).toEqual([]);
    expect(text(state(end, 'make() call', 'count'))).toBe('2');
  });
  it('let in a for loop gives each iteration its own record', () => {
    const l = last(
      trace('const fns = [];\nfor (let i = 0; i < 2; i++) {\n  fns.push(() => i);\n}'),
    );
    const blocks = l.envs.filter(
      (e) => e.kind === 'block' && e.bindings.some((b) => b.name === 'i'),
    );
    expect(blocks.map((b) => text(b.bindings[0]?.state ?? { kind: 'uninitialized' }))).toEqual([
      '0',
      '1',
    ]);
  });
});

describe('values and the heap', () => {
  const t = last(
    trace(
      'const s1 = Symbol("same"), s2 = Symbol("same");\nconst arr = [1, , 3];\nconst o = { arr };\no.self = o;\nconst alias = o;',
    ),
  );
  it('two symbols with the same description stay distinct', () => {
    const s1 = state(t, 'Global', 's1');
    const s2 = state(t, 'Global', 's2');
    expect(
      s1.kind === 'primitive' &&
        s1.type === 'symbol' &&
        s2.kind === 'primitive' &&
        s2.type === 'symbol',
    ).toBe(true);
    if (
      s1.kind === 'primitive' &&
      s1.type === 'symbol' &&
      s2.kind === 'primitive' &&
      s2.type === 'symbol'
    ) {
      expect(s1.symbolId).not.toBe(s2.symbolId);
    }
  });
  it('an array hole is not undefined', () => {
    const arr = state(t, 'Global', 'arr');
    const obj = t.heap.find((h) => arr.kind === 'ref' && h.id === arr.heapId);
    expect(obj?.kind === 'array' && obj.items[1]).toEqual({ kind: 'hole' });
  });
  it('aliases and cycles point at one object', () => {
    const o = state(t, 'Global', 'o');
    expect(state(t, 'Global', 'alias')).toEqual(o);
    const obj = t.heap.find((h) => o.kind === 'ref' && h.id === o.heapId);
    expect(obj?.kind === 'object' && obj.props.find((p) => p.key === 'self')?.value).toEqual(o);
  });
});

describe('errors', () => {
  it('reports an uncaught TDZ access the way the engine names it', () => {
    const t = trace('console.log(x);\nlet x = 1;');
    expect(t.uncaught).toMatch(/^ReferenceError/);
    expect(last(t).kind).toBe('throw');
  });
  it('stops a runaway loop instead of hanging', () => {
    expect(() => trace('while (true) {}', { maxNodes: 10_000 })).toThrow(/endless loop/);
    expect(() => trace('let i = 0;\nwhile (true) { i++; }', { maxFrames: 50 })).toThrow(
      /more than 50 frames/,
    );
  });
});

describe('labels and stack links', () => {
  it('names the loop head record and each iteration record of a let loop', () => {
    const t = trace('const fns = [];\nfor (let i = 0; i < 2; i++) {\n  fns.push(() => i);\n}');
    const labels = new Set(t.frames.flatMap((f) => f.envs.map((e) => e.label)));
    expect(labels).toContain('head of the loop at line 2');
    expect(labels).toContain('iteration 1 of the loop at line 2');
    expect(labels).toContain('iteration 2 of the loop at line 2');
  });
  it("names a named function expression's own-name record", () => {
    const t = trace(
      'const f = function fact(n) {\n  return n <= 1 ? 1 : n * fact(n - 1);\n};\nf(2);',
    );
    expect(t.frames.some((f) => f.envs.some((e) => e.label === "fact's own name"))).toBe(true);
  });
  it('every stack frame points at a record shown in the same frame', () => {
    const sources = [
      'const fns = [];\nfor (let i = 0; i < 2; i++) {\n  fns.push(() => i);\n}',
      'function f() {\n  {\n    let x = 1;\n  }\n  return 2;\n}\nf();',
    ];
    for (const source of sources) {
      for (const frame of trace(source).frames) {
        const ids = new Set(frame.envs.map((e) => e.id));
        for (const s of frame.stack)
          expect(ids.has(s.envId), `step ${frame.step} ${s.fn}`).toBe(true);
      }
    }
  });
});

describe('functions with default parameters', () => {
  const t = trace('function f(a, b = () => a) {\n  var a = 9;\n  return b();\n}\nf(1);');
  const enter = t.frames.find((f) => f.kind === 'enter' && f.stack.at(-1)?.fn === 'f') as Frame;
  const kinds = (frame: Frame) =>
    frame.envs.flatMap((e) => e.bindings.map((b) => `${b.decl} ${b.name}`));

  it('enters after the default-parameter code ran, with every parameter bound', () => {
    expect(kinds(enter)).toContain('param b');
    const bBinding = enter.envs.flatMap((e) => e.bindings).find((b) => b.name === 'b');
    expect(bBinding?.state.kind).toBe('ref');
  });
  it('keeps the var record separate and labels its names var, even when a parameter shares the name', () => {
    expect(kinds(enter)).toContain('var a');
    expect(kinds(enter)).toContain('param a');
  });
  it('hides arguments in teaching detail', () => {
    expect(kinds(enter).some((k) => k.endsWith(' arguments'))).toBe(false);
  });
  it('return frames carry the line the call ended on', () => {
    const ret = t.frames.find((f) => f.kind === 'return' && f.stack.at(-1)?.fn === 'f');
    expect(ret?.span?.startLine).toBe(3);
  });
});
