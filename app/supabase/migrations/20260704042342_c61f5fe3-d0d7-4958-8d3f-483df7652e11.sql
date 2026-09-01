
-- ENUMS
CREATE TYPE public.knowledge_access_type AS ENUM ('free','one_time','subscription','lifetime');
CREATE TYPE public.knowledge_content_type AS ENUM ('ebook','course','video','template','prompt_pack','tool');
CREATE TYPE public.knowledge_difficulty AS ENUM ('iniciante','intermediario','avancado');
CREATE TYPE public.knowledge_status AS ENUM ('draft','published','archived');
CREATE TYPE public.knowledge_entitlement_source AS ENUM ('purchase','subscription','grant','lifetime');

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.knowledge_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- knowledge_items
-- =========================================================
CREATE TABLE public.knowledge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_url text,
  category text NOT NULL DEFAULT 'geral',
  type public.knowledge_content_type NOT NULL DEFAULT 'ebook',
  access_type public.knowledge_access_type NOT NULL DEFAULT 'one_time',
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'brl',
  estimated_minutes integer NOT NULL DEFAULT 0,
  difficulty public.knowledge_difficulty NOT NULL DEFAULT 'iniciante',
  status public.knowledge_status NOT NULL DEFAULT 'draft',
  order_index integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_items TO anon, authenticated;
GRANT ALL ON public.knowledge_items TO service_role;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published items are visible"
  ON public.knowledge_items FOR SELECT
  USING (status = 'published');
CREATE TRIGGER knowledge_items_touch BEFORE UPDATE ON public.knowledge_items
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();

-- =========================================================
-- knowledge_bundles
-- =========================================================
CREATE TABLE public.knowledge_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'brl',
  access_type public.knowledge_access_type NOT NULL DEFAULT 'one_time',
  status public.knowledge_status NOT NULL DEFAULT 'draft',
  stripe_price_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_bundles TO anon, authenticated;
GRANT ALL ON public.knowledge_bundles TO service_role;
ALTER TABLE public.knowledge_bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published bundles are visible"
  ON public.knowledge_bundles FOR SELECT
  USING (status = 'published');
CREATE TRIGGER knowledge_bundles_touch BEFORE UPDATE ON public.knowledge_bundles
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();

CREATE TABLE public.knowledge_bundle_items (
  bundle_id uuid NOT NULL REFERENCES public.knowledge_bundles(id) ON DELETE CASCADE,
  knowledge_id uuid NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  PRIMARY KEY (bundle_id, knowledge_id)
);
GRANT SELECT ON public.knowledge_bundle_items TO anon, authenticated;
GRANT ALL ON public.knowledge_bundle_items TO service_role;
ALTER TABLE public.knowledge_bundle_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bundle items visible when bundle is published"
  ON public.knowledge_bundle_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.knowledge_bundles b WHERE b.id = bundle_id AND b.status = 'published'));

-- =========================================================
-- knowledge_entitlements
-- =========================================================
CREATE TABLE public.knowledge_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  knowledge_id uuid REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  bundle_id uuid REFERENCES public.knowledge_bundles(id) ON DELETE CASCADE,
  source public.knowledge_entitlement_source NOT NULL DEFAULT 'purchase',
  active boolean NOT NULL DEFAULT false,
  stripe_session_id text,
  stripe_payment_intent text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (knowledge_id IS NOT NULL OR bundle_id IS NOT NULL)
);
CREATE UNIQUE INDEX knowledge_entitlements_user_item_uniq
  ON public.knowledge_entitlements (user_id, knowledge_id)
  WHERE knowledge_id IS NOT NULL;
CREATE UNIQUE INDEX knowledge_entitlements_user_bundle_uniq
  ON public.knowledge_entitlements (user_id, bundle_id)
  WHERE bundle_id IS NOT NULL;
CREATE INDEX knowledge_entitlements_session_idx ON public.knowledge_entitlements (stripe_session_id);
GRANT SELECT ON public.knowledge_entitlements TO authenticated;
GRANT ALL ON public.knowledge_entitlements TO service_role;
ALTER TABLE public.knowledge_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read their entitlements"
  ON public.knowledge_entitlements FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE TRIGGER knowledge_entitlements_touch BEFORE UPDATE ON public.knowledge_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();

-- =========================================================
-- has_knowledge_access: gates chapters & user surface
-- =========================================================
CREATE OR REPLACE FUNCTION public.has_knowledge_access(_user uuid, _knowledge uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _user IS NOT NULL AND (
      -- item is free
      EXISTS (
        SELECT 1 FROM public.knowledge_items ki
        WHERE ki.id = _knowledge AND ki.access_type = 'free'
      )
      -- direct active entitlement
      OR EXISTS (
        SELECT 1 FROM public.knowledge_entitlements e
        WHERE e.user_id = _user
          AND e.knowledge_id = _knowledge
          AND e.active = true
          AND (e.expires_at IS NULL OR e.expires_at > now())
      )
      -- bundle-based entitlement
      OR EXISTS (
        SELECT 1
        FROM public.knowledge_entitlements e
        JOIN public.knowledge_bundle_items bi ON bi.bundle_id = e.bundle_id
        WHERE e.user_id = _user
          AND bi.knowledge_id = _knowledge
          AND e.active = true
          AND (e.expires_at IS NULL OR e.expires_at > now())
      )
    );
$$;

-- =========================================================
-- knowledge_chapters
-- =========================================================
CREATE TABLE public.knowledge_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id uuid NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  content_md text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  is_preview boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (knowledge_id, slug)
);
CREATE INDEX knowledge_chapters_knowledge_idx ON public.knowledge_chapters (knowledge_id, order_index);
GRANT SELECT ON public.knowledge_chapters TO anon, authenticated;
GRANT ALL ON public.knowledge_chapters TO service_role;
ALTER TABLE public.knowledge_chapters ENABLE ROW LEVEL SECURITY;
-- Metadata (title/slug/order/preview) always visible for published items so we can render the sidebar & paywall.
CREATE POLICY "chapter rows visible when item is published"
  ON public.knowledge_chapters FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.knowledge_items ki WHERE ki.id = knowledge_id AND ki.status = 'published'));

-- =========================================================
-- knowledge_progress
-- =========================================================
CREATE TABLE public.knowledge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  knowledge_id uuid NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.knowledge_chapters(id) ON DELETE CASCADE,
  progress_pct numeric(5,2) NOT NULL DEFAULT 0,
  last_position integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chapter_id)
);
CREATE INDEX knowledge_progress_user_item_idx ON public.knowledge_progress (user_id, knowledge_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_progress TO authenticated;
GRANT ALL ON public.knowledge_progress TO service_role;
ALTER TABLE public.knowledge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.knowledge_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER knowledge_progress_touch BEFORE UPDATE ON public.knowledge_progress
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();

-- =========================================================
-- knowledge_favorites
-- =========================================================
CREATE TABLE public.knowledge_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  knowledge_id uuid NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.knowledge_chapters(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX knowledge_favorites_uniq
  ON public.knowledge_favorites (user_id, knowledge_id, COALESCE(chapter_id, '00000000-0000-0000-0000-000000000000'::uuid));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_favorites TO authenticated;
GRANT ALL ON public.knowledge_favorites TO service_role;
ALTER TABLE public.knowledge_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.knowledge_favorites FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- knowledge_notes
-- =========================================================
CREATE TABLE public.knowledge_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  knowledge_id uuid NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.knowledge_chapters(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  anchor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX knowledge_notes_user_chapter_idx ON public.knowledge_notes (user_id, chapter_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_notes TO authenticated;
GRANT ALL ON public.knowledge_notes TO service_role;
ALTER TABLE public.knowledge_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes" ON public.knowledge_notes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER knowledge_notes_touch BEFORE UPDATE ON public.knowledge_notes
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();

-- =========================================================
-- knowledge_checklists
-- =========================================================
CREATE TABLE public.knowledge_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.knowledge_chapters(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chapter_id, item_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_checklists TO authenticated;
GRANT ALL ON public.knowledge_checklists TO service_role;
ALTER TABLE public.knowledge_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own checklists" ON public.knowledge_checklists FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER knowledge_checklists_touch BEFORE UPDATE ON public.knowledge_checklists
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();
