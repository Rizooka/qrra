"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/data/products";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

export type PromoCodeRow = {
  code: string;
  discount_percent: number;
  active: boolean;
  created_at: string;
  used_count: number;
  total_discount_amount: number;
};

export function PromoAdminTable({ promoCodes }: { promoCodes: PromoCodeRow[] }) {
  const router = useRouter();

  // New promo form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newPercent, setNewPercent] = useState<number>(10);
  const [newActive, setNewActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search filter
  const [search, setSearch] = useState("");

  const filtered = promoCodes.filter((p) =>
    p.code.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const toggleActive = async (code: string, currentActive: boolean) => {
    const supabase = createClient();
    await supabase
      .from(QRRA.promo_codes)
      .update({ active: !currentActive })
      .eq("code", code);
    router.refresh();
  };

  const deletePromo = async (code: string) => {
    if (!confirm(`Удалить промокод ${code}?`)) return;
    const supabase = createClient();
    await supabase.from(QRRA.promo_codes).delete().eq("code", code);
    router.refresh();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanCode = newCode.trim().toUpperCase();
    if (cleanCode.length < 3 || cleanCode.length > 32) {
      setError("Код должен содержать от 3 до 32 символов.");
      return;
    }
    if (newPercent < 1 || newPercent > 50) {
      setError("Скидка должна быть от 1% до 50%.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.from(QRRA.promo_codes).insert({
      code: cleanCode,
      discount_percent: newPercent,
      active: newActive,
    });

    setLoading(false);

    if (err) {
      if (err.code === "23505") {
        setError(`Промокод ${cleanCode} уже существует.`);
      } else {
        setError(err.message);
      }
      return;
    }

    setNewCode("");
    setNewPercent(10);
    setNewActive(true);
    setShowAddForm(false);
    router.refresh();
  };

  return (
    <div className="px-4 pb-12 sm:px-8">
      {/* Search and add toolbar */}
      <div className="flex flex-col gap-3 border-2 border-ink bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск промокода…"
          className="w-full border-2 border-ink px-3 py-2 text-sm outline-none focus:bg-acid/20 sm:max-w-xs"
        />
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="border-2 border-ink bg-signal px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-ink"
        >
          {showAddForm ? "Закрыть форму" : "+ Создать промокод"}
        </button>
      </div>

      {/* New promo code form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="mt-4 border-2 border-ink bg-paper p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal">
            Новый промокод
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mute">
                Промокод (код)
              </label>
              <input
                type="text"
                required
                placeholder="например: SUMMER20"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2 font-mono text-sm font-bold uppercase outline-none focus:bg-acid/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mute">
                Скидка (%)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={newPercent}
                onChange={(e) => setNewPercent(Number(e.target.value))}
                className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2 font-bold tabular-nums text-sm outline-none focus:bg-acid/20"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newActive}
                  onChange={(e) => setNewActive(e.target.checked)}
                  className="h-5 w-5 accent-ink"
                />
                <span className="text-sm font-bold">
                  {newActive ? "Активен сразу" : "Неактивен"}
                </span>
              </label>
            </div>
          </div>

          {error && (
            <p className="mt-3 border-2 border-signal bg-signal/10 px-3 py-2 text-xs font-bold text-signal">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="border-2 border-ink bg-acid px-6 py-2 text-xs font-extrabold uppercase tracking-wider hover:bg-signal hover:border-signal hover:text-paper disabled:opacity-60"
            >
              {loading ? "Сохранение…" : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-acid/30"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Promo codes table */}
      <div className="mt-4 overflow-x-auto border-2 border-ink">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-ink text-paper sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Код</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Скидка</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Статус</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Заказов</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Скидок выдано</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Создан</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.code} className="border-b border-ink/15 hover:bg-acid/5">
                <td className="px-4 py-3">
                  <span className="font-mono text-base font-black text-ink">{p.code}</span>
                </td>
                <td className="px-4 py-3 font-bold tabular-nums text-signal">
                  -{p.discount_percent}%
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.active ? "bg-acid text-ink" : "bg-ink/10 text-mute"
                    }`}
                  >
                    {p.active ? "Активен" : "Отключен"}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold tabular-nums">{p.used_count}</td>
                <td className="px-4 py-3 tabular-nums font-bold">
                  {p.total_discount_amount > 0
                    ? formatPrice(p.total_discount_amount)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-mute">
                  {new Date(p.created_at).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(p.code, p.active)}
                      className={`border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase ${
                        p.active ? "hover:bg-signal hover:text-paper" : "hover:bg-acid"
                      }`}
                    >
                      {p.active ? "Отключить" : "Включить"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePromo(p.code)}
                      className="border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase hover:bg-signal hover:text-paper"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-mute">
                  {search ? `Промокод «${search}» не найден.` : "Промокодов пока нет."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
