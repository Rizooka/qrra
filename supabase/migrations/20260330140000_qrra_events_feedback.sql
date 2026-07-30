-- Behavioral events + customer wishes (QRRA)

CREATE TABLE IF NOT EXISTS public.qrra_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL CHECK (
    event_name IN (
      'page_view',
      'product_view',
      'product_click',
      'add_to_cart',
      'remove_from_cart',
      'cart_view',
      'checkout_start',
      'order_complete',
      'wish_open',
      'wish_submit'
    )
  ),
  visitor_id text NOT NULL CHECK (char_length(visitor_id) >= 8 AND char_length(visitor_id) <= 64),
  session_id text NOT NULL CHECK (char_length(session_id) >= 8 AND char_length(session_id) <= 64),
  user_id uuid REFERENCES public.qrra_profiles (id) ON DELETE SET NULL,
  page_path text,
  product_slug text,
  product_id uuid REFERENCES public.qrra_products (id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qrra_events_created_at_idx ON public.qrra_events (created_at DESC);
CREATE INDEX IF NOT EXISTS qrra_events_event_name_idx ON public.qrra_events (event_name);
CREATE INDEX IF NOT EXISTS qrra_events_visitor_id_idx ON public.qrra_events (visitor_id);
CREATE INDEX IF NOT EXISTS qrra_events_session_id_idx ON public.qrra_events (session_id);

CREATE TABLE IF NOT EXISTS public.qrra_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('wish', 'product_idea', 'recommendation')),
  message text NOT NULL CHECK (char_length(message) >= 3 AND char_length(message) <= 2000),
  email text,
  visitor_id text,
  user_id uuid REFERENCES public.qrra_profiles (id) ON DELETE SET NULL,
  product_slug text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qrra_feedback_created_at_idx ON public.qrra_feedback (created_at DESC);

ALTER TABLE public.qrra_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrra_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS qrra_events_insert_public ON public.qrra_events;
CREATE POLICY qrra_events_insert_public ON public.qrra_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS qrra_events_select_admin ON public.qrra_events;
CREATE POLICY qrra_events_select_admin ON public.qrra_events
  FOR SELECT TO authenticated
  USING (public.qrra_is_admin());

DROP POLICY IF EXISTS qrra_feedback_insert_public ON public.qrra_feedback;
CREATE POLICY qrra_feedback_insert_public ON public.qrra_feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS qrra_feedback_select_admin ON public.qrra_feedback;
CREATE POLICY qrra_feedback_select_admin ON public.qrra_feedback
  FOR SELECT TO authenticated
  USING (public.qrra_is_admin());
