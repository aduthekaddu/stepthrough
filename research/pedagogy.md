# Groundwork pedagogy: evidence and lesson-design playbook

Research date: 2026-11-15. Status: research done, playbook ready to use as the writer's brief for the lesson pipeline.

**Goal of this note.** Aditya wants deep, interactive, animated lessons that teach from first principles, use no term before it is defined, and give theory and code equal weight. Lessons will be made by a pipeline: Claude outlines and writes code and traces, Gemini drafts prose, other models check the result. This note gives that pipeline three things. First, the learning-science evidence and what each finding means for Groundwork. Second, a numbered recipe a writer follows for one lesson, plus a checklist a reviewer applies. Third, a full outline of lesson 1.3 "Scope and closures" built with the recipe. Section 6 lists where the build spec (§5 lesson anatomy, §7 daily schedule and nearby sections) conflicts with the evidence.

**How to read the evidence.** Every claim links to a page or PDF I opened in this session. When I could open only an abstract page or a secondary summary, the line says so. "Strong", "moderate" and "weak" are my judgement of the evidence, explained in each row. Effect sizes are as reported by the source: *d* and *g* are standardized mean differences, so 0.2 is small, 0.5 medium and 0.8 large by the usual rule of thumb. Papers I could not open are listed in [Gaps](#8-gaps-in-this-research).

---

## 1. Summary

1. **Retrieval and spacing carry the most weight.** Practice tests beat restudy (*g* = 0.50 across 159 effects, 0.73 with feedback) and spacing the gap to the test date matters a lot. These two are the only techniques that Dunlosky et al. rated "high utility". Groundwork's Predict blocks, cards and FSRS queue are the right bones.
2. **Prediction works through surprise, and the answer must come right after the guess.** A wrong prediction helps only if the learner sees the correct outcome straight away and attends to it. Every Predict needs a commit step, an immediate reveal, and an explanation tied to the specific wrong answer.
3. **Animation alone adds little.** Two meta-analyses put the gain of animation over static pictures at *d* = 0.37 and *g* = 0.23, and smaller still for abstract diagrams like Groundwork's stack and environment boxes. Reviewers find that most "animation wins" came from added interactivity or prediction. So Groundwork's visualizers must be stepped by the learner and must ask "what happens next?" at key frames. The motion is polish. The interaction is the teaching.
4. **Name the parts before the diagram moves.** Pre-training on component names (*d* = 0.85) and learner-paced segments (*d* = 0.98) are Mayer's strongest principles that apply to a text-and-diagram site. This backs a glossary mechanism and a "build the visualizer one part at a time" rule.
5. **Standard stack drawings mislead about closures.** Students reading a stack picture conclude that a returned function loses its variables, or that a function can see its caller's variables (dynamic scope). The `<EnvChain>` visual must draw environment records apart from stack frames, with the outer arrow pointing to where the function was *created*.
6. **There is no good JavaScript misconception catalog.** progmiscon.org lists 6 JavaScript entries. Sorva's catalog lists 162 general novice misconceptions. Groundwork has to build and own a misconception registry, and every Predict distractor should point to one entry.
7. **Explanations should be conceptual, not about feelings.** Self-explanation prompts give *g* = 0.55, but multiple-choice prompts and metacognitive prompts ("how well did you understand?") showed no detectable effect.
8. **FSRS predicts recall better than SM-2 on Anki data.** On 10k Anki users, FSRS-6 had log loss 0.345 and SM-2 0.72 (lower is better). The benchmark is run by the FSRS authors and measures prediction accuracy on flashcards, not learning gains. Card quality will matter more than the scheduler over 30 days.
9. **The main spec conflicts.** §5 batches 2 to 4 checkpoints after the mental model. The evidence says put an interaction every 60 to 150 words, about 8 to 12 per lesson. §5 has no vocabulary step and no misconception registry. §7 runs a 100-minute lesson block and puts "explain it back" at the end of the same day, where a next-morning recall would add spacing.

---

## 2. Evidence, finding by finding

Each row gives the claim, the strength, the source I opened, and what it means for Groundwork.

### 2.1 Retrieval practice (the testing effect)

| | |
|---|---|
| **Claim** | Trying to recall material improves long-term memory more than re-reading it. |
| **Effect size** | Rowland's meta-analysis of 61 studies and 159 effects: *g* = 0.50, 95% CI [0.42, 0.58]. With feedback after the test, *g* = 0.73 [0.61, 0.86]. Without feedback, *g* = 0.39 [0.29, 0.49]. Adesope et al. (217 studies) found practice tests beat restudying "and all other comparison conditions". |
| **Strength** | Strong. Many studies, two independent meta-analyses, rated high utility by Dunlosky et al. |
| **Transfer caveat** | Pan and Rickard found transfer to new questions of *d* = 0.40 [0.31, 0.50], greatest "across test formats, to application and inference questions". After correcting for publication bias the predicted transfer often fell to zero "when none of the aforementioned moderators are present". The moderators are response congruency, elaborated retrieval practice and high initial test accuracy. Transfer to untested material from the same lesson was weakest. |
| **Sources** | [Rowland 2014 PDF](https://courseware.epfl.ch/assets/courseware/v1/fdde2f0aa590bf3b1324077a6bf1540c/asset-v1:EPFL+DEMO+2020+type@asset+block/Rowland2014-meta-analysis.pdf), [Adesope et al. 2017, ERIC abstract](https://eric.ed.gov/?id=EJ1141817), [Pan & Rickard 2018 PDF](https://pdf.retrievalpractice.org/transfer/Pan_Rickard_2018.pdf), [Dunlosky et al. 2013 PDF](https://www.whz.de/fileadmin/lehre/hochschuldidaktik/docs/dunloskiimprovingstudentlearning.pdf) |
| **Groundwork** | Every Predict and card shows feedback. Cards ask "why", not just "what" (elaborated retrieval). Each concept is tested in at least two formats (predict output, explain, implement) because transfer is best across formats. Interviews test transfer, so cards must use new code, not the lesson's exact snippet. |

### 2.2 Spacing

| | |
|---|---|
| **Claim** | Spreading study over time beats massing it, and the best gap grows with how long you need to remember. |
| **Effect size** | Cepeda et al. 2006 reviewed 839 assessments in 317 experiments: "the ISI producing maximal retention increased as retention interval increased". Cepeda et al. 2008 (1,350+ people, tests up to a year later): "the optimal gap declined from about 20 to 40% of a 1-week test delay to about 5 to 10% of a 1-year test delay". |
| **Strength** | Strong. |
| **Sources** | [Cepeda 2006, eScholarship PDF](https://www.escholarship.org/content/qt3rr6q10c/qt3rr6q10c.pdf), [Cepeda 2008 PDF](https://www.evullab.org/pdf/CepedaVulRohrerWixtedPashler-PS-2008.pdf) |
| **Groundwork** | Aditya needs this knowledge in interviews from about day 30 to day 90. By the ratios above (inferred, not computed for this case), week-1 topics should come back a few days later and again in weeks 2 to 4. FSRS does this automatically. The "Today" page should never let week-1 cards drop out because new lessons crowd the 30-review cap. |

### 2.3 Interleaving

| | |
|---|---|
| **Claim** | Mixing different problem types in practice beats doing one type at a time, but only for some material. |
| **Effect size** | Brunmair and Richter (59 studies, 238 effects): overall *g* = 0.42. Paintings *g* = 0.67. Mathematical tasks *g* = 0.34. Expository texts: not significant. Words: blocking was better, *g* = −0.39. Effects were stronger "for learning material more similar between categories" and "for more complex learning material". |
| **Strength** | Moderate, and the authors warn it "should be used with caution in certain conditions, especially for expository texts and words". |
| **Source** | [Brunmair & Richter 2019 accepted manuscript](https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf) |
| **Groundwork** | Interleave on purpose, not at random. The win comes from telling look-alike categories apart: `var` vs `let` loops, microtask vs task, the four `this` rules, `==` vs `===`. Build "discrimination sets" of cards that look alike but have different answers, and put them in the same review session. Plain definition cards gain little from mixing. |

### 2.4 Generation, prediction and errors

| | |
|---|---|
| **Claim** | Producing an answer, even a wrong one, before seeing the right answer improves learning of the right answer. |
| **Evidence** | Kornell, Hays and Bjork used questions people could not answer: "Unsuccessful retrieval attempts enhanced learning with both types of materials." Brod's review argues that "predicting boosts surprise about unexpected answers, which leads to enhanced attention to the correct answer and strengthens its encoding", and that this sets predicting apart from guessing. Brod notes a boundary condition: "the correct answer has to be presented shortly after the guess". He also cites the hypercorrection effect: "erroneous responses committed with high confidence are more likely to be corrected". |
| **Strength** | Moderate. The error benefit is well replicated in lab memory tasks. The prediction-specific mechanism (surprise) rests on a small number of studies, which Brod calls "initial evidence". |
| **Sources** | [Kornell, Hays & Bjork 2009 PDF](https://web.williams.edu/Psychology/Faculty/Kornell/Publications/Kornell.Hays.Bjork.2009.pdf), [Brod 2021 PDF](https://link.springer.com/content/pdf/10.3758/s13423-021-01904-1.pdf), [Bjork & Bjork chapter, 2nd ed. 2014](https://burrell.edu/wp-content/uploads/2020/09/EBjorkRBjork_FABBSchapter2014-2nd-ed._WithCoverPage.pdf) |
| **Groundwork** | (1) Lock the answer in before the reveal. (2) Ask for confidence (sure / think so / guessing), because confident errors are where surprise and correction are largest, and because confidence data tells Groundwork which misconception is firmly held. (3) Reveal the real outcome at once. (4) Never "save the answer for later" without at least showing what happened. The *explanation* can wait; the *observation* cannot. |

### 2.5 Predict-Observe-Explain (White & Gunstone)

| | |
|---|---|
| **Claim** | Ask learners to predict an event and say why, show the event, then have them reconcile prediction and observation. |
| **Evidence** | NZCER's teacher resource describes POE as developed "to uncover individual students' predictions, and their reasons for making these", with three steps: predict and give a reason, observe, then "amend or add to their explanation to take account of the observation". It notes "unless students are asked to predict first what will happen, they may not observe carefully". |
| **Strength** | Weak to moderate as a learning method. POE was designed as a probe of understanding, and its classroom support is mostly practice reports. The general benefit of predicting comes from §2.4. |
| **Sources** | [NZCER Assessment Resource Banks, POE](https://arbs.nzcer.org.nz/predict-observe-explain-poe). The book (White & Gunstone 1992, *Probing Understanding*, Falmer) is not online; I did not read it. |
| **Groundwork** | Keep the "because" field. A Predict should collect the answer *and* a one-click reason (the reason options map to misconceptions). After the reveal, ask the learner to fix their reason, not just note they were wrong. |

### 2.6 PRIMM (Predict, Run, Investigate, Modify, Make)

| | |
|---|---|
| **Claim** | A structured sequence for programming lessons: read and predict code, run it, investigate it with questions, modify it, then make something new. |
| **Evidence** | 493 students aged 11 to 14 in 13 schools, with a control group. Post-test means 3.28 (PRIMM) vs 2.57 (control), Mann-Whitney *Z* = −3.392, *r* = .13. The authors could not control what the control classes were taught. |
| **Strength** | Weak to moderate. One quasi-experiment, a small effect, children not adults. Its order matches stronger evidence on worked examples and fading (§2.7). |
| **Source** | [Sentance, Waite & Kallia 2019 PDF](https://primmportal.com/wp-content/uploads/2020/10/teaching-computer-programming-with-primm-a-sociocultural-perspective.pdf) |
| **Groundwork** | Use PRIMM as the order of a code segment: predict, run, investigate (step it in the visualizer and answer a question), modify (change one line and predict again), make (lab). Do not cite it as strong evidence. |

### 2.7 Worked examples, completion problems, fading, cognitive load

| | |
|---|---|
| **Claim** | Novices learn more from studying worked solutions than from solving problems unaided. Then support should fade: full example, then partly complete, then independent. |
| **Evidence** | Sweller, van Merriënboer and Paas (2019): "very strong empirical evidence for the worked example effect", with the constraint that "worked examples are less effective for high-expertise learners". Completion problems were proposed "in the field of introductory computer programming": "learners receive incomplete computer programs that need to be finished". The "transient information effect": information that "disappears after a few seconds, for example, in spoken text or in instructional video or animation" adds load, and self-pacing and segmentation reduce it. Atkinson, Renkl and Merrill: fading alone helps near transfer but "is not reliable on far-transfer tasks". Fading plus prompts to name the principle behind each step "produced medium to large effects on near and far transfer without requiring additional time on task". |
| **Strength** | Strong for worked examples and fading. Moderate for the specific fading-plus-prompt combination (2 experiments). |
| **Sources** | [Sweller et al. 2019 PDF](https://link.springer.com/content/pdf/10.1007/s10648-019-09465-5.pdf), [Atkinson, Renkl & Merrill 2003 PDF](https://mrbartonmaths.com/resourcesnew/8.%20Research/Making%20the%20most%20of%20examples/Fading%20out%20and%20Prompts.pdf) |
| **Groundwork** | Labs fade: one worked solution with "which principle makes this line work?" prompts, then a completion problem, then a blank-file lab. A visualizer step is transient, so the previous frame must stay recoverable (step back, ghost of the previous state, a text transcript). |

### 2.8 Expertise reversal

| | |
|---|---|
| **Claim** | Help that supports novices can hurt learners who already know the topic. |
| **Evidence** | "Instructional techniques that are highly effective with inexperienced learners can lose their effectiveness and even have negative consequences when used with more experienced learners." Redundant explanation is the main cause. |
| **Strength** | Strong as a pattern across many studies. |
| **Source** | [Kalyuga, Ayres, Chandler & Sweller 2003 PDF](https://mrbartonmaths.com/resourcesnew/8.%20Research/Explicit%20Instruction/The%20Expertise%20Reversal%20Effect.pdf) |
| **Groundwork** | Aditya is "rusty", not new. He has 500+ LeetCode problems and real projects. The hook Predict doubles as a pre-test: if he answers it and the first two checks correctly with high confidence, offer a "fast path" that collapses the explanation segments to their summary lines but keeps every Predict. Never remove the Predicts; they are cheap for an expert. |

### 2.9 Mayer's multimedia principles

Mayer 2008 reports median effect sizes on transfer tests.

| Principle | Definition (Mayer's words) | *d* | Tests | Applies to Groundwork? |
|---|---|---|---|---|
| Coherence | "Reduce extraneous material." | 0.97 | 13 of 14 | Yes. No decorative animation, no side stories inside the main path. |
| Signaling | "Highlight essential material." | 0.52 | 6 of 6 | Yes. Semantic concept colours, highlighted lines, "what changed" marks. |
| Redundancy | "Do not add on-screen text to narrated animation." | 0.72 | 5 of 5 | Partly. Groundwork has no narration, so text is the only verbal channel. |
| Spatial contiguity | "Place printed words next to corresponding graphics." | 1.12 | 5 of 5 | Yes. Step narration sits next to the diagram, not below a long scroll. |
| Temporal contiguity | "Present corresponding narration and animation at the same time." | 1.31 | 8 of 8 | Yes. Narration for a step appears with that step. |
| Segmenting | "Present animation in learner-paced segments." | 0.98 | 3 of 3 | Yes. Manual stepping. |
| Pre-training | "Provide pretraining in the name, location, and characteristics of key components." | 0.85 | 5 of 5 | Yes. Glossary and part-by-part introduction of each visualizer. |
| Modality | "Present words as spoken text rather than printed text." | 1.02 | 17 of 17 | No. No audio in Groundwork, and Sweller et al. report the benefit reverses for longer audio. |

Mayer's segmenting example used "one or two sentences of narration along with about 8 to 10 s of animation" per segment, with a CONTINUE button.

**Strength.** Moderate. The effects are large and consistent, but most come from one research group, short lessons (minutes long) and immediate tests (my reading of the cited studies, not a claim Mayer makes). Treat the sizes as upper bounds.

**Source.** [Mayer 2008 PDF](https://studio.courseware.epfl.ch/assets/courseware/v1/2d72fc86ef1f00456f217c7389e65ff8/asset-v1:EPFL+DEMO+2020+type@asset+block/_www.instructionaldesign.institute_uploads_3_1_2_2_31221959_richard_mayer_article_applying_the_science_of_learning.pdf)

### 2.10 Animation versus static diagrams

| | |
|---|---|
| **Tversky, Morrison & Bétrancourt 2002** | "In cases where animated graphics seem superior to static ones, scrutiny reveals lack of equivalence between animated and static graphics in content or procedures; the animated graphics convey more information or involve interactivity." Animations fail the "Apprehension Principle" because they "are often too complex or too fast to be accurately perceived", and "many continuous events are conceived of as sequences of discrete steps". "Judicious use of interactivity may overcome both these disadvantages." Successes often came from "superior study procedures such as interactivity or prediction". |
| **Höffler & Leutner 2007** | 26 studies, 76 comparisons: *d* = 0.37 [0.25, 0.49]. Larger for representational (not decorative) animation (0.40), realistic video (0.76), and procedural-motor skills (1.06). |
| **Berney & Bétrancourt 2016** | 61 experiments, 140 comparisons, *N* = 7,036: *g* = 0.226 [0.12, 0.33], high heterogeneity. Iconic pictures gained more than abstract ones ("analytical pictures, formal notation, symbols, charts, diagrams"). Surprisingly, system-paced animations beat learner-paced ones in this set, which the authors say "interacts with other factors, like type of instruction, prior knowledge". |
| **Ploetzner, Berney & Bétrancourt 2021** | Animation won for identifying *motions*; static pictures won for identifying *spatial arrangements*. "The effect sizes are large." |
| **Strength** | Strong that the average benefit of animation is small. Moderate on the conditions where it helps. Contested on pacing control (Mayer and Sweller favour learner pacing; Berney & Bétrancourt found the opposite). |
| **Sources** | [Tversky et al. 2002 PDF](https://hci.stanford.edu/courses/cs448b/papers/Tversky_AnimationFacilitate_IJHCS02.pdf), [Höffler & Leutner 2007, ERIC abstract](https://eric.ed.gov/?id=EJ780451), [Berney & Bétrancourt, EARLI 2016 summary of the meta-analysis](https://tecfa.unige.ch/perso/sandra/pdf/Earli2016_berney_betrancourt_FINAL.pdf) (the full *Computers & Education* article is paywalled; I read the authors' conference summary), [Ploetzner et al. 2021 PDF](https://d-nb.info/1244480126/34) |
| **Groundwork** | Groundwork's diagrams are abstract (boxes, arrows, queues), which is the weakest case for animation. So: (1) treat each visualizer as a sequence of discrete, learner-stepped states, which matches how people think of program steps; (2) animate only the *change* between two states (what moved, what was added), at the spec's 150 to 250 ms; (3) add a prediction at key steps, because prediction and interactivity carried the reported wins; (4) for "how is this arranged" questions (which environment does this function point to?), show a still, side-by-side comparison rather than motion. Keep manual stepping as the default, and log whether learners use autoplay, so the pacing question can be checked on real use. |

### 2.11 Engagement with visualizations

| | |
|---|---|
| **Claim** | A visualization teaches little unless the learner does something with it. |
| **Evidence** | Naps et al. report Hundhausen's meta-analysis of 21 experiments, in which "only 13 of those experiments ... showed that some aspect of visualization technology or its pedagogical application significantly impacted learning outcomes". They propose an engagement taxonomy: no viewing, viewing, responding, changing, constructing, presenting. "Responding" includes "What will the next frame in this visualization look like? (prediction)". |
| **Strength** | Moderate. Older literature, but consistent with §2.10. |
| **Source** | [Naps et al. 2002 PDF](https://users.cs.duke.edu/~rodger/jflappapers/Naps2002.pdf) |
| **Groundwork** | Every visualizer reaches at least "responding" (next-frame prediction) and, through "Edit this example", "changing". Labs are "constructing". The Feynman explain-back is a form of "presenting". |

### 2.12 Notional machines

| | |
|---|---|
| **Claim** | Learners need an explicit, simplified model of the machine that runs their code. |
| **Evidence** | Sorva credits du Boulay with the term: a notional machine is "an idealized computer 'whose properties are implied by the constructs in the programming language employed' but which can also be made explicit in teaching". Sorva adds: "the purpose of a notional machine is to explain program execution". Clements and Krishnamurthi (ICER 2022) show the usual stack picture misleads. For a returned function, "it is reasonable for a student to assume that x has been lost ... we saw some students provide exactly this explanation", so "the traditional drawing is actively misleading". The stack picture also pushes students toward dynamic scope, because "control chains in the order of frames in the stack. The environment, however, chains to the environment that was present at its point of creation." They also criticise Python Tutor for "suggestion of dynamic scope". |
| **Strength** | Strong as a design argument and supported by small pre/post studies. Clements and Krishnamurthi's samples are upper-level university courses. |
| **Sources** | [Sorva 2012 doctoral thesis PDF](https://aaltodoc.aalto.fi/server/api/core/bitstreams/6f1c730e-019e-42ed-9833-aae9b7c541ac/content), [Clements & Krishnamurthi 2022 PDF](https://cs.brown.edu/people/sk/Publications/Papers/Published/ck-nm-stacks/paper.pdf). Sorva's 2013 TOCE paper "Notional machines and introductory programming education" returned HTTP 403 to me. |
| **Groundwork** | Groundwork's notional machine for JS is the spec's `Trace` frame: a stack of frames (control), a set of environment records with parent links, and a heap. Draw the stack and the environment records in separate regions. A frame points to its current environment record; an environment record points to its outer record; a function object points to the record it was created in. The outer arrow must never be drawn as "the frame below". The trace format in §6.1 already separates `stack` and `envs`, so this is a rendering rule, not a format change. |

### 2.13 Misconception catalogs

| | |
|---|---|
| **Sorva's catalog** | Table A.1 of Sorva's thesis lists 162 novice misconceptions with sources. Relevant rows: #5 "Difficulties understanding the lifetime of values" (du Boulay); #9 "A variable can hold multiple values at a time / 'remembers' old values"; #47 "Subprograms can (routinely) use the variables of calling subprograms" (Fleury 1991), which is dynamic scope. |
| **progmiscon.org** | A curated inventory linked to language specifications. Its JavaScript page lists 6 entries: AssignmentCopiesObject, ClassDefinesType, ConstReferenceImpliesImmutability, NoAtomicExpression, NullIsObject, ThisAssignable. The site itself warns the count reflects collection effort, not language difficulty. |
| **JavaScript-specific research** | I found no study-based catalog of JavaScript closure, async or `this` misconceptions. Clements and Krishnamurthi is the closest (closures and stacks, in Python-like code). |
| **Strength** | Strong for the general catalog; JS coverage is thin (finding, not a guess). |
| **Sources** | [Sorva thesis](https://aaltodoc.aalto.fi/server/api/core/bitstreams/6f1c730e-019e-42ed-9833-aae9b7c541ac/content) (Appendix A, p. 359 onward), [progmiscon JavaScript list](https://progmiscon.org/misconceptions/JavaScript/), [Chiodini et al. 2021 PDF](https://www.chiodini.org/publications/iticse21-progmiscon.pdf) |
| **Groundwork** | Build `content/misconceptions/*.yaml`, one entry per misconception, with an ID, a one-line wrong belief, the source (paper, progmiscon ID, or "observed in Aditya's answers"), a diagnostic snippet, and the refutation. Predict options reference these IDs. The Feynman grader's `misconceptions[]` output uses the same IDs. This registry is also a reusable open-source contribution; progmiscon is the place to upstream JS entries. |

### 2.14 Self-explanation

| | |
|---|---|
| **Claim** | Prompting learners to explain why a step works improves learning. |
| **Evidence** | Chi et al. 1989 found "Good" students generate self-explanations "guided by accurate monitoring of their own understanding", while "Poor" students "do not generate sufficient self-explanations". Bisra et al. (64 reports, 69 effects, 5,917 participants): *g* = 0.55 [0.45, 0.65]. All inducement types had a detectable effect "except multiple-choice inducements and metacognitive self-explanations". Conceptual prompts beat metacognitive ones. Explanations written by the learner did as well as or better than explanations given to them in the studies reviewed. |
| **Strength** | Strong for the overall effect; moderate for the moderators. |
| **Sources** | [Chi et al. 1989, abstract on SERC](https://serc.carleton.edu/resources/19512.html) (full text blocked by a bot check), [Bisra et al. 2018 PDF](https://gwern.net/doc/psychology/spaced-repetition/2018-bisra.pdf) |
| **Groundwork** | Explain prompts are free text and conceptual: "Which environment record does `g` look in first, and why that one?" Not "Did that make sense?". Short ones go mid-lesson right after a reveal; the long "explain it back" goes at the end and the next day. |

### 2.15 Desirable difficulties

| | |
|---|---|
| **Claim** | Spacing, interleaving, varied practice and testing slow visible progress but improve lasting learning. |
| **Evidence** | Bjork and Bjork: "conditions that most rapidly increase retrieval strength differ from the conditions that maximize the gain of storage strength", so learners who read fluency as learning "become susceptible to preferring poorer conditions of learning". Caveat: "If, however, the learner does not have the background knowledge or skills to respond to them successfully, they become undesirable difficulties." |
| **Strength** | Strong as a framework; it summarises §2.1 to §2.4. |
| **Source** | [Bjork & Bjork, 2nd ed. 2014 chapter](https://burrell.edu/wp-content/uploads/2020/09/EBjorkRBjork_FABBSchapter2014-2nd-ed._WithCoverPage.pdf) |
| **Groundwork** | Tell Aditya plainly that reviews will feel harder than re-reading and that this is the point. Keep difficulty answerable: a Predict whose answer depends on a term not yet taught is an undesirable difficulty. |

### 2.16 Writing multiple-choice items

| | |
|---|---|
| **Claim** | Multiple-choice can teach wrong answers, unless feedback follows. Plausible wrong options make learners think about why each is wrong. |
| **Evidence** | Butler and Roediger: multiple-choice "exposes students to erroneous information in the form of lure items"; immediate or delayed feedback "increased the proportion of correct responses and reduced the proportion of intrusions" on a later test. Little et al.: multiple-choice tests with "plausible (i.e., competitive)" alternatives "also facilitated recall of information pertaining to incorrect alternatives". |
| **Strength** | Moderate to strong (lab studies with text passages). |
| **Sources** | [Butler & Roediger 2008 PDF](https://gwern.net/doc/psychology/spaced-repetition/2008-butler.pdf), [Little, Bjork, Bjork & Angello 2012 PDF](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Little_EBjork_RBjork_Angello_2012.pdf) |
| **Groundwork** | Every option must be something a real learner believes (a registry entry), never a joke option. Always give feedback. Prefer typed answers (output, value) where the answer space is small, because typed recall avoids planting lures. |

### 2.17 Parsons problems

| | |
|---|---|
| **Claim** | Reordering given code lines is a fast, effective step between reading and writing code. |
| **Evidence** | The 2022 ITiCSE working-group review: "A wide variety of types of Parsons problems are known to provide learning gains to students, including basic, faded, adaptive, and with distractors ... Overall, evidence in this category is high quality." Solving them "was significantly faster than ... fixing code with errors [62], writing textual code [59, 62]", where [62] is Ericson, Margulieux and Rick 2017. A Parsons problem whose solution did not match the common student solution was not faster. |
| **Strength** | Moderate to strong for efficiency; most studies are Python and Java. |
| **Source** | [Ericson et al. 2022 PDF](https://juholeinonen.com/assets/pdf/ericson2022parsons.pdf) |
| **Groundwork** | Use a Parsons step between the worked example and the blank lab, with distractor lines that encode misconceptions (for example, `let timer` placed inside the returned function in `debounce`). Write the target solution the way a learner would naturally write it. |

### 2.18 Mastery learning and tutoring

| | |
|---|---|
| **Claim** | Requiring mastery of a unit before the next raises achievement. Bloom's "two sigma" claim for tutoring is overstated. |
| **Evidence** | Kulik, Kulik and Bangert-Drowns: 108 controlled evaluations showed positive effects on examination performance. A careful secondary review reports their pooled effect as 0.52, with about 0.5 on teacher-made tests and near zero (0.08) on standardised tests, and quotes Slavin that effects are "essentially nil on standardized achievement measures". VanLehn 2011: human tutoring vs no tutoring *d* = 0.79; step-based tutoring systems 0.76. |
| **Strength** | Moderate and contested. The gap between local and standardised tests suggests mastery programmes teach to their own tests. |
| **Sources** | [Kulik et al. 1990, ERIC abstract](https://eric.ed.gov/?q=%22Effectiveness+of+Mastery+Learning+Programs%22) (record EJ415887; the full PDF did not load), [Nintil review of Bloom's two sigma](https://nintil.com/bloom-sigma/) (secondary), [VanLehn 2011 PDF](https://www.emergingedtech.com/-kvanlehn/Stringent/PDF/EffectivenessOfTutoring_Vanlehn.pdf) |
| **Groundwork** | Use a soft mastery gate: a lesson counts as "done" when its checkpoint Predicts are answered correctly on a later day (from the review queue), not when the page is scrolled. Do not block the path; with 30 days, blocking costs more than it gains. Because mastery measured on Groundwork's own items can mislead, also test on new interview-style questions (§5 "Interview lens"). Step-based help (VanLehn) matches Groundwork's stepped Predicts and hint ladder. |

### 2.19 FSRS versus SM-2

| | |
|---|---|
| **Claim** | FSRS predicts the chance of recalling a card better than SM-2. |
| **Evidence** | The open-spaced-repetition benchmark uses about 727 million reviews from 10,000 Anki users. In the April 2025 version of the README, unweighted, without same-day reviews: FSRS-6 log loss 0.345, RMSE(bins) 0.066, AUC 0.707; SM-2 0.72, 0.203, 0.603; Anki-SM-2 0.62, 0.172, 0.613. SM-2 "does not predict the probability of recall natively; therefore ... the output was modified based on some assumptions about the forgetting curve." The current README drops the SM-2 rows and lists FSRS-7 (log loss 0.3401) and FSRS-7 with default parameters (0.3620). |
| **Strength** | Strong that FSRS predicts recall better on Anki data. No evidence here that it produces more learning. The benchmark is maintained by the FSRS authors (not independent), uses flashcard data, and scores a converted SM-2. |
| **Sources** | [srs-benchmark README (current)](https://github.com/open-spaced-repetition/srs-benchmark), [README at commit 57828eff8c, April 2025, with SM-2 rows](https://github.com/open-spaced-repetition/srs-benchmark/blob/57828eff8c/README.md) |
| **Groundwork** | Keep ts-fsrs. Over 30 days Aditya will make a few hundred reviews, too few to train personal parameters, so Groundwork runs on default parameters (the benchmark shows defaults are worse than trained but still far better than SM-2 by log loss). The bigger lever is card design (§3, step 10). |

### 2.20 One overview to anchor the rest

Dunlosky et al. rated ten techniques. "Practice testing and distributed practice received high utility assessments." "Elaborative interrogation, self-explanation, and interleaved practice received moderate utility." "Summarization, highlighting, the keyword mnemonic, imagery use for text learning, and rereading" were rated low. Source: [Dunlosky et al. 2013 PDF](https://www.whz.de/fileadmin/lehre/hochschuldidaktik/docs/dunloskiimprovingstudentlearning.pdf). For Groundwork this means the review queue and predictions are the core, and a "re-read the lesson" button is not a study tool.

---

## 3. How the best explainers build one lesson

I opened one or more real pages from each author and measured how much prose runs between interactive elements. Measurement method: a script counted words in paragraphs between consecutive interactive elements in the page HTML. The numbers are approximate (captions and code count unevenly).

### 3.1 What each one does

| Explainer | Page(s) opened | Order of moves | Term introduction | Prose between interactions | How understanding is checked |
|---|---|---|---|---|---|
| **javascript.info** | [Variable scope, closure](https://javascript.info/closure) | Code blocks and nested functions first, then a working `makeCounter`, then a question ("If we create multiple counters, will they be independent?"), then "Lexical Environment" in four numbered steps with a figure per step, then garbage collection and "real-life optimizations", then 10 tasks. | Defines "Lexical Environment" in bold the first time, as "an internal (hidden) associated object", then its two parts, then uses it. Flags depth honestly ("Here be dragons! The in-depth technical explanation lies ahead."). Notes it is "a specification object" that exists only "theoretically". | Figures every 25 to 165 words in the theory part. | Tasks at the end with an "importance" rating (1 to 5) and hidden solutions. The mid-text questions are rhetorical; the learner never commits. |
| **Bartosz Ciechanowski** | [Mechanical Watch](https://ciechanow.ski/mechanical-watch/) | Shows the finished, complex object first as a map. Lays out the core system "in a straight line". Then strips to the simplest part (a coil spring) and adds one part per section until the whole watch is rebuilt. | Every component name is colour-coded where it first appears and the colour is reused in figures. He tells the reader "you shouldn't feel pressured to remember" the jargon. | 93 interactive figures in about 8,200 words. Median 61 words between figures. | No quizzes. Understanding is checked by manipulating each figure (drag, slider). |
| **Sam Rose** | [Memory Allocation](https://samwho.dev/memory-allocation/), [Load Balancing](https://samwho.dev/load-balancing/) | Starts from the simplest case (32 bytes; one server, one request). Reuses one widget throughout and adds one rule at a time (bump allocator, free list, fragmentation, boundary tags). Ends with a playground. | A dog character voices the reader's doubts at the moment they arise: "Wait a sec... What is malloc actually returning as a value?", "Is that a bug in the visualisation?", "We store the size twice? Isn't that wasteful?" | Median 60 words (memory, 21 widgets) and 63.5 words (load balancing, 24 simulations). | A "quick malloc puzzle": "Have a think about this before playing with the slider below." Each widget carries a text description attribute. |
| **Josh W. Comeau** | [Why React Re-Renders](https://www.joshwcomeau.com/react/why-react-re-renders/), [The Joy of React course page](https://www.joyofreact.com/) | Opens by admitting he worked with React "without really understanding" re-rendering, names the misconceptions, then states one rule (state change is the only trigger), then raises the reader's objection ("don't components re-render when their props change?"), then refuses to have it memorised ("Rather than memorize this as a rule, though, let's take a step back") and derives it from React's main job. Uses a metaphor (each render is a snapshot; memo is "a lazy photographer"). Live code after each idea. | Terms like "pure component" are defined in a sentence before use. | A live playground per section. | The course page describes "exercises, real-world-inspired projects, and fun mini-games", with "a boss at the end of each section". |
| **Dan Abramov, Just JavaScript** | [Episode 1, Mental Models](https://justjavascript.com/learn/01-mental-models), [Episode 3, Values and Variables](https://justjavascript.com/learn/03-values-and-variables) | Starts with a small puzzle. Asks the reader to "write down your exact thought process for each line of this code, step by step", then "Don't reveal until you have finished writing." Reveals, says "Don't despair if you got it wrong!", then introduces the model (variables as "wires") and asks the reader to sketch it. Ends with a recap list and exercises. | Says plainly that the model's word is not a JS term: "A 'wire' is not a JavaScript concept—but it helps us imagine how variables point to values." Uses "fast and slow" thinking to motivate step-by-step tracing. | Short; each episode is about 1,100 to 2,100 words with one puzzle near the top and exercises at the end. | Quizzes after every episode. The landing page says wrong answers get an explanation. Also: "If two things that you learned seem to contradict each other, don't get discouraged. Usually it's a sign that there's a deeper truth lurking underneath." |

### 3.2 Moves they share

1. **Start concrete.** All five open with a specific object, puzzle or confession, never an abstract definition.
2. **Simplest case first, one rule at a time.** Ciechanowski and Rose add exactly one part or rule per step to the same widget.
3. **About 60 words, then something to touch.** The two most interactive authors converge on a median of about 60 words between interactive elements. javascript.info and Comeau run longer (up to about 200 words) between figures or playgrounds.
4. **Name a term, then use it.** Colour (Ciechanowski), bold plus definition (javascript.info), or an explicit "this is our model, not a JS term" (Abramov).
5. **Say the reader's doubt out loud.** Rose's dog, Comeau's "don't components re-render when their props change?", Abramov's "you might object".
6. **Commit before reveal, and no shame.** Only Just JavaScript and Rose's puzzle make the reader commit. Abramov's "write down your thought process ... Don't reveal until you have finished" is the strongest version.
7. **Theory is named as theory.** javascript.info warns before the spec-level section. Comeau refuses rote rules and derives them.

Groundwork should take the commit-before-reveal habit from Abramov, the part-by-part build from Ciechanowski and Rose, the voiced doubt from Rose and Comeau, and the spec-level honesty from javascript.info, and add what none of them has: distractors mapped to a misconception registry, and spaced review.

---

## 4. The lesson-design playbook (writer's brief)

This is the recipe for one lesson. It is written for the pipeline. Claude owns steps 1 to 7 and the code, traces and Predicts. The prose writer (Gemini) owns step 8 within the constraints given. Reviewers apply the checklist in §4.3.

### 4.1 The artifacts one lesson produces

| File | Owner | Contents |
|---|---|---|
| `content/<track>/<lesson>/outline.yaml` | Claude | Frontmatter, vocabulary list, misconception IDs, ordered segment list (shape below). The single source of truth the prose writer works from. |
| `content/misconceptions/<id>.yaml` | Claude | New or updated registry entries used by this lesson. |
| `content/<track>/<lesson>/traces/*.ts` | Claude | Scripted traces, checked against real execution in CI. |
| `content/<track>/<lesson>/index.mdx` | Gemini drafts, Claude assembles | The lesson body, generated from the outline. |
| `content/<track>/<lesson>/review.md` | QA models | The filled-in reviewer checklist with findings. |

Segment shape in `outline.yaml`:

```yaml
segments:
  - id: s03-lookup
    goal: "Lookup walks from the current environment record outward"   # one idea
    terms_introduced: [outer-reference]          # must be in vocabulary
    terms_used: [binding, environment-record]    # must be introduced earlier
    words: 80-120                                # prose budget for the writer
    code: traces/lookup.ts                       # optional, runs in CI
    visual: { component: EnvChain, steps: [1, 4], new_parts: [outer-arrow] }
    interaction:
      kind: predict                              # predict | step | predict-next-frame | explain | parsons | run
      id: p02
    doubt: "Why doesn't it look in the caller's variables?"   # optional voiced doubt
```

### 4.2 The recipe

**Step 1. Fix the outcomes and the misconceptions first.** Write at most three outcomes (spec §4.3). For each outcome list the wrong beliefs a learner could hold, from the registry, from Sorva's Table A.1, from progmiscon, from the spec or MDN "common mistake" sections, or from Aditya's past answers. Each lesson targets 4 to 8 misconception IDs. A misconception with no Predict that can expose it is not covered.

**Step 2. Write the vocabulary list.** List every technical term the lesson uses, including ones from earlier lessons. For each, mark `new` or `from <lesson-id>`. Write a one-sentence plain-English definition for each new term, and the exact spec name where one exists (for example "environment record", spec name "Environment Record", field `[[OuterEnv]]`). Rules:
- No term appears in prose before the segment that introduces it. The only exception is the hook, which must be answerable with no new terms.
- At most three new terms per segment.
- Every new term is rendered with a `<Term id>` component on first use (it shows the definition on hover or tap, and adds the term to the lesson glossary and to the site glossary).
- Terms from earlier lessons get a one-clause reminder the first time they appear ("an execution context, the record JS keeps for each running piece of code (lesson 1.2)").
- If the lesson's teaching model uses a word that is not a JS term (like Abramov's "wire"), say so in the text.
- The spec's precise vocabulary rule (§9.5) applies: write "the function object holds a reference to the environment record in which it was created", not "closures remember variables".

**Step 3. Write the hook.** One `<Predict>` with a short snippet whose answer surprises people who hold the lesson's main misconception. It needs no new terms. Show the real output immediately after the commit (run it), but defer the explanation: "Keep your answer; by segment 9 you will be able to explain this." The hook is also the expertise check (step 9).

**Step 4. Plan segments.** Each segment has one idea, 60 to 150 words of prose, and ends with one interaction. Hard cap: 250 words without an interaction. A 75-minute lesson has roughly 12 to 18 segments and 8 to 12 Predicts or next-frame predictions. Order segments with this cycle, repeated per idea:
1. Concrete code (the smallest snippet that shows the idea).
2. Predict (commit, confidence, reason).
3. Observe (run it, or step the visualizer).
4. Explain the mechanism, with the term introduced here.
5. Ground it in the spec: one short quoted line or field name, with a link, in a `<Sidenote>`.
6. Vary one thing and predict again (the "modify" of PRIMM).

Theory and code alternate inside this cycle. No more than two segments in a row without code. No code without a sentence on the mechanism behind it.

**Step 5. Write every Predict to the same template.**
- **Format.** Prefer typed answers (exact output or value) when the answer is short. Use multiple choice when the answer space is large or the point is to tell apart specific beliefs. Use "click the box" on a diagram for "where does this lookup land?" questions.
- **Options.** 3 or 4. Exactly one is correct. Every wrong option maps to a misconception ID, and the option text is what that belief actually predicts (run the "wrong model" in your head or as code to get it right). No joke options.
- **Commit.** Answer plus a confidence choice: "sure", "think so", "guessing". Optional "because" chip list (reasons map to misconception IDs).
- **Reveal.** Immediately. Show the real result (run output or the next frames).
- **Feedback for a wrong answer.** Named misconception, 2 to 4 sentences: what you believed, the smallest counterexample, the true rule, and a link to the segment or visual step that shows it. Never "Incorrect, try again". A confident wrong answer gets a "this is a common and confident belief" line (hypercorrection: these are the most fixable).
- **Feedback for a right answer.** One line confirming the mechanism, so a lucky guess still learns the reason.
- **Log.** Store answer, confidence and misconception ID locally. Feed misses into the review queue as cards for that misconception.
- **CI.** The correct answer is the real output of the snippet (spec §9.1). Each wrong option's text is checked against its registry entry's "predicts" field.

**Step 6. Introduce a visualizer one part at a time.**
1. **Pre-train the parts with a still diagram.** Before any stepping, show a labelled static frame: each kind of box and arrow with its name and a one-line meaning. This is Mayer's pre-training.
2. **Add one new part per segment.** The first stepped trace uses only the parts introduced so far. A new part (for example the function object's `[[Environment]]` arrow) is introduced in its own segment, with its own label, before a trace depends on it.
3. **Learner-paced stepping.** Manual by default. Back-stepping always available. The changed element is highlighted in each step and the previous state is shown as a faint ghost for one step (transient-information rule).
4. **Narration next to the diagram.** One sentence per step, beside the diagram, in sync with the step (spatial and temporal contiguity). The same sentence goes to the `aria-live` transcript.
5. **Predict the next frame.** At one or two key steps per trace, pause and ask "what changes next?" with clickable targets (Naps "responding").
6. **Still comparison for structure.** When the point is how things are arranged (two loops, two environment layouts), show the two final states side by side and still.
7. **Edit this example.** After the guided trace, offer a small change to try (PRIMM "modify").

**Step 7. Plan the lab as fading.** Worked example with "which rule makes this line work?" prompts, then a completion problem, then a Parsons problem with misconception-coded distractors, then a blank implementation with tests. Hints follow spec §6.3. Each lab test name states the behaviour in plain words and, where a failing test signals a known misconception, the failure message names it.

**Step 8. Prose rules for the writer (Gemini).** The writer receives `outline.yaml`, the vocabulary list, the registry entries and the traces, and writes only the prose fields.
- Stay inside each segment's word budget and introduce only the listed terms.
- One idea per paragraph, short sentences, plain words. Aditya is a non-native English speaker; prefer the everyday word.
- Voice the reader's doubt where the outline has a `doubt` field, then answer it.
- Do not restate the code in words line by line; explain what the code shows about the mechanism.
- Do not invent APIs, behaviour, outputs or numbers. If a claim is not in the outline, the spec quote or a linked source, do not write it.
- Follow the banned-phrase list (spec §9.3) and use no emoji.
- Say when something is a teaching model rather than the spec, and when something is engine behaviour (V8) rather than the language.

**Step 9. Add the expertise fast path.** If the hook and the first two Predicts are answered correctly with "sure", show an offer: "You seem to know the basics. Collapse explanations to summaries?" Collapsed segments show their one-line goal and keep their Predicts. Wrong answers re-expand the segment.

**Step 10. Write explain-it-back prompts and cards.**
- **Explain it back.** One end-of-lesson prompt in the spec's form ("Explain X to a junior in 3 sentences"), with a rubric of 3 to 5 required points that use the lesson's terms, and one or two misconception IDs the grader watches for. The same prompt is repeated the next morning without the lesson open (retrieval plus spacing).
- **Mid-lesson explains.** 1 or 2 one-sentence free-text prompts right after a big reveal. Conceptual ("which record, and why"), never metacognitive ("did you understand?").
- **Cards.** 3 to 6 per lesson (spec §5), with these rules:
  - At least one card per format: predict-output, explain, implement.
  - Predict-output cards use new snippets with different names and surface shape from the lesson's code (transfer needs varied cues).
  - At least one "why" card whose answer is a mechanism sentence (elaborated retrieval).
  - At least one card in a discrimination set with a look-alike from another lesson (for example `var` loop vs `let` loop), tagged so review sessions put them together.
  - One fact per card. The back states the answer and the one-line reason.
  - A missed Predict in the lesson adds the matching misconception card to the queue.

**Step 11. Close with the spec's sections.** Misconceptions summary (generated from the registry IDs used), lab, "In the wild", interview lens with rubrics, explain it back, cards. These are already in §5 of the spec.

**Step 12. Run the checks.** content-check (code runs, traces verify, banned phrases), the vocabulary lint (see 4.3, item 2), then the reviewer checklist.

### 4.3 Reviewer checklist (depth and quality)

A reviewing model fills this in per lesson, citing segment IDs. Mark each item pass, fail or n/a with a reason. Prefix defects `h` (blocks publication), `m` (fix before `reviewed`), `l` (optional).

**Vocabulary and order**
1. Every new term is in the vocabulary list, introduced by `<Term>` on first use, and never appears earlier (automatable: scan MDX for vocabulary terms before their introducing segment).
2. No segment introduces more than three new terms.
3. The hook needs no new term to answer.
4. Earlier-lesson terms get a one-clause reminder on first use.

**Interaction density**
5. No run of more than 250 prose words without an interaction (automatable).
6. At least 8 Predicts or next-frame predictions for a 60 to 90 minute lesson.
7. Each segment has one idea; its `goal` line can be stated in one sentence.

**Predicts**
8. Each Predict's correct answer is the real CI output.
9. Each wrong option maps to a registry ID and is what that belief actually predicts.
10. Each wrong option has targeted feedback (belief, counterexample, rule, link).
11. Confidence is collected; reveal is immediate.
12. The Predicts escalate: at least one tests transfer to new code, and at least one is a "modify and predict again" variation.

**Depth (theory as important as code)**
13. Each outcome is backed by a mechanism explanation that names the spec structure involved, with a spec link, not only by examples.
14. The lesson states at least one boundary of its model ("this is how the spec describes it; engines may store it differently") where relevant.
15. The lesson answers "why is it designed this way?" at least once (the design reason or the trade-off).
16. Every misconception in the outline is both exposed by a Predict and refuted with a counterexample.
17. A reader could re-derive the lesson's rules from the mechanism, without memorising them (Comeau's test). Check by asking: is any rule stated without a "because"?
18. "In the wild" connects to code Aditya will meet at work or in interviews, with a concrete snippet.

**Visualizer**
19. Parts are pre-trained with a still, labelled frame before stepping.
20. Each new visual part gets its own segment before a trace depends on it.
21. Narration sits beside the diagram, one sentence per step, mirrored in the transcript.
22. The visual draws control (stack) and environments separately where both appear.
23. At least one next-frame prediction per trace.

**Explain, cards, lab**
24. Explain prompts are conceptual and have a rubric with the lesson's terms.
25. Cards meet the step-10 rules (formats, new surface, why card, discrimination set).
26. The lab fades from worked example to blank, and distractors in the Parsons step encode registry misconceptions.

**Prose**
27. Plain English, short sentences, no banned phrases, no unexplained jargon, no invented behaviour or numbers.
28. Every claim about behaviour is either run in CI, quoted from the spec or MDN, or labelled as engine-specific.

---

## 5. Worked outline: lesson 1.3 "Scope and closures"

**Frontmatter.** As in spec §5 (`id: js-closures`, `minutes: 75`, `prereqs: [js-execution-context]`). Outcomes as in the spec. Sources: [ECMAScript Environment Records](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-environment-records), [MDN Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures).

**Spec facts the lesson rests on (verified in the spec pages).**
- An Environment Record "is a specification type used to define the association of Identifiers to specific variables and functions, based upon the lexical nesting structure of ECMAScript code". "Every Environment Record has an [[OuterEnv]] field, which is either null or a reference to an outer Environment Record." A new one is created each time a function, block or catch clause is evaluated. ([spec 9.1](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-environment-records))
- Every ECMAScript function object has an internal slot `[[Environment]]`: "The Environment Record that the function was closed over. Used as the outer environment when evaluating the code of the function." ([spec 10.2](https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ecmascript-function-objects))
- A `for` loop with `let` calls CreatePerIterationEnvironment, which gives each iteration its own copy of the loop binding. ([spec 14.7.4](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-createperiterationenvironment))
- MDN: a closure "is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment)", and MDN has a section "Creating closures in loops: A common mistake". ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures))

**Design decision.** The hook uses an array of functions called after the loop, not `setTimeout`. The `setTimeout` version mixes the closure question with the event loop, which is lesson 1.7. One variable at a time. The `setTimeout` version appears in "In the wild" with a forward link.

### 5.1 Misconception registry entries used

| ID | Wrong belief | Source |
|---|---|---|
| `CLO-SNAPSHOT` | A function captures the *value* of an outer variable when the function is created. | Sorva #9 is related ("remembers old values"); MDN's loop "common mistake" section. |
| `SCOPE-DYNAMIC` | A function can see the variables of whatever function called it. | Sorva #47 (Fleury 1991); Clements & Krishnamurthi 2022. |
| `CLO-FRAME-DIES` | When a function returns, its local variables are destroyed, so an inner function returned from it cannot use them. | Clements & Krishnamurthi 2022 ("Closures Outlive Stack Frames"); Sorva #5 (lifetime of values). |
| `CLO-SHARED-ACROSS-CALLS` | All calls to the same outer function share one set of local variables. | Inferred from MDN's counter example ("Notice how the two counters maintain their independence"); confirm with Aditya's answers. |
| `CLO-RERUN-OUTER` | Calling the inner function re-runs the outer function's body, resetting its variables. | Local, unverified in literature; observed pattern in counter questions. Label "observed" once seen in logs. |
| `CLO-COPY-PER-FUNCTION` | Two functions created in the same call each get their own copy of the outer variables. | Inferred from MDN's "single lexical environment that is shared by the three functions" example. |
| `VAR-BLOCK-SCOPED` | `var` is scoped to the nearest block, like `let`. | MDN loop section; javascript.info. |
| `LOOP-LET-SINGLE` | A `let` loop variable is one binding that the loop increments, same as `var`. | Spec CreatePerIterationEnvironment refutes it. |
| `LOOP-INCREMENT-LEAKS` | The loop's `i++` changes the binding that an earlier iteration's function captured. | Spec order of CreatePerIterationEnvironment and the increment refutes it. |
| `SCOPE-NO-WALK` | Lookup only checks the current function's variables, then gives up. | Inferred; Sorva #48 is the related "cannot use globals ... not passed as parameters". |

Entries marked "inferred" or "local" are hypotheses until Aditya's logged answers show them. That is fine: the registry records the source honestly.

### 5.2 Vocabulary

| Term | Status | Plain definition |
|---|---|---|
| execution context | from 1.2 | The record JS keeps for each running piece of code: which code, where it is, which environment it uses. |
| call stack, frame | from 1.2 | The list of execution contexts in progress; a frame is one entry. |
| heap, function object | from 1.1 | Where objects live; a function is an object too. |
| binding | new (s02) | One name paired with its current value, like a row in a table. |
| scope | new (s02) | The part of the code where a name can be used. |
| environment record | new (s02) | A table of bindings that JS creates when a function call, a block or the script starts running. Spec name "Environment Record". |
| outer reference | new (s03) | The arrow from an environment record to the record around it. Spec field `[[OuterEnv]]`. |
| lookup (scope chain) | new (s03) | Finding a name: check this record, then follow outer references until found or until `null`. |
| lexical scope | new (s05) | Scope decided by where code is written, not by who calls it. |
| `[[Environment]]` slot | new (s05) | A hidden field on every function object pointing to the environment record where the function was created. |
| closure | new (s06) | A function object together with the environment record its `[[Environment]]` points to. Every JS function has one; returning a function just makes it visible. |
| block environment | new (s10) | The environment record created for a `{ ... }` block; holds its `let`, `const` and `class` bindings, not `var`. |
| per-iteration environment | new (s12) | The fresh environment record a `let` loop makes for each pass, with the loop variable copied in. |
| `setTimeout` | forward ref (In the wild) | Runs a function later, after the current code finishes; full story in 1.7. |

### 5.3 Segments

Approximate time in brackets. "Trace" means a scripted trace in `traces/`, verified in CI. EnvChain colours follow spec §4.2: stack frames blue, heap objects (function objects) ochre; environment records get a neutral ink outline in their own region.

**s01. Hook** [4 min]

Predict **P0** (typed answer, confidence):
```js
const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns.map((f) => f()));
```
Correct: `[ 3, 3, 3 ]`.
If shown as choices:
- `[ 0, 1, 2 ]` → `CLO-SNAPSHOT` (each function kept the value it saw) or `VAR-BLOCK-SCOPED` (each pass has its own `i`). Reason chips separate the two.
- `[ 2, 2, 2 ]` → not a closure belief; the loop stops when `i < 3` fails, so `i` ends at 3. Feedback points at the loop condition.
- `ReferenceError` → `CLO-FRAME-DIES` (the loop is over, so `i` is gone).

Reveal: run it, show the output. Text: "Keep your answer in mind. By segment 11 you will be able to explain this exactly, and fix it two ways." No explanation yet.

**s02. Names live in tables** [4 min] Terms: binding, scope, environment record.
Code: a three-line script with `const a = 1; let b = 2;`. Still diagram (pre-training): one environment record box labelled "environment record (global)", two rows labelled "binding". Narration: what a binding is, that JS creates a record when code starts running, spec name in a sidenote. Interaction: step a 2-step trace where `b = 3` updates the row (not a new row; refutes "variable holds old values", Sorva #9).

**s03. Looking a name up** [5 min] Terms: outer reference, lookup.
Code:
```js
const site = "groundwork";
function show() {
  const page = "closures";
  return site + "/" + page;
}
console.log(show());
```
Visual, new part: the outer-reference arrow. Still frame first with the arrow labelled `[[OuterEnv]]`, then a stepped trace: call `show`, a new record appears with an arrow to global, lookup of `page` stops in the inner record, lookup of `site` follows the arrow. Next-frame prediction **N1** at the `site` lookup: "Click the record where `site` is found."
Wrong click on the inner record → `SCOPE-NO-WALK` feedback.

**s04. Which outer?** [5 min] No new terms. This is the surprise that motivates lexical scope.
Predict **P1**:
```js
let x = "global";
function f() {
  let x = "f";
  return g();
}
function g() {
  return x;
}
console.log(f());
```
Correct: `global`.
- `f` → `SCOPE-DYNAMIC`. Feedback: "You followed the call: `f` called `g`, so you looked in `f`. JS does not follow calls for names. It follows where `g` was written. Segment 5 shows the arrow that decides this."
- `ReferenceError` or `undefined` → `SCOPE-NO-WALK`.
Doubt to voice: "But `f` is right there on the stack, under `g`."

**s05. Functions remember where they were born** [6 min] Terms: lexical scope, `[[Environment]]` slot.
Visual, new parts: the stack region (blue frames) drawn separately from the environment region, and function objects in the heap (ochre) with an `[[Environment]]` arrow. Still frame first, labelled. Then step the P1 program: when `g` is called, its new record's outer arrow is copied from `g.[[Environment]]` (global), not from the frame below. Narration quotes the spec slot description in a sidenote. Side-by-side still: "the arrow JS uses" vs "the arrow the stack suggests" (the misconception drawn and crossed out). Mid-lesson explain **E1** (free text, one sentence): "Why did `g` see `"global"` and not `"f"`?" Model answer shown after submit; rubric points: `[[Environment]]`, created at global level, lookup ignores the caller.

**s06. Returning a function** [6 min] Term: closure.
Predict **P2**:
```js
function makeAdder(a) {
  return function (b) {
    return a + b;
  };
}
const add5 = makeAdder(5);
console.log(add5(2));
```
Correct: `7`.
- `NaN` → `CLO-FRAME-DIES` (believes `a` became `undefined` after `makeAdder` returned, and `undefined + 2` is `NaN`).
- `ReferenceError` → `CLO-FRAME-DIES` (believes `a` no longer exists).
- `"52"` → not a closure belief; numbers add. Brief feedback.
Visual: step it. The `makeAdder` frame pops off the stack, but its environment record stays, because the returned function object's `[[Environment]]` still points to it. Next-frame prediction **N2** just before the pop: "When the frame leaves, what happens to the record with `a`?" (stays / removed). Define closure here, with MDN's definition in a sidenote and the spec-precise sentence in the text. Say plainly: every function has `[[Environment]]`; "closure" is the name we use when it matters.

**s07. A closure holds the binding, not the value** [4 min] No new terms.
Predict **P3**:
```js
let count = 1;
const read = () => count;
count = 2;
console.log(read());
```
Correct: `2`.
- `1` → `CLO-SNAPSHOT`. Feedback: "The function's `[[Environment]]` points to the record, and the record's `count` row now says 2. Nothing was copied."
Modify-and-predict **P3b** (typed): change `let` to `const` and remove the reassignment line; ask what `read()` returns and why `const` does not change the closure story. Correct: `1`.

**s08. Each call makes a new record** [5 min] No new terms.
Predict **P4**:
```js
function makeCounter() {
  let n = 0;
  return () => ++n;
}
const a = makeCounter();
const b = makeCounter();
a();
a();
console.log(a(), b());
```
Correct: `3 1`.
- `3 4` → `CLO-SHARED-ACROSS-CALLS`.
- `1 1` → `CLO-RERUN-OUTER` (believes calling the inner function re-runs `let n = 0`).
- `3 3` → mixed; feedback asks which counter `b` uses.
Visual: still side-by-side of the two records after the code runs, each with its own `n`, each function object pointing to its own record. This is a structure question, so still pictures, not motion.

**s09. Functions from one call share one record** [4 min] No new terms.
Predict **P5**:
```js
function makeAccount() {
  let balance = 0;
  return {
    deposit: (x) => {
      balance += x;
    },
    read: () => balance,
  };
}
const acct = makeAccount();
acct.deposit(50);
console.log(acct.read());
```
Correct: `50`.
- `0` → `CLO-COPY-PER-FUNCTION`.
Feedback links this to "In the wild" (module pattern, React hooks state). Short "why is it designed this way?" note: private state without classes, and why this matters for interview "implement a counter with private state" questions.

**s10. Blocks get records too, `var` does not** [6 min] Term: block environment.
Predict **P6**:
```js
function f() {
  if (true) {
    var a = 1;
    let b = 2;
  }
  return typeof a + " " + typeof b;
}
console.log(f());
```
Correct: `number undefined`.
- `undefined undefined` → `VAR-BLOCK-SCOPED`.
- `number number` → believes blocks create no record for `let`.
- `ReferenceError` → believes `typeof` on a name that is not in scope throws. Feedback: `typeof` returns `"undefined"` for a name that is not found; the error you may be thinking of is the TDZ from lesson 1.2, which only applies inside the binding's own scope.
Visual: step it; a block record appears at `{` and disappears at `}` (no function points to it), while `a` sits in the function's record. Sidenote: `var` goes to the function's variable environment (spec term, linked), one sentence only.

**s11. Back to the hook** [6 min] No new terms.
Visual: step the P0 trace. One record holds `i` (the record around the loop, since `var` ignores the block). Three function objects appear, all with `[[Environment]]` arrows to the same record. Next-frame prediction **N3** at the last loop check: "What is `i` now?" (2 / 3). Then the calls each look up `i` and find 3.
Mid-lesson explain **E2** (free text): "In one sentence, why does every function return 3?" Rubric: one shared binding, functions hold the record not the value, `i` is 3 when they run.

**s12. Fix 1: `let` and per-iteration records** [6 min] Term: per-iteration environment.
Predict **P7**: the P0 code with `var` changed to `let`. Correct: `[ 0, 1, 2 ]`.
- `[ 3, 3, 3 ]` → `LOOP-LET-SINGLE`.
- `[ 1, 2, 3 ]` → `LOOP-INCREMENT-LEAKS`.
Visual, new part: per-iteration records. Step it: before each increment, JS makes a new record and copies `i` in (spec CreatePerIterationEnvironment, quoted in a sidenote), so the increment happens in the next pass's record. Still side-by-side: the `var` final state (one record, three arrows into it) and the `let` final state (three records, one arrow each).
Escalation Predict **P8**:
```js
const fns = [];
for (let i = 0; i < 3; i++) {
  fns.push(() => i++);
}
console.log(fns[0](), fns[0](), fns[1]());
```
Correct: `0 1 1`.
- `0 0 1` → `CLO-SNAPSHOT`.
- `0 1 2` → `LOOP-LET-SINGLE` (one shared `i`).
Doubt to voice: "Why would the language copy the variable at all?" Answer: so that code like P7 does what most people expect; `let` was designed after years of the `var` loop bug (state as design reason, without dates unless sourced).

**s13. Fix 2: make a new record yourself** [5 min] No new terms.
Worked example with prompt: `makeGetter(j)` returning `() => j`, used as `fns.push(makeGetter(i))` in the `var` loop. Prompt after each line: "Which record does this function point to?" (Atkinson et al. principle prompts.) Then completion problem **C1**: rewrite with an inline function call (`((j) => () => j)(i)`), with the outer call left blank to fill in; tests run in the sandbox.

**s14. In the wild** [5 min]
- The same bug with `setTimeout` in a loop (forward link to 1.7, with the one-line `setTimeout` reminder term).
- Event handlers created in a loop.
- React: a `useEffect` callback reading state from the render it was created in (forward link to 3.2, "stale closures"). One snippet, no React theory.
- Memory: a closure keeps its whole environment record reachable, so a long-lived handler can keep large data alive (forward link to 1.9). Label engine behaviour as such: javascript.info notes V8 can drop unused variables, which shows up in the debugger; the spec model keeps the record.

**s15. Misconceptions** [3 min] Generated from the registry IDs above: belief, one-line counterexample, link to the segment.

**s16. Lab** [spec lab: `once`, `memoize`, `debounce`, `throttle`] Fading:
1. `once`: worked solution with "which record holds `called`?" prompts.
2. `memoize`: completion problem (cache creation given, lookup to write).
3. `debounce`: Parsons problem. Distractor lines: `let timer` placed inside the returned function (`CLO-SHARED-ACROSS-CALLS` inverse: a new binding per call, so `clearTimeout` never clears the old timer), and a missing `clearTimeout`.
4. `throttle`: blank file with tests.
`debounce` and `throttle` need timers. The lab uses a fake clock, and the README says so, since the event loop comes in 1.7.

**s17. Interview lens** Two or three questions as asked in Indian frontend rounds ("What is a closure? Show a real use." "Why does this loop print 3 3 3? Fix it two ways." "Implement `once` / `debounce`."). Rubrics list required points, including the spec-precise definition and both fixes.

**s18. Explain it back** "Explain to a junior, in 3 sentences, what a closure is and why the `var` loop returns 3 three times." Rubric: function object, `[[Environment]]`, environment record, one shared binding vs one per iteration. Grader watches `CLO-SNAPSHOT`, `SCOPE-DYNAMIC`. Repeated next morning without the lesson open.

**s19. Cards** (5)
1. Predict-output, new surface: a `forEach` callback that pushes arrow functions reading an outer `let total` changed after the loop. (Tests `CLO-SNAPSHOT` with new code.)
2. Predict-output, discrimination set with card 3: a `var` loop with functions called later.
3. Predict-output, discrimination set with card 2: the same loop with `let`.
4. Explain ("why" card): "A function is called from inside another function. Whose variables can it see, and what decides that?"
5. Implement: "Write `once(fn)` from memory." Auto-tested.

**Answers checked.** I ran the code from P0 to P8 in Node v26.13.1 as an ES module. Output: `[ 3, 3, 3 ]`, `global`, `7`, `2`, `3 1`, `50`, `number undefined`, `[ 0, 1, 2 ]`, `0 1 1`, matching the correct answers above. The CI trace check (§9.1 of the spec) should repeat this.

### 5.4 Count check against the checklist

Predicts and next-frame predictions: P0 to P8 plus P3b (10) and N1 to N3 (3), so 13 interactions in 75 minutes, plus E1, E2 and C1. New terms per segment: at most three (s02 has three). Every misconception ID is exposed by at least one Predict. The visual gains parts in s02 (record, binding), s03 (outer arrow), s05 (stack region, function object, `[[Environment]]` arrow), s10 (block record), s12 (per-iteration records), each with a still frame first.

---

## 6. Where the spec conflicts with the evidence, and what to change

| # | Spec section | What it says | What the evidence says | Recommended change |
|---|---|---|---|---|
| 1 | §5 items 2 and 3 | Build the mental model, then 2 to 4 checkpoint Predicts. | Interaction every ~60 words in the most interactive explainers (§3.1). Segmenting *d* = 0.98 and pre-training *d* = 0.85 (§2.9). Visualization helps mainly when learners respond (§2.10, §2.11). | Merge "mental model" and "checkpoints" into one segment sequence. Require 8 to 12 Predicts or next-frame predictions per 60 to 90 minutes and at most 250 words without an interaction. |
| 2 | §5, §4.3 | No vocabulary step. Components list has no glossary element. | Pre-training on names of components (§2.9). User directive: no term before it is defined. | Add a "vocabulary" field to frontmatter (or outline), a `<Term>` component, a site glossary, and a CI lint for first-use order. |
| 3 | §5 item 4, §8.1 | "Misconceptions" is a short prose list at the end; the grader outputs free-form `misconceptions[]`. | Distractors work when plausible and followed by feedback (§2.16). No JS catalog exists (§2.13). | Add a misconception registry (`content/misconceptions/*.yaml`) with IDs. Predict options, feedback, cards and the grader all reference IDs. Keep the end-of-lesson section, generated from the registry. |
| 4 | §5 item 1, §9.4 | First element is a `<Predict>` with "no preamble". | Agrees with Abramov's and Comeau's openings and §2.4. Conflicts with pre-training only if the hook needs new terms. | Keep. Add the rule: the hook must be answerable with no new terms, and its real output is shown immediately, with the explanation deferred. |
| 5 | §1.1, §5 | Predict → Run → Explain → Retrieve; no confidence. | Confident errors are corrected best and show firmly held beliefs (§2.4). | Add a confidence choice to `<Predict>` and log it with the misconception ID. |
| 6 | §4.4 | Manual stepping default; autoplay opt-in; animate state changes at 150 to 250 ms. | Learner pacing is supported by Mayer and Sweller but contested by Berney & Bétrancourt (§2.10). Animation adds little for abstract diagrams; static pictures beat animation for spatial arrangement. | Keep manual stepping. Add: next-frame predictions inside traces, a ghost of the previous state, and still side-by-side comparisons for structure questions. Log autoplay use to test the pacing question on real data. |
| 7 | §6.2 (`<CallStack>` + `<EnvChain>`) | Not specified how they relate visually. | Drawing environments as "the frame below" leads to dynamic-scope and "frame dies" errors (§2.12). | Rendering rule: stack and environment records in separate regions; outer arrows follow `[[OuterEnv]]` and `[[Environment]]`, never stack order. |
| 8 | §6.7 | Review sessions interleave topics. | Interleaving helps for confusable categories and can hurt for words and expository text (§2.3). | Interleave by discrimination set (look-alike concepts), not randomly. Tag cards with a `contrastsWith` field. |
| 9 | §5 item 9 | 3 to 6 cards, any form. | Transfer is best across formats and with elaborated retrieval, and weak without them (§2.1). | Keep the count. Require mixed formats, new surface code, and at least one "why" card. |
| 10 | §7 schedule | 20 min review, ~100 min new lesson, 60 min lab, 30 min DSA, 10 min "explain it back" journal at the end of the day. | A 100-minute block of new material in one sitting runs against segmenting (§2.9). Explaining at the end of the same day is closer to restudy than spaced retrieval (§2.1, §2.2). | (a) Split the lesson block in two (about 50 min each) with the lab or DSA between, matching the optional 50/10 timer. (b) Move "explain it back" to the start of the next day, written from memory before the review queue, then compared with the rubric. Keep a 5-minute end-of-day "what confused me" note instead. (c) Keep the lab right after the lesson: it is the fading step. |
| 11 | §7 pacing (~110 h, 40+ lessons) | New lesson every day. | Desirable difficulties turn undesirable when the learner lacks the basis (§2.15). Mastery checks help on local tests (§2.18). | Add a soft mastery signal: a lesson is "done" when its checkpoint items are passed in a later review, and the Today page flags unmastered prerequisites before the next lesson. Do not lock the path. |
| 12 | §6.7 | Daily cap 30 reviews. | Spacing needs old cards to keep returning (§2.2). | Keep the cap, but reserve part of it for cards older than 7 days so new-lesson cards cannot crowd out week-1 material. |
| 13 | §10 `/review`, §1.1 | Retrieve only through cards. | Pan & Rickard: transfer is weak without response congruency and elaborated retrieval (§2.1). | Mix interview-lens questions into review weekly, since they are new-format transfer tests. |
| 14 | §6.3 | Hints then "I give up". | Fading and completion problems beat jumping straight to a blank file (§2.7, §2.17). | Labs start with worked and completion steps (per §4.2 step 7), not only hints. |

No conflict found with: §1.4 (visual only where it carries meaning), §1.5 (checkable claims), §9.5 (precise language), the Feynman grader in §8, or FSRS in §2.

---

## 7. What this means for the people involved

- **For Aditya.** Lessons will ask him to commit before every reveal, roughly once a minute or two, and will tell him which belief caused a wrong answer. Reviews will feel harder than re-reading; that is expected. The next-morning recall replaces the evening journal.
- **For the prose writer (Gemini).** It writes inside a fixed outline: word budgets, allowed terms, given doubts. It does not choose what to teach or invent outputs.
- **For the reviewer models.** They get a 28-item checklist with items that can be partly automated (word gaps, first-use order, CI outputs).
- **For whoever maintains Groundwork.** Two new data structures (vocabulary and misconception registry) and four component changes (`<Term>`, confidence and reason on `<Predict>`, next-frame prompts in visualizers, still comparison view). The registry is also a contribution other teachers can reuse.

---

## 8. Gaps in this research

- **Not opened:** Roediger & Karpicke 2006 (the WUSTL server refused the connection); Bertsch et al. 2007 generation-effect meta-analysis (Springer redirected to a login), so I give no generation-effect size; Brod, Hasselhorn & Bunge 2018 (I relied on Brod's 2021 review of it); Sorva 2013 TOCE paper and Chi et al. 1989 full text (HTTP 403 and a bot check; I used Sorva's thesis and the SERC abstract); Ericson, Margulieux & Rick 2017 (cited through the 2022 review); the full Kulik et al. 1990 PDF (the server certificate failed; I used the ERIC abstract and a secondary review for the numbers); the full Berney & Bétrancourt journal article (used the authors' EARLI summary); White & Gunstone's book (offline).
- **Not measured:** Josh Comeau's prose gaps, because his page is not split into plain paragraphs; I report his order of moves only.
- **Unverified registry entries:** `CLO-RERUN-OUTER`, `CLO-SHARED-ACROSS-CALLS`, `CLO-COPY-PER-FUNCTION` and `SCOPE-NO-WALK` are my inferences, not catalogued findings. They should be confirmed or dropped from Aditya's logged answers.
- **Not checked:** whether ts-fsrs exposes FSRS-6 or FSRS-7 at build time; the spec says to check versions with `npm view`.
- **No Groundwork-specific test.** None of these findings was tested on Groundwork itself. The cheapest check is to log Predict accuracy, confidence and misconception IDs from day 1 and look at them after week 1.
