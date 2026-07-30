import { AdminPageHeader } from "@/components/admin/page-header";
import { StockAdminTable } from "@/components/admin/stock-admin-table";
import { computeStockAnalytics } from "@/lib/admin/compute-stock-analytics";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";

export const metadata = { title: "Склад — QRRA" };

export default async function AdminStockPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: items }, { data: orders }] =
    await Promise.all([
      supabase
        .from(QRRA.products)
        .select("id, slug, name, price, stock, is_active")
        .order("name"),
      supabase
        .from(QRRA.order_items)
        .select("order_id, product_slug, qty, price"),
      supabase.from(QRRA.orders).select("id, status"),
    ]);

  const stock = computeStockAnalytics(
    products ?? [],
    items ?? [],
    orders ?? [],
  );

  return (
    <div>
      <AdminPageHeader
        title="Склад"
        description="Остатки, продажи и пополнение. Данные идут в аналитику."
      />

      <div className="grid gap-3 px-4 pb-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <Kpi label="Остаток (шт.)" value={String(stock.totalUnitsOnHand)} />
        <Kpi
          label="Стоимость на складе"
          value={formatPrice(stock.totalStockValue)}
        />
        <Kpi label="Нет в наличии" value={String(stock.outOfStockCount)} />
        <Kpi label="Мало (≤3)" value={String(stock.lowStockCount)} />
      </div>

      <StockAdminTable lines={stock.lines} />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-ink bg-paper px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-black tabular-nums">
        {value}
      </p>
    </div>
  );
}
