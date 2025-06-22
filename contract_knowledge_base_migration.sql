-- Contract templates and knowledge base
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'employment', 'nda', 'service', 'consulting', etc.
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'agreement', 'contract', 'terms'
  jurisdiction TEXT DEFAULT 'US',
  tags TEXT[], -- searchable tags
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract sections - modular components
CREATE TABLE contract_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES contract_templates(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'preamble', 'parties', 'terms', 'payment', etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- The actual legal text
  variables JSONB DEFAULT '[]', -- Variables that can be extracted
  order_index INTEGER DEFAULT 0,
  is_optional BOOLEAN DEFAULT false,
  conditions JSONB, -- When this section should be included
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract clauses - reusable legal language
CREATE TABLE contract_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clause_type TEXT NOT NULL, -- 'confidentiality', 'termination', 'liability', etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  use_cases TEXT[], -- When to use this clause
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key parameters for different contract types
CREATE TABLE contract_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type TEXT NOT NULL,
  parameter_key TEXT NOT NULL,
  parameter_label TEXT NOT NULL,
  parameter_type TEXT NOT NULL, -- 'text', 'date', 'number', 'currency', 'select'
  is_required BOOLEAN DEFAULT true,
  validation_rules JSONB,
  help_text TEXT,
  example_value TEXT,
  options JSONB, -- For select type
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract generation sessions
CREATE TABLE contract_creation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  initial_request TEXT NOT NULL,
  detected_type TEXT,
  collected_parameters JSONB DEFAULT '{}',
  conversation_history JSONB DEFAULT '[]',
  agent_state JSONB DEFAULT '{}',
  generated_contract TEXT,
  editable_fields JSONB DEFAULT '[]',
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add creation_session_id to existing contracts table
ALTER TABLE contracts ADD COLUMN creation_session_id UUID REFERENCES contract_creation_sessions(id);

-- Create indexes for better search performance
CREATE INDEX idx_contract_templates_type ON contract_templates(type);
CREATE INDEX idx_contract_templates_tags ON contract_templates USING GIN(tags);
CREATE INDEX idx_contract_sections_template ON contract_sections(template_id);
CREATE INDEX idx_contract_clauses_type ON contract_clauses(clause_type);
CREATE INDEX idx_contract_clauses_tags ON contract_clauses USING GIN(tags);

-- Enable full-text search
ALTER TABLE contract_templates ADD COLUMN search_vector tsvector;
ALTER TABLE contract_sections ADD COLUMN search_vector tsvector;
ALTER TABLE contract_clauses ADD COLUMN search_vector tsvector;

-- Update search vectors for contract_templates
CREATE OR REPLACE FUNCTION update_templates_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update search vectors for contract_sections
CREATE OR REPLACE FUNCTION update_sections_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.content, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update search vectors for contract_clauses
CREATE OR REPLACE FUNCTION update_clauses_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.content, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_search_vector 
  BEFORE INSERT OR UPDATE ON contract_templates 
  FOR EACH ROW EXECUTE PROCEDURE update_templates_search_vector();

CREATE TRIGGER update_sections_search_vector 
  BEFORE INSERT OR UPDATE ON contract_sections 
  FOR EACH ROW EXECUTE PROCEDURE update_sections_search_vector();

CREATE TRIGGER update_clauses_search_vector 
  BEFORE INSERT OR UPDATE ON contract_clauses 
  FOR EACH ROW EXECUTE PROCEDURE update_clauses_search_vector();