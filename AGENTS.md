# AGENTS.md — RegWatch Codebase Reference

> **Read this first.** This file is the single source of truth for any AI agent
> working in this codebase. It replaces the need to explore the file tree from
> scratch. Read the relevant section, then open only the files you need to modify.

## What This Is
RegWatch is a regulatory intelligence platform built by MNL Advocates LLP (MN Legal), 
a Nairobi-based legal tech law firm. It delivers AI-powered regulatory briefings, 
document management, and compliance chat to fintech and crypto startups, SMEs, and 
international organisations operating in Kenya.

This is not a generic SaaS. Every piece of content that reaches a client has been 
reviewed and approved by a lawyer. The platform is an extension of MNL's legal practice.

---

## Commands

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm run lint       # Run ESLint
```

There are no automated tests. TypeScript type-checking:
```bash
npx tsc --noEmit
```

Supabase migrations are applied manually via the Supabase MCP or dashboard — there is no local Supabase CLI workflow set up. Migration files live in `supabase/migrations/`.

Deploy the Edge Function:
```bash
supabase functions deploy on_document_upload
```

---

## Stack
- **Frontend:** Next.js 16 App Router, TypeScript, Tailwind CSS v4
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage, pgvector, Edge Functions)
- **AI:** Google Gemini (`gemini-2.5-flash`) via File Search API — handles document indexing, retrieval, and chat generation in a single call
- **Anthropic Claude:** Not used in the current architecture. `ANTHROPIC_API_KEY` is retained in env but not called.
- **Email:** Resend + React Email
- **Deployment:** Vercel

---

## Architecture

### Route Structure
```
app/
  (auth)/login/       — Unauthenticated login page
  page.tsx            — Public landing page (Request Access form only — no signup)
  dashboard/          — Client-facing routes (role: client)
  lawyer/             — Lawyer routes (role: lawyer | admin)
  admin/              — Admin-only routes (role: admin)
  api/chat/route.ts   — SSE streaming chat endpoint (RAG pipeline)
```

### Middleware & Auth (`lib/supabase/middleware.ts`)
The middleware runs on every request. It:
1. Refreshes Supabase session via cookies
2. Redirects unauthenticated users to `/login`
3. Reads `profiles.role` and redirects authenticated users to their role dashboard
4. Blocks `/admin` for non-admins and `/lawyer` for clients

### Supabase Client Pattern
Three distinct clients — always use the right one:
- `lib/supabase/server.ts` — `createClient()` — cookie-based, respects RLS, use in Server Components
- `lib/supabase/admin.ts` — `createAdminClient()` — service role, **bypasses RLS**, use only in Server Actions when you need to write across RLS boundaries
- Edge Function — creates its own `@supabase/supabase-js` client with service role

### Server Actions Pattern
All mutations are Next.js Server Actions (`'use server'`) in `actions.ts` files co-located with their route. Pattern:
1. `createClient()` for auth check (`supabase.auth.getUser()`)
2. `createAdminClient()` for the actual DB write (bypasses RLS)
3. `logAudit()` from `lib/audit.ts` after every significant mutation
4. `redirect()` to navigate on success or error

### RAG Pipeline — Gemini File Search (replaces Voyage AI + pgvector)
The full RAG pipeline uses the **Gemini File Search API** — no manual chunking, embeddings, or vector DB needed.

**Indexing** (triggered on document upload/publish):
- Upload the PDF to a per-client **Gemini FileSearchStore** via the Files API
- Google automatically handles chunking, embedding (Gemini embedding model), and indexing
- Store the `fileSearchStoreName` reference on the client or document record in Supabase
- Mark `documents.processed = true` after successful upload

**Query** (`app/api/chat/route.ts`):
- Auth guard → fetch `companies.gemini_store_name` for the authenticated client
- Single `POST generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` with:
  - `systemInstruction` — MNL regulatory assistant persona
  - `tools: [{ fileSearch: { fileSearchStoreNames: [gemini_store_name] } }]`
  - Full conversation history + user message
- Gemini retrieves relevant chunks AND generates the answer in one call — no separate Claude call
- Extract text from `candidates[0].content.parts`, citations from `candidates[0].groundingMetadata.groundingChunks`
- Emit as SSE: citations event → text event → `[DONE]`

**What no longer exists:** `chunks` table, `match_chunks` RPC, Voyage AI calls, `on_document_upload` Edge Function chunking logic, `VOYAGE_API_KEY`.

### Chat SSE Protocol
The `/api/chat` endpoint streams Server-Sent Events in this order:
1. `{ type: 'citations', citations: [...] }` — source documents returned by Gemini File Search
2. `{ type: 'text', text: '...' }` — streamed text deltas
3. `data: [DONE]`

---

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | All users (admin, lawyer, client) with `role` field |
| `companies` | Client company profiles |
| `jurisdictions` | Reference table (CBK, ODPC) |
| `client_jurisdictions` | Junction: client ↔ jurisdiction |
| `documents` | Uploaded files with status, jurisdiction tag, storage path, `processed` flag |
| `document_assignments` | Which documents are assigned to which clients |
| `briefings` | Regulatory briefings with status, jurisdiction, `approved_by` |
| `briefing_assignments` | Which briefings go to which clients |
| `chunks` | **Deprecated** — replaced by Gemini File Search (can be dropped from schema) |
| `audit_logs` | Every significant action logged |

---

## Roles & Permissions

### Admin (MNL internal — Zachary)
- Full platform access; manages lawyer accounts, views all content, billing records

### Lawyer (MNL associates)
- Onboard and manage clients, upload documents, write/approve/reject briefings, publish documents
- Cannot access other lawyers' clients unless admin grants access

### Client (External)
- Read-only: view their own published briefings and documents, chat with AI scoped to their documents
- Cannot see draft or unapproved content under any circumstance

---

## Core Rules — Never Break These

1. **Human approval is mandatory.** No briefing or document reaches a client 
   without a lawyer explicitly clicking approve/publish. Enforced at DB level via RLS.

2. **Jurisdiction gating is enforced at DB level.** RLS policies enforce this — it is not a UI filter.

3. **No self-signup.** Clients are onboarded by lawyers only. Landing page has a "Request Access" form only.

4. **AI chat is document-scoped.** Each client has their own Gemini `FileSearchStore`. The `fileSearch` tool is always scoped to that client's store — no cross-client data leakage is possible.

5. **Audit everything.** Call `logAudit()` after every approval, publish, rejection, and significant mutation.

---

## Status Flows

### Briefing
```
draft → approved → sent
```
Rejection returns to `draft`. The `sendBriefingAction` updates status to `sent` (email via Resend Edge Function — Phase B, not yet wired).

### Document
```
uploaded → assigned → published
```
Unpublish returns to `assigned`. Publishing triggers indexing into the client's Gemini FileSearchStore; unpublishing removes the document from the store.

### Client Account
```
pending_review → active → suspended
```

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
GEMINI_API_KEY=           # Required for File Search RAG and chat
# VOYAGE_API_KEY — no longer needed (replaced by Gemini File Search)
```

---

## What Is Explicitly Out of Scope for MVP
- WhatsApp alerts, CMA jurisdiction, self-signup, payment/billing, mobile app, multi-language, public API

Do not build any of the above. Redirect to post-summit roadmap.

---

## Brand
- **Primary:** Navy `#1a2744`
- **Accent:** Burgundy `#8b1c3f`
- **Background:** Cream `#f5f3ef`
- **Headings:** Playfair Display
- **Body:** Inter

---

## Key Dates
- **Summit:** June 18–20, 2026 — Villa Rosa Kempinski, Nairobi
- **Demo target:** Live product with at least 2 active paying clients
- **Demo format:** Single regulatory scenario walkthrough (not a feature tour)
