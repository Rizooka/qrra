-- QRRA: clean install in public schema (no custom schema)
-- Safe re-run: drops tables only (not views — qrra_* are tables).

DROP TABLE IF EXISTS public.qrra_order_items CASCADE;
DROP TABLE IF EXISTS public.qrra_orders CASCADE;
DROP TABLE IF EXISTS public.qrra_addresses CASCADE;
DROP TABLE IF EXISTS public.qrra_products CASCADE;
DROP TABLE IF EXISTS public.qrra_profiles CASCADE;

DROP SCHEMA IF EXISTS qrra CASCADE;

DROP FUNCTION IF EXISTS public.qrra_is_admin();
DROP FUNCTION IF EXISTS public.qrra_handle_new_user();

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.qrra_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.qrra_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.qrra_profiles (id) ON DELETE CASCADE,
  label text,
  city text NOT NULL,
  line text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.qrra_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  color text NOT NULL,
  lens text NOT NULL,
  vibe text NOT NULL,
  description text NOT NULL,
  accent text NOT NULL,
  frame text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  color_group text NOT NULL,
  fit text NOT NULL DEFAULT 'one-size',
  fit_note text NOT NULL,
  specs jsonb NOT NULL DEFAULT '{}',
  care text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.qrra_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.qrra_profiles (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')
  ),
  total integer NOT NULL CHECK (total >= 0),
  shipping jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.qrra_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.qrra_orders (id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.qrra_products (id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_slug text NOT NULL,
  qty integer NOT NULL CHECK (qty > 0),
  price integer NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX qrra_orders_user_id_idx ON public.qrra_orders (user_id);
CREATE INDEX qrra_addresses_user_id_idx ON public.qrra_addresses (user_id);
CREATE INDEX qrra_order_items_order_id_idx ON public.qrra_order_items (order_id);

-- ---------------------------------------------------------------------------
-- Auth helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.qrra_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.qrra_profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.qrra_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.qrra_profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS qrra_on_auth_user_created ON auth.users;
CREATE TRIGGER qrra_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.qrra_handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.qrra_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrra_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrra_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrra_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrra_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY qrra_profiles_select_own ON public.qrra_profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY qrra_profiles_select_admin ON public.qrra_profiles
  FOR SELECT TO authenticated USING (public.qrra_is_admin());

CREATE POLICY qrra_profiles_insert_own ON public.qrra_profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY qrra_profiles_update_own ON public.qrra_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY qrra_addresses_select_own ON public.qrra_addresses
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY qrra_addresses_insert_own ON public.qrra_addresses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY qrra_addresses_update_own ON public.qrra_addresses
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY qrra_addresses_delete_own ON public.qrra_addresses
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY qrra_products_select_active ON public.qrra_products
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.qrra_is_admin());

CREATE POLICY qrra_products_admin_insert ON public.qrra_products
  FOR INSERT TO authenticated WITH CHECK (public.qrra_is_admin());

CREATE POLICY qrra_products_admin_update ON public.qrra_products
  FOR UPDATE TO authenticated USING (public.qrra_is_admin());

CREATE POLICY qrra_products_admin_delete ON public.qrra_products
  FOR DELETE TO authenticated USING (public.qrra_is_admin());

CREATE POLICY qrra_orders_select_own ON public.qrra_orders
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.qrra_is_admin());

CREATE POLICY qrra_orders_insert_own ON public.qrra_orders
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY qrra_orders_admin_update ON public.qrra_orders
  FOR UPDATE TO authenticated USING (public.qrra_is_admin());

CREATE POLICY qrra_order_items_select_own ON public.qrra_order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.qrra_orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.qrra_is_admin())
    )
  );

CREATE POLICY qrra_order_items_insert_own ON public.qrra_order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.qrra_orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Seed products (8 models)
-- ---------------------------------------------------------------------------

INSERT INTO public.qrra_products (
  slug, name, price, color, lens, vibe, description, accent, frame, tags,
  color_group, fit, fit_note, specs, care, is_active
) VALUES
(
  'stare-acid', 'STARE ACID', 8900, 'Кислотный', 'Зеркальный UV400', 'Дневной вызов',
  'Квадратная оправа, которая не извиняется. Для тех, кто смотрит первым и не моргает.',
  '#B8FF00', '#111111', ARRAY['acid','day','square'], 'acid', 'one-size',
  'Unisex. Средняя посадка. Сидит плотно — не просит прощения.',
  '{"material":"Ацетат + сталь","weight":"28 г","uv":"UV400","warranty":"Lifetime"}'::jsonb,
  'Протирай сухой тканью. Не оставляй на торпеде. Система не любит жару.', true
),
(
  'signal-cut', 'SIGNAL CUT', 9400, 'Сигнальный', 'Дымчатый UV400', 'Уличный удар',
  'Острый силуэт и оранжевый акцент. Выглядит как предупреждение — и работает как броня.',
  '#FF3B00', '#1A1A1A', ARRAY['signal','street','sharp'], 'signal', 'one-size',
  'Unisex. Узкий мост. Для тех, кто режет кадр.',
  '{"material":"Ацетат","weight":"26 г","uv":"UV400","warranty":"Lifetime"}'::jsonb,
  'Храни в жёстком чехле. Сигнал не должен гнуться.', true
),
(
  'blank-out', 'BLANK OUT', 8200, 'Чёрный мат', 'Чёрный UV400', 'Тихий бунт',
  'Минимум деталей, максимум присутствия. Когда хочешь исчезнуть — и всё равно быть замеченным.',
  '#2A2A2A', '#0A0A0A', ARRAY['black','minimal','night'], 'black', 'one-size',
  'Unisex. Классическая ширина. Тихий, но тяжёлый.',
  '{"material":"Матовый ацетат","weight":"27 г","uv":"UV400","warranty":"Lifetime"}'::jsonb,
  'Матовая поверхность — только мягкая ткань. Без химии.', true
),
(
  'heatwave', 'HEATWAVE', 9800, 'Жар', 'Янтарный UV400', 'Полуденный огонь',
  'Тёплые линзы и дерзкая геометрия. Солнце — не повод прятаться.',
  '#FF6A00', '#2B1408', ARRAY['heat','day','amber'], 'heat', 'one-size',
  'Unisex. Чуть шире. Держит лицо на солнце.',
  '{"material":"Ацетат","weight":"29 г","uv":"UV400","warranty":"Lifetime"}'::jsonb,
  'Янтарь боится растворителей. Только вода и ткань.', true
),
(
  'ice-dare', 'ICE DARE', 9100, 'Лёд', 'Голубой UV400', 'Холодный взгляд',
  'Прозрачная оправа с ледяным оттенком. Смотришь сквозь — и всё равно давишь.',
  '#7EC8FF', '#C5D8E8', ARRAY['cold','clear','ice'], 'cold', 'one-size',
  'Unisex. Лёгкая посадка. Холод без веса.',
  '{"material":"Прозрачный ацетат","weight":"24 г","uv":"UV400","warranty":"Lifetime"}'::jsonb,
  'Прозрачный ацетат царапается. Чехол обязателен.', true
),
(
  'riot-rim', 'RIOT RIM', 10500, 'Riot', 'Зелёный UV400', 'Ночной рейд',
  'Толстая оправа, невозможный цвет. Для тех, кто не спрашивает «можно ли».',
  '#00E5A0', '#0D1F18', ARRAY['acid','night','thick'], 'acid', 'one-size',
  'Unisex. Толстый обод. Занимает пространство.',
  '{"material":"Толстый ацетат","weight":"32 г","uv":"UV400","warranty":"Lifetime"}'::jsonb,
  'Тяжёлая оправа — не бросай. Система не прощает падений.', true
),
(
  'ghost-wire', 'GHOST WIRE', 8700, 'Призрак', 'Серебро UV400', 'Невидимый удар',
  'Тонкий металл, почти невесомый. Появляется в кадре — и ломает композицию.',
  '#D0D0D0', '#8A8A8A', ARRAY['cold','metal','minimal'], 'cold', 'one-size',
  'Unisex. Тонкий металл. Почти не чувствуешь — все видят.',
  '{"material":"Нержавеющая сталь","weight":"18 г","uv":"UV400","warranty":"Lifetime"}'::jsonb,
  'Металл — без соли и пота на ночь. Протирай после улицы.', true
),
(
  'punchline', 'PUNCHLINE', 9900, 'Панч', 'Розовый UV400', 'Последнее слово',
  'Не милый розовый — розовый как удар. Финальный аккорд любой улицы.',
  '#FF4FA3', '#1A0A12', ARRAY['signal','street','punch'], 'signal', 'one-size',
  'Unisex. Средняя ширина. Финальный кадр.',
  '{"material":"Ацетат","weight":"27 г","uv":"UV400","warranty":"Lifetime"}'::jsonb,
  'Цвет держи в тени. Солнце выжигает панч.', true
);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
