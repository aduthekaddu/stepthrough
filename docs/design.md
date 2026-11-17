# Design system: the lab notebook

Status: decided 2026-11-15 (direction A of `research/design/REPORT.md`). This file is the reference for every UI change. It refines spec §4; where it differs, `DECISIONS.md` says why.

Warm paper and serif prose. Small, precise instrument panels that break out of the text column. A tick-ruler stepper. Concept colour is always paired with a label, a fixed lane and a shape. Motion moves only what changed.

## Fonts

| Family | Package | Axes | Use |
|---|---|---|---|
| Source Serif 4 | `@fontsource-variable/source-serif-4` | weight 200-900, optical size 8-60 | prose, headings, narration |
| IBM Plex Sans | `@fontsource-variable/ibm-plex-sans` | weight 100-700, width 75-100% | UI, labels |
| IBM Plex Mono | `@fontsource/ibm-plex-mono` 400 and 500 (static only) | none | code, readouts |

`font-optical-sizing: auto`; code has `font-variant-ligatures: none`. No other families.

## Tokens

Light is the base; dark applies with `prefers-color-scheme: dark` unless the page sets `data-theme="light"`, and with `data-theme="dark"`.

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--paper` | `#F7F4EE` | `#14130F` | page |
| `--panel` | `#FCFAF6` | `#1A1915` | visualizer and card surface |
| `--ink` | `#1B1A17` | `#ECE7DD` | 15.9 / 15.1 on paper |
| `--muted` | `#6B675E` | `#9C978C` | 5.1 / 6.4; also every control border |
| `--rule` | `#E4DED3` | `#2A2822` | decorative lines only, never the only edge of a control |
| `--accent` | `#D94F2B` | `#F0704C` | large text and graphics only in light mode (3.75) |
| `--accent-ink` | `#C54523` | `#F0704C` | small accent text (4.50 light) |
| `--accent-fill` | `#D04825` | `#F0704C` | fill under white text (4.53) |
| `--stack` | `#2F5DA8` | `#5886D0` | spec dark value fails 3:1 (2.88) |
| `--heap` | `#906922` | `#B7862B` | spec light value fails 3:1 (2.96) |
| `--micro` | `#1F7A6E` | `#269486` | |
| `--macro` | `#7A3E73` | `#B46CAC` | spec dark value 2.45 |
| `--net` | `#4F7A2A` | `#5F9332` | |
| `--error` | `#B3261E` | `#E25850` | spec dark value 2.84 |

Tinted fills: `color-mix(in srgb, var(--concept) 14%, var(--paper))` in light, 20% in dark. Radius 6px (controls 4px). Stroke 1.5px. No gradients, no shadows beyond a 1px rule.

Every concept also has a fixed place, shape and label, because olive/red and ochre/olive collide under colour-blindness simulation:

| Concept | Lane | Shape | Label |
|---|---|---|---|
| Call stack | left, grows upward | bar | function name |
| Environment records | beside the stack, linked by arrows | open box with a header | record label |
| Heap | centre | rounded box with mono `#id` | object id |
| Microtask queue | lower lane | small circle | micro |
| Task queue | bottom lane | small square | task |
| Network / I/O | right lane | dashed outline | net |
| Error | where it happens | 3px left bar | Error |

## Type scale

| Role | Desktop | Phone |
|---|---|---|
| Title, Serif 600 | 44/1.1 | 34/1.15 |
| H2, Serif 600 | 30/1.2 | 26/1.2 |
| H3, Serif 600 | 23/1.3 | 21/1.3 |
| Body, Serif 400 | 19/1.6, 66ch | 17/1.55 |
| Sidenote, Serif, muted | 15/1.5 | 16/1.5 |
| Narration, Serif | 17/1.5 | 16/1.5 |
| Panel label, Plex Sans 500 caps +0.08em | 11/1.2 | 11/1.2 |
| UI, Plex Sans 500 | 13/1.3 | 14/1.3 |
| Code, Plex Mono | 15/1.55 | 14/1.5 |
| Readout, Plex Mono 500 tabular | 13 | 13 |

## Layout

- At 1280px and wider: `[1fr] [prose 66ch] [48px] [sidenotes 240px] [1fr]`.
- Visualizers break out to `min(1100px, 100vw - 32px)`. One-control widgets stay in the prose column.
- Side gutter at least 16px at every width.
- No page scrolls sideways at 360px or wider (`e2e/phone.spec.ts` checks 360, 390 and 430). Code wraps, and a wrapped line hangs its indent by 2ch. Only fenced text diagrams keep their columns and scroll inside their own box.

## Visualizer panel

A `<figure>` on `--panel`, 1px `--rule` border, 6px radius.

1. Header (40px): label such as `FIG 3 · SCOPE CHAIN`; legend chips on the right. Hovering a chip dims everything else to 35%.
2. Body: code pane (40%) beside state lanes (60%). Current line: 3px accent bar plus 8% accent tint. Lines already run keep a muted dot in the gutter. Below 900px the panes stack and the code pane shows five lines around the current one.
3. Narration strip: one sentence per step, the `aria-live="polite"` region.
4. Stepper bar (48px, 56px on touch): Reset, Previous, Play/Pause, Next (32px square, 44px on touch, 1px `--muted` border). A tick ruler fills the rest: 1x8px ticks, every fifth 12px, the current step a 2x20px accent needle and a mono readout `07 / 23`. Steps where something happens get a 4px dot in the concept's colour and shape. Named phases above the ruler jump to their first step. Hover or focus on a tick previews its narration. The ruler drags and answers arrow keys. Keys: `→`/`l` next, `←`/`h` previous, `space` play/pause, `r` reset.
5. Predict gate: stepping stays locked until the learner commits to the gate question.
6. Ghost: for one step after a change, the previous state of the changed element stays as a faint outline (transient-information rule from the pedagogy research).
7. Faded parts in a stepped figure (`Dim`) step every colour down to `--muted` and drop their fills; they never use opacity, so their text keeps AA contrast. `e2e/viz.spec.ts` runs axe on `/playground/figures`, which draws every figure at every step.

## Motion

| What | Duration | Easing |
|---|---|---|
| Hover, press, colour | 120ms | `cubic-bezier(0.2,0,0,1)` |
| Frame or queue item enters or leaves, line highlight moves | 180ms | enter/move `cubic-bezier(0.2,0,0,1)`, exit `cubic-bezier(0.4,0,1,1)` |
| Item moves between lanes | `min(250, 160 + 0.15 × px)` ms | `cubic-bezier(0.2,0,0,1)` |
| Arrow re-routes / new arrow draws | 180ms / 200ms | same |

A step has at most two phases 60ms apart and finishes within 400ms. A new key press jumps the running animation to its end state. Nothing overshoots. Nothing in prose animates on scroll. Autoplay advances every 1200ms and always has a visible pause control.

Reduced motion: nothing slides; changes cross-fade over 120ms and the changed element keeps a 2px outline in its concept colour for 600ms; autoplay is off. Motion components read `useReducedMotion`; one global CSS rule covers everything else.

## Prose devices

- Sidenotes: in the margin at 1280px and wider, level with their reference; hovering either end highlights both. Below 1280px the number is a button that opens the note under the paragraph with a 2px left border.
- `Term`: dotted underline; hover, focus or long-press shows the definition (`interestfor` + `popover="hint"`, polyfilled).
- Concept words: 2px underline in the concept colour with the concept's shape before the word. Hovering lights that lane in the nearest visualizer.
- Buttons inside sentences may swap the nearby figure between variants.

## Decided taste calls (revisit if the learner disagrees)

- Theme follows the system setting, with a toggle; light when there is no preference.
- Restraint over playfulness: rich interaction, quiet motion.
- Figures are labelled `FIG n` within a lesson.
- "Draw your model" (Just JavaScript ep. 9) is deferred to v1.1.
