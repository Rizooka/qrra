"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/data/products";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

type Row = {
  id: string;
  slug: string;
  name: string;
  price: number;
  cost_price: number | null;
  sale_price: number | null;
  sale_ends_at: string | null;
  color_group: string;
  is_active: boolean;
  stock: number;
};

export function ProductsAdminTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  const filtered = products.filter((p) => {
    if (activeOnly && !p.is_active) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.color_group.toLowerCase().includes(q);
  });

  const savePrice = async (id: string) => {
    const val = Number(priceInput);
    if (!val || val <= 0) { setEditingPrice(null); return; }
    setSavingPrice(true);
    const supabase = createClient();
    await supabase
      .from(QRRA.products)
      .update({ price: val, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSavingPrice(false);
    setEditingPrice(null);
    router.refresh();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from(QRRA.products).update({ is_active: !current, updated_at: new Date().toISOString() }).eq("id", id);
    router.refresh();
  };

  return (
    <div className="px-4 pb-12 sm:px-8">
      <div className="flex flex-col gap-3 border-2 border-ink bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: название, slug, группа"
          className="w-full border-2 border-ink px-3 py-2 text-sm outline-none focus:bg-acid/20 sm:max-w-sm"
        />
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
          Только активные
        </label>
      </div>

      <div className="mt-4 overflow-x-auto border-2 border-ink">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-ink text-paper">
            <tr>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Модель</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Цена</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Маржа</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Остаток</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Статус</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const margin =
                p.cost_price && p.cost_price > 0
                  ? Math.round(((p.price - p.cost_price) / p.price) * 100)
                  : null;

              const now = new Date();
              const saleActive =
                p.sale_price &&
                p.sale_price > 0 &&
                (!p.sale_ends_at || new Date(p.sale_ends_at) > now);

              return (
                <tr key={p.id} className="border-b border-ink/15 last:border-0 hover:bg-acid/5">
                  <td className="px-4 py-3">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-[11px] text-mute">{p.slug} · {p.color_group}</p>
                  </td>

                  {/* Inline price edit */}
                  <td className="px-4 py-3">
                    {editingPrice === p.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          autoFocus
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") void savePrice(p.id); if (e.key === "Escape") setEditingPrice(null); }}
                          className="w-28 border-2 border-acid px-2 py-1 text-sm tabular-nums outline-none bg-acid/10"
                        />
                        <button type="button" disabled={savingPrice} onClick={() => savePrice(p.id)} className="border-2 border-ink bg-acid px-2 py-1 text-[10px] font-bold disabled:opacity-60">✓</button>
                        <button type="button" onClick={() => setEditingPrice(null)} className="border-2 border-ink px-2 py-1 text-[10px] font-bold hover:bg-signal hover:text-paper">✕</button>
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() => { setEditingPrice(p.id); setPriceInput(String(p.price)); }}
                          className="tabular-nums font-bold hover:underline hover:text-signal"
                          title="Нажми для изменения цены"
                        >
                          {formatPrice(p.price)}
                        </button>
                        {saleActive && (
                          <p className="text-[10px] text-signal font-bold">
                            Акция: {formatPrice(p.sale_price!)}
                          </p>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 tabular-nums">
                    {margin !== null ? (
                      <span className={`font-black ${margin >= 40 ? "text-ink" : margin >= 20 ? "text-acid" : "text-signal"}`}>
                        {margin}%
                      </span>
                    ) : (
                      <span className="text-mute/50">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`font-black tabular-nums ${p.stock === 0 ? "text-signal" : p.stock <= 3 ? "text-acid" : ""}`}>
                      {p.stock}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(p.id, p.is_active)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-2 transition-colors ${
                        p.is_active
                          ? "border-ink bg-acid text-ink hover:bg-paper"
                          : "border-ink/30 bg-paper text-mute hover:bg-acid/30"
                      }`}
                    >
                      {p.is_active ? "Витрина" : "Скрыт"}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-acid"
                        data-cursor="hover"
                      >
                        Редактировать
                      </Link>
                      <Link
                        href={`/shop/${p.slug}`}
                        target="_blank"
                        className="border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-ink hover:text-paper"
                        data-cursor="hover"
                      >
                        Витрина ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-mute">Ничего не найдено.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
