
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_slug TEXT NOT NULL,
  service_name TEXT NOT NULL,
  addons JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  status TEXT NOT NULL DEFAULT 'pending',
  customer_email TEXT,
  customer_name TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can create a pending order (checkout is public)
CREATE POLICY "Anyone can create pending order"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Service role manages everything (webhook)
CREATE POLICY "Service role full access"
  ON public.orders FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX idx_orders_status ON public.orders(status);
