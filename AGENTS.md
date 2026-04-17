# AGENTS.md — RegWatch Codebase Reference

> **Read this first.** This file is the single source of truth for any AI agent
> working in this codebase. It replaces the need to explore the file tree from
> scratch. Read the relevant section, then open only the files you need to modify.

---

## 1. Project Identity

**RegWatch** — AI-powered regulatory intelligence platform for MNL Advocates LLP  
**Client types served:** Fintech/crypto startups, SMEs, international orgs in Kenya  
**Core promise:** Every piece of content a client sees has been approved by a human lawyer.  
**Summit demo deadline:** June 18–20, 2026 — Villa Rosa Kempinski, Nairobi

---

## 2. Tech Stack (quick reference)

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router · TypeScript · Tailwind CSS v4 |
| Database | Supabase PostgreSQL + pgvector (ivfflat, 1024-dim) |
| Auth | Supabase Auth (cookie-based sessions) |
| Storage | Supabase Storage (PDF uploads) |
| AI Chat | Anthropic Claude `claude-sonnet-4-20250514` |
| Embeddings | Voyage AI `voyage-3` (1024-dim) |
| Email | Resend + React Email |
| Edge Functions | Deno (Supabase Functions) |
| Deployment | Vercel |

---

## 3. Full File Map

```
app/
  layout.tsx                      Root layout (fonts, metadata)
  page.tsx                        Public landing — "Request Access" form ONLY
  globals.css                     Base Tailwind + CSS custom properties

  (auth)/login/                   Unauthenticated login page

  dashboard/                      CLIENT role
    layout.tsx                    Client shell + bottom nav guard
    page.tsx                      Redirect → /dashboard/briefings
    bottom-nav.tsx                Mobile bottom navigation component
    briefings/
      page.tsx                    Client briefings list
      [id]/page.tsx               Single briefing detail
    documents/
      page.tsx                    Client documents list
      [id]/page.tsx               Single document viewer
      doc-filters.tsx             Filter bar component
    chat/
      page.tsx                    AI chat UI (SSE consumer, full RAG chat)
    profile/
      page.tsx                    Client profile view

  lawyer/                         LAWYER role
    layout.tsx                    Lawyer shell + sidebar nav
    page.tsx                      Lawyer dashboard overview
    clients/
      page.tsx                    Client list + onboarding
      actions.ts                  onboardClientAction, suspendClientAction
    briefings/
      page.tsx                    Briefing list (draft/approved/sent)
      actions.ts                  createBriefingAction, approveBriefingAction,
                                  rejectBriefingAction, sendBriefingAction
    documents/
      page.tsx                    Document list + assignment management
      actions.ts                  uploadDocumentAction, assignDocumentAction,
                                  publishDocumentAction, unpublishDocumentAction
      upload-form.tsx             Multi-step upload form component

  admin/                          ADMIN role (Zachary only)
    layout.tsx                    Admin shell
    page.tsx                      Admin overview (stats)
    clients/
      page.tsx                    All clients across all lawyers
      actions.ts                  Admin client management actions
    lawyers/
      page.tsx                    Lawyer account management
      actions.ts                  createLawyerAction, deactivateLawyerAction
    audit-logs/
      page.tsx                    Full audit log viewer

  api/
    chat/route.ts                 SSE streaming endpoint — RAG query pipeline

lib/
  audit.ts                        logAudit(action, userId, meta) — call after mutations
  supabase/
    server.ts                     createClient() — cookie-based, respects RLS
    admin.ts                      createAdminClient() — service role, bypasses RLS
    client.ts                     Browser client (used in Client Components)
    middleware.ts                 Session refresh + role-based redirects

supabase/
  migrations/
    0001_initial_schema.sql       All tables: profiles, companies, documents, etc.
    0002_rls_policies.sql         ALL Row Level Security policies
    0003_document_metadata.sql    Added metadata columns to documents
    0004_document_internal_notes.sql  Internal notes column
    0005_rag_pipeline.sql         chunks table + match_chunks RPC + ivfflat index
  functions/
    on_document_upload/index.ts   Deno edge function: PDF → Claude extract → Voyage
                                  embed → store chunks

specs/
  phase-a-gemini-migration.md     Migration spec (Claude→Gemini for embeddings phase)

public/                           Static assets
scripts/                          One-off utility scripts
```

---

## 4. Database Schema (tables)

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | `id` (= auth.uid), `role` (admin/lawyer/client), `company_id` | Linked 1:1 to auth.users |
| `companies` | `id`, `name`, `status` (pending_review/active/suspended) | Client companies |
| `jurisdictions` | `id`, `name`, `code` | e.g. CBK, ODPC |
| `client_jurisdictions` | `company_id`, `jurisdiction_id` | Junction table |
| `documents` | `id`, `title`, `jurisdiction_id`, `storage_path`, `status`, `processed` | `processed` = RAG indexed |
| `document_assignments` | `document_id`, `company_id` | Which client sees which doc |
| `briefings` | `id`, `title`, `content`, `status` (draft/approved/sent), `approved_by` | |
| `briefing_assignments` | `briefing_id`, `company_id` | Which client receives briefing |
| `chunks` | `id`, `document_id`, `content`, `embedding` (vector 1024) | RAG source data |
| `audit_logs` | `id`, `action`, `user_id`, `metadata`, `created_at` | Written by logAudit() |

**Critical RPC:** `match_chunks(query_embedding, match_threshold, match_count, p_company_id)`  
— cosine similarity search, SECURITY DEFINER, scoped to company's published documents.

---

## 5. Auth & Role Flow

```
Request arrives
  └── middleware.ts
        ├── No session → redirect /login
        ├── role = 'client' → redirect /dashboard
        ├── role = 'lawyer' → redirect /lawyer
        └── role = 'admin' → redirect /admin (also /lawyer accessible)
```

**Always use `supabase.auth.getUser()`** (not `getSession()`) for server-side auth checks.

---

## 6. Supabase Client Rules

| Situation | Client to use | Why |
|---|---|---|
| Server Component (read) | `createClient()` from `lib/supabase/server.ts` | Respects RLS |
| Server Action (auth check) | `createClient()` | Respects RLS |
| Server Action (DB write) | `createAdminClient()` from `lib/supabase/admin.ts` | Bypasses RLS to write across boundaries |
| Client Component | `createClient()` from `lib/supabase/client.ts` | Browser client |
| Edge Function | Inline with `SUPABASE_SERVICE_ROLE_KEY` | Deno environment |

---

## 7. Server Action Pattern (copy this every time)

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'

export async function myAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { error } = await admin.from('table').insert({ ... })
  if (error) redirect('/path?error=message')

  await logAudit('ACTION_NAME', user.id, { relevant: 'metadata' })
  redirect('/path?success=true')
}
```

---

## 8. RAG Pipeline

### Indexing (Edge Function — Deno)
`supabase/functions/on_document_upload/index.ts`

1. Webhook fires on `documents` INSERT
2. Download PDF from Supabase Storage
3. Send to Claude API (`pdfs-2024-09-25` beta header) for text extraction
4. Chunk: 2000 chars, 200-char overlap
5. Embed via Voyage AI `voyage-3` in batches of 64 (`input_type: 'document'`)
6. Insert into `chunks` table, mark `documents.processed = true`

### Query (Node.js — `app/api/chat/route.ts`)

1. Embed user message via Voyage AI (`input_type: 'query'`)
2. Call `match_chunks` RPC (threshold 0.65, top 5, scoped to `company_id`)
3. Stream Claude response as SSE:
   - Event 1: `{ type: 'citations', citations: [...] }`
   - Events 2–N: `{ type: 'text', text: '...' }` (streamed deltas)
   - Final: `data: [DONE]`

---

## 9. Status State Machines

```
Briefing:   draft → approved → sent   (rejection → back to draft)
Document:   uploaded → assigned → published   (unpublish → back to assigned)
Account:    pending_review → active → suspended
```

---

## 10. Absolute Rules (never violate)

1. **No content reaches a client without lawyer approval.** Enforced by RLS + status checks.
2. **No self-signup.** Landing page has Request Access only; lawyers onboard clients.
3. **Jurisdiction gating at DB level.** Never rely on UI filters alone.
4. **AI chat is company-scoped.** `match_chunks` RPC enforces this at SQL — no cross-client leakage.
5. **Audit everything.** `logAudit()` after every approval, publish, rejection, creation.
6. **Always `getUser()` not `getSession()`** for server auth checks.

---

## 11. Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
VOYAGE_API_KEY=           # Required — chat/RAG disabled without this
```

---

## 12. Out of Scope (do not build)

WhatsApp alerts · CMA jurisdiction · self-signup · payment/billing ·  
mobile app · multi-language · public API

---

## 13. Brand Tokens

```css
--color-navy:    #1a2744;   /* Primary — headers, sidebar */
--color-burgundy: #8b1c3f;  /* Accent — CTAs, highlights */
--color-cream:   #f5f3ef;   /* Background */
--font-heading:  'Playfair Display';
--font-body:     'Inter';
```

---

## 14. Dev Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check

# Supabase (via MCP or dashboard — no local CLI)
supabase functions deploy on_document_upload
```

Migrations: apply via Supabase MCP tool or dashboard. Files in `supabase/migrations/`.
