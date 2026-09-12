-- Adicionar coluna prospect_id em crm_leads pra sincronizar com clodoaldo_prospects
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS prospect_id TEXT;

-- Índice pra busca rápida
CREATE INDEX IF NOT EXISTS idx_crm_leads_prospect_id ON crm_leads(prospect_id) WHERE prospect_id IS NOT NULL;

-- Verificação
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'crm_leads' AND column_name = 'prospect_id';
