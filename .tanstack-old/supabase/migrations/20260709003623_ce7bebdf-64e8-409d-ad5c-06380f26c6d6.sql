CREATE TABLE public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.stripe_webhook_events TO service_role;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_client_access" ON public.stripe_webhook_events FOR SELECT TO authenticated USING (false);