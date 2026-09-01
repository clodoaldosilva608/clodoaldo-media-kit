ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS queue_id uuid REFERENCES public.service_queue(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_queue_id_idx ON public.orders(queue_id);