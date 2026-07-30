import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { RevenueBarChart } from "@/components/admin/revenue-bar-chart";
import { computeAnalytics } from "@/lib/admin/compute-analytics";
import { computeStockAnalytics } from "@/lib/admin/compute-stock-analytics";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/admin/order-status";

export const metadata = { title: "Обзор — QRRA" };

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: productsCount },
    { count: ordersCount },
    { count: customersCount },
    { data: recent },
    { data: allOrders },
    { data: profiles },
    { data: items },
    { data: productRows },
  ] = await Promise.all([
    supabase.from(QRRA.products).select("*", { count: "exact", head: true }),
    supabase.from(QRRA.orders).select("*", { count: "exact", head: true }),
    supabase.from(QRRA.profiles).select("*", { count: "exact", head: true }),
    supabase
      .from(QRRA.orders)
      .select("id, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from(QRRA.orders)
      .select("id, status, total, created_at, user_id, shipping"),
    supabase.from(QRRA.profiles).select("id, created_at"),
    supabase
      .from(QRRA.order_items)
      .select("order_id, product_name, product_slug, qty, price"),
    supabase
      .from(QRRA.products)
      .select("id, slug, name, price, stock, is_active"),
  ]);

  const analytics = computeAnalytics(
    allOrders ?? [],
    items ?? [],
    profiles ?? [],
  );
  const stock = computeStockAnalytics(
    productRows ?? [],
    items ?? [],
    allOrders ?? [],
  );

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
      href: "/admin/analytics",
      label: "Выручка 7 дней",
      value: formatPrice(analytics.revenue7d),
      isMoney: true,
    },
    {
      href: "/admin/analytics",
      label: "Средний чек",
      value: formatPrice(Math.round(analytics.aov)),
      isMoney: true,
    },
    {
      href: "/admin/stock",
      label: "Нет в наличии",
      value: stock.outOfStockCount,
      alert: stock.outOfStockCount > 0,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Обзор"
        description="Заказы, каталог и клиенты QRRA."
      />

      <p className="px-4 text-sm sm:px-8">
        <Link
          href="/admin/analytics"
          className="font-bold text-signal underline"
        >
          Полная аналитика →
        </Link>
        <span className="text-mute">
          {" "}
          — сегменты, города, топ товаров, графики 14 дней.
        </span>
      </p>

      <div className="grid gap-4 px-4 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            data-cursor="hover"
            className={`border-2 border-ink bg-paper p-5 transition-colors hover:bg-acid/30 ${
              "alert" in c && c.alert ? "border-signal bg-signal/10" : ""
            }`}
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

      <div className="px-4 pb-6 sm:px-8">
        <RevenueBarChart daily={analytics.daily14} />
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
