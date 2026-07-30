import { AdminPageHeader } from "@/components/admin/page-header";
import { CustomersAdminTable } from "@/components/admin/customers-admin-table";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Клиенты — Admin QRRA" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from(QRRA.profiles)
    .select("id, email, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        title="Клиенты"
        description="Профили, роли, контакты."
      />
      <CustomersAdminTable customers={customers ?? []} />
    </div>
  );
}
