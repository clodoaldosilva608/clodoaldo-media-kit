CREATE TABLE public.supporters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_slug TEXT NOT NULL,
  tier_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  supporter_name TEXT NOT NULL,
  supporter_email TEXT NOT NULL,
  supporter_message TEXT,
  public_display BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.supporters TO anon, authenticated;
GRANT ALL ON public.supporters TO service_role;

ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public supporters are viewable"
ON public.supporters FOR SELECT
USING (public_display = true AND status = 'paid');

CREATE INDEX supporters_app_slug_idx ON public.supporters (app_slug);
CREATE INDEX supporters_status_idx ON public.supporters (status);