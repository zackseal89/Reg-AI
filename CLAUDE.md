# RegWatch — Claude Code Project Memory

## What This Is
RegWatch is a regulatory intelligence platform built by MNL Advocates LLP (MN Legal), 
a Nairobi-based legal tech law firm. It delivers AI-powered regulatory briefings, 
document management, and compliance chat to fintech and crypto startups, SMEs, and 
international organisations operating in Kenya.

This is not a generic SaaS. Every piece of content that reaches a client has been 
reviewed and approved by a lawyer. The platform is an extension of MNL's legal practice.

---

## Stack
- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage, pgvector, Edge Functions, Realtime)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514) via RAG pipeline
- **Email:** Resend + React Email
- **Deployment:** Vercel
- **Vector Search:** Supabase pgvector extension

---

## Roles & Permissions

### Admin (MNL internal — Zachary)
- Full platform access
- Manage lawyer accounts
- View all clients, briefings, documents
- Access usage metrics and audit logs
- Manage billing records manually

### Lawyer (MNL associates)
- Onboard and manage clients
- Upload documents to client accounts
- Write and edit briefings
- Approve or reject briefings before sending
- Publish or unpublish documents
- Cannot access other lawyers' clients unless admin grants access

### Client (External — fintech/crypto startups, SMEs, international orgs)
- View their own dashboard only
- Read approved, published briefings
- Open and download published documents
- Chat with AI about their published documents only
- Cannot see draft or unapproved content under any circumstance

---

## Core Rules — Never Break These

1. **Human approval is mandatory.** No briefing or document reaches a client 
   without a lawyer explicitly clicking approve/publish. This is enforced at 
   the database level via RLS, not just the UI.

2. **Jurisdiction gating is enforced at DB level.** A client only sees content 
   tagged to their jurisdiction focus. RLS policies enforce this — it is not 
   a UI filter.

3. **No self-signup.** Clients are onboarded by lawyers only. 
   Landing page has a "Request Access" form — not a signup form.

4. **AI chat is document-scoped.** The AI can only answer questions using 
   documents published to that specific client. No cross-client data leakage.

5. **Audit everything.** Every approval, publish, rejection, and login is logged 
   with a timestamp and user ID.

---

## Jurisdictions (MVP Launch)
- **CBK** — Central Bank of Kenya (fintech, payments, licensing)
- **ODPC** — Office of the Data Protection Commissioner (data protection, privacy)
- CMA to be added post-summit

---

## Status Flows

### Client Account
```
pending_review → active → suspended
```
- Created by lawyer → sits at pending_review
- Lawyer or admin activates → active
- Can be suspended without deletion

### Briefing
```
draft → approved → sent
```
- AI generates or lawyer writes → draft
- Lawyer reviews and clicks approve → approved
- System sends email + publishes to dashboard → sent
- Lawyer can reject draft with notes → back to draft

### Document
```
uploaded → assigned → published
```
- Lawyer uploads to platform → uploaded
- Lawyer assigns to client(s), jurisdiction check runs → assigned
- Lawyer clicks publish → published (now visible to client)
- Unpublish at any time → returns to assigned

---

## Database Tables (Overview)

| Table | Purpose |
|---|---|
| `profiles` | All users (admin, lawyer, client) with role field |
| `companies` | Client company profiles |
| `jurisdictions` | Reference table (CBK, ODPC) |
| `client_jurisdictions` | Junction table — client ↔ jurisdiction |
| `documents` | Uploaded files with status, jurisdiction tag, storage path |
| `document_assignments` | Which documents are assigned to which clients |
| `briefings` | Regulatory briefings with status, jurisdiction, approved_by |
| `briefing_assignments` | Which briefings go to which clients |
| `chunks` | Document text chunks with pgvector embeddings for RAG |
| `audit_logs` | Every significant action logged |

---

## AI / RAG Pipeline

```
Document uploaded to Supabase Storage
→ Edge Function triggered on upload
→ Extract text from PDF
→ Split into chunks (500 tokens, 50 overlap)
→ Generate embeddings via Anthropic API
→ Store chunks + embeddings in chunks table (pgvector)

Client asks question in chat
→ Generate embedding of question
→ pgvector similarity search on chunks scoped to client's published docs only
→ Top K chunks retrieved
→ Passed as context to Claude API
→ Claude responds with grounded answer
→ Response streamed to client dashboard
```

---

## Email Flow

```
Briefing approved by lawyer
→ Supabase Edge Function triggered
→ Resend sends briefing email to assigned clients
→ Email uses React Email template (MNL brand: navy #1a2744, burgundy #8b1c3f)
→ Briefing status updated to "sent"
→ Audit log entry created
```

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```

---

## What Is Explicitly Out of Scope for MVP
- WhatsApp alerts
- CMA jurisdiction
- Self-signup
- Payment/billing infrastructure
- Mobile app
- Multi-language support
- Public API

Do not build any of the above even if asked. Redirect to post-summit roadmap.

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
