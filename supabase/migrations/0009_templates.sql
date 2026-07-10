-- Reusable briefing & document templates (firm-internal starter content).
-- Templates are authored/maintained by lawyers and admins and are never
-- exposed to clients — they are the starting point a lawyer adapts before a
-- briefing or compliance document ever reaches a client.

-- Which content pipeline a template feeds
CREATE TYPE template_kind AS ENUM ('briefing', 'document');

-- Library grouping shown in the UI
CREATE TYPE template_category AS ENUM (
  'regulatory_briefing',
  'data_protection',
  'banking_fintech',
  'board_reporting',
  'client_onboarding'
);

CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  kind template_kind NOT NULL,
  category template_category NOT NULL,
  -- Jurisdiction tag as free text ('CBK', 'ODPC', 'General') — a template can
  -- be jurisdiction-agnostic, so this is intentionally not an FK.
  jurisdiction TEXT NOT NULL DEFAULT 'General',
  description TEXT NOT NULL,
  body TEXT NOT NULL,             -- the fill-in-the-blanks starter content
  adaptation_notes TEXT,          -- what to change for the Kenya/CBK/ODPC context
  source TEXT,                    -- attribution for the underlying template
  source_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON templates(category, sort_order);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Internal-only: lawyers and admins can read and manage. Clients get no policy,
-- so RLS denies them entirely.
CREATE POLICY "Internal manage templates" ON templates
  FOR ALL USING (is_lawyer() OR is_admin());
