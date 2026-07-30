import Link from "next/link";
import { redirect } from "next/navigation";
import { ensureProfile, getProfile, getUser } from "@/lib/auth";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";
import { AccountProfileForm } from "./profile-form";
import { AddressForm } from "./address-form";
import { OrderRepeatButton } from "@/components/order-repeat-button";
import { SignOutButton } from "./sign-out-button";

export const metadata = {
  title: "Кабинет — QRRA",
};

const statusLabel: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  shipped: "В пути",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");

  const profile = (await ensureProfile(user)) ?? (await getProfile());
  const meta = user.user_metadata as Record<string, unknown>;
  const displayName =
    profile?.full_name ??
    (typeof meta.full_name === "string" ? meta.full_name : "");
  const displayPhone =
    profile?.phone ?? (typeof meta.phone === "string" ? meta.phone : "");
  const supabase = await createClient();

  const [{ data: addresses }, { data: orders }] = await Promise.all([
    supabase
      .from(QRRA.addresses)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from(QRRA.orders)
      .select(
        "id, status, total, shipping, created_at, qrra_order_items(product_name, product_slug, qty, price)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <section className="bg-paper pt-24">
      <div className="mx-auto max-w-[960px] space-y-14 px-4 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
              Личный кабинет
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight sm:text-5xl">
              Кабинет
            </h1>
            <p className="mt-2 text-sm text-mute">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {profile?.role === "admin" ? (
              <Link
                href="/admin"
                data-cursor="hover"
                className="border-2 border-ink bg-acid px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-ink"
              >
                Управление
              </Link>
            ) : null}
            <SignOutButton />
          </div>
        </div>

        <AccountProfileForm fullName={displayName} phone={displayPhone} />

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">
            Адреса
          </h2>
          <ul className="mt-4 space-y-3">
            {(addresses ?? []).map((a) => (
              <li
                key={a.id}
                className="border-2 border-ink px-4 py-3 text-sm"
              >
                <p className="font-bold">
                  {a.label || "Адрес"}
                  {a.is_default ? (
                    <span className="ml-2 text-xs uppercase tracking-wider text-signal">
                      по умолчанию
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-mute">
                  {a.city}, {a.line}
                </p>
              </li>
            ))}
            {(addresses ?? []).length === 0 ? (
              <li className="text-sm text-mute">Пока пусто.</li>
            ) : null}
          </ul>
          <AddressForm />
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">
            Заказы
          </h2>
          <ul className="mt-4 space-y-4">
            {(orders ?? []).map((order) => {
              const items = (order.qrra_order_items ?? []) as {
                product_name: string;
                product_slug: string;
                qty: number;
                price: number;
              }[];
              return (
                <li key={order.id} className="border-2 border-ink p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-bold tabular-nums">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-signal">
                      {statusLabel[order.status] ?? order.status}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-mute">
                    {new Date(order.created_at).toLocaleString("ru-RU")}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {items.map((item, i) => (
                      <li key={`${order.id}-${i}`}>
                        {item.product_name} × {item.qty}
                      </li>
                    ))}
                  </ul>
                  {(() => {
                    const sh = (order.shipping ?? {}) as { tracking_number?: string; carrier?: string };
                    if (!sh.tracking_number) return null;
                    return (
                      <div className="mt-3 border-t border-ink/20 pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-mute">Трек-номер</p>
                        <p className="mt-1 font-mono text-sm font-bold">{sh.tracking_number}</p>
                        {sh.carrier && <p className="text-xs text-mute">{sh.carrier}</p>}
                      </div>
                    );
                  })()}
                  <OrderRepeatButton items={items} />
                </li>
              );
            })}
            {(orders ?? []).length === 0 ? (
              <li className="text-sm text-mute">
                Заказов нет.{" "}
                <Link
                  href="/shop"
                  className="font-bold underline underline-offset-4"
                  data-cursor="hover"
                >
                  В магазин
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
