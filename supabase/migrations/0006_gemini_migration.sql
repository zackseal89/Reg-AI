-- Phase A: Gemini File Search migration
-- Add FileSearchStore reference to companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS gemini_store_name TEXT;

-- Add gemini_file_id to documents for delete-on-unpublish
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS gemini_file_id TEXT;
