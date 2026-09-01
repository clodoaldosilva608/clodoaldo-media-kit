UPDATE public.knowledge_items
SET access_type = 'one_time',
    price_cents = 2700,
    currency = 'brl',
    updated_at = now()
WHERE slug = 'pack-imagens-premium'
  AND (access_type <> 'one_time' OR price_cents <> 2700 OR currency <> 'brl');