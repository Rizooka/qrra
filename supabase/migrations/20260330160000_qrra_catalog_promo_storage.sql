-- Stock, images, promo codes, product photos bucket

ALTER TABLE public.qrra_products
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 10 CHECK (stock >= 0),
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.qrra_promo_codes (
  code text PRIMARY KEY CHECK (char_length(code) >= 3 AND char_length(code) <= 32),
  discount_percent integer NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 50),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.qrra_promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS qrra_promo_select_active ON public.qrra_promo_codes;
CREATE POLICY qrra_promo_select_active ON public.qrra_promo_codes
  FOR SELECT TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS qrra_promo_admin_all ON public.qrra_promo_codes;
CREATE POLICY qrra_promo_admin_all ON public.qrra_promo_codes
  FOR ALL TO authenticated
  USING (public.qrra_is_admin())
  WITH CHECK (public.qrra_is_admin());

INSERT INTO public.qrra_promo_codes (code, discount_percent, active)
VALUES ('QRRA10', 10, true), ('WELCOME5', 5, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qrra-products',
  'qrra-products',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS qrra_products_storage_read ON storage.objects;
CREATE POLICY qrra_products_storage_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'qrra-products');

DROP POLICY IF EXISTS qrra_products_storage_admin_insert ON storage.objects;
CREATE POLICY qrra_products_storage_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'qrra-products' AND public.qrra_is_admin());

DROP POLICY IF EXISTS qrra_products_storage_admin_update ON storage.objects;
CREATE POLICY qrra_products_storage_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'qrra-products' AND public.qrra_is_admin());

DROP POLICY IF EXISTS qrra_products_storage_admin_delete ON storage.objects;
CREATE POLICY qrra_products_storage_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'qrra-products' AND public.qrra_is_admin());
