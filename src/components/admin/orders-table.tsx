"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/admin/order-status";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatPrice } from "@/data/products";

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping: Record<string, string> | null;
  profile: { full_name: string | null; phone: string | null; email: string | null } | null;
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const currentStatus = search.get("status") ?? "all";

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (!q) return true;
      const shipping = o.shipping ?? {};
      return (
        (o.profile?.full_name ?? "").toLowerCase().includes(q) ||
        (o.profile?.phone ?? "").includes(q) ||
        (o.profile?.email ?? "").toLowerCase().includes(q) ||
        (shipping.name ?? "").toLowerCase().includes(q) ||
        (shipping.phone ?? "").includes(q) ||
        (shipping.city ?? "").toLowerCase().includes(q) ||
        String(o.total).includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
  }, [orders, query]);

  const statusItems = [
    { id: "all", label: "Все" },
    ...ORDER_STATUSES.map((s) => ({ id: s, label: ORDER_STATUS_LABEL[s] })),
  ];

  return (
    <div>
      {/* Status filter + search */}
      <div className="px-4 sm:px-8 pb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {statusItems.map((item) => {
            const active = currentStatus === item.id;
            const href =
              item.id === "all"
                ? pathname
                : `${pathname}?status=${encodeURIComponent(item.id)}`;
            return (
              <Link
                key={item.id}
                href={href}
                data-cursor="hover"
                className={`border-2 border-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
                  active ? "bg-ink text-paper" : "bg-paper hover:bg-acid"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="relative max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени, телефону, email, городу…"
            className="w-full border-2 border-ink bg-paper px-3 py-2 pl-9 text-sm outline-none focus:bg-acid/20"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute text-sm">
            🔍
          </span>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink font-bold"
            >
              ×
            </button>
          )}
        </div>

        {query && (
          <p className="text-xs text-mute">
            Найдено: <strong>{filtered.length}</strong> из {orders.length}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-y-2 border-ink px-4 pb-12 sm:px-8">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-ink text-paper">
            <tr>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Дата</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Клиент</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Сумма</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Статус</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Доставка</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const shipping = order.shipping ?? {};
              const p = order.profile;
              return (
                <tr key={order.id} className="border-b border-ink/15 hover:bg-acid/5">
                  <td className="px-4 py-3 text-mute">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-bold text-ink hover:text-signal"
                      data-cursor="hover"
                    >
                      {new Date(order.created_at).toLocaleString("ru-RU")}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{p?.full_name || shipping.name || "—"}</p>
                    <p className="text-xs text-mute">
                      {p?.phone || shipping.phone || "—"} · {p?.email || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-mute">
                    {shipping.city ?? "—"} · {shipping.delivery ?? "—"}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-mute">
                  {query ? `Ничего не найдено по «${query}».` : "Заказов нет."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
