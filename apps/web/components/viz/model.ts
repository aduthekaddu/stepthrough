import type {
  ArrayItem,
  BindingState,
  EnvRecord,
  Frame,
  HeapObject,
  Span,
  StackFrame,
  Trace,
} from '@stepthrough/trace';

/** Each concept has a fixed colour, lane and shape (docs/design.md). */
export type Concept = 'stack' | 'env' | 'heap' | 'error';

/** One thing that differs between a frame and the frame before it. */
export type Change =
  | { kind: 'push'; frame: StackFrame }
  | { kind: 'pop'; frame: StackFrame }
  | { kind: 'record-added'; env: EnvRecord }
  | { kind: 'record-removed'; env: EnvRecord }
  | {
      kind: 'binding';
      envId: string;
      name: string;
      before: BindingState | null;
      after: BindingState;
    }
  | { kind: 'heap-added'; obj: HeapObject }
  | { kind: 'heap-removed'; obj: HeapObject }
  | {
      kind: 'slot';
      heapId: string;
      /** Property key, or array index as a decimal string. */
      slot: string;
      before: ArrayItem | null;
      after: ArrayItem | null;
    }
  | { kind: 'console'; text: string }
  | { kind: 'error'; message: string };

export function stateKey(state: BindingState | ArrayItem): string {
  switch (state.kind) {
    case 'primitive':
      return state.type === 'symbol' ? `symbol:${state.symbolId}` : `${state.type}:${state.text}`;
    case 'ref':
      return `ref:${state.heapId}`;
    case 'uninitialized':
      return 'uninitialized';
    case 'hole':
      return 'hole';
  }
}

function byId<T extends { id: string }>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function slotsOf(obj: HeapObject): Map<string, ArrayItem> {
  switch (obj.kind) {
    case 'function':
      return new Map();
    case 'array':
      return new Map(obj.items.map((item, index) => [String(index), item]));
    case 'object':
      return new Map(obj.props.map((p) => [p.key, p.value]));
  }
}

export function diffFrames(prev: Frame | null, next: Frame, uncaught: string | null): Change[] {
  const changes: Change[] = [];
  const before = prev ?? { stack: [], envs: [], heap: [], console: [] };

  const oldCalls = new Set(before.stack.map((s) => s.callId));
  const newCalls = new Set(next.stack.map((s) => s.callId));
  for (const frame of before.stack)
    if (!newCalls.has(frame.callId)) changes.push({ kind: 'pop', frame });
  for (const frame of next.stack)
    if (!oldCalls.has(frame.callId)) changes.push({ kind: 'push', frame });

  const oldEnvs = byId(before.envs);
  const newEnvs = byId(next.envs);
  for (const env of next.envs) {
    const old = oldEnvs.get(env.id);
    if (!old) {
      changes.push({ kind: 'record-added', env });
      continue;
    }
    const oldBindings = new Map(old.bindings.map((b) => [b.name, b.state]));
    for (const b of env.bindings) {
      const was = oldBindings.get(b.name) ?? null;
      if (was === null || stateKey(was) !== stateKey(b.state))
        changes.push({ kind: 'binding', envId: env.id, name: b.name, before: was, after: b.state });
    }
  }
  for (const env of before.envs)
    if (!newEnvs.has(env.id)) changes.push({ kind: 'record-removed', env });

  const oldHeap = byId(before.heap);
  const newHeap = byId(next.heap);
  for (const obj of next.heap) {
    const old = oldHeap.get(obj.id);
    if (!old) {
      changes.push({ kind: 'heap-added', obj });
      continue;
    }
    const was = slotsOf(old);
    const now = slotsOf(obj);
    for (const [slot, value] of now) {
      const prevValue = was.get(slot) ?? null;
      if (prevValue === null || stateKey(prevValue) !== stateKey(value))
        changes.push({ kind: 'slot', heapId: obj.id, slot, before: prevValue, after: value });
    }
    for (const [slot, value] of was)
      if (!now.has(slot))
        changes.push({ kind: 'slot', heapId: obj.id, slot, before: value, after: null });
  }
  for (const obj of before.heap)
    if (!newHeap.has(obj.id)) changes.push({ kind: 'heap-removed', obj });

  for (const text of next.console.slice(before.console.length))
    changes.push({ kind: 'console', text });
  if (next.kind === 'throw') changes.push({ kind: 'error', message: uncaught ?? 'Error' });
  return changes;
}

const CONCEPT_OF: Record<Change['kind'], Concept | null> = {
  push: 'stack',
  pop: 'stack',
  'record-added': 'env',
  'record-removed': 'env',
  binding: 'env',
  'heap-added': 'heap',
  'heap-removed': 'heap',
  slot: 'heap',
  console: null,
  error: 'error',
};

const PRIORITY: Concept[] = ['error', 'stack', 'env', 'heap'];

/** The concept whose dot marks this step on the ruler, or null when nothing happened. */
export function eventConcept(changes: readonly Change[]): Concept | null {
  const present = new Set(changes.map((c) => CONCEPT_OF[c.kind]));
  return PRIORITY.find((concept) => present.has(concept)) ?? null;
}

/**
 * The span to highlight. A return frame has none, so it keeps the last line its call ran.
 */
export function displaySpan(frames: readonly Frame[], index: number): Span | null {
  const frame = frames[index];
  if (!frame) return null;
  if (frame.span || frame.kind !== 'return') return frame.span;
  const callId = frame.stack.at(-1)?.callId;
  for (let i = index - 1; i >= 0; i--) {
    const earlier = frames[i];
    if (earlier?.span && earlier.stack.at(-1)?.callId === callId) return earlier.span;
  }
  return null;
}

/** Lines whose statement had started before this step. */
export function ranLines(frames: readonly Frame[], index: number): Set<number> {
  const lines = new Set<number>();
  for (const frame of frames.slice(0, index))
    if (frame.span && frame.kind !== 'start') lines.add(frame.span.startLine);
  return lines;
}

/**
 * Which call created each function record. Function records are never folded, and the
 * enter frame's top stack frame points at the new record, so the first sighting is the owner.
 */
export function recordOwners(trace: Trace): Map<string, string> {
  const owners = new Map<string, string>();
  for (const frame of trace.frames) {
    const kinds = new Map(frame.envs.map((e) => [e.id, e.kind]));
    for (const s of frame.stack)
      if (kinds.get(s.envId) === 'function' && !owners.has(s.envId)) owners.set(s.envId, s.callId);
  }
  return owners;
}

/** Function records whose call has left the stack but that something still reaches. */
export function detachedRecords(frame: Frame, owners: ReadonlyMap<string, string>): Set<string> {
  const live = new Set(frame.stack.map((s) => s.callId));
  const detached = new Set<string>();
  for (const env of frame.envs) {
    const owner = owners.get(env.id);
    if (env.kind === 'function' && owner !== undefined && !live.has(owner)) detached.add(env.id);
  }
  return detached;
}

/** Functions whose [[Environment]] is this record: what keeps a detached record reachable. */
export function closuresOver(frame: Frame, envId: string): HeapObject[] {
  return frame.heap.filter((obj) => obj.kind === 'function' && obj.envId === envId);
}

export function heapLabel(id: string): string {
  return `#${id.replace(/^obj(?=\d+$)/, '')}`;
}

export function functionName(obj: Extract<HeapObject, { kind: 'function' }>): string {
  return obj.name === '' || obj.name === '(anonymous)' ? 'anonymous' : obj.name;
}

const PREVIEW_CHARS = 28;

/** Compact text for a value drawn inline, e.g. `{n: 2}`, `[1, empty]` or `ƒ inc`. */
export function inlineValue(
  state: BindingState | ArrayItem,
  heap: readonly HeapObject[],
  nested = false,
): string {
  if (state.kind === 'primitive') return state.text;
  if (state.kind === 'uninitialized') return 'uninitialized';
  if (state.kind === 'hole') return 'empty';
  const obj = heap.find((h) => h.id === state.heapId);
  if (!obj) return heapLabel(state.heapId);
  if (obj.kind === 'function') return `ƒ ${functionName(obj)}`;
  if (nested) return obj.kind === 'array' ? '[…]' : '{…}';
  const text =
    obj.kind === 'array'
      ? `[${obj.items.map((item) => inlineValue(item, heap, true)).join(', ')}]`
      : `{${obj.props.map((p) => `${p.key}: ${inlineValue(p.value, heap, true)}`).join(', ')}}`;
  return text.length > PREVIEW_CHARS ? `${text.slice(0, PREVIEW_CHARS - 2)}…${text.at(-1)}` : text;
}

/** Short text for a value inside a sentence. */
export function spokenValue(state: BindingState | ArrayItem, heap: readonly HeapObject[]): string {
  switch (state.kind) {
    case 'primitive':
      return state.text;
    case 'uninitialized':
      return 'uninitialized';
    case 'hole':
      return 'an empty slot';
    case 'ref': {
      const obj = heap.find((h) => h.id === state.heapId);
      const label = heapLabel(state.heapId);
      if (!obj) return `object ${label}`;
      if (obj.kind === 'function') return `function ${functionName(obj)} (${label})`;
      return `${obj.kind === 'array' ? 'array' : 'object'} ${label}`;
    }
  }
}

function listBindings(env: EnvRecord, heap: readonly HeapObject[]): string {
  return env.bindings
    .map((b) =>
      b.state.kind === 'uninitialized'
        ? `${b.name} uninitialized`
        : `${b.name} = ${spokenValue(b.state, heap)}`,
    )
    .join(', ');
}

function plural(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function describeChange(
  change: Change,
  frame: Frame,
  envLabels: ReadonlyMap<string, string>,
  detached: ReadonlySet<string>,
  owners: ReadonlyMap<string, string>,
): string | null {
  const heap = frame.heap;
  switch (change.kind) {
    case 'pop': {
      const record = frame.envs.find(
        (e) => detached.has(e.id) && owners.get(e.id) === change.frame.callId,
      );
      if (!record) return `${change.frame.fn}() has left the stack.`;
      const holders = closuresOver(frame, record.id).map((f) =>
        f.kind === 'function' ? functionName(f) : f.id,
      );
      return `${change.frame.fn}() has left the stack, but its record "${record.label}" stays, because ${plural(holders)} still ${holders.length === 1 ? 'points' : 'point'} to it.`;
    }
    case 'record-added':
      return change.env.kind === 'global'
        ? null
        : `A new record "${change.env.label}" is created${change.env.bindings.length ? ` with ${listBindings(change.env, heap)}` : ''}.`;
    case 'record-removed':
      return `Nothing refers to "${change.env.label}" any more, so it is gone.`;
    case 'binding': {
      const where = envLabels.get(change.envId);
      const name = where && where !== 'Global' ? `${change.name} (in ${where})` : change.name;
      const after = spokenValue(change.after, heap);
      if (change.before === null) return `${name} is created as ${after}.`;
      if (change.before.kind === 'uninitialized') return `${name} is initialized to ${after}.`;
      return `${name} changes from ${spokenValue(change.before, heap)} to ${after}.`;
    }
    case 'heap-added': {
      const obj = change.obj;
      const what =
        obj.kind === 'function'
          ? `function ${functionName(obj)}`
          : obj.kind === 'array'
            ? 'array'
            : 'object';
      return `A new ${what} ${heapLabel(obj.id)} is created.`;
    }
    case 'heap-removed':
      return null;
    case 'slot': {
      const owner = heap.find((h) => h.id === change.heapId);
      const target =
        owner?.kind === 'array'
          ? `${heapLabel(change.heapId)}[${change.slot}]`
          : `${heapLabel(change.heapId)}.${change.slot}`;
      if (change.after === null) return `${target} is removed.`;
      const after = spokenValue(change.after, heap);
      if (change.before === null) return `${target} is set to ${after}.`;
      return `${target} changes from ${spokenValue(change.before, heap)} to ${after}.`;
    }
    case 'console':
      return `It prints ${change.text}.`;
    case 'push':
    case 'error':
      return null;
  }
}

const MAX_SENTENCES = 3;

/**
 * One or two plain sentences for a step. Authored narration wins; otherwise the sentence is
 * derived from what changed, so every step has a transcript.
 */
export function describeStep(
  trace: Trace,
  index: number,
  owners: ReadonlyMap<string, string>,
): string {
  const frame = trace.frames[index];
  if (!frame) return '';
  if (frame.narration) return frame.narration;
  const prev = trace.frames[index - 1] ?? null;
  const changes = diffFrames(prev, frame, trace.uncaught);
  const line = displaySpan(trace.frames, index)?.startLine;
  const top = frame.stack.at(-1);

  switch (frame.kind) {
    case 'start':
      return 'Nothing has run yet.';
    case 'throw':
      return `The script stops with an uncaught error: ${trace.uncaught ?? 'unknown error'}.`;
    case 'enter': {
      const record = frame.envs.find((e) => e.id === top?.envId);
      const contents = record?.bindings.length
        ? ` with ${listBindings(record, frame.heap)}`
        : ', with no bindings';
      return `${top?.fn ?? 'A function'}() is called. Its new record "${record?.label ?? '?'}" starts${contents}.`;
    }
    case 'return':
      return `${top?.fn ?? 'The function'}() returns. Its call leaves the stack next.`;
    default:
      break;
  }

  if (prev && prev.stack.length === 0 && frame.stack.length > 0) {
    const global = frame.envs.find((e) => e.kind === 'global');
    const hoisted = global?.bindings.length ? `: ${listBindings(global, frame.heap)}` : '';
    return `Before any line runs, every declaration already has a binding in the global record${hoisted}.`;
  }

  const labels = new Map(frame.envs.map((e) => [e.id, e.label]));
  const detached = detachedRecords(frame, owners);
  const sentences = changes
    .map((c) => describeChange(c, frame, labels, detached, owners))
    .filter((s): s is string => s !== null);
  const shown = sentences.slice(0, MAX_SENTENCES);
  if (sentences.length > MAX_SENTENCES)
    shown.push(`${sentences.length - MAX_SENTENCES} more changes.`);
  if (frame.kind === 'end') return [...shown, 'The script has finished.'].join(' ');
  if (line !== undefined) shown.push(`Line ${line} runs next.`);
  return shown.join(' ');
}
