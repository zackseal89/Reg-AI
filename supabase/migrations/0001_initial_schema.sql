-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'lawyer', 'client');
CREATE TYPE document_status AS ENUM ('uploaded', 'assigned', 'published');
CREATE TYPE briefing_status AS ENUM ('draft', 'approved', 'sent');

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'client' NOT NULL,
  company_id UUID, -- Will be referenced correctly below
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES companies(id);

-- Jurisdictions
CREATE TABLE jurisdictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, 
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Jurisdictions (Many-to-many)
CREATE TABLE client_jurisdictions (
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  jurisdiction_id UUID REFERENCES jurisdictions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (client_id, jurisdiction_id)
);

-- Documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status document_status DEFAULT 'uploaded',
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Assignments
CREATE TABLE document_assignments (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (document_id, client_id)
);

-- Briefings
CREATE TABLE briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status briefing_status DEFAULT 'draft',
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  author_id UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Briefing Assignments
CREATE TABLE briefing_assignments (
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (briefing_id, client_id)
);

-- Chunks (for RAG)
CREATE TABLE chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding vector,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic indexes for RLS lookup scaling
CREATE INDEX idx_client_jurisdictions_client ON client_jurisdictions(client_id);
CREATE INDEX idx_document_assignments_client ON document_assignments(client_id);
CREATE INDEX idx_briefing_assignments_client ON briefing_assignments(client_id);
