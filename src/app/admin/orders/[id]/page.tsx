import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderNotesForm } from "@/components/admin/order-notes-form";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Заказ ${id.slice(0, 8)} — QRRA` };
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from(QRRA.orders)
    .select(
      "id, status, total, shipping, notes, created_at, updated_at, user_id, qrra_order_items(product_name, product_slug, qty, price), qrra_profiles(full_name, phone, email)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const shipping = (order.shipping ?? {}) as {
    name?: string;
    phone?: string;
    city?: string;
    line?: string;
    delivery?: string;
  };
  const items = (order.qrra_order_items ?? []) as {
    product_name: string;
    product_slug: string;
    qty: number;
    price: number;
  }[];
  const profile = order.qrra_profiles as
    | { full_name: string | null; phone: string | null; email: string | null }
    | null
    | { full_name: string | null; phone: string | null; email: string | null }[];
  const p = Array.isArray(profile) ? profile[0] : profile;

  return (
    <div>
      <AdminPageHeader
        title="Заказ"
        description={new Date(order.created_at).toLocaleString("ru-RU")}
        actions={
          <Link
            href="/admin/orders"
            className="border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-acid"
            data-cursor="hover"
          >
            ← Все заказы
          </Link>
        }
      />

      <div className="grid gap-6 px-4 pb-12 sm:px-8 lg:grid-cols-2">
        <section className="border-2 border-ink p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-[family-name:var(--font-display)] text-3xl font-black tabular-nums">
              {formatPrice(order.total)}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-mute">
              Статус
            </p>
            <div className="mt-2">
              <OrderStatusSelect id={order.id} status={order.status} />
            </div>
          </div>
        </section>

        <section className="border-2 border-ink p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
            Клиент
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-xs uppercase text-mute">Имя</dt>
              <dd className="font-bold">
                {shipping.name || p?.full_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-mute">Телефон</dt>
              <dd>{shipping.phone || p?.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-mute">Email</dt>
              <dd>{p?.email || "—"}</dd>
            </div>
            {order.user_id ? (
              <div>
                <Link
                  href={`/admin/customers/${order.user_id}`}
                  className="text-xs font-bold uppercase tracking-wider underline"
                  data-cursor="hover"
                >
                  Профиль клиента →
                </Link>
              </div>
            ) : (
              <p className="text-xs font-bold uppercase tracking-wider text-signal">
                Гостевой заказ
              </p>
            )}
          </dl>
        </section>

        <section className="border-2 border-ink p-5 lg:col-span-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
            Доставка
          </h2>
          <p className="mt-3 text-sm">
            {shipping.city ?? "—"}
            {shipping.line ? `, ${shipping.line}` : ""}
          </p>
          <p className="mt-1 text-sm text-mute capitalize">
            {shipping.delivery ?? "—"}
          </p>
        </section>

        <OrderNotesForm orderId={order.id} initialNotes={order.notes ?? ""} />

        <section className="border-2 border-ink lg:col-span-2">
          <h2 className="border-b-2 border-ink px-5 py-3 font-[family-name:var(--font-display)] text-lg font-extrabold">
            Позиции
          </h2>
          <ul className="divide-y-2 divide-ink/10">
            {items.map((item, i) => (
              <li
                key={`${item.product_slug}-${i}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div>
                  <p className="font-bold">{item.product_name}</p>
                  <Link
                    href={`/shop/${item.product_slug}`}
                    className="text-xs text-mute underline"
                    data-cursor="hover"
                  >
                    {item.product_slug}
                  </Link>
                </div>
                <p className="tabular-nums">
                  {item.qty} × {formatPrice(item.price)} ={" "}
                  {formatPrice(item.price * item.qty)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
