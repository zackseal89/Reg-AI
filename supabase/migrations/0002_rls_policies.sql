ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is lawyer
CREATE OR REPLACE FUNCTION is_lawyer() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'lawyer'
  );
$$ LANGUAGE sql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- PROFILES
--------------------------------------------------------------------------------
-- Users can see their own profile
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (id = auth.uid());
-- Lawyers can see their own clients' profiles (simplification: lawyers see all clients for MVP)
CREATE POLICY "Lawyers view all profiles" ON profiles FOR SELECT USING (is_lawyer() OR is_admin());
-- Admins have full access
CREATE POLICY "Admin full profile access" ON profiles FOR ALL USING (is_admin());

--------------------------------------------------------------------------------
-- JURISDICTIONS & COMPANIES
--------------------------------------------------------------------------------
-- Everyone can view jurisdictions and companies
CREATE POLICY "Public view jurisdictions" ON jurisdictions FOR SELECT USING (true);
CREATE POLICY "Public view companies" ON companies FOR SELECT USING (true);

--------------------------------------------------------------------------------
-- CLIENT JURISDICTIONS
--------------------------------------------------------------------------------
CREATE POLICY "Users view own linked jurisdictions" ON client_jurisdictions FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Lawyers view all client jurisdictions" ON client_jurisdictions FOR SELECT USING (is_lawyer() OR is_admin());

--------------------------------------------------------------------------------
-- BRIEFINGS
--------------------------------------------------------------------------------
-- Clients see only published briefings assigned to them with matching jurisdiction
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
-- Lawyers and admins see all briefings
CREATE POLICY "Lawyer and Admin view all briefings" ON briefings FOR ALL USING (is_lawyer() OR is_admin());

--------------------------------------------------------------------------------
-- DOCUMENTS
--------------------------------------------------------------------------------
-- Clients see only published documents assigned to them with matching jurisdiction
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
-- Lawyers and admins see all documents
CREATE POLICY "Lawyer and Admin view all docs" ON documents FOR ALL USING (is_lawyer() OR is_admin());

--------------------------------------------------------------------------------
-- CHUNKS
--------------------------------------------------------------------------------
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
-- Internal users see all chunks
CREATE POLICY "Internal chunks access" ON chunks FOR ALL USING (is_lawyer() OR is_admin());

--------------------------------------------------------------------------------
-- ASSIGNMENTS
--------------------------------------------------------------------------------
CREATE POLICY "Client view own doc assignments" ON document_assignments FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Client view own briefing assignments" ON briefing_assignments FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Internal view all assignments" ON document_assignments FOR ALL USING (is_lawyer() OR is_admin());
CREATE POLICY "Internal view all briefing assigns" ON briefing_assignments FOR ALL USING (is_lawyer() OR is_admin());

--------------------------------------------------------------------------------
-- AUDIT LOGS
--------------------------------------------------------------------------------
CREATE POLICY "Admins only audit logs" ON audit_logs FOR ALL USING (is_admin());
