CREATE TABLE public.service_capacity (
  service_slug text PRIMARY KEY,
  monthly_slots integer NOT NULL DEFAULT 4 CHECK (monthly_slots > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_capacity TO anon, authenticated;
GRANT ALL ON public.service_capacity TO service_role;

ALTER TABLE public.service_capacity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "capacity is public" ON public.service_capacity
  FOR SELECT USING (true);

CREATE TABLE public.service_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_slug text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_month date NOT NULL DEFAULT date_trunc('month', now())::date,
  position integer NOT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','checkout_started','paid','cancelled')),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX service_queue_unique_entry
  ON public.service_queue (service_slug, user_id, cycle_month);
CREATE INDEX service_queue_cycle_idx
  ON public.service_queue (service_slug, cycle_month, position);

GRANT SELECT, INSERT ON public.service_queue TO authenticated;
GRANT ALL ON public.service_queue TO service_role;

ALTER TABLE public.service_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own queue entries" ON public.service_queue
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert own queue entry" ON public.service_queue
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'waiting');

CREATE TRIGGER service_capacity_touch BEFORE UPDATE ON public.service_capacity
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();
CREATE TRIGGER service_queue_touch BEFORE UPDATE ON public.service_queue
  FOR EACH ROW EXECUTE FUNCTION public.knowledge_touch_updated_at();

CREATE OR REPLACE FUNCTION public.service_queue_join(_slug text)
RETURNS TABLE (
  queue_id uuid,
  queue_position integer,
  monthly_slots integer,
  taken integer,
  available_now boolean,
  queue_status text,
  cycle date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _cycle date := date_trunc('month', now())::date;
  _slots integer;
  _active boolean;
  _row public.service_queue;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT sc.monthly_slots, sc.active INTO _slots, _active
  FROM public.service_capacity sc WHERE sc.service_slug = _slug;

  IF _slots IS NULL OR _active IS NOT TRUE THEN
    RAISE EXCEPTION 'service has no queue';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(_slug || _cycle::text));

  SELECT * INTO _row FROM public.service_queue q
  WHERE q.service_slug = _slug AND q.user_id = _user AND q.cycle_month = _cycle;

  IF _row.id IS NULL THEN
    INSERT INTO public.service_queue (service_slug, user_id, cycle_month, position)
    VALUES (
      _slug, _user, _cycle,
      COALESCE((
        SELECT MAX(q.position) FROM public.service_queue q
        WHERE q.service_slug = _slug AND q.cycle_month = _cycle
          AND q.status <> 'cancelled'
      ), 0) + 1
    )
    RETURNING * INTO _row;
  END IF;

  RETURN QUERY
  SELECT
    _row.id,
    _row.position,
    _slots,
    (SELECT COUNT(*)::int FROM public.service_queue q
      WHERE q.service_slug = _slug AND q.cycle_month = _cycle AND q.status <> 'cancelled'),
    _row.position <= _slots,
    _row.status,
    _row.cycle_month;
END;
$$;

REVOKE ALL ON FUNCTION public.service_queue_join(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.service_queue_join(text) TO authenticated, service_role;

INSERT INTO public.service_capacity (service_slug, monthly_slots) VALUES
  ('video-dedicado', 4),
  ('mencao-patrocinada', 8),
  ('serie-stories', 6),
  ('roteiro-estrategico', 20),
  ('edicao-viral', 20),
  ('pack-criativos', 20),
  ('auditoria-perfil', 20)
ON CONFLICT (service_slug) DO NOTHING;