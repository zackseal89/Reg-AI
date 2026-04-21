# RegWatch

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzackseal89%2FReg-AI&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,GEMINI_API_KEY,RESEND_API_KEY,APP_URL&envDescription=Supabase%20project%20keys%2C%20Gemini%20API%20key%20for%20File%20Search%20RAG%2C%20Resend%20for%20email%2C%20and%20the%20public%20app%20URL.&envLink=https%3A%2F%2Fgithub.com%2Fzackseal89%2FReg-AI%23environment-variables&project-name=regwatch&repository-name=regwatch)

RegWatch is an AI-powered regulatory intelligence platform built by **MNL Advocates LLP (MN Legal)**, a Nairobi-based legal tech law firm. It delivers regulatory briefings, secure document management, and compliance chat to fintech and crypto startups, SMEs, and international organisations operating in Kenya.

Every piece of content that reaches a client has been reviewed and approved by a lawyer. The platform is an extension of MNL's legal practice, not a generic SaaS.

---

## Core Features

- **Document Management** — Lawyers upload regulatory documents, assign them to specific clients, and publish. Jurisdiction gating (CBK, ODPC) is enforced at the database level via RLS, not the UI.
- **Regulatory Briefings** — Lawyers draft, approve, and send briefings. The two-step Approve → Send flow (REG-13) triggers transactional email delivery via a Supabase Edge Function + Resend.
- **AI Compliance Chat** — Clients ask questions scoped strictly to their own published documents. Powered by the Gemini File Search API — each client has an isolated `FileSearchStore` so cross-client data leakage is impossible by construction.
- **Role-Based Portals** — Admin (MNL internal), Lawyer (MNL associates), and Client (external) portals with distinct routes, RLS policies, and middleware guards.
- **Audit Trail** — Every approval, publish, rejection, and significant mutation is recorded to `audit_logs`.

---

## Tech Stack

- **Frontend** — [Next.js 16](https://nextjs.org/) App Router, React 19, TypeScript, Tailwind CSS v4
- **Backend / DB** — [Supabase](https://supabase.com/): PostgreSQL, Auth, Storage, RLS, Edge Functions
- **RAG / AI** — [Google Gemini](https://ai.google.dev/) `gemini-2.5-flash` with the File Search API (handles chunking, embedding, retrieval, and generation in one call)
- **Email** — [Resend](https://resend.com/) + [React Email](https://react.email/)
- **Deployment** — [Vercel](https://vercel.com/) (app) + Supabase (Edge Functions)

> Note: `@anthropic-ai/sdk` is retained in dependencies but not currently called — the RAG pipeline was migrated from Claude to Gemini File Search in Phase A.

---

## Architecture

### Route Structure

```
app/
  (auth)/login/       Unauthenticated login
  page.tsx            Public landing — Request Access form only (no self-signup)
  dashboard/          Client portal (role: client)
  lawyer/             Lawyer portal (role: lawyer | admin)
  admin/              Admin portal (role: admin)
  api/chat/route.ts   SSE streaming chat endpoint
```

### RAG Pipeline — Gemini File Search

**Indexing** (on document publish):
1. Create a per-client `FileSearchStore` on first document publish (stored on `companies.gemini_store_name`)
2. Upload the PDF to Gemini's Files API
3. Import the file into the client's FileSearchStore — Google handles chunking, embedding, and indexing
4. Mark `documents.processed = true`

**Query** (`app/api/chat/route.ts`):
1. Auth guard → look up the authenticated client's `gemini_store_name`
2. Single call to `gemini-2.5-flash:generateContent` with `tools: [{ fileSearch: { fileSearchStoreNames: [store] } }]`
3. Stream SSE back: `citations` event → `text` deltas → `[DONE]`

### Supabase Client Pattern

- `lib/supabase/server.ts` — cookie-based, respects RLS, use in Server Components
- `lib/supabase/admin.ts` — service role, **bypasses RLS**, use in Server Actions
- Edge Functions — create their own service-role client

### Edge Functions

- `supabase/functions/on_document_upload` — document processing hook
- `supabase/functions/on_briefing_sent` — fires on `briefings` UPDATE to `status='sent'`, renders the React Email template, and sends via Resend

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- A Gemini API key ([aistudio.google.com](https://aistudio.google.com/app/apikey))
- A Resend API key + verified sending domain

### Local Development

```bash
# Install
npm install

# Copy the example env and fill it in
cp .env.example .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

```bash
npm run dev        # Next.js dev server
npm run build      # Production build
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript check (no test suite)
```

### Database

Migrations live in `supabase/migrations/` and are applied manually via the Supabase dashboard or MCP. There is no local Supabase CLI workflow.

### Edge Function Deployment

```bash
supabase functions deploy on_document_upload
supabase functions deploy on_briefing_sent
```

The `on_briefing_sent` function is wired via a Supabase Database Webhook on the `briefings` table (UPDATE events). Configure the webhook in the Supabase dashboard with a shared secret passed as `x-webhook-secret`.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (publishable) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (bypasses RLS — server-only) |
| `GEMINI_API_KEY` | Gemini API key for File Search indexing and chat |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `APP_URL` | Public URL used in email CTAs (e.g. `https://www.regwatchmnl.net`) |
| `RESEND_FROM` | *(optional)* From address, defaults to `RegWatch <briefings@mnladvocates.com>` |
| `WEBHOOK_SECRET` | *(optional)* Shared secret for the briefing-sent webhook |
| `ANTHROPIC_API_KEY` | *(unused)* Retained for future use, not called in current architecture |

---

## Core Rules

1. **Human approval is mandatory.** No briefing or document reaches a client without a lawyer explicitly clicking approve/publish. Enforced at the DB level via RLS.
2. **Jurisdiction gating is enforced at DB level.** RLS policies — not UI filters.
3. **No self-signup.** Clients are onboarded by lawyers only. The landing page has a Request Access form only.
4. **AI chat is document-scoped.** Each client has their own Gemini `FileSearchStore` — cross-client data leakage is impossible by construction.
5. **Audit everything.** Every approval, publish, rejection, and significant mutation is logged.

---

## Roles

| Role | Access |
|---|---|
| **Admin** (MNL internal) | Full platform, lawyer accounts, all content, billing |
| **Lawyer** (MNL associates) | Onboard clients, upload documents, write/approve briefings |
| **Client** (external) | Read-only: their own published briefings and documents, AI chat scoped to their corpus |

---

## Status Flows

```
Briefing:  draft → approved → sent            (rejection returns to draft)
Document:  uploaded → assigned → published    (unpublish returns to assigned)
Account:   pending_review → active → suspended
```

---

## Brand

- **Navy** `#1a2744` (primary)
- **Burgundy** `#8b1c3f` (accent)
- **Cream** `#f5f3ef` (background)
- **Headings** — Playfair Display
- **Body** — Inter

---

## Further Reading

- [CLAUDE.md](./CLAUDE.md) — engineering playbook and architecture deep-dive
- [ROADMAP.md](./ROADMAP.md) — build phases leading to the June 2026 Kempinski summit demo
- [AGENTS.md](./AGENTS.md) — AI-agent collaboration guide
- [specs/phase-a-gemini-migration.md](./specs/phase-a-gemini-migration.md) — Phase A migration spec

---

## Key Dates

- **Summit:** June 18–20, 2026 — Villa Rosa Kempinski, Nairobi
- **Demo target:** live product with at least 2 active paying clients
