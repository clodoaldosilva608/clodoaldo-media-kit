CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  source text NOT NULL DEFAULT 'biblioteca',
  ebook_slug text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  instagram_follow_intent boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can create leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (consent = true);

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS bonus_ebooks jsonb NOT NULL DEFAULT '[]'::jsonb;