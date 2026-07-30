"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CustomerRoleSelect } from "@/components/admin/customer-role-select";
import { formatPrice } from "@/data/products";

type Row = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  orders_count: number;
  total_spent: number;
};

export function CustomersAdminTable({ customers }: { customers: Row[] }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "ltv" | "orders">("created");

  const filtered = useMemo(() => {
    let rows = customers;
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (c) =>
          (c.full_name ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").includes(q) ||
          c.id.toLowerCase().includes(q),
      );
    }

    return [...rows].sort((a, b) => {
      if (sortBy === "ltv") return b.total_spent - a.total_spent;
      if (sortBy === "orders") return b.orders_count - a.orders_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [customers, query, sortBy]);

  return (
    <div className="px-4 sm:px-8 pb-12">
      <div className="flex flex-col gap-3 border-2 border-ink p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: имя, email, телефон"
          className="w-full border-2 border-ink px-3 py-2 text-sm outline-none focus:bg-acid/20 sm:max-w-md"
        />

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold uppercase text-mute">Сортировка:</span>
          {(
            [
              { id: "created", label: "По дате" },
              { id: "ltv", label: "По LTV (выручке)" },
              { id: "orders", label: "По заказам" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSortBy(s.id)}
              className={`border-2 border-ink px-2.5 py-1 font-bold uppercase tracking-wider ${
                sortBy === s.id ? "bg-ink text-paper" : "bg-paper hover:bg-acid"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto border-2 border-ink">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-ink text-paper">
            <tr>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Клиент
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Email / Телефон
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Заказов
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                LTV (Всего)
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Роль
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Регистрация
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-ink/15 hover:bg-acid/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="font-bold hover:text-signal"
                    data-cursor="hover"
                  >
                    {c.full_name || "Без имени"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{c.email || "—"}</p>
                  <p className="text-xs text-mute">{c.phone || "—"}</p>
                </td>
                <td className="px-4 py-3 font-bold tabular-nums">
                  {c.orders_count} шт.
                </td>
                <td className="px-4 py-3 tabular-nums font-black text-ink">
                  {c.total_spent > 0 ? formatPrice(c.total_spent) : "—"}
                </td>
                <td className="px-4 py-3">
                  <CustomerRoleSelect id={c.id} role={c.role} />
                </td>
                <td className="px-4 py-3 text-mute">
                  {new Date(c.created_at).toLocaleDateString("ru-RU")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-mute">
                  Ничего не найдено.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
