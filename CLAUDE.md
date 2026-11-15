# Stepthrough: working agreement

- Read GROUNDWORK_BUILD_SPEC.md and docs/architecture.md before any task. The spec is the product intent; DECISIONS.md records where we changed it and why.
- The learner is studying from this site daily. Shipping usable lessons beats building infrastructure.
- Before writing a lesson: read its sources (fetch the MDN/spec/docs page), then write. Never invent APIs or behaviour.
- Every code example must run in CI. Every trace must pass verification. Never mark content `reviewed`; only the learner does that.
- Follow the design system in spec §4 and docs/design.md. No new colours, fonts, gradients, shadows, or emoji.
- Prefer small PRs/commits per lesson or component. Run all quality gates (spec §11) before calling something done.
- Record non-obvious choices in DECISIONS.md (one line each: date, decision, reason).
- When unsure about scope, choose the smaller version and leave a TODO with an issue-style note.
- Personal data (the resume track) never goes into a public branch or repo.
