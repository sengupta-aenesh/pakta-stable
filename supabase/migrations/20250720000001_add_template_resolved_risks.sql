-- Add resolved_risks column to contract_templates table for template risk management
ALTER TABLE contract_templates ADD COLUMN resolved_risks JSONB DEFAULT '[]';

-- Add index for better query performance on resolved risks
CREATE INDEX idx_contract_templates_resolved_risks ON contract_templates USING GIN(resolved_risks);

-- Add comment to document the column purpose
COMMENT ON COLUMN contract_templates.resolved_risks IS 'JSON array of resolved template risks with resolution metadata';