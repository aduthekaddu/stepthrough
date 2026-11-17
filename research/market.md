# Market check for the Groundwork curriculum

Research date: 2026-11-15. Scope: spec §0 market claims, Indian SDE-1 and frontend interview loops, India "full-stack TypeScript + AI" job descriptions, and a comparison with the 30-day spine in spec §7.

## How to read this file

- Every claim names the URL I opened and the date the page gives. "No date shown" means the page shows none.
- "Opened" means I fetched the page this session. A few pages were blocked (LeetCode Discuss, Medium, Glassdoor, the Naukri blog, Business Insider, and one Interview Query guide). Where I only saw a search-result snippet, I say "snippet only" and keep it out of every count.
- All counts are counts of the posts or job descriptions I read. They are not market statistics. The samples are small (9 interview posts, 7 job descriptions).
- Most interview-format sources are prep companies or candidate blogs, not company statements. I flag the weak ones.

## 1. Verdicts on the spec §0 claims

| # | Claim in §0 | Verdict | Evidence |
|---|---|---|---|
| 1 | "AI skills now appear in roughly 40 to 50% of software job postings." | Partly confirmed. US tech-postings data only, and recent numbers sit above the range. No India figure found. | See 1.1 |
| 2 | "General SWE demand has split: AI-capable profiles rewarded, plain CRUD squeezed." | Partly confirmed (growth is concentrated in AI and senior roles). The "CRUD squeezed" part is not measured anywhere I found. | See 1.2 |
| 3 | "Listing ChatGPT, Copilot, LangChain no longer differentiates; built-and-shipped AI features do." | Not found as data. Only opinion and one anecdote support it. | See 1.3 |
| 4 | "Meta replaced one onsite coding round with a 60-minute AI-assisted round." | Confirmed, with nuance. It began as a pilot in October 2025. Meta's own quoted wording says "pilot". | See 1.4 |
| 5 | "Google added a code-comprehension round, reading and modifying an existing codebase with AI." | Partly confirmed. It is a pilot for junior and mid-level engineers on select US teams, reported from internal documents. Sources disagree on whether it replaces a round. Nothing found for India. | See 1.5 |
| 6 | "Candidates are graded on how they direct the AI and verify its output." | Confirmed by prep-site reporting for both Meta and Google. No official rubric is public. | See 1.4, 1.5 |
| 7 | "DSA rounds without AI still exist." | Confirmed. | See 1.4, section 2 |
| 8 | "Indian product companies lean heavily on JS deep-dives, polyfills and machine-coding (UI LLD) rounds for frontend and full-stack roles." | Confirmed for frontend roles. Partly wrong for full-stack or backend-leaning SDE roles, where machine coding is backend object-oriented LLD, not UI. | See section 2 |
| 9 | "System design follows the usual structure, but LLM/RAG prompts are now common." | Not found for Indian SDE-1 loops (0 of 9 posts). Globally, prep blogs claim it with no data. | See 1.6 |

### 1.1 Share of postings that mention AI skills

- CompTIA, October 2026 data, as reported by Metro Atlanta CEO on 2026-11-09: "Active job postings associated with AI skills reached 366,322" and "Active job postings totaled 629,876". https://metroatlantaceo.com/news/2026/11/tech-employment-gains-momentum-october-comptia-analysis-finds/ . My own division gives 58%. CompTIA did not state that percentage in the text I read. These are US tech postings, not software-only postings.
- Dice, reported by CIO Dive on 2026-07-09: the share of US tech postings "highlighting at least one AI skill" went "from 15% in January 2024 to 73% in May 2026", from 7 million postings. The article does not define what counts as an AI skill. https://www.ciodive.com/news/dice-report-tech-hiring-AI/824893/
- CompTIA "State of the Tech Workforce 2026", PR Newswire, 2026-03-24: more than 275,000 active postings sought AI skills in January 2026. No share is stated. https://www.prnewswire.com/news-releases/key-employment-metrics-market-insights-and-the-impact-of-ai-revealed-in-comptia-state-of-tech-workforce-2026-report-302722946.html
- Final Round AI (no date shown) quotes "41% of all active technology job postings in the US were either for specific AI positions or required some level of AI skills", next to a CompTIA "AI Hiring Intent Index" chart, apparently for November 2025. https://www.finalroundai.com/blog/tech-jobs-ai-skills
- Indeed Hiring Lab, 2026-07-08, by Guillermo Gallacher, gives no share of postings. It says 37% of the May 2025 to May 2026 increase in US software development postings "is due to jobs that mention AI in their title". https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/ . CNBC repeats it on 2026-10-11. https://www.cnbc.com/2026/10/11/ai-software-developer-jobs.html
- India: not found. The Naukri JobSpeak blog returned 403, and the Info Edge PDF had no readable text layer.

Conclusion. "40 to 50%" matched late 2025. Late-2026 US measures run from about 58% (CompTIA counts) to 73% (Dice). The definitions differ and are loose. A posting that says "familiar with AI tools" counts. No India share was found. Suggested rewrite: "In US tech postings, AI-skill mentions rose from about 41% (CompTIA, Nov 2025) to about 58% (CompTIA counts, Oct 2026); India has no equivalent public figure."

### 1.2 Demand split

- Indeed Hiring Lab, 2026-07-08: "71% of the increase in software development job postings between May 2025 and May 2026 is from senior roles", and 37% of the increase came from AI-titled jobs. US data. (URL above.)
- Naukri JobSpeak October 2026, as reported by Remunance (no publish date shown, covers October 2026): index 2,836, up 14% year on year. IT and software services hiring rose 5%. AI and ML roles in IT rose 32%. Fresher hiring rose 15%. https://remunance.com/industry-news/naukri-jobspeak-october-2026-white-collar-hiring/
- The Pragmatic Engineer, 2026-10-06, Gergely Orosz: "There seems to be less demand for iOS, Android, and frontend specializations, and more for 'generic' software engineers." It also says "AI 'fluency' and 'positivity' matter in recruitment at startups", and quotes a Series D director of engineering: "AI positivity was something we started to screen for in our hiring process." https://newsletter.pragmaticengineer.com/p/the-state-of-the-tech-industry-in

### 1.3 "Listing tools no longer differentiates"

- gitgood.dev, 2026-07-02, Patrick Wilson: argues that a working LLM demo is not enough and a project needs metrics, an eval suite, cost and latency numbers, and failure modes. Its only hiring-manager evidence is one unnamed manager quoted second-hand, and the site sells portfolio reviews. https://gitgood.dev/blog/ai-side-project-that-gets-you-hired-2026
- No survey or dataset found. Treat the claim as reasonable opinion, not fact.

### 1.4 Meta's AI-enabled coding round

- CoderPad, 2025-10-30 (modified 2026-04-15): describes Meta's "pilot program for AI-enabled coding interviews" and quotes the Meta Recruiting Team: "It's not 'cheating,' it's how the job is evolving." It gives no length or rubric. https://coderpad.io/blog/hiring-developers/ai-in-the-interview-is-not-cheating-it-is-the-job-according-to-meta/
- interviewing.io (no date shown, author Githire B. Wahome): "In October 2025, Meta began piloting an AI-enabled coding interview." It "replaces one of the coding interviews in the onsite". 60 minutes in CoderPad. A multi-file project instead of two algorithm problems. https://interviewing.io/blog/how-to-use-ai-in-meta-s-ai-assisted-coding-interview-with-real-prompts-and-examples
- Hello Interview (no date shown): "one of those coding rounds is the AI-enabled format", for SWE and EM roles up to E7 and M2. "You'll still have a traditional coding interview alongside it." It runs 60 minutes in phases: fix a bug, implement a feature, then optimize for larger inputs. It is graded on problem solving, code quality, verification and communication: "Should use AI, but need to show you understand the code." It says the format "is still evolving". https://www.hellointerview.com/blog/meta-ai-enabled-coding

### 1.5 Google's code-comprehension round

- University of Miami career blog, reposting Exponent, 2026-05-14: cites "an internal document" reported by Business Insider. The pilot "targets junior and mid-level roles on select US teams". Candidates read, debug and optimize an existing codebase with Gemini. Interviewers evaluate "AI fluency, including prompt engineering, output validation, and debugging skills." It does not say a round is replaced. https://customcareer.miami.edu/blog/2026/05/14/googles-ai-assisted-coding-interview-2026-guide/
- levelop.dev, 2026-05-20: says Google "added a round" (60 minutes, CoderPad, Gemini, multi-file codebase). It links no primary source. https://levelop.dev/blog/google-coding-interviews-in-2026-what-changed-and-what-didnt
- ByteHerald, 2026-10-20, citing Business Insider via dnyuz: "The October documents show the formats have been rolled out more broadly across the company, though a spokesperson said they are still considered pilot-phase." It does not mention India. https://www.byteherald.com/2026/10/google-changed-coding-interview-ai-is.html
- I could not open Business Insider itself (blocked to this tool).

### 1.6 LLM/RAG prompts in system design

- Design Gurus Substack, 2026-05-04, Arslan Ahmad: "AI-aware designs are now table stakes." It cites no data. https://designgurus.substack.com/p/system-design-interviews-changed
- DEV Community, landedjobs, "Posted on Nov 3" (year not shown, footer 2026): lists 10 AI system-design prompts "from 2026 interview loops" (Design ChatGPT, Design a RAG system, LLM inference at scale, an agent, and others). It gives no counts. https://dev.to/landedjobs/the-10-ai-system-design-questions-that-actually-come-up-and-one-way-to-answer-all-of-them-2m77
- Indian SDE-1 posts I opened (section 2): 0 of 9 had an LLM or RAG system-design prompt. The design prompts I did see were Google Calendar (Flipkart frontend), a GTT order service with Kafka and Redis (Groww), a voice-transcription pipeline (District/Zomato), and "scale a website" (Razorpay frontend).

### 1.7 Do Indian product companies run AI-assisted rounds?

- OwnYourCareer, 2026-06-15: says AI tools are "mostly banned" in coding rounds at Razorpay, PhonePe, CRED, Postman and Atlassian India, and predicts change in 2027. It links no evidence for the India claims. Weak source. https://www.ownyourcareer.in/blog/faang-ai-assisted-coding-interview-2026-india-prep-playbook
- Sarvam AI interview notes on GitHub ("Last reviewed: November 2026", unofficial, built from Grapevine and Blind reports): AI tools are allowed in a time-boxed build round, and one report allows LLM use in a founder round. https://github.com/ombharatiya/AI-Engineer-Interview-Questions/blob/main/14-company-interview-questions/sarvam-ai.md
- Snippet only, not opened: an Interview Query Razorpay guide describing a 60-minute "AI-assisted coding interview" (the page returned 429 twice), and a LeetCode CRED SDE-2 post from Dec 2025 saying AI use was allowed and that the screening asked how the candidate uses AI tools.
- In the 9 posts I opened, 0 allowed AI tools in a round.

Conclusion. For Indian product companies in late 2026, the AI-assisted round is the exception. AI-first startups are the place it shows up. The skill still matters, because job descriptions now ask for daily AI-tool use and review of AI output (section 3).

## 2. Indian SDE-1 and frontend loops (late 2025 to 2026)

### 2.1 Posts I opened

| # | Company, role | Date | Rounds and topics | Source |
|---|---|---|---|---|
| P1 | Flipkart, UI Engineer 2 (frontend) | 2026-01-19 | (1) Machine coding: React app from scratch (Feedback Review System). (2) JS/React: promises, polyfills ("often asked"), event loop, IntersectionObserver, Core Web Vitals, web security, debounce/throttle, box model, Redux-like library, auto-retry promise, event emitter. (3) DSA, 2 questions. (4) Frontend system design: Google Calendar. (5) Hiring manager. | https://devtools.tech/blog/flipkart-frontend-interview-experience-or-ui-engineer-2---rid---2GUVrdNW6ka6fdh0xcbU |
| P2 | Razorpay, frontend (level not stated) | 2026-05-11 | (0) HR. (1) JS fundamentals, 60 min: output questions (`typeof null`, `var` vs `let` with `setTimeout`), closures, write debounce, path string to nested object. (2) React machine coding, 90 min: pagination component, then `useMemo`/`useCallback`, virtual DOM, keys. (3) Web fundamentals and design: URL to page, storage vs cookies, CORS, React performance, scaling. (4) Hiring manager. No DSA. | https://mocklingo.com/blogs/i-interviewed-at-razorpay-for-frontend |
| P3 | Razorpay, SDE 1 frontend | 2025-06-20 | (1) Machine coding: carousel. Rejected for unfinished animations and UI polish. (2) Web fundamentals and JS (no detail). (3) HR. | https://interviewexperiences.in/experience/razorpay/razorpay-sde-1-frontend-engineer |
| P4 | Uber, SDE-2 frontend | 2025-06-13 | (1) `memoize()` with nested arguments (trie inside a Map). (2) Async scheduler with a concurrency limit (microtasks vs macrotasks, backpressure). (3) Task runner with dependencies; the interviewer expected a topological sort. | https://interviewexperiences.in/experience/uber/uber-sde-2-frontend-engineer-interview-experience |
| P5 | Atlassian, frontend P40, Bengaluru | 2025-10-26 | 6 rounds. Karat screen in plain JS ("React is not allowed"). Focus on React and JS, no LeetCode-style DSA. Other rounds not detailed. | https://www.jointaro.com/interviews/companies/atlassian/experiences/frontend-developer-bengaluru-karnataka-october-26-2025-accepted-offer-positive-5dc0fb17/ |
| P6 | Groww, SDE-2 with 1.5 years of experience (backend) | 2026-09-25 | (1) Machine coding, 1 h: brokerage calculator with trade types, plans, charges and validation. (2) System design: GTT order service with Kafka, Redis, outbox pattern, Redis Streams with Lua. Rejected. | https://interviewexperiences.in/experience/groww/groww-sde-2-interview-experience-15-yoe-september-2026 |
| P7 | District (Zomato), SDE-1 | 2026-07-31 | (1) Internship deep dive plus LLD of rate limiters (fixed window, sliding window, leaky bucket). (2) HLD: voice-transcription platform at 100K recordings a day (pre-signed S3 uploads, job queues, retries). (3) Hiring manager. | https://daily.dev/posts/district-zomato-sde-1-interview-experience-off-campus-56-lpa-ctc--icujmwe8t |
| P8 | Meesho, SDE-1 (open campus) | updated 2025-07-23 | OA with 3 DSA problems. DSA interview (bipartite graph). Machine coding, 60 min, LLD: car pooling system, judged on class design and clean runnable code. HR round with OS, networks and SQL. | https://www.geeksforgeeks.org/interview-experiences/meesho-sde-1-open-campus-interview-experience-2025/ |
| P9 | Groww, SDE intern (AI/LLM role) | 2025-10-29 | Two DSA problems. A DSA plus AI round with a deep dive on the candidate's GenAI projects. Rejected because AI/ML knowledge "wasn't as strong as perhaps expected". | https://interviewexperiences.in/experience/groww/groww-sde-intern-interview-experience-aillm-role-6-month |

Supporting pages, not counted as posts:
- Atlassian India guide, intervue.io, 2026-11-06: P30 is "Software Engineer, 1 to 4 years". The P30 loop is a screen (online test or Karat), coding, code design ("decides most P30 outcomes"), values and manager. Frontend roles get a frontend system design round. https://www.intervue.io/blog/atlassian-interview-experience-india
- interviewexperiences.in company listings (opened). Flipkart SDE-1 entries from October 2025 are DSA problems. https://interviewexperiences.in/company/flipkart . PhonePe SDE-1 (2025-07-20) had a machine-coding round on a fitness-class booking system. https://interviewexperiences.in/company/phonepe . Razorpay's 2025 to 2026 backend entries are mostly LLD and machine coding (ATM, Git-like version control, in-memory search engine, in-memory SQL database). https://interviewexperiences.in/company/razorpay
- AceRound, 2026-09-24, describes the Razorpay, PhonePe, Swiggy and CRED loops. It names no sources, and the site sells an "undetectable" interview copilot, so I give it no weight. https://www.aceround.app/blog/razorpay-phonepe-swiggy-cred-interview-india/
- Snippet only, not counted: Swiggy SDE-1 frontend on LeetCode (Dec 2024: HackerRank test with 2 DSA, 2 JS and a React file explorer). Zomato SDE-1 UI on LeetCode (about mid-2026: event loop, reconciliation, browser internals, rendering performance). A Glassdoor Flipkart UI review (Feb 2026: machine coding plus event loop, promises and closures, then a hiring-manager round "more like discussion of ai usage in my daily life").

### 2.2 Recurring topics (count out of the 9 opened posts; 5 are frontend: P1 to P5)

| Topic | Count | Where |
|---|---|---|
| Machine coding or LLD build round | 6 of 9 | UI: P1, P2, P3. Backend object-oriented LLD: P6, P7, P8 |
| Hiring manager, values, or project deep dive | 6 of 9 | P1, P2, P3 (HR), P7, P9, P5 (per the Atlassian guide) |
| JS internals and async utilities (event loop, closures, promises, polyfill-style utilities) | 4 of 9 (4 of 5 frontend) | P1, P2, P4, P5 |
| System design (HLD) | 4 of 9 | P1 (frontend SD), P2 (light), P6, P7 |
| LeetCode-style DSA | 3 of 9 | P1, P8, P9. Explicitly no DSA: P2, P5 |
| Web fundamentals (CORS, storage, URL to page, Core Web Vitals, security, box model) | 3 of 9 | P1, P2, P3 |
| React internals and performance (VDOM, keys, memo, state library) | 2 of 9 | P1, P2 |
| Backend infra in design (Kafka/queues, Redis, outbox, rate limiters, retries) | 2 of 9 | P6, P7 |
| Debounce or throttle | 2 of 9 | P1, P2 |
| AI knowledge asked | 1 of 9 | P9 (an AI-specific role) |
| AI tools allowed in a round | 0 of 9 | none |
| LLM or RAG system-design prompt | 0 of 9 | none |

Patterns worth noting:
- The frontend loop is consistent: JS deep-dive, React machine coding (60 to 90 min), web fundamentals, sometimes frontend system design, then a hiring manager. DSA depends on the company.
- Backend-leaning SDE-1 and SDE-2 loops use machine coding too, but it is object-oriented LLD (calculator, car pooling, booking, rate limiter) graded on class design and clean runnable code. This is different from UI machine coding, and the curriculum does not teach it.
- One rejection (P3) came from unfinished UI polish, not from logic. Timed practice and CSS fluency matter.
- Few Indian product companies hire under a "full-stack" title. Their SDE-1 roles are either "UI/Frontend Engineer" or "SDE (backend)". "Full-stack AI" titles cluster at startups (section 3).

## 3. India "full-stack TypeScript + AI" job descriptions

### 3.1 Job descriptions I opened

| # | Company, title | Date | Experience, pay | AI asks | Source |
|---|---|---|---|---|---|
| J1 | appscrip, Full-Stack Engineer (AI-Native), Bengaluru | 2026-10-02 | 2 to 4 y, 4 to 6 LPA | Daily AI coding tool use; "reviewing AI output before committing"; context windows, hallucinations, token cost; streaming chat UIs; tool-call status displays; retry states for non-deterministic output; LLM APIs with SSE/WebSockets, tool calling, rate limits, cost and latency. Also TS, React, Next.js App Router/RSC, NestJS, Postgres, auth, testing, OWASP. Preferred: "demoable shipped AI features". No RAG, evals or MCP. | https://jobfound.org/job/appscrip-is-hiring-for-full-stack-engineer-ai-native-bengaluru-india-2-october-2026 |
| J2 | THG Ingenuity, Full Stack Engineer, Pune | first seen 2026-10-24 | not stated | Python and TypeScript; tool calling, structured output, streaming, RAG; "evaluation datasets and a CI regression gate"; observability. | https://jobpilot.suxrobgm.net/jobs/full-stack-engineer-at-thg-ingenuity-2e114a |
| J3 | Alchemyst AI, Full Stack AI Engineer Intern | reposted about Oct 2026 (exact date not shown) | 0 to 1 y, 1.8 to 6 L | Next.js, React, strict TypeScript, WebSockets, streaming UI, RAG, MongoDB, Redis, Python. | https://wellfound.com/jobs/4126022-full-stack-ai-engineer-intern |
| J4 | Razorpay, Full-Stack Builder, Bengaluru | 2026-11-03 | 2 to 4 y in the header, 3 to 6 y in the text; 10 to 25 LPA | Claude Code or Cursor as the default environment; orchestrating agents; building with skills and MCPs; reading code; fixing CI/CD; product sense. | https://jobfound.org/job/razorpay-is-hiring-for-full-stack-builder-bengaluru-karnataka-india-india-3-november-2026 |
| J5 | Innoveric, Full-Stack AI Engineer, Chennai | 2026-10-21 | fresher, 3 to 5 LPA | LangGraph, Google ADK, CrewAI or Vercel AI SDK; tool calling; memory; MCP; A2A; Claude Code or Codex; agent evaluation and observability. Python, TS, FastAPI, Next.js, Supabase, OAuth, Docker, CI. | https://jobfound.org/job/innoveric-is-hiring-for-full-stack-ai-engineer-chennai-tamil-nadu-india-india-21-october-2026 |
| J6 | Troopd, Full Stack Developer (AI/LLM Applications), Bengaluru | "2 months ago" | 3 to 4 y | Production LLM integration is mandatory, and personal projects "don't qualify"; prompt design, structured outputs, retrieval, evaluation, guardrails, human review. Preferred: vector DBs, RAG, LLM observability. TS, React/Next, Node/Express, SQL or Mongo, testing, security. | https://bebee.com/in/jobs/full-stack-developer-ai-llm-applications-troopd-bengaluru--techmap_in_4466838207 |
| J7 | Sarvam AI, Full Stack AI Engineer, Bengaluru | 2026-05-20 (closed) | 1 to 2 y, "not for fresh graduates" | Python or Node backend; model integrations; Docker, Kubernetes; prototype to production; bonus GPU infra. | https://jobs.khoslaventures.com/companies/sarvam-ai-2/jobs/79492493-engineering-full-stack-ai-engineer |

### 3.2 What recurs (count out of 7)

| Ask | Count |
|---|---|
| TypeScript | 5 (J1, J2, J3, J5, J6) |
| Python, required or alongside | 4 (J2, J3, J5, J7) |
| React or Next.js | 4 (J1, J3, J5, J6) |
| Streaming to the UI (SSE/WebSockets) | 3 (J1, J2, J3) |
| Tool calling | 3 (J1, J2, J5) |
| RAG or retrieval | 3 (J2, J3, J6) |
| Evals (datasets, CI gate, agent evaluation) | 3 (J2, J5, J6) |
| Observability (traces, logging for LLM calls) | 3 (J2, J5, J6) |
| Daily AI coding tools and reviewing AI output | 3 (J1, J4, J5) |
| Postgres or SQL | 3 (J1, J5, J6) |
| Testing | 3 (J1, J5, J6) |
| Docker or CI/CD | 3 (J4, J5, J7) |
| Structured output | 2 (J2, J6) |
| MCP | 2 (J4, J5) |
| Agent orchestration | 2 (J4, J5) |
| Vector DB named | 1 (J6, preferred) |
| A named framework (LangGraph, Vercel AI SDK, CrewAI) | 1 (J5) |
| Guardrails and human review | 1 (J6) |
| Cost, latency, rate limits | 1 (J1) |

Snippet-only listings, not counted: Evnek "Full Stack Engineer - LLM & RAG" (LangChain, LangGraph, LlamaIndex; 4 to 10 y), IH (LangChain, LangGraph), Razorpay "AI Agents Engineer" (tool calling, structured outputs, evaluation; 3 to 6 y), and Razorpay "Forward Deployed Engineer, Agent Studio" (Python or TypeScript; tool calling, RAG, evals). The pages either returned 403 or 410, or I did not open them.

Readings:
- The common core is: stream an LLM response into a React UI, call tools, return structured output, retrieve from your own data, and measure it with evals and traces. Groundwork §7 Week 4 already covers most of this.
- Python shows up in 4 of 7. The spec's decision (§15) to skip Python is the main point these job descriptions push against.
- Named frameworks are rare in this sample (1 of 7). Building from raw API calls is fine, as long as the learner can say what LangGraph or the Vercel AI SDK would replace.
- The "full-stack AI" titles that accept 0 to 1 years pay 1.8 to 6 LPA (J1, J3, J5). The better-paid listing (J4, Razorpay) wants 2 or more years and product ownership. J6 explicitly rejects personal projects as proof of production LLM experience.

## 4. Comparison with the §7 curriculum

### 4.1 High-value topics that are missing

1. **Backend machine coding (object-oriented LLD) in TypeScript.** 3 of 9 posts (P6, P7, P8) had it, plus the PhonePe and Razorpay listings. The spec has no lesson on classes and interfaces, SOLID, the strategy and observer patterns, in-memory repositories, or timed builds such as a parking lot, an expense splitter, a booking system, an LRU/LFU cache or a brokerage calculator. Recommendation: add one lesson and a 90-minute timed lab series (about 6 h) in Week 3.
2. **Volume of timed UI machine coding, with CSS.** UI machine coding was in 3 of 5 frontend posts. P3 was rejected for polish, P1 asked about the box model, and a Swiggy snippet included a "match this UI" CSS task. §7 has three machine-coding builds in 1.11 and no CSS layout lesson. Recommendation: add a short CSS layout lesson (box model, flexbox, grid, positioning, stacking) and grow the lab to about 8 timed builds drawn from the posts: file explorer, carousel, pagination, nested comments or JSON viewer, autocomplete, progress bars, a calendar day view, and a star rating or accordion with keyboard a11y.
3. **More async utility drills.** The posts asked for auto-retry promise, event emitter, async scheduler with a limit, task runner with dependencies (topological sort), memoize with nested arguments, and path-string to nested object. Most fit inside 1.3 and 1.8. Add them as a graded "utility gauntlet".
4. **Frontend system design depth.** It appeared in P1, the Atlassian guide, and an Uber snippet. §7 gives it one lesson (8.6) with no centrepiece. Recommendation: two cases (feed or autocomplete, plus a calendar or chat client), covering component API, state shape, caching, pagination, offline, a11y and performance.
5. **A rehearsed answer to "How do you use AI in your daily work?"** It was asked in a Flipkart hiring-manager round (snippet). J1, J4 and J5 ask for daily AI-tool use, and The Pragmatic Engineer (2026-10-06) reports startups screening for "AI positivity". Add it to the STAR bank with a concrete workflow and a story where the AI was wrong and he caught it.
6. **Python reading literacy.** 4 of 7 job descriptions list it. A 2 to 3 hour "Python for a TypeScript developer" lesson (syntax, async, FastAPI, Pydantic as the Zod equivalent) would cover reading and small edits. This changes a §15 decision, so it is the user's call. I label the recommendation as my judgment, not a finding.
7. **LLM observability and cost tracking.** 3 of 7 ask for observability. §9.5 mentions cost and latency only in passing. Fold in tracing every LLM call (inputs, tokens, latency, cost) and show it on the eval dashboard.
8. **Take-home delivery.** Sarvam uses a time-boxed build. Take-homes are also reported for Groww frontend and CRED, but those are snippet only or from the weak AceRound source. Add a checklist lab: README with trade-offs, tests, a deploy link, and an eval number when AI is involved.

### 4.2 Topics that get more time than their interview value (judgment, from 0-mention counts)

| Lesson | Evidence | Suggestion |
|---|---|---|
| 1.10 Write a 60-line bundler | 0 of 9 posts | Keep CJS vs ESM as concept; drop the bundler lab |
| 2.4 Advanced type-level programming | 0 of 9 posts asked type gymnastics | Cut to one session; keep `infer` and mapped types basics |
| 5.5 Applied crypto, envelope encryption | 0 of 9 posts; resume defence only (DevSecret) | Move into the `/resume` DevSecret page |
| 7.1 Docker internals (namespaces, cgroups) plus AWS core | 0 of 9 posts asked container internals | Keep the Dockerfile and CI lab; cut the internals |
| 5.1 HTTP server on raw `net` | URL-to-page asked once (P2) | Keep the concept; shorten the lab |
| 4.2 1 GB CSV stream lab | 0 of 9 posts | Keep backpressure concept; smaller lab |
| 8.5 Secrets-manager design case | 0 of 9 posts | Keep the payment case (Razorpay, Groww fintech); move secrets to `/resume` |

Freed time, roughly 8 to 10 h by my estimate, covers items 1, 2 and 4 in 4.1.

Topics the evidence supports keeping as they are: 1.2 to 1.8 (JS internals, promises and polyfills), 3.1 and 3.2 (React internals; P1 and P2 asked them), 5.3 (idempotency and webhooks, which suit fintech), 6.5 and 6.6 (Redis, queues and outbox; P6 asked about outbox and Redis Lua almost exactly), 8.3 (rate limiter; P7), and 9.2, 9.3 and 9.5 (streaming, tool calling, RAG and evals, which match J1, J2, J3, J5 and J6).

Keep 10.1, but with a narrower aim. AI-assisted rounds are rare in Indian product loops (0 of 9 posts). The same skill (reading code fast, reviewing AI output) is asked for in job descriptions J1 and J4, and it is the format at Meta, Google and Sarvam.

### 4.3 Can 7 months of experience credibly target these roles?

- Level fit. Atlassian P30 is "1 to 4 years" (intervue.io, 2026-11-06). Groww interviewed a 1.5-year candidate for SDE-2 (P6, rejected). District interviewed an SDE-1 with internship experience (P7). SDE-1, UI Engineer 1 and P30 are realistic targets. Senior "full-stack AI" roles are not.
- Job descriptions. 2 of 7 accept 0 to 1 years (J3, J5), and 1 asks 1 to 2 years (J7, closed). 3 want 2 to 4 years or more (J1, J4, J6). J6 rejects personal projects as production LLM experience.
- Market. Naukri, via Remunance, reports fresher hiring up 15% in October 2026 and AI/ML roles in IT up 32%. The Pragmatic Engineer (2026-10-06) says it is "harder for graduates & interns to get hired" and that frontend specialization demand is dropping.
- Reading (judgment). The credible pitch is "SDE-1 with production experience (AEM at work, paid freelance Next.js), plus one deployed AI feature with real eval numbers". The pitch is not "AI engineer". Counting the freelance work as experience moves him toward the 1 to 2 year band. Apply on two tracks, frontend loops and SDE (backend) loops, because product companies rarely hire SDE-1s under a "full-stack" title.

### 4.4 What makes a portfolio project stand out in 2026

The evidence is thin. No hiring-manager survey was found.
- The Pragmatic Engineer, 2026-10-06: domain depth matters ("Engineers with deep domain knowledge will become more in demand"), and startups screen for AI fluency. (URL above.)
- gitgood.dev, 2026-07-02: publish the metric you optimized, a baseline, eval results, cost and p95 latency, and handled failure modes. Its evidence is one anecdote, and the author has a commercial interest. (URL above.)
- J1 prefers "demoable shipped AI features". J6 discounts projects without production use.

Implication for Groundwork (judgment). The plan in spec §14 already lines up with this: a CI-verified trace format, an eval suite, prompt-injection tests. To beat the "personal project" discount, ship it publicly, get real users (even a few), and publish the eval numbers, cost per grade, and p95 latency in the README.

## 5. Gaps in this research

- LeetCode Discuss, Medium, Glassdoor, the Naukri blog and Business Insider were blocked (403). A curl attempt on LeetCode was denied by the sandbox, and I did not retry it. Most Swiggy, Zomato, PhonePe-frontend and CRED evidence is therefore snippet only.
- No first-hand post opened for Zerodha, Swiggy, Zomato (main app), CRED, PhonePe frontend or an AI-first startup's full loop.
- Interview Query's Razorpay guide returned 429 twice, so the "Razorpay AI-assisted round" claim is unverified.
- The Info Edge JobSpeak PDF had no extractable text, and no PDF tools were installed.
- No India share of postings with AI skills was found.
- Notion memory was not read or written in this research step.
