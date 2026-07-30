import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ExportOrdersButton } from "@/components/admin/export-orders-button";
import { OrdersTable } from "@/components/admin/orders-table";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/order-status";

export const metadata = { title: "Заказы — QRRA" };

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;
  const statusFilter =
    statusParam && ORDER_STATUSES.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : null;

  const supabase = await createClient();
  let query = supabase
    .from(QRRA.orders)
    .select("id, status, total, shipping, created_at, qrra_profiles(full_name, phone, email)")
    .order("created_at", { ascending: false });

  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: rawOrders } = await query;

  const orders = (rawOrders ?? []).map((o) => {
    const profile = o.qrra_profiles as
      | { full_name: string | null; phone: string | null; email: string | null }
      | { full_name: string | null; phone: string | null; email: string | null }[]
      | null;
    const p = Array.isArray(profile) ? profile[0] : profile;
    return {
      id: o.id,
      status: o.status,
      total: o.total,
      created_at: o.created_at,
      shipping: (o.shipping ?? {}) as Record<string, string>,
      profile: p ?? null,
    };
  });

  return (
    <div>
      <AdminPageHeader
        title="Заказы"
        description={`${orders.length} заказов${statusFilter ? ` · статус: ${statusFilter}` : ""}`}
        actions={<ExportOrdersButton />}
      />
      <Suspense fallback={null}>
        <OrdersTable orders={orders} />
      </Suspense>
    </div>
  );
}
