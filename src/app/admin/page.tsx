import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";

export const metadata = {
  title: "Админка — QRRA",
};

export default async function AdminHomePage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/account");

  const supabase = await createClient();

  const [
    { count: productsCount },
    { count: ordersCount },
    { count: customersCount },
    { data: recent },
  ] = await Promise.all([
    supabase.from(QRRA.products).select("*", { count: "exact", head: true }),
    supabase.from(QRRA.orders).select("*", { count: "exact", head: true }),
    supabase.from(QRRA.profiles).select("*", { count: "exact", head: true }),
    supabase
      .from(QRRA.orders)
      .select("id, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const cards = [
    { href: "/admin/products", label: "Товары", value: productsCount ?? 0 },
    { href: "/admin/orders", label: "Заказы", value: ordersCount ?? 0 },
    {
      href: "/admin/customers",
      label: "Клиенты",
      value: customersCount ?? 0,
    },
  ];

  return (
    <section className="bg-paper pt-24">
      <div className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
          Admin
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight sm:text-5xl">
          Панель
        </h1>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              data-cursor="hover"
              className="border-2 border-ink bg-ink p-6 text-paper transition-colors hover:bg-signal"
            >
              <p className="text-xs uppercase tracking-wider text-paper/50">
                {c.label}
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-black tabular-nums">
                {c.value}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">
            Последние заказы
          </h2>
          <ul className="mt-4 divide-y-2 divide-ink border-2 border-ink">
            {(recent ?? []).map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-bold tabular-nums">
                  {formatPrice(o.total)}
                </span>
                <span className="uppercase tracking-wider text-mute">
                  {o.status}
                </span>
                <span className="text-mute">
                  {new Date(o.created_at).toLocaleString("ru-RU")}
                </span>
              </li>
            ))}
            {(recent ?? []).length === 0 ? (
              <li className="px-4 py-6 text-sm text-mute">Пока пусто.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
