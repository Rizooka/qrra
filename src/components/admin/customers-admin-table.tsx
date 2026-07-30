"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CustomerRoleSelect } from "@/components/admin/customer-role-select";

type Row = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

export function CustomersAdminTable({ customers }: { customers: Row[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.full_name ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [customers, query]);

  return (
    <div className="px-4 sm:px-8 pb-12">
      <div className="border-2 border-ink p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: имя, email, телефон"
          className="w-full border-2 border-ink px-3 py-2 text-sm outline-none focus:bg-acid/20 sm:max-w-md"
        />
      </div>

      <div className="mt-4 overflow-x-auto border-2 border-ink">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-ink text-paper">
            <tr>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Клиент
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Email
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Телефон
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
              <tr key={c.id} className="border-b border-ink/15">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="font-bold hover:text-signal"
                    data-cursor="hover"
                  >
                    {c.full_name || "Без имени"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-mute">{c.email || "—"}</td>
                <td className="px-4 py-3">{c.phone || "—"}</td>
                <td className="px-4 py-3">
                  <CustomerRoleSelect id={c.id} role={c.role} />
                </td>
                <td className="px-4 py-3 text-mute">
                  {new Date(c.created_at).toLocaleDateString("ru-RU")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-mute">
                  Ничего не найдено.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
