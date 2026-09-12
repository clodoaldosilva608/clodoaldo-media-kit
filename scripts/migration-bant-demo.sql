-- ============================================================
-- MIGRATION — BANT + site_status no CRM (método Gabriel Miranda)
-- ============================================================
-- Aplicar no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jckkbsluvbejioyrlcfo/sql/new
-- ============================================================

-- 1) Adicionar colunas BANT (checklist de qualificação)
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS bant_budget BOOLEAN DEFAULT false;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS bant_authority BOOLEAN DEFAULT false;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS bant_need BOOLEAN DEFAULT false;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS bant_timing BOOLEAN DEFAULT false;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS bant_notes TEXT;

-- 2) Adicionar coluna site_status (detecção de site quebrado)
-- Valores: ok | broken | slow | ssl_invalid | no_site | unknown
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS site_status TEXT DEFAULT 'unknown';
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS site_checked_at TIMESTAMPTZ;

-- 3) Adicionar coluna demo_url (link do preview gerado)
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS demo_url TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS demo_generated_at TIMESTAMPTZ;

-- 4) Verificação
SELECT
  'BANT columns' AS check_name,
  COUNT(*) FILTER (WHERE column_name LIKE 'bant%') AS count
FROM information_schema.columns
WHERE table_name = 'crm_leads' AND column_name LIKE 'bant%'
UNION ALL
SELECT
  'site_status column',
  COUNT(*) FILTER (WHERE column_name = 'site_status')
FROM information_schema.columns
WHERE table_name = 'crm_leads' AND column_name = 'site_status'
UNION ALL
SELECT
  'demo columns',
  COUNT(*) FILTER (WHERE column_name LIKE 'demo%')
FROM information_schema.columns
WHERE table_name = 'crm_leads' AND column_name LIKE 'demo%';

-- ✅ Após rodar, o /admin/leads-crm vai mostrar:
--    - Botão "Gerar Demo" no modal do lead
--    - Checklist BANT (Budget / Authority / Need / Timing)
--    - Status do site (ok / broken / sem site) quando disponível
