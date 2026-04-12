# RegWatch — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL (Frontend)                  │
│                  Next.js 14 App Router               │
│                                                      │
│  /login          → Supabase Auth                     │
│  /admin          → Admin dashboard (Zachary)         │
│  /lawyer         → Lawyer workspace                  │
│  /dashboard      → Client dashboard                  │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                    SUPABASE                          │
│                                                      │
│  Auth ──────────────► Role assigned on signup        │
│                        (admin / lawyer / client)     │
│                                                      │
│  PostgreSQL                                          │
│  ├── profiles                                        │
│  ├── companies                                       │
│  ├── jurisdictions (CBK | ODPC)                      │
│  ├── client_jurisdictions                            │
│  ├── documents ──────► status: uploaded              │
│  │                              → assigned           │
│  │                              → published          │
│  ├── document_assignments                            │
│  ├── briefings ──────► status: draft                 │
│  │                              → approved           │
│  │                              → sent               │
│  ├── briefing_assignments                            │
│  ├── chunks + pgvector embeddings                    │
│  └── audit_logs                                      │
│                                                      │
│  RLS Policies                                        │
│  ├── Clients see published=true + matching           │
│  │   jurisdiction only                               │
│  ├── Lawyers see their own clients only              │
│  └── Admin sees everything                           │
│                                                      │
│  Storage                                             │
│  └── /documents/{client_id}/{file}                   │
│                                                      │
│  Edge Functions                                      │
│  ├── on_document_upload → chunk → embed → store      │
│  ├── on_briefing_approved → trigger Resend email     │
│  └── weekly_briefing_cron → generate AI draft        │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌─────────────────────────────┐
│   ANTHROPIC      │   │           RESEND             │
│   Claude API     │   │                              │
│                  │   │  Briefing approved            │
│  RAG Chat:       │   │  → React Email template      │
│  Question        │   │  → Send to assigned clients  │
│  → embed         │   │  → MNL brand navy / burgundy │
│  → pgvector      │   └─────────────────────────────┘
│    similarity    │
│    search        │
│  → top K chunks  │
│  → Claude prompt │
│  → stream answer │
│    to client     │
└──────────────────┘
```

---

## Lawyer Workflow

```
Lawyer logs in
→ Creates client profile
   (company name, sector, jurisdiction: CBK | ODPC)
→ System sends magic link invite to client email
→ Client account status: pending_review

→ Uploads document
   → Jurisdiction tag set on upload
   → Jurisdiction check runs against client profile
   → Document status: uploaded (client cannot see it)

→ Assigns document to client(s)
   → Mismatch warning shown if jurisdiction does not match
   → Lawyer can override with reason logged
   → Document status: assigned

→ Clicks Publish
   → Document status: published
   → Client can now see it in dashboard
   → Audit log entry created

→ Writes or reviews AI-generated briefing draft
→ Edits if needed
→ Clicks Approve & Send
   → Briefing status: approved → sent
   → Edge Function fires
   → Resend email sent to assigned clients
   → Dashboard updated in real time
   → Audit log entry created
```

---

## Client Workflow

```
Client receives magic link
→ Sets password
→ Lands on personal dashboard

→ Sees published briefings (jurisdiction-matched only)
→ Opens and reads documents
→ Asks AI a question about a document
   → RAG query runs against their published docs only
   → Claude API responds, streamed to screen
   → No access to other clients' data at any point

→ Needs deeper guidance
   → Clicks "Book a Consultation" CTA
   → Routed to MNL intake form
   → This is the primary upsell moment
```

---

## Admin Workflow

```
Admin (Zachary) logs in
→ Full visibility: all clients, lawyers, briefings, documents
→ Views usage metrics
   (logins, briefings sent, documents published, chat queries)
→ Manages lawyer accounts (create, suspend, deactivate)
→ Reviews full audit log
→ Tracks pilot client status
→ Manually records billing against client records
```

---

## RAG Pipeline Detail

```
INGESTION
─────────
PDF uploaded to Supabase Storage
→ Edge Function: on_document_upload fires
→ Extract raw text from PDF
→ Split into chunks (500 tokens, 50 token overlap)
→ For each chunk:
   → Generate embedding via Anthropic API
   → Insert into chunks table with:
      - document_id
      - client_id
      - chunk_text
      - embedding (vector)
      - jurisdiction

RETRIEVAL
─────────
Client types question in chat
→ Generate embedding of question
→ pgvector cosine similarity search
   WHERE document.published = true
   AND document_assignment.client_id = auth.uid()
→ Return top 5 most relevant chunks
→ Build Claude prompt:
   [System: You are a regulatory compliance assistant for MNL Advocates.
    Answer using only the context provided. If unsure, say so.]
   [Context: {top 5 chunks}]
   [Question: {client question}]
→ Stream Claude response to client dashboard
```

---

## RLS Policy Logic

```sql
-- Clients see only published briefings assigned to them
-- with matching jurisdiction
CREATE POLICY "client_briefings"
ON briefings FOR SELECT
USING (
  status = 'sent'
  AND EXISTS (
    SELECT 1 FROM briefing_assignments ba
    WHERE ba.briefing_id = briefings.id
    AND ba.client_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM client_jurisdictions cj
    WHERE cj.client_id = auth.uid()
    AND cj.jurisdiction_id = briefings.jurisdiction_id
  )
);

-- Clients see only published documents assigned to them
-- with matching jurisdiction
CREATE POLICY "client_documents"
ON documents FOR SELECT
USING (
  status = 'published'
  AND EXISTS (
    SELECT 1 FROM document_assignments da
    WHERE da.document_id = documents.id
    AND da.client_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM client_jurisdictions cj
    WHERE cj.client_id = auth.uid()
    AND cj.jurisdiction_id = documents.jurisdiction_id
  )
);

-- Clients only query chunks from their own published documents
CREATE POLICY "client_chunks"
ON chunks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM documents d
    JOIN document_assignments da ON da.document_id = d.id
    WHERE d.id = chunks.document_id
    AND da.client_id = auth.uid()
    AND d.status = 'published'
  )
);
```

---

## Folder Structure

```
/reg-ai
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── admin/
│   │   ├── clients/
│   │   ├── lawyers/
│   │   ├── briefings/
│   │   ├── documents/
│   │   └── audit-logs/
│   ├── lawyer/
│   │   ├── clients/
│   │   ├── briefings/
│   │   └── documents/
│   └── dashboard/
│       ├── briefings/
│       ├── documents/
│       └── chat/
├── components/
│   ├── ui/
│   ├── admin/
│   ├── lawyer/
│   └── client/
├── lib/
│   ├── supabase/
│   ├── anthropic/
│   ├── resend/
│   └── rag/
├── supabase/
│   ├── migrations/
│   └── functions/
│       ├── on_document_upload/
│       ├── on_briefing_approved/
│       └── weekly_briefing_cron/
├── emails/
│   └── briefing-template.tsx
├── docs/
│   └── architecture.md
├── CLAUDE.md
├── .env.local
└── .gitignore
```
