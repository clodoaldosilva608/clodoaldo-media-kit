-- ============================================================
-- MIGRATION — Adicionar image_path nos produtos + landing page
-- ============================================================
-- Aplicar no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jckkbsluvbejioyrlcfo/sql/new
-- ============================================================

-- 1) Adicionar coluna image_path
ALTER TABLE products_catalog
  ADD COLUMN IF NOT EXISTS image_path TEXT;

-- 2) Atualizar cada produto com o caminho da imagem (já estão em /public/assets/produtos/)
UPDATE products_catalog SET image_path = '/assets/produtos/site-profissional.jpg'
  WHERE whatsapp_sku = 'site-profissional';
UPDATE products_catalog SET image_path = '/assets/produtos/seo-local.jpg'
  WHERE whatsapp_sku = 'seo-local';
UPDATE products_catalog SET image_path = '/assets/produtos/google-meu-negocio.jpg'
  WHERE whatsapp_sku = 'google-meu-negocio';
UPDATE products_catalog SET image_path = '/assets/produtos/integracao-whatsapp.jpg'
  WHERE whatsapp_sku = 'integracao-whatsapp';
UPDATE products_catalog SET image_path = '/assets/produtos/cardapio-digital-qr.jpg'
  WHERE whatsapp_sku = 'cardapio-digital-qr';
UPDATE products_catalog SET image_path = '/assets/produtos/edicao-cardapio.jpg'
  WHERE whatsapp_sku = 'edicao-cardapio';
UPDATE products_catalog SET image_path = '/assets/produtos/artes-redes-sociais.jpg'
  WHERE whatsapp_sku = 'artes-redes-sociais';
UPDATE products_catalog SET image_path = '/assets/produtos/pacote-recorrencia-mensal.jpg'
  WHERE whatsapp_sku = 'pacote-recorrencia-mensal';
UPDATE products_catalog SET image_path = '/assets/produtos/produtos-digitais-sob-medida.jpg'
  WHERE whatsapp_sku = 'produtos-digitais-sob-medida';

-- 3) Verificação
SELECT name, whatsapp_sku, image_path, price_label
FROM products_catalog
ORDER BY sort_order;
