---
status: accepted
date: 2026-04-17
---

# 0001: Use Gemini File Search for the entire RAG pipeline

## Context

The original RAG pipeline split responsibilities across three AI billing relationships: Anthropic Claude did PDF extraction (via the `pdfs-2024-09-25` beta header) and chat generation, while Voyage AI (`voyage-3`, 1024 dims) produced embeddings for a hand-rolled `chunks` table queried through a Postgres `match_chunks` RPC over pgvector.

`specs/phase-a-gemini-migration.md` proposed a narrower swap: replace Claude's PDF extraction and Voyage's embeddings with Gemini (`gemini-embedding-001`, 3072 dims), while keeping Claude for chat generation. The stated goal was consolidating from three AI vendors to two, plus better retrieval quality from higher-dimensional embeddings.

## Decision

Implementation went further than the spec. Instead of swapping in Gemini embeddings alongside a self-managed vector store, we adopted the **Gemini File Search API** end-to-end: it handles chunking, embedding, indexing, retrieval, *and* answer generation in a single `generateContent` call with a `fileSearch` tool. This eliminated the `chunks` table and `match_chunks` RPC entirely (dropped in migration `0007_cleanup_rag.sql`) and removed Claude from the pipeline altogether — `ANTHROPIC_API_KEY` is retained in the environment but is not called anywhere in the current architecture.

Each client gets an isolated Gemini `FileSearchStore` (`companies.gemini_store_name`), so the `fileSearch` tool is always scoped to one client's documents — cross-client leakage is impossible by construction, not by query-time filtering.

We considered keeping Claude for generation with Gemini only handling retrieval, matching the original spec. We rejected it: splitting retrieval and generation across two vendors reintroduces the "stitch citations back to model output" complexity File Search removes for free, for no retrieval-quality benefit once Gemini was already in the loop.

## Consequences

- **One less moving part.** No pgvector, no manual chunking, no embedding pipeline to maintain or re-run when chunking strategy changes.
- **Single AI vendor for the whole document pipeline.** Anthropic billing is now zero for this product; `ANTHROPIC_API_KEY` sitting unused in the environment is intentional, not dead config — see `CLAUDE.md`.
- **Retrieval quality is now entirely Google's implementation**, not tunable via custom chunking/embedding choices. Acceptable given no complaints surfaced pre-launch, but revisit if retrieval quality becomes a client-facing complaint.
- **Vendor lock-in to Gemini File Search's current API shape.** If Google changes pricing or deprecates File Search, this is a full pipeline rewrite, not a swap of one embedding call.
- Anyone reading only the Phase A spec will get a narrower picture than what shipped — this ADR is the record of what actually happened.
