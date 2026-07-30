"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import type { StockLine } from "@/lib/admin/compute-stock-analytics";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

function statusBadge(status: StockLine["status"]) {
  if (status === "out")
    return "bg-signal text-paper";
  if (status === "low") return "bg-acid text-ink";
  return "bg-ink text-paper";
}

function statusText(status: StockLine["status"]) {
  if (status === "out") return "Нет в наличии";
  if (status === "low") return "Мало";
  return "В наличии";
}

export function StockAdminTable({ lines }: { lines: StockLine[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "out" | "low" | "ok">("all");

  const filtered = useMemo(() => {
    let rows = lines;
    if (filter !== "all") rows = rows.filter((r) => r.status === filter);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q),
    );
  }, [lines, filter, query]);

  const adjust = async (id: string, delta: number) => {
    const row = lines.find((l) => l.id === id);
    if (!row) return;
    const next = Math.max(0, row.stock + delta);
    const supabase = createClient();
    await supabase
      .from(QRRA.products)
      .update({ stock: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    router.refresh();
  };

  const setStock = async (id: string, raw: string) => {
    const next = Math.max(0, Number(raw) || 0);
    const supabase = createClient();
    await supabase
      .from(QRRA.products)
      .update({ stock: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    router.refresh();
  };

  return (
    <div className="px-4 pb-12 sm:px-8">
      <div className="flex flex-col gap-3 border-2 border-ink bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск модели…"
          className="w-full border-2 border-ink px-3 py-2 text-sm outline-none focus:bg-acid/20 sm:max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "Все" },
              { id: "out", label: "Нет" },
              { id: "low", label: "Мало" },
              { id: "ok", label: "В наличии" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              data-cursor="hover"
              onClick={() => setFilter(f.id)}
              className={`border-2 border-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                filter === f.id ? "bg-ink text-paper" : "bg-paper"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto border-2 border-ink">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-ink text-paper">
            <tr>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Модель
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Статус
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Остаток
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Продано
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Выручка
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Сумма на складе
              </th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Изменить
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-ink/15">
                <td className="px-4 py-3">
                  <p className="font-bold">{row.name}</p>
                  <Link
                    href={`/admin/products/${row.id}`}
                    className="text-xs text-mute underline"
                  >
                    {row.slug}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge(row.status)}`}
                  >
                    {statusText(row.status)}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold tabular-nums">{row.stock}</td>
                <td className="px-4 py-3 tabular-nums">{row.soldUnits}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatPrice(row.soldRevenue)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatPrice(row.stockValue)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 border-2 border-ink font-bold"
                      onClick={() => adjust(row.id, -1)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      defaultValue={row.stock}
                      key={`${row.id}-${row.stock}`}
                      onBlur={(e) => setStock(row.id, e.target.value)}
                      className="w-16 border-2 border-ink px-2 py-1 text-center text-sm tabular-nums"
                    />
                    <button
                      type="button"
                      className="h-8 w-8 border-2 border-ink font-bold"
                      onClick={() => adjust(row.id, 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase"
                      onClick={() => adjust(row.id, 5)}
                    >
                      +5
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-mute">
                  Ничего не найдено.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-mute">
        На витрине при остатке 0 клиенты видят «Нет в наличии» и не могут
        добавить в корзину. После заказа остаток уменьшается автоматически.
      </p>
    </div>
  );
}
