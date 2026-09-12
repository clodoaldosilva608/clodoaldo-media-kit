-- ============================================================
-- MIGRATION — Catálogo de Produtos (método Gabriel Miranda Long Form)
-- ============================================================
-- Aplicar no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jckkbsluvbejioyrlcfo/sql/new
-- ============================================================

-- 1) Tabela products_catalog
CREATE TABLE IF NOT EXISTS products_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  price_label TEXT,
  category TEXT DEFAULT 'site',
  icon TEXT DEFAULT '✅',
  is_recurring BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 100,
  whatsapp_sku TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) RLS — admin only
ALTER TABLE products_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_catalog_all" ON products_catalog;
CREATE POLICY "products_catalog_all" ON products_catalog FOR ALL USING (true) WITH CHECK (true);

-- 3) Seed com 9 produtos do modelo Gabriel Miranda (Long Form)
INSERT INTO products_catalog (name, description, price_cents, price_label, category, icon, is_recurring, is_active, sort_order, whatsapp_sku)
SELECT * FROM (VALUES
  -- Site profissional (instalação)
  ('Site Profissional',
   'Criação de site profissional — rápido, responsivo, que converte visita em cliente. SEO local incluído.',
   170000, 'R$ 1.700,00 (em até 12x)', 'site', '✅', false, true, 1, 'site-profissional'),

  -- SEO local
  ('SEO Local',
   'Otimização para aparecer em 1º nas buscas "[nicho] em [cidade]" no Google. Inclui Google Meu Negócio.',
   49000, 'R$ 490,00 (único)', 'seo', '✅', false, true, 2, 'seo-local'),

  -- Google Meu Negócio
  ('Google Meu Negócio Otimizado',
   'Configuração completa + otimização para destaque no Maps. Fotos, horários, posts, descrição.',
   29000, 'R$ 290,00 (único)', 'gmb', '✅', false, true, 3, 'google-meu-negocio'),

  -- Integração WhatsApp
  ('Integração com WhatsApp',
   'Botão flutuante + formulário que abre WhatsApp com mensagem pronta. Cliente pede com 1 clique.',
   19000, 'R$ 190,00 (único)', 'site', '✅', false, true, 4, 'integracao-whatsapp'),

  -- Cardápio digital QR
  ('Cardápio Digital com QR Code',
   'Cliente acessa do celular, sem app, sem download. Atualização ilimitada por 30 dias.',
   99000, 'R$ 990,00 (único)', 'cardapio', '✅', false, true, 5, 'cardapio-digital-qr'),

  -- Edição cardápio
  ('Edição de Cardápio Profissional',
   'Fotos profissionais + descrições que vendem. Inclui 20 itens fotografados + descrição copywriting.',
   79000, 'R$ 790,00 (único)', 'cardapio', '✅', false, true, 6, 'edicao-cardapio'),

  -- Artes redes sociais
  ('Pacote de Artes Redes Sociais',
   '12 a 30 artes/mês prontas para postar no Instagram/Facebook. Templates + copy + calendário.',
   39000, 'R$ 39,00/mês', 'social', '✅', true, true, 7, 'artes-redes-sociais'),

  -- Pacote recorrência mensal
  ('Pacote Recorrência Mensal',
   'Site + artes + SEO + suporte, sem contratar funcionário. Tudo incluso por mensalidade.',
   49700, 'R$ 497,00/mês', 'assinatura', '✅', true, true, 8, 'pacote-recorrencia-mensal'),

  -- Produtos digitais sob medida
  ('Produtos Digitais Sob Medida',
   'E-books, landing pages de campanhas, auditoria de perfil, criativos para tráfego pago. Sob consulta.',
   0, 'Sob consulta', 'extras', '✅', false, true, 9, 'produtos-digitais-sob-medida')
) AS t(name, description, price_cents, price_label, category, icon, is_recurring, is_active, sort_order, whatsapp_sku)
WHERE NOT EXISTS (SELECT 1 FROM products_catalog LIMIT 1);

-- 4) Verificação
SELECT name, price_label, category FROM products_catalog ORDER BY sort_order;
