import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { ExportOrdersButton } from "@/components/admin/export-orders-button";
import { OrdersStatusFilter } from "@/components/admin/orders-status-filter";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/order-status";

export const metadata = { title: "Заказы — QRRA" };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;
  const statusFilter =
    statusParam &&
    ORDER_STATUSES.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : null;

  const supabase = await createClient();
  let query = supabase
    .from(QRRA.orders)
    .select(
      "id, status, total, shipping, created_at, qrra_profiles(full_name, phone, email)",
    )
    .order("created_at", { ascending: false });

  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: orders } = await query;

  return (
    <div>
      <AdminPageHeader
        title="Заказы"
        description="Статусы, доставка, клиент."
        actions={<ExportOrdersButton />}
      />
      <Suspense fallback={null}>
        <OrdersStatusFilter />
      </Suspense>

      <div className="overflow-x-auto border-y-2 border-ink px-4 pb-12 sm:px-8">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-ink text-paper">
            <tr>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Дата
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Клиент
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Сумма
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Статус
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Доставка
              </th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => {
              const shipping = (order.shipping ?? {}) as {
                name?: string;
                city?: string;
                delivery?: string;
              };
              const profile = order.qrra_profiles as
                | { full_name: string | null; phone: string | null; email: string | null }
                | null
                | {
                    full_name: string | null;
                    phone: string | null;
                    email: string | null;
                  }[];
              const p = Array.isArray(profile) ? profile[0] : profile;

              return (
                <tr key={order.id} className="border-b border-ink/15">
                  <td className="px-4 py-3 text-mute">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-bold text-ink hover:text-signal"
                      data-cursor="hover"
                    >
                      {new Date(order.created_at).toLocaleString("ru-RU")}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold">
                      {p?.full_name || shipping.name || "—"}
                    </p>
                    <p className="text-xs text-mute">
                      {p?.phone || "—"} · {p?.email || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-mute">
                    {shipping.city ?? "—"} · {shipping.delivery ?? "—"}
                  </td>
                </tr>
              );
            })}
            {(orders ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-mute">
                  Заказов нет.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
