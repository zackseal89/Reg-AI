-- Phase 4: RAG pipeline — chunks schema + match_chunks RPC

-- Add missing columns to chunks table
ALTER TABLE chunks
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS jurisdiction_id UUID REFERENCES jurisdictions(id),
  ADD COLUMN IF NOT EXISTS chunk_index INTEGER NOT NULL DEFAULT 0;

-- Fix embedding column to fixed dimension (voyage-3 outputs 1024 dimensions)
ALTER TABLE chunks ALTER COLUMN embedding TYPE vector(1024);

-- ivfflat index for cosine similarity
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_chunks_client_id ON chunks(client_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);

-- Add processing tracking to documents
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS processed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- match_chunks RPC
-- Returns top-K chunks with similarity score, document title, and document type
-- scoped strictly to published documents assigned to the given client.
-- SECURITY DEFINER so the service role can call it from edge functions;
-- p_client_id is always validated against document_assignments.
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  p_client_id uuid
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  similarity float,
  document_id uuid,
  document_title text,
  document_type text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.chunk_text,
    1 - (c.embedding <=> query_embedding) AS similarity,
    c.document_id,
    d.title  AS document_title,
    d.doc_type::text AS document_type
  FROM chunks c
  JOIN documents d  ON d.id  = c.document_id
  JOIN document_assignments da ON da.document_id = c.document_id
  WHERE
    da.client_id = p_client_id
    AND d.status = 'published'
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;
