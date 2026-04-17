-- Phase A (Gemini): Cleanup legacy RAG pipeline
-- Drops the chunks table, policies, indexes, and vector search RPC.

-- 1. Drop policies
DROP POLICY IF EXISTS "client_chunks" ON chunks;
DROP POLICY IF EXISTS "Internal chunks access" ON chunks;

-- 2. Drop the table (this will automatically drop associated indexes)
DROP TABLE IF EXISTS chunks CASCADE;

-- 3. Drop the RPC
DROP FUNCTION IF EXISTS match_chunks(vector, float, int, uuid);
