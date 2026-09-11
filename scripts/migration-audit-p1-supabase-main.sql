-- ============================================================
-- AUDITORIA P1 — MIGRATION PARA O SUPABASE PRINCIPAL
-- ============================================================
-- Projeto: jckkbsluvbejioyrlcfo
-- URL:     https://supabase.com/dashboard/project/jckkbsluvbejioyrlcfo/sql/new
--
-- APLICAR NO SUPABASE SQL EDITOR (login: clodoaldo608@gmail.com)
-- Após rodar, TODAS as páginas P1 (/admin/health, /admin/financeiro,
-- /admin/auditoria, /admin/leads-crm com Tarefas+Histórico) vão funcionar.
-- ============================================================

-- 1) lead_tasks — tarefas e lembretes por lead
CREATE TABLE IF NOT EXISTS lead_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT,
  assigned_to TEXT,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  done BOOLEAN DEFAULT false,
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) lead_history — REMOVIDA: usar tabela existente crm_lead_events (já populada pelo leads-crm PATCH)
-- (Nada a fazer aqui — o /api/admin/lead-history agora lê de crm_lead_events)

-- 3) audit_logs — auditoria de ações administrativas
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4) payment_events — webhook events do gateway (Kiwify/etc)
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT NOT NULL,
  event_id TEXT UNIQUE,
  order_id TEXT,
  status TEXT NOT NULL,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'BRL',
  raw_payload JSONB DEFAULT '{}'::jsonb,
  signature_valid BOOLEAN DEFAULT false,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- 5) Índices
CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead ON lead_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_due ON lead_tasks(due_at) WHERE done = false;
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_status ON payment_events(status, received_at DESC);

-- 6) RLS — service_role bypassa RLS, mas admin via anon key precisa destas policies
ALTER TABLE lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_tasks_all" ON lead_tasks;
DROP POLICY IF EXISTS "audit_logs_all" ON audit_logs;
DROP POLICY IF EXISTS "payment_events_all" ON payment_events;

CREATE POLICY "lead_tasks_all" ON lead_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "audit_logs_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "payment_events_all" ON payment_events FOR ALL USING (true) WITH CHECK (true);

-- 7) 7 templates transacionais (idempotente)
INSERT INTO email_templates (name, subject, preheader, body_html, trigger, active)
SELECT * FROM (VALUES
  ('Boas-vindas (novo lead)', 'Recebemos seu contato, {{nome}}! 🎉', 'Obrigado pelo interesse — em breve entrarei em contato.',
   '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Obrigado pelo seu interesse em meus serviços de criação de sites. Recebi seus dados e em até <strong>24 horas úteis</strong> entrarei em contato pelo WhatsApp.</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
   'welcome', true),
  ('Confirmação de briefing', 'Briefing recebido! (#{{briefing_id}})', 'Seu briefing foi registrado.',
   '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Confirmei o recebimento do seu briefing (<strong>#{{briefing_id}}</strong>). Em até <strong>48 horas</strong> envio uma proposta personalizada.</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
   'briefing_received', true),
  ('Carrinho abandonado', '{{nome}}, seu carrinho ainda está salvo 🛒', 'Finalize em 5 minutos.',
   '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Notei que você iniciou o checkout do serviço <strong>{{servico}}</strong> mas não finalizou.</p><p style="text-align:center;margin:24px 0;"><a href="{{checkout_url}}" style="background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Retomar checkout →</a></p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
   'abandoned_cart', true),
  ('Confirmação de compra', 'Pagamento confirmado! 🎉 (#{{order_id}})', 'Recebemos seu pagamento para {{servico}}.',
   '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Confirmamos o recebimento do seu pagamento de <strong>{{valor}}</strong> para o serviço <strong>{{servico}}</strong>.</p><p><strong>Próximos passos:</strong> Você receberá um link de briefing em até 1h.</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
   'purchase_confirmed', true),
  ('Entrega de produto digital', 'Seu acesso está liberado! 📚', 'Download/links para {{servico}}.',
   '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Seu produto digital <strong>{{servico}}</strong> está disponível!</p><p style="text-align:center;margin:24px 0;"><a href="{{link}}" style="background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Acessar conteúdo →</a></p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
   'digital_delivery', true),
  ('Mudança de status', 'Atualização do seu projeto: {{status}}', 'O status foi atualizado.',
   '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Atualização sobre seu projeto <strong>{{servico}}</strong>:</p><p style="background:#f5f5f5;padding:16px;border-radius:8px;text-align:center;font-weight:bold;font-size:18px;color:#10b981;">Status atual: {{status}}</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
   'status_update', true),
  ('Lead sem resposta (7 dias)', 'Ainda posso te ajudar, {{nome}}? 💬', 'Faz {{dias_sem_resposta}} dias que não falamos.',
   '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;"><p>Olá <strong>{{nome}}</strong>,</p><p>Faz <strong>{{dias_sem_resposta}} dias</strong> que não temos contato. Se quiser retomar, é só responder este email.</p><p>Abraço,<br/><strong>Clodoaldo Silva</strong></p></div>',
   'lead_no_response', true)
) AS t(name, subject, preheader, body_html, trigger, active)
WHERE NOT EXISTS (SELECT 1 FROM email_templates et WHERE et.trigger = t.trigger);

-- 8) Logs de auditoria de exemplo (para visualização imediata)
INSERT INTO audit_logs (actor, actor_role, action, entity, entity_id, details, created_at)
SELECT * FROM (VALUES
  ('clodoaldo608@gmail.com', 'admin', 'login', 'auth', NULL, '{"ip":"201.81.x.x","user_agent":"Chrome/SaoPaulo"}'::jsonb, now() - interval '5 minutes'),
  ('clodoaldo608@gmail.com', 'admin', 'view_page', 'admin', NULL, '{"page":"/admin/health"}'::jsonb, now() - interval '3 minutes'),
  ('clodoaldo608@gmail.com', 'admin', 'view_page', 'admin', NULL, '{"page":"/admin/orders"}'::jsonb, now() - interval '2 minutes'),
  ('clodoaldo608@gmail.com', 'admin', 'role_change', 'user_roles', NULL, '{"email":"clodoaldo608@gmail.com","role":"admin"}'::jsonb, now() - interval '1 minute'),
  ('system', 'system', 'weekly_report_sent', 'cron', NULL, '{"period":"7d","emails_sent":1,"telegram_sent":true}'::jsonb, now() - interval '2 days')
) AS v(actor, actor_role, action, entity, entity_id, details, created_at
);

-- 9) Verificação final
SELECT 'lead_tasks' AS tabela, COUNT(*) AS rows FROM lead_tasks
UNION ALL SELECT 'lead_history', COUNT(*) FROM lead_history
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL SELECT 'payment_events', COUNT(*) FROM payment_events
UNION ALL SELECT 'email_templates', COUNT(*) FROM email_templates;

-- ✅ Após rodar, aguarde 30s (Vercel redeploy) e acesse:
--    https://clodoaldo.vercel.app/admin/health        → ver status
--    https://clodoaldo.vercel.app/admin/financeiro    → ver reconciliação
--    https://clodoaldo.vercel.app/admin/auditoria     → ver 5 logs de exemplo
--    https://clodoaldo.vercel.app/admin/email         → ver 7 templates
--    https://clodoaldo.vercel.app/admin/leads-crm     → abrir lead → Tarefas/Histórico
