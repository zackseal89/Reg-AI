# RegWatch — Build Roadmap

**Target:** Live demo with 2 active paying clients — Summit June 18–20, 2026
**Updated:** April 17, 2026 — 62 days to go — **Phase A closed, Phase B active**

---

## Current State (as of Apr 17)

### Done ✓
| Area | Linear |
|---|---|
| Supabase project (REGAI, eu-central-1) — ACTIVE_HEALTHY | — |
| Database schema — all 10 tables, migrated | — |
| Row Level Security — all tables enforced | — |
| Jurisdiction gating at DB level | — |
| RLS helper functions `is_admin()`, `is_lawyer()` | — |
| Next.js App Router + Supabase SSR clients | — |
| Middleware — role-based routing (admin / lawyer / client) | REG-8 ✓ |
| Login page (no self-signup) | — |
| Admin panel — metrics, lawyer mgmt, client mgmt, audit logs | REG-9–12 ✓ |
| Lawyer portal — clients, documents, briefings with full status flows | — |
| Client dashboard — briefings, documents, PDF viewer, profile | — |
| AI chat UI — streaming, citations, conversation history | — |
| Audit logging — all major actions | — |
| Seed: CBK + ODPC jurisdictions, Zachary admin account | REG-5, 6 ✓ |
| Supabase Storage bucket + RLS | REG-7 ✓ |
| Fix hardcoded credentials in seed-admin.ts | REG-32 ✓ |
| Fix double profile query in middleware | REG-35 ✓ |
| **Phase A — Gemini File Search Migration (closed Apr 17)** | **REG-33, 34, 40, 41, 42 ✓** |
| `GOOGLE_API_KEY` wired in all environments | REG-34 ✓ |
| Schema migration `0006_gemini_migration.sql` — `companies.gemini_store_name`, `documents.gemini_file_id` | REG-41 ✓ |
| `on_document_upload` Edge Function simplified (chunking/embedding removed) | REG-33 ✓ |
| Chat API route rewritten — single Gemini `generateContent` + File Search tool | REG-40 ✓ |
| DB cleanup `0007_cleanup_rag.sql` — `chunks` table, `match_chunks` RPC, legacy RLS/indexes dropped | REG-42 ✓ |
| `scripts/migrate-existing-clients.ts` — retroactive Gemini store provisioning for legacy data | — |

### Known Gap Carried Into Phase B
| Task | Linear | Notes |
|---|---|---|
| Re-index Gemini store when new client is assigned to already-published doc | REG-43 (High) | `assignDocumentsAction` in `app/lawyer/documents/actions.ts:240` does not call `triggerGeminiIndexing`. Fix in server action (recommended) rather than resurrecting a second Edge Function. |

### Active Now — Phase B (Email Pipeline)
| Task | Linear | Due |
|---|---|---|
| Build React Email briefing template (MNL brand) | REG-14 | Apr 24 |
| Build `on_briefing_approved` Edge Function (Resend send + audit) | REG-13 | Apr 27 |
| Configure Resend API key + verify domain | REG-15 | Apr 29 |
| End-to-end test: approve briefing → client inbox | REG-16 | May 1 |
| Fix REG-43 indexing gap | REG-43 | Apr 21 |

---

## AI Stack Decision

Consolidating to Gemini File Search for the full RAG pipeline. Claude is kept for chat generation.

| Role | Before | After |
|---|---|---|
| PDF text extraction | Claude API (pdfs-2024-09-25 beta) | Gemini File Search (automatic at upload) |
| Chunking | Manual (2000 chars, 200 overlap) | Automatic (Google-managed) |
| Embeddings | Voyage AI `voyage-3` (1024 dims) | Automatic (Google-managed) |
| Vector search | pgvector `match_chunks` RPC | Gemini File Search tool |
| Document scoping | `match_chunks` SECURITY DEFINER + client_id | Per-client FileSearchStore isolation |
| Chat generation | Claude `claude-sonnet-4-20250514` | **Gemini `gemini-2.5-flash`** (same call as retrieval) |

**What this eliminates:** Voyage AI, pgvector, `chunks` table, `match_chunks` RPC, manual chunking, embedding batches, separate Claude chat call, `ANTHROPIC_API_KEY`.

**Single API, single call:** Gemini `generateContent` with File Search tool does retrieval + generation together. Citations come from `groundingMetadata` in the response. No second API call needed.

**New env var:** `GOOGLE_API_KEY` (replaces `VOYAGE_API_KEY` and `ANTHROPIC_API_KEY`)

---

## Phase A — Gemini File Search Migration ✓ DONE (closed Apr 17)
**Issues:** REG-34, REG-41, REG-33, REG-40, REG-42 — all Done.
**Carry-over:** REG-43 (indexing on new assignment) moved to Phase B active list.

**Architecture:**
```
On upload:
  PDF in Supabase Storage
  → on_document_upload Edge Function
  → Create/reuse client's FileSearchStore (lazy, on first upload)
  → Upload PDF to FileSearchStore
  → Google auto-chunks, embeds, indexes
  → companies.gemini_store_name saved
  → documents.processed = true + audit log

On chat:
  Client message
  → Resolve gemini_store_name from authenticated client's company record
  → Gemini generateContent with File Search tool (retrieval + generation in one call)
  → Extract text + citations from groundingMetadata
  → Stream SSE: citations event → text event → [DONE]
```

**Exit criteria:** Full RAG pipeline works with zero Voyage AI calls. Upload CBK PDF → chat returns grounded answer with citations → `chunks` table is empty.

---

## Phase B — Email Pipeline
**Target: Apr 23 – May 4** | Issues: REG-13, REG-14, REG-15, REG-16

- [ ] Build `emails/briefing-template.tsx` — React Email, MNL brand (REG-14)
- [ ] Build `supabase/functions/on_briefing_approved/` Edge Function (REG-13)
  - Trigger: DB webhook on `briefings` UPDATE where `status = 'approved'`
  - Fetch assigned clients → send Resend email → audit log
- [ ] Configure Resend API + verify domain (REG-15)
- [ ] End-to-end test: approve briefing → client inbox (REG-16)

**Exit criteria:** Lawyer clicks Approve → clients receive branded email within 30 seconds.

---

## Phase C — Integration & Polish
**Target: May 5–18** | Issues: REG-17, REG-18, REG-19, REG-20, REG-21

- [ ] Run full demo scenario end-to-end, fix every bug (REG-17)
- [ ] Verify AI chat document scoping with Gemini File Search (REG-18)
- [ ] Add error states + empty states to all forms and pages (REG-19)
- [ ] Add loading states + skeleton screens across all portals (REG-20)
- [ ] Mobile responsiveness check on client dashboard (REG-21)

**Exit criteria:** Complete 8-step demo scenario runs without a single blank page, 404, or unhandled error.

---

## Phase D — Vercel Deployment
**Target: May 19–25** | Issues: REG-22, REG-23, REG-24

- [ ] Configure Vercel project + all env vars (REG-22)
  - `GOOGLE_API_KEY` (not `VOYAGE_API_KEY`)
- [ ] Deploy to Vercel + production smoke test (REG-23)
- [ ] Deploy Edge Functions to production + verify webhooks (REG-24)

**Exit criteria:** Platform is live at a real URL. Localhost is no longer needed for demos.

---

## Phase E — Pilot Client Onboarding
**Target: May 26 – Jun 7** | Issues: REG-25, REG-26, REG-27

- [ ] Onboard Pilot Client 1 — CBK jurisdiction, fintech startup (REG-25)
- [ ] Onboard Pilot Client 2 — ODPC jurisdiction, SME or intl org (REG-26)
- [ ] Collect pilot feedback + fix issues (REG-27)

**Exit criteria:** 2 active paying clients on the live platform with published documents and a sent briefing each.

---

## Phase F — Demo Hardening
**Target: Jun 8–15** | Issues: REG-28, REG-29, REG-30, REG-31

- [ ] Demo rehearsal #1 — run full scenario, document every issue (REG-28)
- [ ] Remove all hardcoded placeholder data (REG-29)
- [ ] Demo rehearsal #2 — fixes applied, full scenario again (REG-30)
- [ ] Demo rehearsal #3 — final sign-off + backup plan (REG-31)

**Exit criteria:** Full 8-step scenario rehearsed 3 times clean. Demo credentials in hand.

---

## Demo Scenario (Summit, Jun 18–20)

```
1. Zachary logs in as admin → shows platform overview with real data
2. Lawyer logs in → creates a client (fintech startup, CBK jurisdiction)
3. Lawyer uploads a CBK circular → assigns and publishes to client
4. Client receives magic link → logs in → sees the document
5. Client opens Compliance Chat → asks "What are the licensing requirements?"
6. Gemini File Search retrieves relevant sections → Claude generates answer → streamed live
7. Lawyer writes a briefing → approves it → client receives branded email
8. Zachary shows audit log of all actions
```

---

## Environment Variables

```
# Next.js (.env.local + Vercel)
NEXT_PUBLIC_SUPABASE_URL           ← set
NEXT_PUBLIC_SUPABASE_ANON_KEY      ← set
SUPABASE_SERVICE_ROLE_KEY          ← set
GOOGLE_API_KEY                     ← NEEDED (Gemini File Search — retrieval + generation)
# ANTHROPIC_API_KEY — no longer needed, remove from all environments
RESEND_API_KEY                     ← set

# Supabase Edge Function secrets
SUPABASE_URL                       ← set automatically
SUPABASE_SERVICE_ROLE_KEY          ← set
GOOGLE_API_KEY                     ← NEEDED (add before Phase A)
RESEND_API_KEY                     ← NEEDED (Phase B)

# Remove after Phase A verified
VOYAGE_API_KEY                     ← DELETE
ANTHROPIC_API_KEY                  ← DELETE (no longer used)
```

---

## Out of Scope (Post-Summit)
- WhatsApp alerts, CMA jurisdiction, self-signup, payment/billing, mobile app, multi-language, public API, weekly AI briefing cron
