# RegWatch — Build Roadmap

**Target:** Live demo with 2 active paying clients — Summit June 18–20, 2026  
**Today:** April 10, 2026 — 69 days to go

---

## Current State

### Done
| Area | Status |
|---|---|
| Supabase project (REGAI, eu-central-1) | ACTIVE_HEALTHY |
| Database schema — all 10 tables | Migrated |
| Row Level Security — all tables | Enforced |
| Jurisdiction gating (client_briefings, client_documents, client_chunks) | Enforced at DB level |
| RLS helper functions `is_admin()`, `is_lawyer()` | Done |
| pgvector extension | Enabled |
| Indexes for RLS scaling | Done |
| Next.js App Router scaffold | Done |
| Supabase SSR client (client.ts, server.ts, middleware.ts) | Done |
| Middleware — role-based routing (admin/lawyer/client) | Done |
| Landing page (Client Login + Request Access) | Done |
| Login page (Supabase password auth, server action) | Done |
| Dashboard layout — sidebar, nav, user email | Done |
| Lawyer layout — sidebar, nav | Done |
| Brand tokens — navy, burgundy, cream, Playfair + Inter | Done |
| Architecture documented (architecture.md) | Done |

### Not Built Yet
| Area | Notes |
|---|---|
| Jurisdictions seed data (CBK, ODPC) | No rows in DB yet |
| Admin account seeded | No users in auth yet |
| Supabase Storage bucket | Not configured |
| All dashboard sub-pages (briefings, documents, chat) | Shell only |
| Lawyer sub-pages (clients, documents, briefings) | Shell only |
| Admin sub-pages (clients, lawyers, audit logs) | Shell only |
| Client onboarding flow (lawyer creates client + sends invite) | Not built |
| Document upload + assignment UI | Not built |
| Briefing create / approve / send flow | Not built |
| AI chat (RAG pipeline) | Not built |
| Supabase Edge Functions (3) | Not built |
| Email template + Resend integration | Not built |
| Vercel deployment | Not deployed |

---

## Build Phases

### Phase 1 — Foundation (Apr 10–16)
Get a real user logged in and routed correctly.

- [ ] Seed jurisdictions table (CBK, ODPC)
- [ ] Create admin account (Zachary) via Supabase Auth
- [ ] Create Supabase Storage bucket `documents` with RLS policy
- [ ] Verify middleware routing end-to-end (login → correct portal)
- [ ] Admin layout + stub sub-pages (clients, lawyers, audit-logs)
- [ ] Fix `admin/layout.tsx` to mirror dashboard layout pattern (auth guard)

**Exit criteria:** Zachary can log in, land on `/admin`, and see the platform shell.

---

### Phase 2 — Lawyer Portal (Apr 17–27)
A lawyer can onboard a client and publish a document.

- [ ] `/lawyer/clients` — list clients, create client modal
  - Create company + profile + auth invite in one flow
  - Assign jurisdiction(s) on creation
  - Client status: pending_review → active toggle
- [ ] `/lawyer/documents` — upload document
  - File upload to Supabase Storage
  - Insert `documents` row (status: uploaded)
  - Assign to client(s) → status: assigned
  - Publish button → status: published
  - Audit log entry on each status change
- [ ] `/lawyer/briefings` — briefings list
  - Create briefing (title, content, jurisdiction)
  - Status: draft → approve → send flow
  - Assign to client(s) before approving

**Exit criteria:** Lawyer can onboard a client, upload a document, and publish it.

---

### Phase 3 — Client Portal (Apr 28 – May 7)
A client can log in and read their content.

- [ ] `/dashboard/briefings` — list + read briefings (sent only, jurisdiction-matched)
- [ ] `/dashboard/documents` — list + open/download published documents
- [ ] Client sees only their own data (RLS verified end-to-end)
- [ ] Magic link invite email (Supabase Auth invite flow)
- [ ] "Book a Consultation" CTA on dashboard

**Exit criteria:** Onboarded client can log in, read a briefing, and open a document.

---

### Phase 4 — AI Chat (May 8–20)
The RAG pipeline, end-to-end.

- [ ] Edge Function: `on_document_upload`
  - Trigger on Storage insert
  - Extract PDF text
  - Chunk (500 tokens, 50 overlap)
  - Generate embeddings via Anthropic API
  - Insert into `chunks` table
- [ ] `/dashboard/chat` — chat UI
  - Text input + streaming response
  - Server action: embed question → pgvector search → Claude prompt → stream
  - Scoped strictly to client's published documents (RLS + explicit filter)
- [ ] Chunk vector search function in Supabase (match_chunks RPC)

**Exit criteria:** Client can ask a question and get a grounded answer from their documents.

---

### Phase 5 — Briefing Email (May 21–27)
Approved briefings reach clients automatically.

- [ ] Edge Function: `on_briefing_approved`
  - Trigger on briefings.status update to 'approved'
  - Fetch assigned clients + emails
  - Render React Email template (MNL brand: navy + burgundy)
  - Send via Resend
  - Update briefing status to 'sent'
  - Write audit log entry
- [ ] React Email template: `emails/briefing-template.tsx`
- [ ] Set `RESEND_API_KEY` in Supabase secrets

**Exit criteria:** Lawyer clicks Approve → clients receive a branded email.

---

### Phase 6 — Admin Portal (May 28 – Jun 4)
Zachary can oversee the entire platform.

- [ ] `/admin/clients` — all clients, status management
- [ ] `/admin/lawyers` — manage lawyer accounts
- [ ] `/admin/audit-logs` — filterable audit trail (action, entity, user, date)
- [ ] `/admin` overview — real metrics (total clients, active lawyers, docs published, briefings sent)
- [ ] Usage stats queries (Supabase server components, no hardcoded zeros)

**Exit criteria:** Zachary can see real data and manage all accounts from `/admin`.

---

### Phase 7 — Demo Hardening (Jun 5–15)
Make the demo bulletproof.

- [ ] Deploy to Vercel, configure all env vars
- [ ] Seed 2 pilot clients (CBK + ODPC jurisdiction)
- [ ] Upload 2–3 real CBK/ODPC regulatory documents
- [ ] Publish 1 briefing per client, send email
- [ ] Run full demo scenario end-to-end
- [ ] Error states on all forms (empty states, loading spinners)
- [ ] Mobile responsiveness check
- [ ] Remove all hardcoded zeros from dashboard/lawyer/admin pages

**Exit criteria:** Full scenario walkthrough works without a single 404, blank page, or error.

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

## Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL          ← already set
NEXT_PUBLIC_SUPABASE_ANON_KEY     ← already set
SUPABASE_SERVICE_ROLE_KEY         ← needed for Edge Functions
ANTHROPIC_API_KEY                 ← needed for Phase 4
RESEND_API_KEY                    ← needed for Phase 5
```

---

## Out of Scope (Post-Summit)
- WhatsApp alerts
- CMA jurisdiction
- Self-signup
- Payment/billing infrastructure
- Mobile app
- Multi-language support
- Public API
- Weekly AI briefing cron (architecture.md mentions it — defer)
