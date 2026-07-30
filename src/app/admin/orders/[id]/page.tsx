import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderNotesForm } from "@/components/admin/order-notes-form";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderTrackingForm } from "@/components/admin/order-tracking-form";
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
    tracking_number?: string;
    carrier?: string;
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

  const phone = shipping.phone || p?.phone || null;
  const cleanPhone = phone?.replace(/\D/g, "") ?? "";
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
  const tgLink = cleanPhone ? `https://t.me/+${cleanPhone}` : null;

  const orderShortId = order.id.slice(0, 8).toUpperCase();

  return (
    <div>
      <AdminPageHeader
        title={`Заказ #${orderShortId}`}
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

        {/* Сумма + статус */}
        <section className="border-2 border-ink p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-[family-name:var(--font-display)] text-3xl font-black tabular-nums">
              {formatPrice(order.total)}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-mute">Статус</p>
            <div className="mt-2">
              <OrderStatusSelect id={order.id} status={order.status} />
            </div>
          </div>
        </section>

        {/* Клиент + быстрые действия */}
        <section className="border-2 border-ink p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
            Клиент
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-xs uppercase text-mute">Имя</dt>
              <dd className="font-bold">{shipping.name || p?.full_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-mute">Телефон</dt>
              <dd className="flex items-center gap-2 flex-wrap">
                <span>{shipping.phone || p?.phone || "—"}</span>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 border-2 border-ink bg-[#25D366] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white hover:opacity-90"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                )}
                {tgLink && (
                  <a
                    href={tgLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 border-2 border-ink bg-[#2AABEE] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white hover:opacity-90"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    Telegram
                  </a>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-mute">Email</dt>
              <dd>
                {p?.email ? (
                  <a href={`mailto:${p.email}`} className="hover:underline">{p.email}</a>
                ) : "—"}
              </dd>
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

        {/* Адрес доставки */}
        <section className="border-2 border-ink p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
            Адрес доставки
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs uppercase text-mute">Город</dt>
              <dd className="font-bold">{shipping.city ?? "—"}</dd>
            </div>
            {shipping.line && (
              <div>
                <dt className="text-xs uppercase text-mute">Адрес</dt>
                <dd>{shipping.line}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase text-mute">Способ доставки</dt>
              <dd className="capitalize">{shipping.delivery ?? "—"}</dd>
            </div>
          </dl>
        </section>

        {/* Заметки */}
        <OrderNotesForm orderId={order.id} initialNotes={order.notes ?? ""} />

        {/* Трек-номер */}
        <OrderTrackingForm
          orderId={order.id}
          initialTracking={shipping.tracking_number ?? ""}
          initialCarrier={shipping.carrier ?? ""}
        />

        {/* Позиции заказа */}
        <section className="border-2 border-ink lg:col-span-2">
          <div className="flex items-center justify-between border-b-2 border-ink px-5 py-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
              Позиции заказа
            </h2>
            <span className="text-xs text-mute">{items.length} поз.</span>
          </div>
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
                    target="_blank"
                  >
                    {item.product_slug} ↗
                  </Link>
                </div>
                <p className="tabular-nums">
                  {item.qty} × {formatPrice(item.price)}{" "}
                  <span className="font-black">= {formatPrice(item.price * item.qty)}</span>
                </p>
              </li>
            ))}
          </ul>
          <div className="border-t-2 border-ink px-5 py-4 text-right">
            <span className="text-xs text-mute uppercase tracking-wider">Итого: </span>
            <span className="font-[family-name:var(--font-display)] text-xl font-black tabular-nums">
              {formatPrice(order.total)}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
