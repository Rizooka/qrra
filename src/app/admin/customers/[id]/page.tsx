import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CustomerRoleSelect } from "@/components/admin/customer-role-select";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from(QRRA.profiles)
    .select("id, email, full_name, phone, role, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!customer) notFound();

  const { data: orders } = await supabase
    .from(QRRA.orders)
    .select("id, status, total, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { data: addresses } = await supabase
    .from(QRRA.addresses)
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        title={customer.full_name || "Клиент"}
        description={customer.email || customer.id}
        actions={
          <Link
            href="/admin/customers"
            className="border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-acid"
            data-cursor="hover"
          >
            ← Все клиенты
          </Link>
        }
      />

      <div className="grid gap-6 px-4 pb-12 sm:px-8 lg:grid-cols-2">
        <section className="border-2 border-ink p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
            Профиль
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase text-mute">Email</dt>
              <dd className="font-bold">{customer.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-mute">Телефон</dt>
              <dd>{customer.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-mute">Роль</dt>
              <dd className="mt-1">
                <CustomerRoleSelect id={customer.id} role={customer.role} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-mute">Создан</dt>
              <dd>
                {new Date(customer.created_at).toLocaleString("ru-RU")}
              </dd>
            </div>
          </dl>
        </section>

        <section className="border-2 border-ink p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
            Адреса
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(addresses ?? []).map((a) => (
              <li key={a.id} className="border border-ink/20 px-3 py-2">
                <p className="font-bold">{a.label || "Адрес"}</p>
                <p className="text-mute">{a.city}, {a.line}</p>
              </li>
            ))}
            {(addresses ?? []).length === 0 ? (
              <li className="text-mute">Нет адресов.</li>
            ) : null}
          </ul>
        </section>

        <section className="border-2 border-ink lg:col-span-2">
          <h2 className="border-b-2 border-ink px-5 py-3 font-[family-name:var(--font-display)] text-lg font-extrabold">
            Заказы
          </h2>
          <ul className="divide-y-2 divide-ink/10">
            {(orders ?? []).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-acid/20"
                  data-cursor="hover"
                >
                  <span className="font-bold tabular-nums">
                    {formatPrice(o.total)}
                  </span>
                  <OrderStatusBadge status={o.status} />
                  <span className="text-sm text-mute">
                    {new Date(o.created_at).toLocaleString("ru-RU")}
                  </span>
                </Link>
              </li>
            ))}
            {(orders ?? []).length === 0 ? (
              <li className="px-5 py-8 text-sm text-mute">Заказов нет.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
