import { AdminPageHeader } from "@/components/admin/page-header";
import { PromoAdminTable, type PromoCodeRow } from "@/components/admin/promo-admin-table";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Промокоды — QRRA" };

export default async function AdminPromoPage() {
  const supabase = await createClient();

  const [{ data: rawPromos }, { data: orders }] = await Promise.all([
    supabase
      .from(QRRA.promo_codes)
      .select("code, discount_percent, active, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from(QRRA.orders)
      .select("total, shipping"),
  ]);

  // Aggregate stats per promo code
  const promoStats: Record<string, { count: number; totalDiscount: number }> = {};

  (orders ?? []).forEach((order) => {
    const shipping = (order.shipping ?? {}) as { promo_code?: string };
    const code = shipping.promo_code?.toUpperCase();
    if (code) {
      if (!promoStats[code]) {
        promoStats[code] = { count: 0, totalDiscount: 0 };
      }
      promoStats[code].count += 1;
    }
  });

  const promoCodes: PromoCodeRow[] = (rawPromos ?? []).map((p) => {
    const stats = promoStats[p.code.toUpperCase()] ?? { count: 0, totalDiscount: 0 };
    return {
      code: p.code,
      discount_percent: p.discount_percent,
      active: p.active,
      created_at: p.created_at,
      used_count: stats.count,
      total_discount_amount: stats.totalDiscount,
    };
  });

  return (
    <div>
      <AdminPageHeader
        title="Промокоды"
        description="Создание и отслеживание скидочных промокодов."
      />
      <PromoAdminTable promoCodes={promoCodes} />
    </div>
  );
}
