-- Legal Profiles and Template System Migration
-- Run this in your Supabase SQL Editor

-- 1. Add legal profile fields to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_jurisdiction TEXT DEFAULT 'united-states';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS additional_jurisdictions TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS regulatory_requirements TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS risk_tolerance TEXT DEFAULT 'medium';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_legal_counsel BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS legal_context JSONB DEFAULT '{}';

-- 2. Create contract templates table
CREATE TABLE IF NOT EXISTS contract_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_type TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    title TEXT NOT NULL,
    template_content TEXT NOT NULL,
    extracted_clauses TEXT[] DEFAULT '{}',
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
    legal_compliance JSONB DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_validated TIMESTAMP WITH TIME ZONE
);

-- 3. Create contract legal metadata table
CREATE TABLE IF NOT EXISTS contract_legal_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    applicable_jurisdictions TEXT[] DEFAULT '{}',
    governing_law TEXT,
    compliance_requirements TEXT[] DEFAULT '{}',
    risk_assessment JSONB DEFAULT '{}',
    template_sources_used TEXT[] DEFAULT '{}',
    agent_insights JSONB DEFAULT '{}',
    cross_border_considerations TEXT[] DEFAULT '{}',
    quality_scores JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(contract_id)
);

-- 4. Create contract template usage tracking
CREATE TABLE IF NOT EXISTS contract_template_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES contract_templates(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    usage_type TEXT NOT NULL CHECK (usage_type IN ('primary', 'supplementary', 'clause_extraction')),
    adaptation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contract_templates_type_jurisdiction ON contract_templates(contract_type, jurisdiction);
CREATE INDEX IF NOT EXISTS idx_contract_templates_quality ON contract_templates(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_contract_templates_validation ON contract_templates(validation_status);
CREATE INDEX IF NOT EXISTS idx_contract_legal_metadata_contract ON contract_legal_metadata(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_template_usage_template ON contract_template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_profiles_jurisdiction ON profiles(primary_jurisdiction);

-- 6. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON contract_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_legal_metadata_updated_at BEFORE UPDATE ON contract_legal_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable RLS (Row Level Security) for all new tables
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_legal_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_template_usage ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies

-- Contract templates are readable by all authenticated users (public templates)
CREATE POLICY "Contract templates are viewable by authenticated users" ON contract_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only system can insert/update contract templates (admin controlled)
CREATE POLICY "Only system can manage contract templates" ON contract_templates
    FOR ALL USING (auth.uid() IS NOT NULL AND auth.jwt() ->> 'role' = 'service_role');

-- Contract legal metadata is accessible by contract owners
CREATE POLICY "Users can view their contract legal metadata" ON contract_legal_metadata
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_legal_metadata.contract_id 
            AND contracts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their contract legal metadata" ON contract_legal_metadata
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_legal_metadata.contract_id 
            AND contracts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their contract legal metadata" ON contract_legal_metadata
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_legal_metadata.contract_id 
            AND contracts.user_id = auth.uid()
        )
    );

-- Template usage is tracked per user
CREATE POLICY "Users can view their template usage" ON contract_template_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_template_usage.contract_id 
            AND contracts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can track their template usage" ON contract_template_usage
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_template_usage.contract_id 
            AND contracts.user_id = auth.uid()
        )
    );

-- 9. Insert sample contract templates for testing
INSERT INTO contract_templates (
    contract_type, 
    jurisdiction, 
    source, 
    source_url, 
    title, 
    template_content, 
    extracted_clauses, 
    quality_score, 
    validation_status,
    legal_compliance,
    features
) VALUES 
(
    'employment',
    'United States',
    'Legal Templates Library',
    'https://legaltemplates.net/employment-contract',
    'Standard Employment Agreement Template',
    'EMPLOYMENT AGREEMENT\n\nThis Employment Agreement is entered into on [DATE] between [COMPANY NAME] and [EMPLOYEE NAME].\n\n1. POSITION AND DUTIES\n[POSITION DETAILS]\n\n2. COMPENSATION\n[SALARY DETAILS]\n\n3. BENEFITS\n[BENEFITS DETAILS]\n\n4. TERMINATION\n[TERMINATION CLAUSES]',
    ARRAY['At-will employment', 'Compensation terms', 'Benefits package', 'Termination procedures'],
    88,
    'validated',
    '{"jurisdictionSpecific": true, "regulatoryCompliance": true, "industryStandards": true, "recentUpdates": true}'::jsonb,
    ARRAY['Professionally drafted', 'State-compliant', 'Balanced terms', 'Modern language']
),
(
    'nda',
    'United States',
    'Harvard Law School Library',
    'https://hls.harvard.edu/library/nda-template',
    'Mutual Non-Disclosure Agreement',
    'NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement is entered into between [PARTY 1] and [PARTY 2].\n\n1. CONFIDENTIAL INFORMATION\n[DEFINITION]\n\n2. OBLIGATIONS\n[OBLIGATIONS DETAILS]\n\n3. TERM\n[DURATION]\n\n4. REMEDIES\n[BREACH REMEDIES]',
    ARRAY['Confidentiality definition', 'Mutual obligations', 'Term duration', 'Breach remedies'],
    92,
    'validated',
    '{"jurisdictionSpecific": true, "regulatoryCompliance": true, "industryStandards": true, "recentUpdates": true}'::jsonb,
    ARRAY['Mutual protection', 'Harvard-reviewed', 'Clear definitions', 'Enforceable terms']
),
(
    'service',
    'United States',
    'American Bar Association',
    'https://aba.org/contract-templates/service-agreement',
    'Professional Services Agreement',
    'SERVICE AGREEMENT\n\nThis Service Agreement is entered into between [SERVICE PROVIDER] and [CLIENT].\n\n1. SERVICES\n[SERVICE DESCRIPTION]\n\n2. PAYMENT\n[PAYMENT TERMS]\n\n3. TIMELINE\n[PROJECT TIMELINE]\n\n4. INTELLECTUAL PROPERTY\n[IP TERMS]',
    ARRAY['Scope of work', 'Payment schedule', 'Timeline', 'IP ownership', 'Termination rights'],
    90,
    'validated',
    '{"jurisdictionSpecific": true, "regulatoryCompliance": true, "industryStandards": true, "recentUpdates": true}'::jsonb,
    ARRAY['ABA-approved', 'Comprehensive scope', 'Fair payment terms', 'IP protection']
);

-- 10. Grant necessary permissions
GRANT SELECT ON contract_templates TO authenticated;
GRANT ALL ON contract_legal_metadata TO authenticated;
GRANT ALL ON contract_template_usage TO authenticated;

-- 11. Create helpful views for the application
CREATE OR REPLACE VIEW contract_with_legal_metadata AS
SELECT 
    c.*,
    clm.applicable_jurisdictions,
    clm.governing_law,
    clm.compliance_requirements,
    clm.risk_assessment,
    clm.template_sources_used,
    clm.agent_insights,
    clm.cross_border_considerations,
    clm.quality_scores
FROM contracts c
LEFT JOIN contract_legal_metadata clm ON c.id = clm.contract_id;

-- Grant access to the view
GRANT SELECT ON contract_with_legal_metadata TO authenticated;

COMMENT ON TABLE contract_templates IS 'Stores validated contract templates from authoritative legal sources';
COMMENT ON TABLE contract_legal_metadata IS 'Stores legal metadata and AI insights for contracts';
COMMENT ON TABLE contract_template_usage IS 'Tracks which templates were used for each contract';
COMMENT ON VIEW contract_with_legal_metadata IS 'Combined view of contracts with their legal metadata';