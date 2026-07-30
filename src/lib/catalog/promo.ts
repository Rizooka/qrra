import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

export type PromoResult =
  | { ok: true; code: string; discountPercent: number }
  | { ok: false; error: string };

export function calcDiscount(total: number, discountPercent: number) {
  const discount = Math.round((total * discountPercent) / 100);
  return {
    discount,
    finalTotal: Math.max(0, total - discount),
  };
}

export async function validatePromoCode(raw: string): Promise<PromoResult> {
  const code = raw.trim().toUpperCase();
  if (code.length < 3) {
    return { ok: false, error: "Введите код" };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from(QRRA.promo_codes)
    .select("code, discount_percent, active")
    .eq("code", code)
    .maybeSingle();

  if (error || !data || !data.active) {
    return { ok: false, error: "Код не найден или не действует" };
  }

  return {
    ok: true,
    code: data.code,
    discountPercent: data.discount_percent,
  };
}
