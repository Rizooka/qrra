-- ============================================================
-- QRRA — Система полного товарного учёта
-- Добавляем: акции, себестоимость, порог low-stock, 
--            журнал движений склада, поступления
-- ============================================================

-- 1. Новые поля в qrra_products
ALTER TABLE public.qrra_products
  ADD COLUMN IF NOT EXISTS sale_price        integer       NULL CHECK (sale_price >= 0),
  ADD COLUMN IF NOT EXISTS sale_starts_at    timestamptz   NULL,
  ADD COLUMN IF NOT EXISTS sale_ends_at      timestamptz   NULL,
  ADD COLUMN IF NOT EXISTS cost_price        integer       NULL CHECK (cost_price >= 0),
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS stock             integer NOT NULL DEFAULT 0;

-- Если поле stock уже было в другой миграции — ничего не сломается
-- (ADD COLUMN IF NOT EXISTS idempotent)

-- 2. Журнал движений склада
CREATE TABLE IF NOT EXISTS public.qrra_stock_movements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        NOT NULL REFERENCES public.qrra_products(id) ON DELETE CASCADE,
  delta       integer     NOT NULL,                         -- положительное = приход, отрицательное = расход
  reason      text        NOT NULL CHECK (reason IN (
                'order', 'manual_add', 'manual_remove',
                'receipt', 'adjustment', 'return', 'write_off'
              )),
  note        text,                                        -- свободный комментарий
  created_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Поступления (инвойсы/партии)
CREATE TABLE IF NOT EXISTS public.qrra_stock_receipts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  note         text,                                       -- описание партии / поставщик
  created_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Позиции в поступлении (можно за раз оприходовать несколько товаров)
CREATE TABLE IF NOT EXISTS public.qrra_stock_receipt_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id  uuid        NOT NULL REFERENCES public.qrra_stock_receipts(id) ON DELETE CASCADE,
  product_id  uuid        NOT NULL REFERENCES public.qrra_products(id) ON DELETE CASCADE,
  qty         integer     NOT NULL CHECK (qty > 0),
  cost_each   integer     NULL CHECK (cost_each >= 0),    -- закупочная цена за штуку в этой партии
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 4. RLS для новых таблиц
ALTER TABLE public.qrra_stock_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrra_stock_receipts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qrra_stock_receipt_items ENABLE ROW LEVEL SECURITY;

-- Только админы могут читать/писать движения и поступления
CREATE POLICY "admin_all_stock_movements"
  ON public.qrra_stock_movements FOR ALL
  USING (public.qrra_is_admin()) WITH CHECK (public.qrra_is_admin());

CREATE POLICY "admin_all_stock_receipts"
  ON public.qrra_stock_receipts FOR ALL
  USING (public.qrra_is_admin()) WITH CHECK (public.qrra_is_admin());

CREATE POLICY "admin_all_stock_receipt_items"
  ON public.qrra_stock_receipt_items FOR ALL
  USING (public.qrra_is_admin()) WITH CHECK (public.qrra_is_admin());

-- 5. Функция оприходования партии
--    Применяет приход по всем позициям, обновляет остатки и пишет в журнал
CREATE OR REPLACE FUNCTION public.qrra_apply_receipt(p_receipt_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT ri.product_id, ri.qty, ri.cost_each
    FROM public.qrra_stock_receipt_items ri
    WHERE ri.receipt_id = p_receipt_id
  LOOP
    -- Обновить остаток
    UPDATE public.qrra_products
    SET stock = stock + item.qty,
        updated_at = now()
    WHERE id = item.product_id;

    -- Записать в журнал движений
    INSERT INTO public.qrra_stock_movements
      (product_id, delta, reason, note)
    VALUES
      (item.product_id, item.qty, 'receipt',
       'Поступление #' || p_receipt_id::text);
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.qrra_apply_receipt(uuid) TO authenticated;

-- 6. Обновить qrra_decrement_stock — добавить запись в журнал
CREATE OR REPLACE FUNCTION public.qrra_decrement_stock(p_product_id uuid, p_qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_product_id IS NULL OR p_qty IS NULL OR p_qty <= 0 THEN RETURN; END IF;

  UPDATE public.qrra_products
  SET stock = GREATEST(0, stock - p_qty),
      updated_at = now()
  WHERE id = p_product_id;

  INSERT INTO public.qrra_stock_movements (product_id, delta, reason)
  VALUES (p_product_id, -p_qty, 'order');
END;
$$;

GRANT EXECUTE ON FUNCTION public.qrra_decrement_stock(uuid, integer) TO anon, authenticated;

-- 7. Функция ручного изменения остатка с записью в журнал
CREATE OR REPLACE FUNCTION public.qrra_adjust_stock(
  p_product_id uuid,
  p_delta      integer,
  p_reason     text DEFAULT 'manual_add',
  p_note       text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.qrra_products
  SET stock = GREATEST(0, stock + p_delta),
      updated_at = now()
  WHERE id = p_product_id;

  INSERT INTO public.qrra_stock_movements (product_id, delta, reason, note)
  VALUES (p_product_id, p_delta, p_reason, p_note);
END;
$$;

GRANT EXECUTE ON FUNCTION public.qrra_adjust_stock(uuid, integer, text, text) TO authenticated;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.qrra_stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_receipt_items_receipt ON public.qrra_stock_receipt_items(receipt_id);
