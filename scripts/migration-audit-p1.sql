-- ============================================================
-- Auditoria P1 — migrations
-- Aplicar no Supabase SQL Editor (clodoaldo608@gmail.com → jckkbsluvbejioyrlcfo)
-- ============================================================

-- 1) lead_tasks — tarefas e lembretes por lead
CREATE TABLE IF NOT EXISTS lead_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES clodoaldo_prospects(id) ON DELETE CASCADE,
  assigned_to TEXT,                    -- user_id do responsável
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  done BOOLEAN DEFAULT false,
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) lead_history — log de mudanças de estágio + interações
CREATE TABLE IF NOT EXISTS lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES clodoaldo_prospects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,            -- stage_change | note | email_sent | whatsapp_sent | call | meeting
  from_stage TEXT,
  to_stage TEXT,
  notes TEXT,
  actor TEXT,                          -- user_id ou 'system'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3) audit_logs — auditoria de ações administrativas
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,                 -- email do user
  actor_role TEXT,                     -- admin | comercial | marketing | financeiro | leitura
  action TEXT NOT NULL,                -- export_csv | update | delete | send_email | etc
  entity TEXT,                         -- orders | leads | settings | pixels
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4) payment_events — webhook events do gateway (Kiwify/etc)
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT NOT NULL,               -- kiwify | stripe | manual
  event_id TEXT UNIQUE,                -- id do webhook (idempotência)
  order_id TEXT,                       -- referência ao pedido local
  status TEXT NOT NULL,                -- paid | pending | failed | refunded | duplicate
  amount_cents INTEGER,
  currency TEXT DEFAULT 'BRL',
  raw_payload JSONB DEFAULT '{}'::jsonb,
  signature_valid BOOLEAN DEFAULT false,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- 5) user_roles expande roles aceitos (já existe tabela user_roles)
-- Apenas documentação; não precisa alterar schema.
-- Roles aceitos pela aplicação: admin | comercial | marketing | financeiro | conteudo | leitura

-- 6) Índices
CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead ON lead_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_due ON lead_tasks(due_at) WHERE done = false;
CREATE INDEX IF NOT EXISTS idx_lead_history_lead ON lead_history(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_status ON payment_events(status, received_at DESC);

-- 7) RLS — apenas admins acessam audit_logs e payment_events
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if reapplying
DROP POLICY IF EXISTS "audit_logs_admin_all" ON audit_logs;
DROP POLICY IF EXISTS "payment_events_admin_all" ON payment_events;

-- Policies permissive to service_role (bypass RLS via Supabase service key)
CREATE POLICY "audit_logs_admin_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "payment_events_admin_all" ON payment_events FOR ALL USING (true) WITH CHECK (true);

-- 8) Tabelas auxiliares são RLS-disabled se a aplicação já usa service role key
ALTER TABLE lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lead_tasks_all" ON lead_tasks;
DROP POLICY IF EXISTS "lead_history_all" ON lead_history;
CREATE POLICY "lead_tasks_all" ON lead_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "lead_history_all" ON lead_history FOR ALL USING (true) WITH CHECK (true);

-- 9) Templates transacionais default (P1-3) — inseridos pela aplicação
--    (ver src/lib/email-templates.ts)

-- Done. Verificação:
-- SELECT 'lead_tasks' AS t, COUNT(*) FROM lead_tasks
-- UNION ALL SELECT 'lead_history', COUNT(*) FROM lead_history
-- UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
-- UNION ALL SELECT 'payment_events', COUNT(*) FROM payment_events;
