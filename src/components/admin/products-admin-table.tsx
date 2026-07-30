"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/data/products";

type Row = {
  id: string;
  slug: string;
  name: string;
  price: number;
  color_group: string;
  is_active: boolean;
};

export function ProductsAdminTable({ products }: { products: Row[] }) {
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (activeOnly && !p.is_active) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.color_group.toLowerCase().includes(q)
      );
    });
  }, [products, query, activeOnly]);

  return (
    <div className="px-4 sm:px-8 pb-12">
      <div className="flex flex-col gap-3 border-2 border-ink bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: название, slug, группа"
          className="w-full border-2 border-ink px-3 py-2 text-sm outline-none focus:bg-acid/20 sm:max-w-md"
        />
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Только активные
        </label>
      </div>

      <div className="mt-4 overflow-x-auto border-2 border-ink">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-ink text-paper">
            <tr>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Модель
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Slug
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Группа
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Цена
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Статус
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-ink/15 last:border-0">
                <td className="px-4 py-3 font-bold">{p.name}</td>
                <td className="px-4 py-3 text-mute">{p.slug}</td>
                <td className="px-4 py-3 uppercase text-xs tracking-wider">
                  {p.color_group}
                </td>
                <td className="px-4 py-3 tabular-nums">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      p.is_active ? "text-ink" : "text-mute"
                    }`}
                  >
                    {p.is_active ? "Витрина" : "Скрыт"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-acid"
                      data-cursor="hover"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/shop/${p.slug}`}
                      className="border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-ink hover:text-paper"
                      data-cursor="hover"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-mute">
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
