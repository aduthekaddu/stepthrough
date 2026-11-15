import {
  Agent,
  BigIntValue,
  BooleanValue,
  BoundNames,
  ContainsExpression,
  DeclarativeEnvironmentRecord,
  type Value as EngineValue,
  type EnvironmentRecord,
  type ExecutionContext,
  FunctionEnvironmentRecord,
  GlobalEnvironmentRecord,
  IsConstantDeclaration,
  inspect,
  isArrayExoticObject,
  isECMAScriptFunctionObject,
  isFunctionObject,
  JSStringValue,
  LexicallyScopedDeclarations,
  ManagedRealm,
  NullValue,
  NumberValue,
  ObjectValue,
  type ParseNode,
  SymbolValue,
  setSurroundingAgent,
  surroundingAgent,
  TopLevelLexicallyScopedDeclarations,
  TopLevelVarScopedDeclarations,
  UndefinedValue,
  Value as V,
  VarScopedDeclarations,
} from '@engine262/engine262';
import { createConsole } from '@engine262/engine262/inspector';
import type {
  ArrayItem,
  Binding,
  BindingState,
  DeclKind,
  EnvKind,
  EnvRecord,
  Frame,
  FrameKind,
  Granularity,
  HeapObject,
  Host,
  Primitive,
  Property,
  Span,
  StackFrame,
  Trace,
  Value,
} from './types.ts';

export type Detail = 'teaching' | 'spec';

export type GenerateOptions = {
  id: string;
  source: string;
  host?: Host;
  /**
   * 'teaching' hides `arguments`, folds the extra record that sloppy-mode functions create
   * for their top-level let/const into the function's own record, and folds block records
   * that hold no bindings into their parent. 'spec' keeps every record the engine creates.
   */
  detail?: Detail;
  /** 'expression' adds a frame before every call, assignment and update expression. */
  granularity?: Granularity;
  /** Hard cap on frames, so a long example fails the build instead of producing a huge trace. */
  maxFrames?: number;
  /** Hard cap on evaluated syntax nodes; catches loops with no statements in their body. */
  maxNodes?: number;
};

const STATEMENT_NODES = new Set([
  'ExpressionStatement',
  'VariableStatement',
  'LexicalDeclaration',
  'ReturnStatement',
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'ThrowStatement',
  'TryStatement',
  'SwitchStatement',
  'BreakStatement',
  'ContinueStatement',
  'ClassDeclaration',
]);

const EXPRESSION_NODES = new Set([
  'CallExpression',
  'NewExpression',
  'AssignmentExpression',
  'UpdateExpression',
]);

type EngineObject = ObjectValue & {
  Environment?: EnvironmentRecord;
  ThisMode?: 'lexical' | 'strict' | 'global';
  Prototype?: ObjectValue | NullValue;
  FormalParameters?: ParseNode;
  ECMAScriptCode?: ParseNode;
};

type Located = {
  location: { start: { line: number; column: number }; end: { line: number; column: number } };
};

function spanOf(node: ParseNode | null): Span | null {
  if (!node) return null;
  const { start, end } = (node as unknown as Located).location;
  return { startLine: start.line, startCol: start.column, endLine: end.line, endCol: end.column };
}

function ownDataProperty(obj: ObjectValue, key: string): EngineValue | undefined {
  const desc = obj.properties.get(V(key));
  return desc && 'Value' in desc ? desc.Value : undefined;
}

function functionName(fn: ObjectValue): string {
  const name = ownDataProperty(fn, 'name');
  return name instanceof JSStringValue && name.stringValue() ? name.stringValue() : '(anonymous)';
}

function classNameOf(obj: EngineObject): string | null {
  const proto = obj.Prototype;
  if (!(proto instanceof ObjectValue)) return null;
  const ctor = ownDataProperty(proto, 'constructor');
  if (!(ctor instanceof ObjectValue)) return null;
  const name = functionName(ctor);
  return name === 'Object' ? null : name;
}

function errorText(err: ObjectValue): string {
  const read = (o: ObjectValue | undefined, key: string) => {
    const v = o ? ownDataProperty(o, key) : undefined;
    return v instanceof JSStringValue ? v.stringValue() : undefined;
  };
  const proto = (err as EngineObject).Prototype;
  const name =
    read(err, 'name') ?? read(proto instanceof ObjectValue ? proto : undefined, 'name') ?? 'Error';
  const message = read(err, 'message');
  return message ? `${name}: ${message}` : name;
}

/** Console text the way Node prints these values: strings raw at the top level. */
function consoleText(args: readonly EngineValue[]): string {
  return args
    .map((a) => {
      if (a instanceof JSStringValue) return a.stringValue();
      if (a instanceof NumberValue && Object.is(a.value, -0)) return '-0';
      return inspect(a);
    })
    .join(' ');
}

function addVarScoped(kinds: Map<string, DeclKind>, decls: readonly unknown[]) {
  for (const d of decls) {
    const node = d as ParseNode;
    const kind: DeclKind = node.type === 'FunctionDeclaration' ? 'function' : 'var';
    for (const n of BoundNames(node)) if (!kinds.has(n) || kind === 'function') kinds.set(n, kind);
  }
}

function addLexical(kinds: Map<string, DeclKind>, decls: readonly unknown[]) {
  for (const d of decls) {
    const node = d as ParseNode;
    const kind: DeclKind =
      node.type === 'ClassDeclaration'
        ? 'class'
        : node.type === 'FunctionDeclaration'
          ? 'function'
          : IsConstantDeclaration(node)
            ? 'const'
            : 'let';
    for (const n of BoundNames(node)) kinds.set(n, kind);
  }
}

/** Declaration kinds of the names a function's own record holds, from the parsed code. */
function functionDeclKinds(fn: EngineObject): Map<string, DeclKind> {
  const kinds = new Map<string, DeclKind>();
  if (fn.FormalParameters) for (const n of BoundNames(fn.FormalParameters)) kinds.set(n, 'param');
  if (fn.ECMAScriptCode) {
    addVarScoped(kinds, VarScopedDeclarations(fn.ECMAScriptCode));
    addLexical(kinds, LexicallyScopedDeclarations(fn.ECMAScriptCode));
  }
  return kinds;
}

function scriptDeclKinds(script: ParseNode): Map<string, DeclKind> {
  const kinds = new Map<string, DeclKind>();
  addVarScoped(kinds, TopLevelVarScopedDeclarations(script));
  addLexical(kinds, TopLevelLexicallyScopedDeclarations(script));
  return kinds;
}

export function generateTrace(options: GenerateOptions): Trace {
  const {
    id,
    source,
    host = 'neutral',
    detail = 'teaching',
    granularity = 'statement',
    maxFrames = 500,
    maxNodes = 200_000,
  } = options;
  let nodeCount = 0;
  const consoleOut: string[] = [];
  const frames: Frame[] = [];
  const envIds = new Map<EnvironmentRecord, string>();
  const heapIds = new Map<ObjectValue, string>();
  const symbolIds = new Map<SymbolValue, string>();
  const callIds = new Map<ExecutionContext, string>();
  const envLabels = new Map<EnvironmentRecord, string>();
  const envDeclKinds = new Map<EnvironmentRecord, Map<string, DeclKind>>();
  const callCounts = new Map<string, number>();
  /**
   * Records shown as their parent in teaching detail. Both cases are fixed at creation:
   * a sloppy function's body record always sits between its context's lexical and
   * variable environments, and a block record gets all its bindings when it is created.
   */
  const folded = new Set<EnvironmentRecord>();
  let globalEnv: GlobalEnvironmentRecord | null = null;
  let globalKinds = new Map<string, DeclKind>();
  let baselineGlobals = new Set<string>();

  const idFor = <K>(map: Map<K, string>, key: K, prefix: string) => {
    let found = map.get(key);
    if (!found) {
      found = `${prefix}${map.size}`;
      map.set(key, found);
    }
    return found;
  };

  const shownEnv = (env: EnvironmentRecord | null): EnvironmentRecord | null => {
    let current = env;
    while (current && detail === 'teaching' && folded.has(current)) current = current.OuterEnv;
    return current;
  };

  const primitive = (value: EngineValue): Primitive => {
    if (value instanceof UndefinedValue)
      return { kind: 'primitive', type: 'undefined', text: 'undefined' };
    if (value instanceof NullValue) return { kind: 'primitive', type: 'null', text: 'null' };
    if (value instanceof BooleanValue)
      return { kind: 'primitive', type: 'boolean', text: String(value.value) };
    if (value instanceof NumberValue) {
      const n = value.value;
      return { kind: 'primitive', type: 'number', text: Object.is(n, -0) ? '-0' : String(n) };
    }
    if (value instanceof BigIntValue)
      return { kind: 'primitive', type: 'bigint', text: inspect(value) };
    if (value instanceof JSStringValue)
      return { kind: 'primitive', type: 'string', text: JSON.stringify(value.stringValue()) };
    if (value instanceof SymbolValue) {
      return {
        kind: 'primitive',
        type: 'symbol',
        text: `Symbol(${value.Description ?? ''})`,
        symbolId: idFor(symbolIds, value, 'sym'),
      };
    }
    throw new Error(`${id}: unexpected engine value ${inspect(value)}`);
  };

  const noteContext = (ctx: ExecutionContext): boolean => {
    if (callIds.has(ctx)) return false;
    idFor(callIds, ctx, 'call');
    const lex = ctx.LexicalEnvironment;
    const varEnv = ctx.VariableEnvironment;
    if (varEnv instanceof GlobalEnvironmentRecord && !globalEnv) {
      globalEnv = varEnv;
      const script = (ctx.ScriptOrModule as { ECMAScriptCode?: ParseNode } | null)?.ECMAScriptCode;
      if (script) globalKinds = scriptDeclKinds(script);
    }
    if (varEnv instanceof FunctionEnvironmentRecord) {
      // With parameter expressions the engine adds separate records for the parameters and
      // the body; folding them could change the lookup path a lesson is about, so keep them.
      const fn = varEnv.FunctionObject as unknown as EngineObject;
      const hasParamExpressions = fn.FormalParameters
        ? ContainsExpression(fn.FormalParameters)
        : false;
      if (!hasParamExpressions && lex !== varEnv && lex.OuterEnv === varEnv) folded.add(lex);
    }
    return true;
  };

  const labelFor = (env: FunctionEnvironmentRecord): string => {
    let label = envLabels.get(env);
    if (!label) {
      const name = functionName(env.FunctionObject);
      const count = (callCounts.get(name) ?? 0) + 1;
      callCounts.set(name, count);
      label = count === 1 ? `${name}() call` : `${name}() call #${count}`;
      envLabels.set(env, label);
    }
    return label;
  };
  const kindsFor = (env: FunctionEnvironmentRecord): Map<string, DeclKind> => {
    let kinds = envDeclKinds.get(env);
    if (!kinds) {
      kinds = functionDeclKinds(env.FunctionObject as unknown as EngineObject);
      envDeclKinds.set(env, kinds);
    }
    return kinds;
  };

  /** `for (let ...)` loops seen so far: the record around the loop and the loop's names. */
  const loops: { outer: EnvironmentRecord; names: string[]; line: number }[] = [];
  const blockLabels = new Map<EnvironmentRecord, string>();
  const blockLabel = (env: EnvironmentRecord, bindings: Binding[]): string => {
    const known = blockLabels.get(env);
    if (known) return known;
    let label = 'block';
    const names = bindings.map((b) => b.name).sort();
    const loop = loops.find(
      (l) => l.outer === shownEnv(env.OuterEnv) && l.names.join() === names.join(),
    );
    if (loop) {
      // The first such record holds the loop's own declaration; each iteration then gets
      // a fresh copy (CreatePerIterationEnvironment).
      const suffix = `loop at line ${loop.line}`;
      const n = [...blockLabels.values()].filter((x) => x.endsWith(suffix)).length;
      label = n === 0 ? `head of the ${suffix}` : `iteration ${n} of the ${suffix}`;
    } else if (env instanceof DeclarativeEnvironmentRecord && env.bindings.size === 1) {
      // A named function expression gets a record holding only its own name.
      const [name, b] = [...env.bindings][0] ?? [];
      const fn = b?.value as EngineObject | undefined;
      if (name && fn instanceof ObjectValue && isFunctionObject(fn) && fn.Environment === env) {
        label = `${name}'s own name`;
      }
    }
    blockLabels.set(env, label);
    return label;
  };

  function snapshot(kind: FrameKind, node: ParseNode | null) {
    if (frames.length >= maxFrames) {
      throw new Error(`${id}: more than ${maxFrames} frames; is there an endless loop?`);
    }
    const envs: EnvRecord[] = [];
    const heap: HeapObject[] = [];
    const doneEnvs = new Set<EnvironmentRecord>();
    const doneObjects = new Set<ObjectValue>();
    const envQueue: EnvironmentRecord[] = [];
    const objectQueue: ObjectValue[] = [];

    const toValue = (v: EngineValue): Value => {
      if (v instanceof ObjectValue) {
        objectQueue.push(v);
        return { kind: 'ref', heapId: idFor(heapIds, v, 'obj') };
      }
      return primitive(v);
    };
    const visit = (env: EnvironmentRecord | null) => {
      const shown = shownEnv(env);
      if (shown) envQueue.push(shown);
    };

    const declarative = (
      env: DeclarativeEnvironmentRecord,
      kinds: Map<string, DeclKind> | undefined,
    ): Binding[] => {
      const out: Binding[] = [];
      for (const [name, b] of env.bindings) {
        if (
          detail === 'teaching' &&
          name === 'arguments' &&
          env instanceof FunctionEnvironmentRecord
        ) {
          continue;
        }
        const state: BindingState =
          b.initialized && b.value !== undefined ? toValue(b.value) : { kind: 'uninitialized' };
        const decl: DeclKind = kinds?.get(name) ?? (b.mutable === false ? 'const' : 'let');
        out.push({ name, decl, state });
      }
      return out;
    };

    const bindingsOf = (env: EnvironmentRecord): Binding[] => {
      if (env instanceof GlobalEnvironmentRecord) {
        const out: Binding[] = [];
        for (const [key, desc] of env.GlobalThisValue.properties) {
          if (!(key instanceof JSStringValue) || baselineGlobals.has(key.stringValue())) continue;
          if (!('Value' in desc) || desc.Value === undefined) continue;
          const name = key.stringValue();
          out.push({ name, decl: globalKinds.get(name) ?? 'implicit', state: toValue(desc.Value) });
        }
        return [...out, ...declarative(env.DeclarativeRecord, globalKinds)];
      }
      if (env instanceof DeclarativeEnvironmentRecord) {
        const kinds = env instanceof FunctionEnvironmentRecord ? kindsFor(env) : undefined;
        const own = declarative(env, kinds);
        if (detail === 'teaching') {
          for (const f of folded) {
            if (
              f.OuterEnv === env &&
              f instanceof DeclarativeEnvironmentRecord &&
              !(f instanceof FunctionEnvironmentRecord)
            ) {
              own.push(...declarative(f, kinds ?? undefined));
            }
          }
        }
        return own;
      }
      return [];
    };

    const kindOf = (env: EnvironmentRecord): EnvKind =>
      env instanceof GlobalEnvironmentRecord
        ? 'global'
        : env instanceof FunctionEnvironmentRecord
          ? 'function'
          : 'block';

    const userContexts = [...surroundingAgent.executionContextStack].filter(
      (ctx) => !(ctx.Function instanceof ObjectValue && !isECMAScriptFunctionObject(ctx.Function)),
    );
    for (const ctx of userContexts) visit(ctx.LexicalEnvironment);
    // The global record stays visible after the script ends, so the final values show.
    if (globalEnv) visit(globalEnv);

    while (envQueue.length || objectQueue.length) {
      const env = envQueue.shift();
      if (env) {
        if (doneEnvs.has(env)) continue;
        doneEnvs.add(env);
        const kind = kindOf(env);
        const bindings = bindingsOf(env);
        if (detail === 'teaching' && kind === 'block' && bindings.length === 0) {
          folded.add(env);
          visit(env.OuterEnv);
          continue;
        }
        const parent = shownEnv(env.OuterEnv);
        envs.push({
          id: idFor(envIds, env, 'env'),
          kind,
          label:
            kind === 'global'
              ? 'Global'
              : env instanceof FunctionEnvironmentRecord
                ? labelFor(env)
                : blockLabel(env, bindings),
          parentId: parent ? idFor(envIds, parent, 'env') : null,
          bindings,
        });
        visit(env.OuterEnv);
        continue;
      }
      const obj = objectQueue.shift() as EngineObject;
      if (doneObjects.has(obj)) continue;
      doneObjects.add(obj);
      const oid = idFor(heapIds, obj, 'obj');
      if (isFunctionObject(obj)) {
        const fnEnv = obj.Environment ? shownEnv(obj.Environment) : null;
        if (fnEnv) envQueue.push(fnEnv);
        heap.push({
          id: oid,
          kind: 'function',
          name: functionName(obj),
          arrow: obj.ThisMode === 'lexical',
          envId: fnEnv ? idFor(envIds, fnEnv, 'env') : null,
        });
        continue;
      }
      const length = ownDataProperty(obj, 'length');
      if (isArrayExoticObject(obj) && length instanceof NumberValue) {
        const items: ArrayItem[] = [];
        for (let i = 0; i < length.value; i += 1) {
          const item = ownDataProperty(obj, String(i));
          items.push(item === undefined ? { kind: 'hole' } : toValue(item));
        }
        heap.push({ id: oid, kind: 'array', items });
        continue;
      }
      const props: Property[] = [];
      for (const [key, desc] of obj.properties) {
        if (!(key instanceof JSStringValue) || !('Value' in desc) || desc.Value === undefined)
          continue;
        props.push({ key: key.stringValue(), value: toValue(desc.Value) });
      }
      heap.push({ id: oid, kind: 'object', className: classNameOf(obj), props });
    }

    // Resolved after the walk, which may fold empty block records the stack points at.
    const stack: StackFrame[] = [];
    for (const ctx of userContexts) {
      const shown = shownEnv(ctx.LexicalEnvironment);
      if (!shown) continue;
      const fn = ctx.Function instanceof ObjectValue ? functionName(ctx.Function) : '(script)';
      stack.push({ callId: idFor(callIds, ctx, 'call'), fn, envId: idFor(envIds, shown, 'env') });
    }

    const order = (x: string) => Number(x.replace(/^\D+/, ''));
    envs.sort((a, b) => order(a.id) - order(b.id));
    heap.sort((a, b) => order(a.id) - order(b.id));
    frames.push({
      step: frames.length,
      kind,
      span: spanOf(node),
      stack,
      envs,
      heap,
      console: [...consoleOut],
      narration: null,
    });
  }

  const agent = new Agent({
    onNodeEvaluation(node: ParseNode) {
      nodeCount += 1;
      if (nodeCount > maxNodes) {
        throw new Error(`${id}: evaluated more than ${maxNodes} nodes; is there an endless loop?`);
      }
      const ctx = surroundingAgent.runningExecutionContext;
      if (node.type === 'ForStatement') {
        const init = (node as unknown as { LexicalDeclaration?: ParseNode }).LexicalDeclaration;
        if (init) {
          loops.push({
            outer: shownEnv(ctx.LexicalEnvironment) ?? ctx.LexicalEnvironment,
            names: BoundNames(init).sort(),
            line: spanOf(node)?.startLine ?? 0,
          });
        }
      }
      if (noteContext(ctx) && ctx.Function instanceof ObjectValue) snapshot('enter', node);
      else if (STATEMENT_NODES.has(node.type)) snapshot('statement', node);
      else if (granularity === 'expression' && EXPRESSION_NODES.has(node.type)) {
        snapshot('expression', node);
      }
    },
  });
  setSurroundingAgent(agent);

  // A function's context leaves the stack when it returns or throws. Snapshot just
  // before that, while its record is still on the stack.
  const contextStack = agent.executionContextStack;
  const popContext = contextStack.pop.bind(contextStack);
  contextStack.pop = (ctx?: ExecutionContext) => {
    const top = ctx ?? contextStack[contextStack.length - 1];
    if (
      top &&
      top.Function instanceof ObjectValue &&
      isECMAScriptFunctionObject(top.Function) &&
      callIds.has(top)
    ) {
      snapshot('return', null);
    }
    return popContext(ctx);
  };

  const realm = new ManagedRealm({});
  createConsole(realm, {
    *log(args: Iterable<EngineValue | undefined>) {
      consoleOut.push(consoleText([...args].filter((a): a is EngineValue => a !== undefined)));
    },
    *default() {},
  });
  baselineGlobals = new Set(
    [...realm.GlobalObject.properties.keys()]
      .filter((k): k is JSStringValue => k instanceof JSStringValue)
      .map((k) => k.stringValue()),
  );

  frames.push({
    step: 0,
    kind: 'start',
    span: null,
    stack: [],
    envs: [],
    heap: [],
    console: [],
    narration: null,
  });
  const completion = realm.evaluateScriptSkipDebugger(source, {
    specifier: `${id}.js`,
  }) as unknown as { Type?: string; Value?: EngineValue };
  let uncaught: string | null = null;
  if (completion?.Type === 'throw' && completion.Value) {
    uncaught =
      completion.Value instanceof ObjectValue
        ? errorText(completion.Value)
        : inspect(completion.Value);
    snapshot('throw', null);
  } else {
    snapshot('end', null);
  }
  return { id, host, granularity, source, frames, uncaught };
}
