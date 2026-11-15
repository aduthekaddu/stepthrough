# Design research (condensed)

Browsed 2026-11-15 by a research agent; saved by the main session because the agent could not write files. The decided design lives in `docs/design.md`. Screenshots (gitignored) are in `shots/`, scripts in `scripts/`, notes in `text/`. Contrast numbers were recomputed independently by the main session and matched.

## What recent.design is

A curated design-inspiration feed (https://recent.design/info): started in 2023 to collect design posts from X, relaunched in 2026, "takes the place of Godly". Feeds: Design (filter `?category=`, sort `?sort=`), Websites, Launch Videos, OG Images, App Screenshots, App Icons, Tools, Skills, Jobs. Of 1,004 crawled items, most are branding, icons, posters, 3D, glass and shaders (all banned by spec §1). About 20 fit the notebook direction.

## recent.design entries worth borrowing from

| Entry | Borrow |
|---|---|
| Leading and Measure (joshpuckett) https://recent.design/i/a58atg5-leading-and-measure | A small widget inside the prose column, mono axis labels, one readout chip |
| Messaging App State Machine https://recent.design/i/hp1ir5a-messaging-app-state-machine | Clickable named states that jump the figure |
| Earth Timeline https://recent.design/i/l9294qq-earth-timeline and The Life of a Cursor https://recent.design/i/xzndm3x-the-life-of-a-cursor | Tick-ruler scrubber with a caption for the current step |
| Codex Code Review UI https://recent.design/i/jl10434-codex-code-review-ui | Tick rail where hovering a tick previews it |
| Key Switch Anatomy https://recent.design/i/2ta73xt-mechanical-key-switch-anatomy, Card Layer Breakdown https://recent.design/i/r7lof7q-platinum-card-layer-breakdown | Exploded, labelled views for anatomy lessons (HTTP message, JWT) |
| Node Connection Interaction https://recent.design/i/x2hewj5-node-connection-interaction | Arrows that re-route between named states |
| Spacing Tips https://recent.design/i/qbsvs1j-spacing-visualization-dashboard | Light one region at a time while the rest dims |
| Linear Animation Principle https://recent.design/i/jwc04f4-linear-animation-principle | Durations that scale with distance |
| Telescope Studio https://recent.design/i/x0bwgj8-app-architecture-map-tool | Clicking a flow lights its path (system-design simulator) |
| The Blue Hour Newspaper https://recent.design/i/792e5r8-the-blue-hour-newspaper | Diagrams set into the text column like type |

## Spec references and other explainers

| Reference | Borrow | Avoid |
|---|---|---|
| Josh W. Comeau, Flexbox guide https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/ | One property change animates the layout; many sliders so readers handle demos | Mascots, sound toggle |
| Bartosz Ciechanowski https://ciechanow.ski/gps/ | One idea per figure, many figures; prose words coloured to match the figure; each figure extends the previous model | Drag-to-rotate 3D; no reduced-motion handling found |
| Sam Rose https://samwho.dev/load-balancing/ | Coloured words with icons act as the legend; framed panels with play and speed; a closing playground; CSS kills animation under reduced motion | Simulations that autoplay |
| Red Blob Games https://www.redblobgames.com/pathfinding/a-star/introduction.html | Buttons inside sentences swap the diagram; step back / step forward | No reduced-motion handling found |
| Lydia Hallie, Event Loop https://dev.to/lydiahallie/javascript-visualized-event-loop-3dif | The stack / Web API / queue lane layout interviewers expect | GIFs cannot be stepped or read by screen readers; video |
| Dan Abramov, Just JavaScript https://justjavascript.com/learn/09-mutation | Draw your own model and reload it later to correct it | |
| Tufte CSS https://edwardtufte.github.io/tufte-css/ | Margin sidenotes on wide screens, toggled open on phones | Copying the whole look |
| Distill https://distill.pub/guide/ | Figure width classes; hover citations | Momentum page does not reflow on phones |
| Bret Victor, Learnable Programming http://worrydream.com/LearnableProgramming/ | Each executed line leaves a dot on a timeline | Demos are videos |
| Svelte tutorial https://svelte.dev/tutorial/svelte/welcome-to-svelte | Prose / editor / output panes; text/editor switch on phones; "solve" button | |
| Loupe http://latentflip.com/loupe/, Python Tutor https://pythontutor.com/visualize.html | The baseline to beat | Loupe slows code with injected loops; Python Tutor is dense |

## Contrast (WCAG 2.x)

| Theme | Colour | Spec value | Ratio on paper | Fix | Ratio |
|---|---|---|---|---|---|
| light | heap | `#B7862B` | 2.96 | `#906922` | 4.52 |
| light | accent (small text) | `#D94F2B` | 3.75 | `#C54523` | 4.50 |
| light | white on accent fill | `#D94F2B` | 4.11 | `#D04825` | 4.53 |
| dark | stack | `#2F5DA8` | 2.88 | `#5886D0` | 5.08 |
| dark | macrotask | `#7A3E73` | 2.45 | `#B46CAC` | 5.03 |
| dark | error | `#B3261E` | 2.84 | `#E25850` | 5.09 |
| dark | microtask | `#1F7A6E` | 3.60 | `#269486` | 5.01 |
| dark | network | `#4F7A2A` | 3.67 | `#5F9332` | 5.05 |

Colour-blindness simulation (Machado 2009): olive and red collide for deuteranopes; ochre and olive for protanopes in dark mode. Every concept therefore also needs a label, a lane and a shape.

## Alternatives not chosen

- B, Oscilloscope bench: dark-first, dotted grid, timing diagrams. Tiring for long reading.
- C, Drawing sheet: technical plates, exploded views. Costly per figure; may be used for one signature figure (HTTP message anatomy).
- D, Workbench split: scroll-driven pinned visualizer. Conflicts with manual stepping.

## Gaps

Tools and Skills pages of recent.design not parsed; most entries are videos judged from one frame; Brilliant and press.stripe.com not opened; colour-blindness is simulated only.
