import { AdminPageHeader } from "@/components/admin/page-header";
import { CustomersAdminTable } from "@/components/admin/customers-admin-table";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Клиенты — QRRA" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const [{ data: rawCustomers }, { data: orders }] = await Promise.all([
    supabase
      .from(QRRA.profiles)
      .select("id, email, full_name, phone, role, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from(QRRA.orders)
      .select("id, user_id, total, status"),
  ]);

  // Compute LTV and order counts
  const userStats: Record<string, { totalSpent: number; ordersCount: number }> = {};
  (orders ?? []).forEach((o) => {
    if (o.status !== "cancelled" && o.user_id) {
      if (!userStats[o.user_id]) {
        userStats[o.user_id] = { totalSpent: 0, ordersCount: 0 };
      }
      userStats[o.user_id].totalSpent += o.total;
      userStats[o.user_id].ordersCount += 1;
    }
  });

  const customers = (rawCustomers ?? []).map((c) => {
    const st = userStats[c.id] ?? { totalSpent: 0, ordersCount: 0 };
    return {
      id: c.id,
      email: c.email,
      full_name: c.full_name,
      phone: c.phone,
      role: c.role,
      created_at: c.created_at,
      orders_count: st.ordersCount,
      total_spent: st.totalSpent,
    };
  });

  return (
    <div>
      <AdminPageHeader
        title="Клиенты"
        description={`${customers.length} пользователей QRRA.`}
      />
      <CustomersAdminTable customers={customers} />
    </div>
  );
}
