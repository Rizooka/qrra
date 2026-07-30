import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";
import { OrderStatusSelect } from "./status-select";

export const metadata = { title: "Заказы — Admin QRRA" };

const statusLabel: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  shipped: "В пути",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from(QRRA.orders)
    .select(
      "id, status, total, shipping, created_at, qrra_order_items(product_name, qty, price), qrra_profiles(full_name, phone)",
    )
    .order("created_at", { ascending: false });

  return (
    <section className="bg-paper pt-10">
      <div className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-black tracking-tight">
          Заказы
        </h1>
        <ul className="mt-8 space-y-4">
          {(orders ?? []).map((order) => {
            const shipping = (order.shipping ?? {}) as {
              name?: string;
              phone?: string;
              city?: string;
              line?: string;
              delivery?: string;
            };
            const items = (order.qrra_order_items ?? []) as {
              product_name: string;
              qty: number;
              price: number;
            }[];
            const profile = order.qrra_profiles as
              | { full_name: string | null; phone: string | null }
              | null
              | { full_name: string | null; phone: string | null }[];
            const p = Array.isArray(profile) ? profile[0] : profile;

            return (
              <li key={order.id} className="border-2 border-ink p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold tabular-nums">
                      {formatPrice(order.total)}
                    </p>
                    <p className="mt-1 text-xs text-mute">
                      {new Date(order.created_at).toLocaleString("ru-RU")}
                    </p>
                    <p className="mt-2 text-sm">
                      {shipping.name || p?.full_name || "—"} ·{" "}
                      {shipping.phone || p?.phone || "—"}
                    </p>
                    <p className="text-sm text-mute">
                      {shipping.city}
                      {shipping.line ? `, ${shipping.line}` : ""} ·{" "}
                      {shipping.delivery ?? "—"}
                    </p>
                  </div>
                  <OrderStatusSelect id={order.id} status={order.status} />
                </div>
                <ul className="mt-3 space-y-1 border-t-2 border-ink/10 pt-3 text-sm">
                  {items.map((item, i) => (
                    <li key={`${order.id}-${i}`}>
                      {item.product_name} × {item.qty} —{" "}
                      {formatPrice(item.price * item.qty)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] uppercase tracking-wider text-mute">
                  {statusLabel[order.status] ?? order.status}
                </p>
              </li>
            );
          })}
          {(orders ?? []).length === 0 ? (
            <li className="text-sm text-mute">Заказов пока нет.</li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
