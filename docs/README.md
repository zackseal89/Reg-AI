# Documentation Framework

RegWatch's documentation is split by **when in the lifecycle of an idea it's written**, not by topic. Each type has a different shelf life and a different reader. Putting something in the wrong place is the main way docs rot — a decision buried in a spec never gets read again once the feature ships; a troubleshooting note buried in a PR description is unfindable six months later.

## The five doc types

| Type | Question it answers | Written | Lives in |
|---|---|---|---|
| **README.md** | "What is this and how do I run it?" | Once, updated rarely | repo root |
| **CLAUDE.md** | "What do I need to know before touching this code?" | Continuously, kept lean | repo root |
| **Spec** | "What are we about to build, and why?" | Before building a feature | `specs/` |
| **Decision (ADR)** | "Why did we build it *this* way, in hindsight?" | Once a decision is settled | `docs/decisions/` |
| **Runbook** | "It's broken / confusing — how do I fix or verify it?" | When you hit and solve a real problem | `docs/runbooks/` |

## Decision tree: where does this go?

```
Is it a fact every session needs (build command, RLS rule, gotcha)?
  → CLAUDE.md. Keep it index-sized — one line + a pointer if it's deep.

Are you proposing work that hasn't happened yet?
  → specs/NNN-short-name.md (see specs/phase-a-gemini-migration.md for the shape)

Did a decision already get made — in a spec, in a PR, in conversation —
and would someone reasonably ask "wait, why did we do it this way"
six months from now?
  → docs/decisions/NNNN-short-name.md (ADR)

Did something break, confuse someone, or take real effort to diagnose,
and is it likely to happen again?
  → docs/runbooks/short-name.md

Is it end-user-facing (client, lawyer, or admin using the product,
not a developer)?
  → In-app Support/FAQ pages (app/*/support/page.tsx), not this docs/ tree.
```

If you're unsure between a spec and an ADR: specs are written *before* code exists and describe intent; ADRs are written *after* code exists and describe what actually happened and why. A spec that ships often deserves a short ADR afterward if the reasoning is non-obvious — the spec stays as historical record of the plan, the ADR is the durable "why" future readers will actually search for.

## Format conventions

**ADRs** (`docs/decisions/`):
- Filename: `NNNN-short-kebab-title.md`, numbered sequentially, never renumbered or deleted — a superseded decision gets `status: superseded` and a pointer to the one that replaced it, not deletion.
- Frontmatter: `status` (`proposed` | `accepted` | `superseded`), `date`.
- Body: Context → Decision → Consequences. See `docs/decisions/TEMPLATE.md`.
- One decision per file. If a spec produced three real decisions, write three ADRs, not one.

**Runbooks** (`docs/runbooks/`):
- Filename: `verb-first-short-name.md` (e.g. `debugging-failed-briefing-emails.md`), no numbering — they're referenced by name, not sequence.
- Frontmatter: `last_verified` (date), `applies_to` (component/area).
- Body: Symptom → Root cause → Fix → How to confirm it's fixed. See `docs/runbooks/TEMPLATE.md`.
- Write the symptom exactly as it appeared (error text, log line) — that's what someone will search for.

## Update triggers

- **CLAUDE.md**: update in the same PR that changes the architecture, adds an env var, or introduces a gotcha. If CLAUDE.md and the code disagree, the code wins and CLAUDE.md is stale — fix it.
- **specs/**: written before implementation starts; not updated afterward — if the plan changed mid-build, that divergence is exactly what an ADR should capture.
- **docs/decisions/**: append-only. Never edit a shipped ADR's Decision section; add a new ADR that supersedes it.
- **docs/runbooks/**: update `last_verified` whenever you re-confirm the fix still applies; add a new "Symptom" section to an existing runbook rather than creating a near-duplicate file if the root cause is the same.

## Known gap (not fixed as part of this framework)

`CLAUDE.md` and `AGENTS.md` currently duplicate almost all of their content. That's a maintenance risk — the two will drift. Recommend picking one as canonical and turning the other into a one-line pointer, but that's a deliberate decision for whoever owns this repo to make, not something to silently merge.
