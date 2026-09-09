-- ============================================================
-- Portal de Aprovação de Projetos — Schema
-- ============================================================

-- 1. Configurações globais (singleton)
CREATE TABLE IF NOT EXISTS approval_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pix_key TEXT,
  pix_key_type TEXT CHECK (pix_key_type IN ('cpf','cnpj','email','phone','random')),
  pix_recipient_name TEXT,
  whatsapp_for_receipts TEXT,
  default_max_revisions INTEGER DEFAULT 3,
  web3forms_access_key TEXT,
  notification_email TEXT,
  default_theme TEXT CHECK (default_theme IN ('dark','light','system')) DEFAULT 'system',
  limit_reached_message TEXT DEFAULT 'Você atingiu o limite de revisões gratuitas. Próximas revisões podem ter custos adicionais. Deseja continuar?',
  out_of_scope_message TEXT DEFAULT 'Esta alteração está fora do escopo combinado e pode ter custo adicional.',
  brand_name TEXT DEFAULT 'Clodoaldo Silva',
  brand_logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO approval_settings (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 2. Projetos de aprovação
CREATE TABLE IF NOT EXISTS approval_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_token TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_whatsapp TEXT,
  project_title TEXT NOT NULL,
  project_type TEXT CHECK (project_type IN ('website','landing_page','art_social','menu_digital','ecosystem','other')) DEFAULT 'website',
  preview_url TEXT,
  preview_html TEXT,
  notes_for_client TEXT,
  project_scope TEXT,
  out_of_scope_examples TEXT,
  status TEXT CHECK (status IN ('draft','sent','in_review','changes_requested','in_progress','awaiting_payment','approved','archived','expired')) DEFAULT 'draft',
  max_revisions INTEGER DEFAULT 3,
  current_revision INTEGER DEFAULT 0,
  theme TEXT CHECK (theme IN ('dark','light','system','inherit')) DEFAULT 'inherit',
  expires_at TIMESTAMPTZ,
  access_password TEXT,
  prospect_id UUID,
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_projects_token ON approval_projects(client_token);
CREATE INDEX IF NOT EXISTS idx_approval_projects_status ON approval_projects(status);
CREATE INDEX IF NOT EXISTS idx_approval_projects_prospect ON approval_projects(prospect_id);

-- 3. Revisões (cada round)
CREATE TABLE IF NOT EXISTS approval_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES approval_projects(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  preview_url TEXT,
  preview_html TEXT,
  notes TEXT,
  images TEXT[],
  status TEXT CHECK (status IN ('sent','in_review','approved','rejected','superseded')) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_revisions_project ON approval_revisions(project_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_approval_revisions_project_revision ON approval_revisions(project_id, revision_number);

-- 4. Pedidos de alteração
CREATE TABLE IF NOT EXISTS approval_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES approval_projects(id) ON DELETE CASCADE,
  revision_id UUID REFERENCES approval_revisions(id) ON DELETE SET NULL,
  client_message TEXT NOT NULL,
  category TEXT CHECK (category IN ('fine_tune','new_revision','bug','design_change','content_change','new_feature','out_of_scope','other')) DEFAULT 'other',
  is_fine_tune BOOLEAN DEFAULT FALSE,
  counts_as_revision BOOLEAN DEFAULT FALSE,
  has_extra_cost BOOLEAN DEFAULT FALSE,
  extra_cost_amount DECIMAL(10,2),
  extra_cost_reason TEXT,
  extra_cost_kiwify_url TEXT,
  additional_service_id UUID REFERENCES additional_services(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending','admin_reviewing','awaiting_payment','in_progress','resolved','rejected','cancelled')) DEFAULT 'pending',
  admin_response TEXT,
  payment_status TEXT CHECK (payment_status IN ('none','pending','confirmed','refunded')) DEFAULT 'none',
  payment_confirmed_at TIMESTAMPTZ,
  image_index INTEGER,
  image_x DECIMAL(5,4),
  image_y DECIMAL(5,4),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_change_requests_project ON approval_change_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON approval_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_change_requests_revision ON approval_change_requests(revision_id);

-- 5. Catálogo de serviços adicionais
CREATE TABLE IF NOT EXISTS additional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('revision_extra','page','menu','art_pack','audit','integration','custom','other')) DEFAULT 'custom',
  price_cents INTEGER NOT NULL DEFAULT 0,
  price_label TEXT,
  kiwify_checkout_url TEXT,
  visible_to_client BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO additional_services (name, slug, description, category, price_cents, price_label, sort_order) VALUES
('Revisão extra (após 3 rounds)', 'revisao-extra', 'Uma revisão adicional após esgotar o limite gratuito.', 'revision_extra', 9700, 'R$ 97', 1),
('Página adicional', 'pagina-adicional', 'Adicionar uma nova página ao site existente.', 'page', 19700, 'R$ 197', 2),
('Cardápio digital com QR Code', 'cardapio-digital-qr', 'Cardápio digital acessível via QR Code, sem app.', 'menu', 29700, 'R$ 297', 3),
('Pack 12 artes Instagram', 'pack-12-artes', 'Pacote com 12 artes prontas para postar no Instagram.', 'art_pack', 19700, 'R$ 197', 4),
('Auditoria de perfil', 'auditoria-perfil', 'Diagnóstico estratégico do seu perfil + recomendações.', 'audit', 34700, 'R$ 347', 5),
('Integração WhatsApp Business', 'integracao-whatsapp', 'Configuração completa do WhatsApp Business + automações.', 'integration', 14700, 'R$ 147', 6)
ON CONFLICT (slug) DO NOTHING;

-- 6. Log de acessos
CREATE TABLE IF NOT EXISTS approval_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES approval_projects(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now(),
  session_id TEXT,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_access_logs_project ON approval_access_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed ON approval_access_logs(accessed_at DESC);

-- 7. Comentários por área em imagens
CREATE TABLE IF NOT EXISTS approval_image_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES approval_projects(id) ON DELETE CASCADE,
  revision_id UUID NOT NULL REFERENCES approval_revisions(id) ON DELETE CASCADE,
  image_index INTEGER NOT NULL,
  x_percent DECIMAL(5,4) NOT NULL,
  y_percent DECIMAL(5,4) NOT NULL,
  author_name TEXT,
  author_role TEXT CHECK (author_role IN ('client','admin')) DEFAULT 'client',
  comment TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_image_comments_project ON approval_image_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_image_comments_revision ON approval_image_comments(revision_id);
CREATE INDEX IF NOT EXISTS idx_image_comments_image ON approval_image_comments(revision_id, image_index);

-- 8. Bucket Storage para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('approval-images', 'approval-images', false)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE approval_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read settings" ON approval_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin update settings" ON approval_settings FOR UPDATE TO authenticated USING (true);

ALTER TABLE approval_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage projects" ON approval_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE approval_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage revisions" ON approval_revisions FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE approval_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage change_requests" ON approval_change_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage services" ON additional_services FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE approval_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage access_logs" ON approval_access_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE approval_image_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage image_comments" ON approval_image_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Triggers updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER approval_settings_updated_at BEFORE UPDATE ON approval_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER approval_projects_updated_at BEFORE UPDATE ON approval_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER approval_change_requests_updated_at BEFORE UPDATE ON approval_change_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER additional_services_updated_at BEFORE UPDATE ON additional_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
