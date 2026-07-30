import { AdminPageHeader } from "@/components/admin/page-header";
import { StockReceiptForm } from "@/components/admin/stock-receipt-form";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Поступления — QRRA" };

export default async function StockReceiptsPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: receipts }] = await Promise.all([
    supabase
      .from(QRRA.products)
      .select("id, slug, name, stock")
      .order("name"),
    supabase
      .from(QRRA.stock_receipts)
      .select("id, note, created_at, qrra_stock_receipt_items(qty, qrra_products(name))")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Поступления"
        description="Оприходование новых партий товаров. Остатки обновляются автоматически."
      />

      <div className="px-4 pb-12 sm:px-8">

        {/* Форма нового поступления */}
        <StockReceiptForm products={products ?? []} />

        {/* История поступлений */}
        {receipts && receipts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
              История поступлений
            </h2>
            <div className="mt-4 border-2 border-ink divide-y-2 divide-ink">
              {receipts.map((r) => {
                const items = (r.qrra_stock_receipt_items ?? []) as unknown as {
                  qty: number;
                  qrra_products: { name: string } | null;
                }[];
                const totalQty = items.reduce((s, i) => s + i.qty, 0);
                return (
                  <div key={r.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm">
                          {r.note || "Поступление без описания"}
                        </p>
                        <p className="text-xs text-mute mt-0.5">
                          {new Date(r.created_at).toLocaleString("ru-RU")} · {items.length} поз. · {totalQty} шт.
                        </p>
                      </div>
                      <span className="bg-ink text-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Оприходовано
                      </span>
                    </div>
                    {items.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {items.map((item, i) => (
                          <li
                            key={i}
                            className="border border-ink/30 bg-acid/10 px-2 py-0.5 text-[11px] font-bold"
                          >
                            {item.qrra_products?.name ?? "?"} × {item.qty}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
