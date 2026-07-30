import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/admin/order-status";

export const metadata = { title: "Обзор — Admin QRRA" };

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: productsCount },
    { count: ordersCount },
    { count: customersCount },
    { data: recent },
    { data: allOrders },
  ] = await Promise.all([
    supabase.from(QRRA.products).select("*", { count: "exact", head: true }),
    supabase.from(QRRA.orders).select("*", { count: "exact", head: true }),
    supabase.from(QRRA.profiles).select("*", { count: "exact", head: true }),
    supabase
      .from(QRRA.orders)
      .select("id, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from(QRRA.orders).select("status, total"),
  ]);

  const revenue =
    (allOrders ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;

  const byStatus = ORDER_STATUSES.map((status) => ({
    status,
    label: ORDER_STATUS_LABEL[status],
    count: (allOrders ?? []).filter((o) => o.status === status).length,
  }));

  const cards = [
    { href: "/admin/products", label: "Товары", value: productsCount ?? 0 },
    { href: "/admin/orders", label: "Заказы", value: ordersCount ?? 0 },
    {
      href: "/admin/customers",
      label: "Клиенты",
      value: customersCount ?? 0,
    },
    {
      href: "/admin/orders",
      label: "Выручка (все заказы)",
      value: formatPrice(revenue),
      isMoney: true,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Обзор"
        description="Заказы, каталог и клиенты QRRA."
      />

      <div className="grid gap-4 px-4 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            data-cursor="hover"
            className="border-2 border-ink bg-paper p-5 transition-colors hover:bg-acid/30"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-mute">
              {c.label}
            </p>
            <p
              className={`mt-2 font-[family-name:var(--font-display)] font-black tabular-nums tracking-tight ${
                c.isMoney ? "text-2xl" : "text-4xl"
              }`}
            >
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 px-4 pb-12 sm:px-8 lg:grid-cols-[1fr_280px]">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Последние заказы
          </h2>
          <ul className="mt-4 divide-y-2 divide-ink border-2 border-ink">
            {(recent ?? []).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-acid/20"
                  data-cursor="hover"
                >
                  <span className="font-bold tabular-nums">
                    {formatPrice(o.total)}
                  </span>
                  <OrderStatusBadge status={o.status} />
                  <span className="text-mute">
                    {new Date(o.created_at).toLocaleString("ru-RU")}
                  </span>
                </Link>
              </li>
            ))}
            {(recent ?? []).length === 0 ? (
              <li className="px-4 py-8 text-sm text-mute">Пока пусто.</li>
            ) : null}
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            По статусам
          </h2>
          <ul className="mt-4 space-y-2">
            {byStatus.map((row) => (
              <li
                key={row.status}
                className="flex items-center justify-between border-2 border-ink px-3 py-2 text-sm"
              >
                <span className="font-bold">{row.label}</span>
                <span className="tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
