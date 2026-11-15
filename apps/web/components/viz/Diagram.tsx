'use client';

import type { ArrayItem, BindingState, Frame, HeapObject } from '@stepthrough/trace';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { type ReactNode, useEffect, useId, useRef } from 'react';
import { type ArrowKind, beforeStates, type Rect, type Scene, slotKey, slots } from './layout.ts';
import {
  type Change,
  callLabel,
  functionTitle,
  heapLabel,
  inlineValue,
  stateKey,
} from './model.ts';
import styles from './viz.module.css';

/** reduced: the learner asked for less motion. instant: a new step arrived mid-animation. */
export type MotionMode = { reduced: boolean; instant: boolean };

const ENTER = [0.2, 0, 0, 1] as const;
const EXIT = [0.4, 0, 1, 1] as const;

function moveTransition(mode: MotionMode, distance: number): Transition {
  if (mode.instant || mode.reduced) return { duration: 0 };
  return { duration: Math.min(250, 160 + 0.15 * distance) / 1000, ease: ENTER };
}

function fadeTransition(mode: MotionMode, delay = 0): Transition {
  if (mode.instant) return { duration: 0 };
  return mode.reduced ? { duration: 0.12 } : { duration: 0.18, ease: ENTER, delay };
}

function exitTransition(mode: MotionMode): Transition {
  if (mode.instant) return { duration: 0 };
  return mode.reduced ? { duration: 0.12 } : { duration: 0.18, ease: EXIT };
}

const ARROW_KINDS: ArrowKind[] = ['frame', 'outer', 'ref', 'env'];

type NodeProps = {
  rect: Rect;
  className: string | undefined;
  concept: 'stack' | 'env' | 'heap';
  mode: MotionMode;
  from: Rect | undefined;
  changed: boolean;
  step: number;
  children: ReactNode;
  data?: Record<`data-${string}`, string | boolean | undefined>;
};

function Node({ rect, className, concept, mode, from, changed, step, children, data }: NodeProps) {
  const distance = from ? Math.hypot(rect.x - from.x, rect.y - from.y) : 0;
  const box = { x: rect.x, y: rect.y, width: rect.w, height: rect.h };
  return (
    <motion.li
      className={`${styles.node} ${className ?? ''}`}
      data-concept={concept}
      {...data}
      initial={{ ...box, opacity: 0, y: mode.reduced ? rect.y : rect.y - 8 }}
      animate={{ ...box, opacity: 1 }}
      exit={{ opacity: 0, transition: exitTransition(mode) }}
      transition={{ default: moveTransition(mode, distance), opacity: fadeTransition(mode) }}
    >
      {children}
      {changed && <span key={step} className={styles.flash} aria-hidden="true" />}
    </motion.li>
  );
}

function ValueText({
  state,
  heap,
  wire,
  mode,
}: {
  state: BindingState | ArrayItem;
  heap: readonly HeapObject[];
  wire: boolean;
  mode: MotionMode;
}) {
  let content: ReactNode;
  if (state.kind === 'uninitialized')
    content = (
      <span className={styles.tdz}>
        uninitialized<span className={styles.srOnly}> (in the temporal dead zone)</span>
      </span>
    );
  else if (state.kind === 'hole')
    content = (
      <span className={styles.hole}>
        empty<span className={styles.srOnly}> slot (a hole, not undefined)</span>
      </span>
    );
  else if (state.kind === 'ref' && wire)
    content = (
      <span className={styles.muted}>
        <span className={styles.srOnly}>points to </span>
        {heapLabel(state.heapId)}
      </span>
    );
  else if (state.kind === 'ref')
    content = (
      <span>
        {inlineValue(state, heap)} <span className={styles.muted}>{heapLabel(state.heapId)}</span>
      </span>
    );
  else content = <span>{state.text}</span>;

  return (
    <span className={styles.value}>
      <AnimatePresence initial={false}>
        <motion.span
          key={stateKey(state)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: exitTransition(mode) }}
          transition={fadeTransition(mode)}
        >
          {content}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Ghost({
  before,
  heap,
}: {
  before: BindingState | ArrayItem | null | undefined;
  heap: readonly HeapObject[];
}) {
  if (!before) return null;
  return <span className={styles.was}>was {inlineValue(before, heap)}</span>;
}

function heapTitle(obj: HeapObject): string {
  if (obj.kind === 'function') return functionTitle(obj);
  if (obj.kind === 'array') return 'array';
  return obj.className ?? 'object';
}

/** Stack, environment records and heap for one frame, with arrows between them. */
export function Diagram({
  scene,
  frame,
  changes,
  step,
  mode,
}: {
  scene: Scene;
  frame: Frame;
  changes: readonly Change[];
  step: number;
  mode: MotionMode;
}) {
  const uid = useId().replace(/[^\w-]/g, '');
  const previous = useRef(new Map<string, Rect>());
  useEffect(() => {
    const rects = new Map<string, Rect>();
    for (const node of [...scene.frames, ...scene.records, ...scene.heap])
      rects.set(node.id, node.rect);
    previous.current = rects;
  }, [scene]);

  const before = beforeStates(changes);
  const added = new Set(
    changes.flatMap((c) =>
      c.kind === 'push'
        ? [c.frame.callId]
        : c.kind === 'record-added'
          ? [c.env.id]
          : c.kind === 'heap-added'
            ? [c.obj.id]
            : [],
    ),
  );
  const arrowIds = new Set(scene.arrows.map((a) => a.id));
  const envLabels = new Map(frame.envs.map((e) => [e.id, e.label]));
  const wire = scene.view !== 'scope';
  const from = (id: string) => previous.current.get(id);
  const common = { mode, step };

  return (
    <div className={styles.stage} style={{ width: scene.width, height: scene.height }}>
      {scene.lanes.map((lane) => (
        <span
          key={lane.concept}
          className={styles.laneLabel}
          data-concept={lane.concept}
          style={{ left: lane.x, top: lane.y }}
          aria-hidden="true"
        >
          {lane.label}
        </span>
      ))}

      <svg
        className={styles.arrows}
        width={scene.width}
        height={scene.height}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {ARROW_KINDS.map((kind) => (
            <marker
              key={kind}
              id={`${uid}-${kind}`}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="8"
              markerHeight="8"
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path d="M0 0.5 L8 4 L0 7.5 Z" className={styles.head} data-kind={kind} />
            </marker>
          ))}
        </defs>
        <AnimatePresence initial={false}>
          {scene.arrows.map((arrow) => (
            <motion.path
              key={arrow.id}
              className={styles.arrow}
              data-kind={arrow.kind}
              data-concept={
                arrow.kind === 'frame' ? 'stack' : arrow.kind === 'outer' ? 'env' : 'heap'
              }
              markerEnd={`url(#${uid}-${arrow.kind})`}
              initial={{ d: arrow.d, opacity: 0 }}
              animate={{ d: arrow.d, opacity: arrow.faint ? 0.4 : 1 }}
              exit={{ opacity: 0, transition: exitTransition(mode) }}
              transition={{
                d:
                  mode.instant || mode.reduced
                    ? { duration: 0 }
                    : { duration: 0.18, ease: ENTER, delay: 0.06 },
                opacity: fadeTransition(mode, 0.06),
              }}
            />
          ))}
        </AnimatePresence>
      </svg>

      {scene.frames.length + scene.ghostFrames.length > 0 && (
        <ol className={styles.list} aria-label="Call stack, newest call first">
          <AnimatePresence initial={false}>
            {[...scene.frames].reverse().map((f) => (
              <Node
                key={f.id}
                rect={f.rect}
                className={styles.bar}
                concept="stack"
                from={from(f.id)}
                changed={added.has(f.id)}
                data={{ 'data-running': f.running || undefined }}
                {...common}
              >
                {callLabel(f.frame)}
                {f.running && (
                  <span className={styles.srOnly}>
                    {' '}
                    (running, uses {envLabels.get(f.frame.envId) ?? 'a folded record'})
                  </span>
                )}
              </Node>
            ))}
            {scene.ghostFrames.map((g) => (
              <motion.li
                key={`ghost:${g.id}`}
                className={`${styles.node} ${styles.ghostBar}`}
                data-concept="stack"
                aria-hidden="true"
                initial={{
                  x: g.rect.x,
                  y: g.rect.y,
                  width: g.rect.w,
                  height: g.rect.h,
                  opacity: 0,
                }}
                animate={{
                  x: g.rect.x,
                  y: g.rect.y,
                  width: g.rect.w,
                  height: g.rect.h,
                  opacity: 1,
                }}
                exit={{ opacity: 0, transition: exitTransition(mode) }}
                transition={fadeTransition(mode)}
              >
                {callLabel(g.frame)}
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}

      <ul className={styles.list} aria-label="Environment records">
        <AnimatePresence initial={false}>
          {scene.records.map((r) => (
            <Node
              key={r.id}
              rect={r.rect}
              className={styles.record}
              concept="env"
              from={from(r.id)}
              changed={added.has(r.id)}
              data={{ 'data-detached': r.detached || undefined }}
              {...common}
            >
              <div className={styles.boxHeader}>
                <span>{r.env.label}</span>
                {r.detached && <span className={styles.tag}>call ended</span>}
              </div>
              <ul className={styles.list} aria-label={`Bindings in ${r.env.label}`}>
                {r.env.bindings.length === 0 && (
                  <li className={`${styles.row} ${styles.empty}`}>no bindings</li>
                )}
                {r.env.bindings.map((b) => {
                  const key = `${r.id}/${b.name}`;
                  const isWire = wire && b.state.kind === 'ref';
                  const hasPort = isWire || arrowIds.has(`env:${r.id}:${b.name}`);
                  return (
                    <li
                      key={b.name}
                      className={styles.row}
                      data-changed={before.bindings.has(key) || undefined}
                    >
                      <span className={styles.decl}>{b.decl}</span> <span>{b.name}</span>{' '}
                      <span className={styles.muted}>=</span>{' '}
                      <ValueText state={b.state} heap={frame.heap} wire={wire} mode={mode} />{' '}
                      <Ghost before={before.bindings.get(key)} heap={frame.heap} />
                      {before.bindings.has(key) && (
                        <span key={step} className={styles.flash} aria-hidden="true" />
                      )}
                      {hasPort && <span className={styles.port} aria-hidden="true" />}
                    </li>
                  );
                })}
              </ul>
            </Node>
          ))}
        </AnimatePresence>
      </ul>

      {scene.heap.length > 0 && (
        <ul className={styles.list} aria-label="Heap">
          <AnimatePresence initial={false}>
            {scene.heap.map((h) => {
              const { obj } = h;
              return (
                <Node
                  key={h.id}
                  rect={h.rect}
                  className={styles.heapBox}
                  concept="heap"
                  from={from(h.id)}
                  changed={added.has(h.id)}
                  {...common}
                >
                  <div className={styles.boxHeader}>
                    <span>{heapTitle(obj)}</span>
                    <span className={styles.heapId}>{heapLabel(obj.id)}</span>
                  </div>
                  <ul className={styles.list} aria-label={`Contents of ${heapLabel(obj.id)}`}>
                    {obj.kind === 'function' && (
                      <li className={styles.row}>
                        <span className={styles.decl}>[[Environment]]</span>{' '}
                        {scene.envArrows ? (
                          <>
                            <span className={styles.srOnly}>
                              {envLabels.get(obj.envId ?? '') ?? 'none'}
                            </span>
                            <span className={styles.port} data-side="left" aria-hidden="true" />
                          </>
                        ) : (
                          <span>
                            {obj.envId === null
                              ? 'built-in'
                              : (envLabels.get(obj.envId) ?? obj.envId)}
                          </span>
                        )}
                      </li>
                    )}
                    {obj.kind !== 'function' && slots(obj).length === 0 && (
                      <li className={`${styles.row} ${styles.empty}`}>empty</li>
                    )}
                    {slots(obj).map((item, i) => {
                      const slot = slotKey(obj, i);
                      const key = `${obj.id}/${slot}`;
                      return (
                        <li
                          key={slot}
                          className={styles.row}
                          data-changed={before.slots.has(key) || undefined}
                        >
                          <span className={styles.decl}>
                            {obj.kind === 'array' ? `[${slot}]` : `${slot}:`}
                          </span>{' '}
                          <ValueText state={item} heap={frame.heap} wire={wire} mode={mode} />{' '}
                          <Ghost before={before.slots.get(key)} heap={frame.heap} />
                          {before.slots.has(key) && (
                            <span key={step} className={styles.flash} aria-hidden="true" />
                          )}
                          {item.kind === 'ref' && (
                            <span className={styles.port} aria-hidden="true" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Node>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
