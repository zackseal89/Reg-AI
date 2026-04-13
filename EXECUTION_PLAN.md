# RegWatch — Architecture Review & Execution Plan

**Written:** April 13, 2026  
**Summit:** June 18–20, 2026 — Villa Rosa Kempinski, Nairobi  
**Days remaining at time of writing:** 66

---

## Architecture: What to Change and Why

### Keep Everything Core — It's Correct for This Use Case

The pgvector + RLS + Claude stack is the right call. Gemini File Search does not replace it.

Gemini File Search scopes documents via **metadata filters**. RegWatch's jurisdiction gating
is a **legal enforcement requirement** — it must be RLS at the database level, not a
`metadata_filter="jurisdiction=CBK"` parameter that could silently fail or be bypassed.
A lawyer misreading a document meant for a different client is a professional liability event.

---

### Change #1 — Use Gemini for PDF Extraction Only (Inside the Edge Function)

CBK and ODPC documents are government PDFs with complex layouts: multi-column text,
tables showing capital requirements, watermarked pages, footnotes. Basic PDF extraction
libraries (`pdf-parse`, `pdfjs`) mangle these. Gemini's document vision understands them natively.

**Current planned flow:**
```
PDF uploaded → Edge Function → pdf-parse extracts text → chunk → embed
```

**Updated flow:**
```
PDF uploaded → Edge Function → Gemini Document API extracts text (preserves tables/layout) → chunk → embed
```

One API call replaces the extraction step. Native PDF text tokens are free on Gemini.
Chunking and embedding still use Voyage-3 via Anthropic. Storage still pgvector. RLS unchanged.

**Cost impact:** Near zero. You pay for page rendering (~258 tokens/page at image rates),
not the extracted text itself.

---

### Change #2 — Fix the Security Issue in `seed-admin.ts`

Real prod credentials are hardcoded in `scripts/seed-admin.ts`. After running the seed,
remove the hardcoded password and move credentials to env vars or delete the file entirely.

---

### Change #3 — Middleware Double Profile Query (Fix in Phase 6, Not Now)

`lib/supabase/middleware.ts` fetches the user profile twice on some paths — once for the
home redirect check, once for role-based protection. Not critical for MVP but adds latency
on every page load. Merge the two blocks during Phase 6.

---

### Change #4 — Admin Metrics Page Needs Real Queries

`app/admin/page.tsx` has all four stats hardcoded to `0`. The lawyer page already shows
the correct pattern (Supabase server component queries). Fix before demo — Zachary
presenting "Total Clients: 0" at the summit would be a disaster.

---

### Don't Change

- **Don't switch to Gemini for generation.** Claude is the product identity.
- **Don't move to Gemini File Search for RAG.** RLS compliance is non-negotiable.
- **Don't add a queue/worker for the edge function yet.** Demo volume (2 clients, ~10 docs)
  doesn't need async job processing. Build it when processing fails at scale, not before.

---

## Execution Checklist — 66 Days to Summit

### PHASE 1 — Foundation (Apr 13–16)
**Goal: Zachary can log in and see a working shell**

- [ ] Seed CBK and ODPC rows into `jurisdictions` table via Supabase SQL editor
- [ ] Run `seed-admin.ts` against prod → then remove hardcoded credentials from the file
- [ ] Create Supabase Storage bucket named `documents` with private access
- [ ] Add Storage RLS policy: lawyers can upload, clients can read their assigned files only
- [ ] Verify full auth flow: login → `/admin`, `/lawyer`, `/dashboard` all route correctly
- [ ] Confirm middleware role redirect works for all three roles

> **Risk:** If jurisdictions aren't seeded, every RLS policy that joins `client_jurisdictions`
> returns nothing. The whole platform is broken without this row in the DB.

---

### PHASE 2 — Lawyer Portal (Apr 17–27)
**Goal: A lawyer can onboard a client, upload a document, and publish it**

**`/lawyer/clients`**
- [ ] Client list page — fetch profiles where `role = 'client'`
- [ ] Create client modal: company row → profile row → `supabase.auth.admin.inviteUserByEmail()` → `client_jurisdictions`
- [ ] Status badge (pending_review / active / suspended) with toggle
- [ ] Audit log on every status change

**`/lawyer/documents`**
- [ ] Document list with status column
- [ ] Upload form: file → Supabase Storage → `documents` row (status: uploaded)
- [ ] Assign to client(s) → `document_assignments` → status: assigned
- [ ] Jurisdiction mismatch warning on assign
- [ ] Publish button → status: published → audit log

**`/lawyer/briefings`**
- [ ] Briefing list with status filter tabs (draft / approved / sent)
- [ ] Create briefing: title, content, jurisdiction
- [ ] Assign to clients before approving
- [ ] Approve button → status: approved → triggers email (Phase 5)
- [ ] Audit log on approve

---

### PHASE 3 — Client Portal (Apr 28 – May 7)
**Goal: A client can log in and read their content**

- [ ] Magic link invite works — client sets password and lands on `/dashboard`
- [ ] `/dashboard/briefings` — list briefings (status: sent, jurisdiction-matched via RLS)
- [ ] Briefing detail page — full content, date, issuing body
- [ ] `/dashboard/documents` — list published documents assigned to this client
- [ ] Document viewer — open PDF in-browser or download button
- [ ] "Book a Consultation" CTA linking to MNL intake form
- [ ] Empty states on all list pages (don't show a blank white box)
- [ ] Verify RLS end-to-end: client A cannot see client B's data even with a direct URL

> **Note:** This phase is what gets demoed the most. Don't rush empty states and loading
> states — they will be seen by the audience.

---

### PHASE 4 — AI Chat + RAG Pipeline (May 8–20)
**Goal: Client can ask a question and get a grounded answer from their documents**
**Highest-risk phase. Give it the full 13 days.**

**Edge Function: `on_document_upload`**
- [ ] Trigger on Storage insert event
- [ ] Call Gemini Document Processing API to extract text from PDF
- [ ] Chunk extracted text: 500 tokens, 50 token overlap
- [ ] For each chunk: generate embedding via Voyage-3 (1024 dimensions — matches schema)
- [ ] Insert into `chunks`: `document_id`, `client_id`, `jurisdiction_id`, `chunk_text`, `embedding`, `chunk_index`
- [ ] Mark `documents.processed = true`, set `processed_at`
- [ ] Handle errors — if embedding fails, don't mark processed; function must be idempotent

**`/dashboard/chat`**
- [ ] Chat UI: text input, message history, streaming response
- [ ] Server action: embed question → `match_chunks` RPC → Claude prompt → stream response
- [ ] System prompt: "You are a regulatory compliance assistant for MNL Advocates. Answer
      using only the provided context. If the answer is not in the documents, say so explicitly."
- [ ] Show source document attribution per answer
- [ ] Disable chat if client has no published documents
- [ ] Test with a real CBK circular — verify answers are grounded

> **Fallback if edge function isn't wired by Day 10:** Seed chunks manually via a script.
> Get the chat UI working for the demo, wire the auto-trigger post-summit.

---

### PHASE 5 — Briefing Email (May 21–27)
**Goal: Lawyer clicks Approve → clients receive a branded email**

- [ ] React Email template (`emails/briefing-template.tsx`): navy header, MNL logo,
      briefing title, content, CTA to dashboard, footer
- [ ] Edge Function `on_briefing_approved`: trigger on `briefings.status` → `approved`
- [ ] Fetch assigned clients + emails from `briefing_assignments` + `profiles`
- [ ] Render template and send via Resend
- [ ] Update briefing status to `sent`
- [ ] Write audit log entry
- [ ] Set `RESEND_API_KEY` in Supabase Edge Function secrets
- [ ] Test with a real email address — verify rendering in Gmail

---

### PHASE 6 — Admin Portal (May 28 – Jun 4)
**Goal: Zachary can see real data and manage all accounts from `/admin`**

- [ ] `/admin` — replace hardcoded zeros with real Supabase queries
- [ ] `/admin/clients` — all clients, status management (suspend/reactivate)
- [ ] `/admin/lawyers` — list, create, deactivate lawyer accounts
- [ ] `/admin/audit-logs` — paginated, filterable by action, entity, date, user
- [ ] Fix double profile query in middleware (merge the two fetch blocks)

---

### PHASE 7 — Demo Hardening (Jun 5–15)
**Don't skip anything here. The demo breaks on the things you didn't test.**

- [ ] Deploy to Vercel — configure all 5 env vars
- [ ] Seed 2 pilot clients: one CBK (fintech), one ODPC (data-heavy startup)
- [ ] Upload 2–3 real CBK circulars and 1–2 ODPC guidelines as published docs
- [ ] Generate and approve 1 briefing per client — client receives email
- [ ] Run the full 8-step demo scenario end-to-end, no shortcuts
- [ ] Error states: every form needs a disabled state while submitting + error message on failure
- [ ] Loading states: every list page needs a skeleton or spinner
- [ ] Mobile responsiveness: `/dashboard` is mobile-first; `/lawyer` and `/admin` must not
      break on a tablet
- [ ] Remove all hardcoded zeros
- [ ] Test on a fresh incognito window — never demo from a cached session

---

## Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Phase 4 edge function takes longer than planned | High | Manual chunk seeding script as fallback |
| Gemini extraction has latency or errors | Medium | Wrap in try/catch, fallback to `pdf-parse` |
| Resend email doesn't deliver correctly | Medium | Test with real emails in Phase 5, not Phase 7 |
| RLS bug lets client see wrong data | Critical | Run `SET ROLE` queries in SQL editor as client user before demo |
| Supabase project paused (free tier inactivity) | Medium | Upgrade to paid plan or add a keep-alive ping |
| Double profile query causes slow page loads | Low | Fix in Phase 6 middleware cleanup |

---

## Demo Scenario (Summit, Jun 18)

```
1. Zachary logs in as admin → shows platform overview with real data
2. Lawyer logs in → creates a client (fintech startup, CBK jurisdiction)
3. Lawyer uploads a CBK circular → assigns and publishes to client
4. Client receives magic link → logs in → sees the document
5. Client opens Compliance Chat → asks "What are the licensing requirements?"
6. Claude answers using the document → streamed live
7. Lawyer writes a briefing → approves it → client receives email
8. Zachary shows audit log of all actions
```

---

## Environment Variables Checklist

```
NEXT_PUBLIC_SUPABASE_URL          ← set
NEXT_PUBLIC_SUPABASE_ANON_KEY     ← set
SUPABASE_SERVICE_ROLE_KEY         ← needed for Edge Functions
ANTHROPIC_API_KEY                 ← needed for Phase 4 (embeddings + generation)
RESEND_API_KEY                    ← needed for Phase 5
GOOGLE_GEMINI_API_KEY             ← needed for Phase 4 (PDF extraction)
```
