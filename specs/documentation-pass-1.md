# Spec: Documentation Pass 1

**Status:** Ready for execution
**Executor:** Claude Sonnet 5 (delegated documentation session)
**Author:** Zachary + Claude (Fable 5)
**Date:** 9 July 2026

---

## Objective

Bring RegWatch's documentation to a state where a new developer (or a fresh AI session) can trust every file in the repo's doc tree: no stale facts, no dead links, the key "why" decisions recorded as ADRs, and the known operational traps written up as runbooks.

The **framework already exists** — read `docs/README.md` first and work strictly inside it. Do not invent new doc types, directories, index files, or naming schemes. The directories are the index; do not create a table-of-contents file for `docs/decisions/` or `docs/runbooks/`.

---

## Ground rules (read before any checkpoint)

1. **Verify, never fabricate.** Every factual claim you write must be traceable to code you opened, git history you ran, or an existing doc. These files are read by agents as ground truth — a fabricated detail poisons every future session. If you cannot verify something, either omit it, mark it explicitly (`> Unverified — confirm with Zachary`), or ask.
2. **Documentation files only.** This pass touches `*.md` files (root, `docs/`, `specs/`) and nothing else. If you find a code bug while verifying, note it in your final report — do not fix it.
3. **Git discipline.** The working tree already contains unrelated uncommitted app changes (UI, support pages, fonts). When committing, stage **only** the markdown files you touched — never `git add -A` / `git add -u`. Ask Zachary before the first commit and before any push.
4. **Style.** Follow the two templates (`docs/decisions/TEMPLATE.md`, `docs/runbooks/TEMPLATE.md`) exactly. Complete sentences over fragment bullets. Exact error strings, verbatim, in runbook Symptom sections. Kebab-case filenames. One decision per ADR.
5. **When a task's premise is wrong** (e.g. a file was already fixed, or a claim below doesn't match what you find), skip the task, don't force it, and record the discrepancy in your final report.
6. **Do each checkpoint in order** and stop at the end of each one to report before continuing. That report is short: what you wrote, what you verified it against, anything you couldn't verify.

---

## Checkpoint 0 — Orient (no writing)

Read, in this order:
1. `docs/README.md` — the framework and decision tree
2. `docs/decisions/TEMPLATE.md`, `docs/decisions/0001-gemini-file-search-for-rag.md` — ADR shape and quality bar
3. `docs/runbooks/TEMPLATE.md`, both existing runbooks — runbook shape and quality bar
4. `CLAUDE.md`, `AGENTS.md`, `README.md` — current root docs
5. `specs/phase-a-gemini-migration.md` — the spec format

**Done when:** you can state, without re-reading, where each of these would go: a new env var, a "why did we choose X" question, a recurring error, a proposal for new work, a client-facing how-to. (Answers: CLAUDE.md, ADR, runbook, spec, in-app support page.)

---

## Checkpoint 1 — Fix stale and broken facts in root docs

Pre-verified stale facts (re-confirm each before editing, per ground rule 1):

| Fact | Where | Reality | Fix |
|---|---|---|---|
| Brand fonts "Playfair Display / Inter" | `CLAUDE.md` ~L219, `README.md` ~L172, `AGENTS.md` ~L213 | `app/layout.tsx` loads **Fraunces** (serif display) and **Instrument Sans** (body) | Update all three. Also note the global 1.5 Lucide stroke rule in `app/globals.css` if the Brand section mentions iconography (it currently doesn't — adding one line is fine). |
| `ROADMAP.md` linked in "Further Reading" | `README.md` ~L180 | File does not exist | Remove the link. Do **not** create a ROADMAP.md. |
| `cp .env.example .env.local` in Getting Started | `README.md` ~L89 | `.env.example` does not exist | Create `.env.example` with every key from the Environment Variables table, values empty, one `#` comment per line taken from the existing table. This is the one non-markdown file you may create. |
| `CLAUDE.md` ↔ `AGENTS.md` near-total duplication | both files (~220 lines each) | They will drift (fonts already drifted in both) | Make `CLAUDE.md` canonical. Rewrite `AGENTS.md` as ≤15 lines: one paragraph saying what RegWatch is, then "Read `CLAUDE.md` — it is the single source of truth; this file exists only because some tools look for AGENTS.md by convention." Preserve nothing else in it. |

Also: skim every remaining section of `README.md` and `CLAUDE.md` against the code (`package.json` scripts, `app/` route folders, env table vs `lib/` usage) and fix anything else that's drifted. Known safe claims you don't need to re-derive: the RAG pipeline description, RLS rules, and status flows were verified recently.

**Done when:** no dead relative links in any root `*.md` (check each `](./...)` target exists); fonts match `app/layout.tsx`; `.env.example` exists and lists exactly the keys documented in README's table; `AGENTS.md` is ≤15 lines.

---

## Checkpoint 2 — Backfill ADRs (docs/decisions/0002–0004)

Write three ADRs. For each: `status`, `date` (use `git log` dates where the work is committed; today's date where it isn't), Context → Decision → Consequences, and name the alternatives that lost, when known. Sources listed below are where the "why" lives — open them.

**0002 — Portal shells: one AppShell, navy sectioned sidebar, real-data-only dashboards.**
Sources: commit `ce70feb` (91-file redesign, 7 July 2026), `components/layout/app-shell.tsx`, `sidebar.tsx`, `top-bar.tsx`, the three `app/*/layout.tsx` files.
Key decisions to capture: all three portals share one `AppShell` parameterized by role rather than three shells; sidebar nav routes that have no real feature render a `ComingSoon` stub page instead of dead links; dashboards display **only real database-backed numbers** — the reference design's fictional widgets (compliance score, risk donut, activity chart, system health) were deliberately replaced with real equivalents or dropped, never faked. That last rule was an explicit product decision, not a shortcut.
Status: `accepted`.

**0003 — Typography and iconography: Fraunces + Instrument Sans + uniform 1.5 icon stroke.**
Sources: `app/layout.tsx`, `app/globals.css` (the `svg.lucide` rule and its comment), `components/layout/sidebar.tsx` (pure serif wordmark, pillar icon removed).
Context to capture: swap from Playfair Display/Inter, motivated by studying Harvey AI's design (editorial low-contrast serif ≈ their "Reckless"; Fraunces chosen as closest Google-Fonts match). Alternatives considered and rejected: Newsreader (quieter), Source Serif 4 (sturdier). Icon emphasis now comes from color only, never stroke weight.
Status: **ask Zachary** whether the font direction is final before writing — if confirmed, `accepted`; if he's still deciding, `proposed`. Do not guess.

**0004 — Two separate email pipelines: Supabase Auth mailer for invites, Resend for briefings.**
Sources: `app/admin/lawyers/actions.ts` (`inviteUserByEmail`), `app/lawyer/clients/actions.ts`, `supabase/functions/on_briefing_sent/index.ts`, `docs/runbooks/debugging-failed-briefing-emails.md`.
Key consequence to capture: verifying one pipeline proves nothing about the other — Resend domain verification does not affect invite delivery, and vice versa. This bit us during testing (see the runbook).
Status: `accepted` (it's how the system observably works), but be honest in Context that this may be an emergent state rather than a deliberate choice — say so rather than inventing a rationale.

**Done when:** three files exist, numbered 0002–0004, each passing the template shape; every claim in them traceable to a named file or commit; nothing in a Decision section you couldn't verify.

---

## Checkpoint 3 — New runbooks (three)

Follow the runbook template. `last_verified` = the date you actually ran/traced the steps. Verify every command against `package.json` / the actual script — do not write commands from memory.

**`deploying-edge-functions.md`**
Sources: `CLAUDE.md` Commands section, `supabase/functions/on_briefing_sent/index.ts` (env vars it reads, the `x-webhook-secret` header check), commit `e76c491` (Vault secret).
Cover: the two `supabase functions deploy` commands; that the webhook is configured in the Supabase dashboard (not in a migration) on `briefings` UPDATE; the shared secret lives in Supabase Vault and is sent as `x-webhook-secret`; that `tsconfig.json` excludes `supabase/functions/**` because they run on Deno (so `tsc --noEmit` passing tells you nothing about them).

**`seeding-test-users.md`**
Source: `scripts/seed-test-users.ts` — read the whole file.
Cover: required env vars, the exact accounts/passwords it creates (they're already printed in the script's own summary — quote that), what's idempotent vs not, the Gemini store creation step being non-fatal if `GEMINI_API_KEY` is absent.

**`verifying-document-indexing.md`**
Sources: `lib/gemini.ts` (especially the gotcha at ~L71–79), `app/lawyer/documents/actions.ts` (`publishDocumentAction`).
Cover: the publish → index flow; the critical gotcha that `documents.gemini_file_id` must be the **store document name** (`fileSearchStores/{store}/documents/{doc}`) not the Files API name (`files/xxx`), and that getting it wrong makes deletion fail *silently*; how to confirm indexing worked (`documents.processed = true`, `companies.gemini_store_name` populated).

**Done when:** three runbooks exist; every command in them exists in the repo exactly as written; each has a concrete "How to confirm it's fixed/working" signal (a column value, a log line — not "it should work").

---

## Checkpoint 4 — Link integrity and final report

1. Collect every relative markdown link across root `*.md`, `docs/**/*.md`, `specs/*.md` and confirm each target exists. Fix any you introduced; report any pre-existing dead links you didn't cause.
2. Confirm no file violates the framework (e.g. an ADR that contains two decisions, a runbook without a Symptom).
3. Write the final report to Zachary in chat (not a file): files created, files changed, facts you corrected, anything marked unverified, anything skipped and why. Then ask whether to commit (markdown files only, per ground rule 3).

**The whole pass is finished when:** all four checkpoints report done, the final report is delivered, and Zachary has answered the commit question. Nothing else — do not start a "pass 2", do not expand scope into user-facing guides or code comments.

---

## Explicitly out of scope

- Writing or editing any application code, styles, or tests
- Creating ROADMAP.md, CONTRIBUTING.md, CHANGELOG.md, or any doc type not in the framework
- End-user help content (that lives in the in-app support pages, already built)
- Committing without asking; pushing at all unless Zachary explicitly says so
- Reorganizing `docs/README.md` or the templates
