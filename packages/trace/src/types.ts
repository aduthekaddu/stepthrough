/**
 * The trace format shared by the generator and every visualizer.
 * Each frame is a complete snapshot, so a visualizer can jump to any step
 * without replaying earlier ones.
 */

export type Primitive =
  | {
      kind: 'primitive';
      type: 'undefined' | 'null' | 'boolean' | 'number' | 'bigint' | 'string';
      text: string;
    }
  /** Two symbols with the same description are different values; symbolId tells them apart. */
  | { kind: 'primitive'; type: 'symbol'; text: string; symbolId: string };

/** A value an object property or array slot can hold. */
export type Value = Primitive | { kind: 'ref'; heapId: string };

/** A binding can also be in the temporal dead zone: created but not yet initialized. */
export type BindingState = Value | { kind: 'uninitialized' };

export type DeclKind = 'var' | 'let' | 'const' | 'function' | 'class' | 'param' | 'implicit';

export type Binding = { name: string; decl: DeclKind; state: BindingState };

export type EnvKind = 'global' | 'function' | 'block';

export type EnvRecord = {
  id: string;
  kind: EnvKind;
  /** Readable label, e.g. "Global", "outer() call", "outer() call #2", "block". */
  label: string;
  parentId: string | null;
  bindings: Binding[];
};

export type StackFrame = {
  /** Stable for the life of one call, so recursive calls of one function stay distinct. */
  callId: string;
  /** Function name, or "(script)" for the top-level code. */
  fn: string;
  /** The environment record identifier lookups start from. */
  envId: string;
};

export type Property = { key: string; value: Value };

export type ArrayItem = Value | { kind: 'hole' };

export type HeapObject =
  | {
      id: string;
      kind: 'function';
      name: string;
      arrow: boolean;
      /** The function's [[Environment]]: the record it was created in. Null for built-ins. */
      envId: string | null;
    }
  | { id: string; kind: 'array'; items: ArrayItem[] }
  | { id: string; kind: 'object'; className: string | null; props: Property[] };

export type Span = { startLine: number; startCol: number; endLine: number; endCol: number };

/**
 * start      before any code runs
 * enter      a function was called and its declarations are instantiated (params bound,
 *            var = undefined, let/const uninitialized), before its first step runs
 * statement  before a statement runs
 * expression before a call, assignment or update expression runs (expression-level traces)
 * return     a function finished; its call is still on the stack and is removed next
 * end        the script finished normally
 * throw      the script ended with an uncaught exception
 */
export type FrameKind = 'start' | 'enter' | 'statement' | 'expression' | 'return' | 'end' | 'throw';

export type Frame = {
  step: number;
  kind: FrameKind;
  span: Span | null;
  stack: StackFrame[];
  envs: EnvRecord[];
  heap: HeapObject[];
  console: string[];
  narration: string | null;
};

export type Host = 'neutral' | 'node' | 'browser';

export type Granularity = 'statement' | 'expression';

export type Trace = {
  id: string;
  host: Host;
  granularity: Granularity;
  source: string;
  frames: Frame[];
  /** Set when the script ended with an uncaught exception, e.g. "ReferenceError: x is not defined". */
  uncaught: string | null;
};
