UPDATE public.knowledge_chapters
SET content_md = replace(
  content_md,
  '/__l5e/assets-v1/3439e0ed-6242-4a15-af6a-5535c23c8913/pack-imagens-premium.zip',
  '/api/public/downloads/pack-imagens-premium.zip'
)
WHERE knowledge_id = (
  SELECT id FROM public.knowledge_items WHERE slug = 'pack-imagens-premium'
)
AND slug = 'baixar-arquivos';