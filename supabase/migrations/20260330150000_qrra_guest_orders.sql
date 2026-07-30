-- Guest checkout: orders without account

ALTER TABLE public.qrra_orders
  ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS qrra_orders_insert_own ON public.qrra_orders;

CREATE POLICY qrra_orders_insert_authenticated ON public.qrra_orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY qrra_orders_insert_guest ON public.qrra_orders
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS qrra_order_items_insert_own ON public.qrra_order_items;

CREATE POLICY qrra_order_items_insert_authenticated ON public.qrra_order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.qrra_orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY qrra_order_items_insert_guest ON public.qrra_order_items
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.qrra_orders o
      WHERE o.id = order_id AND o.user_id IS NULL
    )
  );
