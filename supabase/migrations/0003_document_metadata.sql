-- Document type enum
CREATE TYPE document_type AS ENUM (
  'circular',
  'gazette_notice',
  'guideline',
  'regulation',
  'policy',
  'directive',
  'amendment',
  'consultation_paper',
  'other'
);

-- Add metadata columns to documents
ALTER TABLE documents
  ADD COLUMN description TEXT,
  ADD COLUMN doc_type document_type DEFAULT 'other',
  ADD COLUMN reference_number TEXT,
  ADD COLUMN issuing_body TEXT,
  ADD COLUMN effective_date DATE,
  ADD COLUMN summary TEXT,
  ADD COLUMN file_name TEXT,
  ADD COLUMN file_size_bytes BIGINT;
