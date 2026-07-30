import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";
import { isUuid } from "@/lib/uuid";

export type CartStockIssue = {
  name: string;
  slug: string;
  requested: number;
  available: number;
};

export async function validateCartStock(
  items: { product: { id: string; slug: string; name: string }; qty: number }[],
): Promise<CartStockIssue[]> {
  const supabase = createClient();
  const issues: CartStockIssue[] = [];

  for (const { product, qty } of items) {
    if (!isUuid(product.id)) continue;
    const { data } = await supabase
      .from(QRRA.products)
      .select("stock, name, slug")
      .eq("id", product.id)
      .maybeSingle();
    if (!data) continue;
    const stock = data.stock ?? 0;
    if (qty > stock) {
      issues.push({
        name: data.name ?? product.name,
        slug: data.slug ?? product.slug,
        requested: qty,
        available: stock,
      });
    }
  }

  return issues;
}
