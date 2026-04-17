# Spec: Phase A — Gemini RAG Migration

**Status:** Awaiting implementation approval
**Author:** Zachary (MNL Advocates) + Claude Code
**Date:** April 15, 2026
**Roadmap ref:** Phase A (Apr 16–20)

---

## Objective

Replace two external API dependencies in the RAG pipeline with Google Gemini:

1. **Claude PDF extraction** (`anthropic-beta: pdfs-2024-09-25`) → Gemini 2.5 Flash (native PDF)
2. **Voyage AI embeddings** (`voyage-3`, 1024 dims) → `gemini-embedding-001` (3072 dims)

Claude is **kept** for chat generation. This is purely an infrastructure swap in the data ingestion layer and the query-embedding step.

**Why:** Consolidate from three AI billing relationships (Anthropic + Voyage + Anthropic) to two (Anthropic for chat, Google for everything else). Gemini's native PDF understanding is more robust than Claude's beta PDF API. Gemini embeddings at 3072 dims give significantly better retrieval quality than Voyage at 1024.

**Who is affected:** No end users — there are no live clients yet. The chunks table will be wiped and reprocessed.

**Success looks like:** A lawyer uploads a PDF → chunks appear in the DB with 3072-dim vectors → a client asks a question → the correct passage is retrieved → Claude streams a grounded answer. Voyage AI is called zero times. The Claude PDF extraction beta header is gone.

---

## Tech Stack

| Concern | Current | After |
|---|---|---|
| PDF extraction | Anthropic API (`pdfs-2024-09-25` beta) | Gemini 2.5 Flash (REST, inline base64) |
| Chunk embeddings | Voyage AI `voyage-3` — 1024 dims | `gemini-embedding-001` — 3072 dims |
| Query embedding | Voyage AI `voyage-3` | `gemini-embedding-001` — 3072 dims |
| Chat generation | Claude `claude-sonnet-4-20250514` | **Unchanged** |
| Runtime (edge fn) | Supabase Edge Function (Deno) | Unchanged |
| Runtime (chat) | Next.js API route (Node.js) | Unchanged |

**New dependency:** Google AI API key (`GOOGLE_API_KEY`)
**Removed dependency:** `VOYAGE_API_KEY`

No new npm packages required — both Google API calls will use raw `fetch()` for consistency across Node.js and Deno runtimes.

---

## Commands

```bash
# Dev server
npm run dev

# Type check
npx tsc --noEmit

# Deploy edge function (after changes)
npx supabase functions deploy on_document_upload

# Set Supabase edge function secret
npx supabase secrets set GOOGLE_API_KEY=<your-key>

# Unset old secret after migration confirmed
npx supabase secrets unset VOYAGE_API_KEY
```

---

## Project Structure — Files Touched

```
app/
  api/
    chat/
      route.ts          ← Replace embedQuery() Voyage call with Gemini

supabase/
  functions/
    on_document_upload/
      index.ts          ← Replace extractTextFromPdf() + embedChunks() with Gemini
  migrations/
    0003_gemini_embeddings.sql   ← NEW: alter vector dim + recreate index

specs/
  phase-a-gemini-migration.md   ← This file

.env.local                      ← Add GOOGLE_API_KEY, remove VOYAGE_API_KEY
```

No other files change. No UI changes. No schema changes beyond the vector column type.

---

## API Reference

### Gemini PDF Extraction

**Approach:** Inline base64 — same pattern as current Claude call. No Files API needed for documents under 100MB.

**Model:** `gemini-2.5-flash`
**Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
**Auth:** `x-goog-api-key: <GOOGLE_API_KEY>` header

**Request body:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "inline_data": {
            "mime_type": "application/pdf",
            "data": "<base64-encoded-pdf>"
          }
        },
        {
          "text": "Extract and return the full text content of this document. Return only the extracted text, no commentary."
        }
      ]
    }
  ]
}
```

**Response:** Text at `candidates[0].content.parts[0].text`

---

### Gemini Embeddings

**Model:** `gemini-embedding-001`
**Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`
**Auth:** `x-goog-api-key: <GOOGLE_API_KEY>` header
**Output dims:** 3072 (set via `outputDimensionality`)

**Request body (document, for chunks):**
```json
{
  "model": "models/gemini-embedding-001",
  "content": {
    "parts": [{ "text": "chunk text here" }]
  },
  "taskType": "RETRIEVAL_DOCUMENT",
  "outputDimensionality": 3072
}
```

**Request body (query, for user questions):**
```json
{
  "model": "models/gemini-embedding-001",
  "content": {
    "parts": [{ "text": "user question here" }]
  },
  "taskType": "RETRIEVAL_QUERY",
  "outputDimensionality": 3072
}
```

**Response:** Vector at `embedding.values` (array of 3072 floats)

**Note:** Gemini embeddings API does not support batch requests. Each chunk must be embedded individually. The current Voyage batching loop (64 chunks at a time) must be replaced with sequential calls. For regulatory PDFs (typically 5–50 chunks), this is acceptable.

---

## Database Migration

**File:** `supabase/migrations/0003_gemini_embeddings.sql`

```sql
-- Wipe existing chunks (no live clients, safe to clear)
TRUNCATE TABLE chunks;

-- Change embedding column from 1024 to 3072 dimensions
ALTER TABLE chunks
  ALTER COLUMN embedding TYPE vector(3072);

-- Drop old index
DROP INDEX IF EXISTS chunks_embedding_idx;

-- Recreate ivfflat index for new dimensions
-- Use lists = sqrt(expected_rows). For small datasets, 10 is fine.
CREATE INDEX chunks_embedding_idx
  ON chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);
```

**Also update `match_chunks()` RPC** if it has a hardcoded dimension — check the function definition and update accordingly.

---

## Code Style

Raw `fetch()` is used throughout — no SDK. Keep functions small and named after what they do. Error messages include the HTTP status and response body for debugging.

```typescript
// Good — named, typed, throws with context
async function embedText(text: string, taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'): Promise<number[]> {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': GOOGLE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
        taskType,
        outputDimensionality: 3072,
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini embedding failed: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.embedding.values as number[]
}
```

---

## Testing Strategy

No automated test suite exists for the API routes. Verification is manual and end-to-end.

**Verification steps (in order):**

1. **DB migration** — Run migration, confirm `\d chunks` shows `vector(3072)`, index present
2. **Edge function locally** — `supabase functions serve on_document_upload`, POST a test payload, confirm chunks inserted with 3072-dim vectors
3. **Upload via UI** — Upload a real PDF through the lawyer portal, check `chunks` table in Supabase dashboard — rows should appear with non-null embeddings
4. **Chat end-to-end** — As a client (or using curl), ask a question about the uploaded document — confirm a grounded answer is returned
5. **Voyage zero calls** — Confirm no `VOYAGE_API_KEY` is referenced anywhere in running code (`grep -r "voyageai" .` returns nothing outside node_modules)

---

## Boundaries

**Always do:**
- Use `taskType: RETRIEVAL_DOCUMENT` when embedding chunks, `RETRIEVAL_QUERY` when embedding user questions — this affects retrieval quality
- Keep `outputDimensionality: 3072` consistent between ingestion and query — mismatched dims will silently return garbage results
- Wipe chunks before migration, not after — altering a populated vector column will fail
- Test with a real PDF, not a synthetic one — text extraction quality matters

**Ask first:**
- Changing the embedding model from `gemini-embedding-001` to anything else (requires re-migration + reprocessing)
- Changing output dimensions (requires re-migration + reprocessing)
- Adding the Files API (changes the ingestion flow significantly for large PDFs)

**Never do:**
- Mix embedding models or dimensions across ingestion and query — will break retrieval silently
- Commit `GOOGLE_API_KEY` to git
- Remove `ANTHROPIC_API_KEY` — Claude is still used for chat generation
- Leave `VOYAGE_API_KEY` referenced in code after migration is confirmed

---

## Success Criteria

- [ ] `chunks.embedding` column is `vector(3072)` in production schema
- [ ] A PDF uploaded through the lawyer portal produces chunk rows with non-null 3072-dim embeddings
- [ ] A client question retrieves relevant chunks (similarity > 0.65) and Claude returns a grounded answer
- [ ] `VOYAGE_API_KEY` is removed from `.env.local` and Supabase secrets
- [ ] `grep -r "voyageai" .` (excluding node_modules) returns no results
- [ ] No Anthropic PDF beta header (`anthropic-beta: pdfs-2024-09-25`) remains in any function
- [ ] `GOOGLE_API_KEY` is set in `.env.local`, Supabase edge function secrets, and (later) Vercel

---

## Open Questions

None — all assumptions confirmed by Zachary on April 15, 2026:
- Google AI API key: not yet obtained (prerequisite step)
- Embedding dims: 3072
- Chat generation: keep Claude
- Existing chunks: safe to wipe (no live clients)
- Supabase project: existing REGAI project

---

## Prerequisites (Before Implementation Starts)

1. **Get a Google AI API key**
   - Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Create a new key
   - Add to `.env.local` as `GOOGLE_API_KEY=...`
   - Add to Supabase edge function secrets: `npx supabase secrets set GOOGLE_API_KEY=...`

2. **Run DB migration** before touching any code — the column type change must happen first

3. **Confirm `match_chunks()` RPC** — read the current function definition and check if vector dimension is hardcoded
