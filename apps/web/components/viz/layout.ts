import type {
  ArrayItem,
  BindingState,
  EnvRecord,
  Frame,
  HeapObject,
  StackFrame,
} from '@stepthrough/trace';
import {
  type Change,
  type Concept,
  callLabel,
  functionTitle,
  heapLabel,
  inlineValue,
} from './model.ts';

/** `scope`: stack and records. `memory`: records and heap. `both`: all three lanes. */
export type View = 'scope' | 'memory' | 'both';

/** Pixel sizes shared by the layout math and the CSS that draws the boxes. */
export const METRICS = {
  row: 24,
  header: 26,
  padBottom: 6,
  char: 7.8,
  bar: 28,
  barGap: 6,
  laneLabel: 26,
  gap: 14,
  indent: 24,
  gutter: 44,
} as const;

export type Rect = { x: number; y: number; w: number; h: number };

export type FrameNode = { id: string; frame: StackFrame; rect: Rect; running: boolean };
export type RecordNode = { id: string; env: EnvRecord; rect: Rect; detached: boolean };
export type HeapNode = { id: string; obj: HeapObject; rect: Rect };
export type Lane = { concept: Exclude<Concept, 'error'>; label: string; x: number; y: number };

/**
 * frame: a stack frame to the record its lookups start from. outer: a record to its parent.
 * ref: a binding or slot to the object it holds. env: a function to its [[Environment]].
 */
export type ArrowKind = 'frame' | 'outer' | 'ref' | 'env';
export type Arrow = { id: string; kind: ArrowKind; d: string; faint: boolean };

export type Scene = {
  view: View;
  narrow: boolean;
  /** Function boxes point at their [[Environment]] with an arrow; otherwise they name it. */
  envArrows: boolean;
  width: number;
  height: number;
  lanes: Lane[];
  frames: FrameNode[];
  /** Calls that left the stack this step, drawn as a faint outline where they were. */
  ghostFrames: FrameNode[];
  records: RecordNode[];
  heap: HeapNode[];
  arrows: Arrow[];
};

export type LayoutInput = {
  frame: Frame;
  changes: readonly Change[];
  view: View;
  width: number;
  detached: ReadonlySet<string>;
};

const NARROW_BELOW: Record<View, number> = { scope: 420, memory: 480, both: 560 };

/** Room between the records and the heap for wires. */
const HEAP_GAP = 60;

const clamp = (value: number, min: number, max: number) =>
  Math.max(Math.min(min, max), Math.min(value, max));

function boxHeight(rows: number): number {
  return METRICS.header + Math.max(1, rows) * METRICS.row + METRICS.padBottom;
}

function rowY(rect: Rect, index: number): number {
  return rect.y + METRICS.header + index * METRICS.row + METRICS.row / 2;
}

/** Approximate advance widths: 13px mono for code text, 11px sans for labels. */
const MONO = METRICS.char;
const SANS = 6.4;
const GAP = 6;
const ROW_PAD = 16 + 8;

function valueWidth(state: BindingState | ArrayItem, heap: readonly HeapObject[], view: View) {
  if (state.kind === 'uninitialized') return 'uninitialized'.length * SANS + 12;
  if (state.kind === 'hole') return 56;
  if (state.kind === 'ref' && view !== 'scope') return heapLabel(state.heapId).length * MONO;
  if (state.kind === 'ref')
    return (inlineValue(state, heap).length + 1 + heapLabel(state.heapId).length) * MONO;
  return inlineValue(state, heap).length * MONO;
}

function ghostWidth(
  before: BindingState | ArrayItem | null | undefined,
  heap: readonly HeapObject[],
) {
  return before ? GAP + (4 + inlineValue(before, heap).length) * SANS + 10 : 0;
}

/** Width of a row: a sans label (decl or key), an optional mono name, the value and its ghost. */
function rowWidth(
  label: string,
  name: string,
  state: BindingState | ArrayItem,
  before: BindingState | ArrayItem | null | undefined,
  heap: readonly HeapObject[],
  view: View,
) {
  const nameW = name ? GAP + (name.length + 2) * MONO + GAP : GAP;
  return (
    ROW_PAD + label.length * SANS + nameW + valueWidth(state, heap, view) + ghostWidth(before, heap)
  );
}

const horizontal = (x0: number, y0: number, x1: number, y1: number) => {
  const dx = Math.max(20, Math.abs(x1 - x0) / 2) * (x1 >= x0 ? 1 : -1);
  return `M ${x0} ${y0} C ${x0 + dx} ${y0}, ${x1 - dx} ${y1}, ${x1} ${y1}`;
};

/** Leaves and re-enters on the right, bulging into the gutter: cycles and same-lane links. */
const bulge = (x0: number, y0: number, x1: number, y1: number, b: number) =>
  `M ${x0} ${y0} C ${x0 + b} ${y0}, ${x1 + b} ${y1}, ${x1} ${y1}`;

/** Child record's header to its parent's lower-left corner, like a tree outline. */
const elbow = (x0: number, y0: number, x1: number, y1: number) =>
  `M ${x0} ${y0} C ${x1} ${y0}, ${x1} ${y0}, ${x1} ${y1}`;

function heapTitleChars(obj: HeapObject): number {
  if (obj.kind === 'function') return functionTitle(obj).length;
  return obj.kind === 'object' ? (obj.className ?? 'object').length : 5;
}

/** Records in tree order: each parent first, then its children in trace order. */
function treeOrder(envs: readonly EnvRecord[]): { env: EnvRecord; depth: number }[] {
  const ids = new Set(envs.map((e) => e.id));
  const children = new Map<string | null, EnvRecord[]>();
  for (const env of envs) {
    const parent = env.parentId !== null && ids.has(env.parentId) ? env.parentId : null;
    children.set(parent, [...(children.get(parent) ?? []), env]);
  }
  const out: { env: EnvRecord; depth: number }[] = [];
  const visit = (parent: string | null, depth: number) => {
    for (const env of children.get(parent) ?? []) {
      out.push({ env, depth });
      visit(env.id, depth + 1);
    }
  };
  visit(null, 0);
  return out;
}

/**
 * What each changed binding (`envId/name`) and slot (`heapId/key`) held before this step.
 * Null means it did not exist yet. The ghost shows this value for one step.
 */
export function beforeStates(changes: readonly Change[]) {
  const bindings = new Map<string, BindingState | null>();
  const slotStates = new Map<string, ArrayItem | null>();
  for (const c of changes) {
    if (c.kind === 'binding') bindings.set(`${c.envId}/${c.name}`, c.before);
    if (c.kind === 'slot') slotStates.set(`${c.heapId}/${c.slot}`, c.before);
  }
  return { bindings, slots: slotStates };
}

export function slots(obj: HeapObject): ArrayItem[] {
  if (obj.kind === 'array') return obj.items;
  if (obj.kind === 'object') return obj.props.map((p) => p.value);
  return [];
}

export function slotKey(obj: HeapObject, index: number): string {
  return obj.kind === 'object' ? (obj.props[index]?.key ?? String(index)) : String(index);
}

/** Heap objects in the order the wires first reach them, so boxes sit near what holds them. */
function heapOrder(frame: Frame, records: readonly { env: EnvRecord }[]): HeapObject[] {
  const byId = new Map(frame.heap.map((h) => [h.id, h]));
  const seen = new Set<string>();
  const out: HeapObject[] = [];
  const visit = (state: BindingState | ArrayItem) => {
    if (state.kind !== 'ref' || seen.has(state.heapId)) return;
    const obj = byId.get(state.heapId);
    if (!obj) return;
    seen.add(obj.id);
    out.push(obj);
    for (const item of slots(obj)) visit(item);
  };
  for (const { env } of records) for (const b of env.bindings) visit(b.state);
  for (const obj of frame.heap) visit({ kind: 'ref', heapId: obj.id });
  return out;
}

export function layoutScene({ frame, changes, view, width, detached }: LayoutInput): Scene {
  const M = METRICS;
  const narrow = width < NARROW_BELOW[view];
  const hasStack = view !== 'memory';
  const hasHeap = view !== 'scope';
  const heap = frame.heap;
  const envArrows = view === 'both' && !narrow;

  const before = beforeStates(changes);

  const longestCall = Math.max(0, ...frame.stack.map((f) => callLabel(f).length));
  const stackW = hasStack
    ? clamp(Math.ceil(longestCall * MONO) + 22, narrow ? 64 : 80, narrow ? 104 : 140)
    : 0;
  const envX = hasStack ? stackW + (narrow ? 12 : 36) : 0;
  const top = M.laneLabel;
  const ordered = treeOrder(frame.envs);
  const heapObjects = hasHeap ? heapOrder(frame, ordered) : [];
  const heapHasLinks = heapObjects.some((obj) => slots(obj).some((item) => item.kind === 'ref'));
  /** Bulging arrows need room on the right: scope-view closures, narrow wires, heap links. */
  const gutter = narrow ? 36 : view === 'scope' || heapHasLinks ? M.gutter : 8;

  const heapWidth = (obj: HeapObject, max: number) => {
    const header = (heapTitleChars(obj) + heapLabel(obj.id).length) * 7.2 + 16 + 16;
    const rows =
      obj.kind === 'function'
        ? [
            ROW_PAD +
              15 * SANS +
              (envArrows
                ? 0
                : GAP + (frame.envs.find((e) => e.id === obj.envId)?.label.length ?? 8) * MONO),
          ]
        : slots(obj).map((item, i) =>
            rowWidth(
              obj.kind === 'array' ? `[${i}]` : `${slotKey(obj, i)}:`,
              '',
              item,
              before.slots.get(`${obj.id}/${slotKey(obj, i)}`),
              heap,
              view,
            ),
          );
    return clamp(Math.ceil(Math.max(header, ...rows)), 110, max);
  };
  const heapNeed = narrow ? 0 : Math.max(0, ...heapObjects.map((obj) => heapWidth(obj, 240)));
  const envMax =
    narrow || !hasHeap
      ? width - envX - gutter
      : Math.min(340, width - envX - HEAP_GAP - heapNeed - gutter);

  const records: RecordNode[] = [];
  let y = top;
  for (const { env, depth } of ordered) {
    const header = 16 + env.label.length * 7 + (detached.has(env.id) ? GAP + 10 * SANS : 0);
    const rows = env.bindings.map((b) =>
      rowWidth(b.decl, b.name, b.state, before.bindings.get(`${env.id}/${b.name}`), heap, view),
    );
    const indent = depth * M.indent;
    const w = clamp(Math.ceil(Math.max(header, ...rows)), 150, envMax - indent);
    const h = boxHeight(env.bindings.length);
    records.push({
      id: env.id,
      env,
      rect: { x: envX + indent, y, w, h },
      detached: detached.has(env.id),
    });
    y += h + M.gap;
  }
  const envBottom = records.length ? y - M.gap : top;
  const envRight = Math.max(envX + 150, ...records.map((r) => r.rect.x + r.rect.w));

  const frames: FrameNode[] = [];
  const ghostFrames: FrameNode[] = [];
  const stackH = (frame.stack.length + 1) * (M.bar + M.barGap);
  const stackBottom = Math.max(envBottom, top + stackH);
  const barAt = (i: number): Rect => ({
    x: 0,
    y: stackBottom - (i + 1) * (M.bar + M.barGap) + M.barGap,
    w: stackW,
    h: M.bar,
  });
  if (hasStack) {
    frame.stack.forEach((s, i) => {
      frames.push({
        id: s.callId,
        frame: s,
        rect: barAt(i),
        running: i === frame.stack.length - 1,
      });
    });
    changes
      .filter((c) => c.kind === 'pop')
      .forEach((c, k) => {
        ghostFrames.push({
          id: c.frame.callId,
          frame: c.frame,
          rect: barAt(frame.stack.length + k),
          running: false,
        });
      });
  }

  const heapNodes: HeapNode[] = [];
  const heapX = narrow ? envX : envRight + HEAP_GAP;
  const heapMax = width - heapX - gutter;
  const heapTop = narrow ? Math.max(envBottom, stackBottom) + M.laneLabel + 16 : top;
  const anchors = new Map<string, number>();
  for (const r of records)
    r.env.bindings.forEach((b, i) => {
      if (b.state.kind === 'ref' && !anchors.has(b.state.heapId))
        anchors.set(b.state.heapId, rowY(r.rect, i));
    });
  let cursor = heapTop;
  for (const obj of heapObjects) {
    const items = slots(obj);
    const w = heapWidth(obj, heapMax);
    const h = boxHeight(obj.kind === 'function' ? 1 : items.length);
    const anchor = narrow ? undefined : anchors.get(obj.id);
    const boxY = Math.max(cursor, anchor === undefined ? cursor : anchor - M.header / 2);
    const rect = { x: narrow ? Math.max(envX, envRight - w) : heapX, y: boxY, w, h };
    heapNodes.push({ id: obj.id, obj, rect });
    items.forEach((item, i) => {
      if (item.kind === 'ref' && !anchors.has(item.heapId)) anchors.set(item.heapId, rowY(rect, i));
    });
    cursor = boxY + h + M.gap;
  }

  const recordById = new Map(records.map((r) => [r.id, r]));
  const heapById = new Map(heapNodes.map((h) => [h.id, h]));
  const headerY = (rect: Rect) => rect.y + M.header / 2;
  const arrows: Arrow[] = [];

  for (const f of frames) {
    const target = recordById.get(f.frame.envId);
    if (!target) continue;
    const { rect } = f;
    arrows.push({
      id: `frame:${f.id}`,
      kind: 'frame',
      d: horizontal(rect.x + rect.w, rect.y + rect.h / 2, target.rect.x, headerY(target.rect)),
      faint: !f.running,
    });
  }

  if (view !== 'memory')
    for (const r of records) {
      const parent = r.env.parentId === null ? undefined : recordById.get(r.env.parentId);
      if (!parent) continue;
      arrows.push({
        id: `outer:${r.id}`,
        kind: 'outer',
        d: elbow(r.rect.x, headerY(r.rect), parent.rect.x + 10, parent.rect.y + parent.rect.h),
        faint: false,
      });
    }

  let lap = 0;
  const nextBulge = () => 22 + 8 * (lap++ % 4);
  for (const r of records)
    r.env.bindings.forEach((b, i) => {
      const ref = b.state;
      if (ref.kind !== 'ref') return;
      const x0 = r.rect.x + r.rect.w;
      const y0 = rowY(r.rect, i);
      if (hasHeap) {
        const target = heapById.get(ref.heapId);
        if (!target) return;
        const t = target.rect;
        arrows.push({
          id: `ref:${r.id}:${b.name}`,
          kind: 'ref',
          d: narrow
            ? bulge(x0, y0, t.x + t.w, headerY(t), nextBulge())
            : horizontal(x0, y0, t.x, headerY(t)),
          faint: false,
        });
        return;
      }
      const fn = heap.find((h) => h.id === ref.heapId);
      if (fn?.kind !== 'function' || fn.envId === null || fn.envId === r.id) return;
      const target = recordById.get(fn.envId);
      if (!target) return;
      const t = target.rect;
      arrows.push({
        id: `env:${r.id}:${b.name}`,
        kind: 'env',
        d: bulge(x0, y0, t.x + t.w, headerY(t), nextBulge()),
        faint: false,
      });
    });

  for (const h of heapNodes) {
    const { obj, rect } = h;
    slots(obj).forEach((item, i) => {
      if (item.kind !== 'ref') return;
      const target = heapById.get(item.heapId);
      if (!target) return;
      const t = target.rect;
      arrows.push({
        id: `ref:${obj.id}:${slotKey(obj, i)}`,
        kind: 'ref',
        d: bulge(rect.x + rect.w, rowY(rect, i), t.x + t.w, headerY(t), nextBulge()),
        faint: false,
      });
    });
    if (envArrows && obj.kind === 'function' && obj.envId !== null) {
      const target = recordById.get(obj.envId);
      if (!target) continue;
      const t = target.rect;
      arrows.push({
        id: `env:${obj.id}`,
        kind: 'env',
        d: horizontal(rect.x, rowY(rect, 0), t.x + t.w, headerY(t)),
        faint: false,
      });
    }
  }

  const lanes: Lane[] = [];
  if (hasStack)
    lanes.push({ concept: 'stack', label: narrow ? 'Stack' : 'Call stack', x: 0, y: 0 });
  lanes.push({ concept: 'env', label: 'Records', x: envX, y: 0 });
  if (hasHeap)
    lanes.push({ concept: 'heap', label: 'Heap', x: heapX, y: narrow ? heapTop - M.laneLabel : 0 });

  const bottoms = [
    envBottom,
    stackBottom,
    ...heapNodes.map((h) => h.rect.y + h.rect.h),
    ...ghostFrames.map((g) => g.rect.y + g.rect.h),
  ];
  return {
    view,
    narrow,
    envArrows,
    width,
    height: Math.max(...bottoms) + 8,
    lanes,
    frames,
    ghostFrames,
    records,
    heap: heapNodes,
    arrows,
  };
}
