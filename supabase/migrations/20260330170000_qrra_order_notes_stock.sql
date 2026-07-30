-- Order notes + stock decrement on purchase

ALTER TABLE public.qrra_orders
  ADD COLUMN IF NOT EXISTS notes text;

CREATE OR REPLACE FUNCTION public.qrra_decrement_stock(p_product_id uuid, p_qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_product_id IS NULL OR p_qty IS NULL OR p_qty <= 0 THEN
    RETURN;
  END IF;
  UPDATE public.qrra_products
  SET stock = GREATEST(0, stock - p_qty),
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.qrra_decrement_stock(uuid, integer) TO anon, authenticated;
