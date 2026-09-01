
-- Fix paywall bypass: knowledge_chapters full content readable via anon key
DROP POLICY IF EXISTS "chapter rows visible when item is published" ON public.knowledge_chapters;

-- Preview chapters remain publicly readable (for teaser)
CREATE POLICY "preview chapters public"
  ON public.knowledge_chapters FOR SELECT
  TO anon, authenticated
  USING (
    is_preview = true
    AND EXISTS (
      SELECT 1 FROM public.knowledge_items ki
      WHERE ki.id = knowledge_id AND ki.status = 'published'
    )
  );

-- Entitled users can read paid chapters
CREATE POLICY "entitled users read chapters"
  ON public.knowledge_chapters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_items ki
      WHERE ki.id = knowledge_id AND ki.status = 'published'
    )
    AND public.has_knowledge_access(auth.uid(), knowledge_id)
  );

-- Fix supporters: revoke SELECT on sensitive columns from anon/authenticated
-- Column-level privileges: only expose safe columns publicly.
REVOKE SELECT ON public.supporters FROM anon;
REVOKE SELECT ON public.supporters FROM authenticated;

GRANT SELECT (id, app_slug, tier_id, supporter_name, supporter_message, amount_cents, public_display, status, created_at)
  ON public.supporters TO anon;
GRANT SELECT (id, app_slug, tier_id, supporter_name, supporter_message, amount_cents, public_display, status, created_at)
  ON public.supporters TO authenticated;

-- Orders: explicitly document no client SELECT access. Revoke to be safe.
REVOKE SELECT ON public.orders FROM anon;
REVOKE SELECT ON public.orders FROM authenticated;
