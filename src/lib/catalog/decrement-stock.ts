import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";
import { isUuid } from "@/lib/uuid";
import { sendTelegramLowStockAlert } from "@/lib/notifications/telegram";

export async function decrementStockForOrderItems(
  rows: { product_id: string | null; qty: number }[],
) {
  const supabase = createClient();
  for (const row of rows) {
    if (!row.product_id || !isUuid(row.product_id)) continue;

    await supabase.rpc("qrra_decrement_stock", {
      p_product_id: row.product_id,
      p_qty: row.qty,
    });

    // Check updated stock & low_stock_threshold
    try {
      const { data: prod } = await supabase
        .from(QRRA.products)
        .select("name, stock, low_stock_threshold")
        .eq("id", row.product_id)
        .maybeSingle();

      if (prod) {
        const threshold = prod.low_stock_threshold ?? 3;
        if (prod.stock <= threshold) {
          await sendTelegramLowStockAlert(prod.name, prod.stock, threshold);
        }
      }
    } catch {
      // Ignore low stock alert errors
    }
  }
}
