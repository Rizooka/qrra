"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  stock: number;
};

type ReceiptLine = {
  product_id: string;
  name: string;
  qty: number;
  cost_each: number | null;
};

export function StockReceiptForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [note, setNote] = useState("");
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      !lines.find((l) => l.product_id === p.id) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addLine = (product: Product) => {
    setLines((prev) => [
      ...prev,
      { product_id: product.id, name: product.name, qty: 1, cost_each: null },
    ]);
    setSearch("");
  };

  const updateLine = (index: number, field: "qty" | "cost_each", value: number | null) => {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    );
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const totalUnits = lines.reduce((sum, l) => sum + l.qty, 0);
  const totalCost = lines.reduce((sum, l) => sum + (l.cost_each ?? 0) * l.qty, 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError("Добавьте хотя бы один товар в поступление.");
      return;
    }
    setError("");

    startTransition(async () => {
      const supabase = createClient();

      // 1. Создать поступление
      const { data: receipt, error: receiptErr } = await supabase
        .from(QRRA.stock_receipts)
        .insert({ note: note.trim() || null })
        .select("id")
        .single();

      if (receiptErr || !receipt) {
        setError(receiptErr?.message ?? "Не удалось создать поступление.");
        return;
      }

      // 2. Добавить позиции
      const items = lines.map((l) => ({
        receipt_id: receipt.id,
        product_id: l.product_id,
        qty: l.qty,
        cost_each: l.cost_each,
      }));

      const { error: itemsErr } = await supabase
        .from(QRRA.stock_receipt_items)
        .insert(items);

      if (itemsErr) {
        setError(itemsErr.message);
        return;
      }

      // 3. Применить поступление (обновит остатки и запишет в журнал)
      const { error: applyErr } = await supabase.rpc("qrra_apply_receipt", {
        p_receipt_id: receipt.id,
      });

      if (applyErr) {
        setError(applyErr.message);
        return;
      }

      setSuccess(`Поступление оприходовано! ${totalUnits} шт. по ${lines.length} позициям.`);
      setLines([]);
      setNote("");
      router.refresh();
    });
  };

  if (success) {
    return (
      <div className="border-2 border-ink bg-acid/20 p-8 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl font-black">✓ Оприходовано</p>
        <p className="mt-2 text-sm">{success}</p>
        <button
          type="button"
          onClick={() => { setSuccess(""); }}
          className="mt-6 border-2 border-ink px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-acid"
        >
          Новое поступление
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* Описание партии */}
      <div className="border-2 border-ink p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal">Описание партии</p>
        <div className="mt-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-mute">
              Примечание (поставщик, дата доставки и т.д.)
            </span>
            <input
              className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2 outline-none focus:bg-acid/20"
              placeholder="Например: Партия от поставщика X, 30.07.2026"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Добавление товаров */}
      <div className="border-2 border-ink p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal">Позиции поступления</p>
        <div className="mt-4">
          <div className="relative">
            <input
              className="w-full border-2 border-ink bg-paper px-3 py-2 outline-none focus:bg-acid/20"
              placeholder="Поиск товара для добавления..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && filteredProducts.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 border-2 border-t-0 border-ink bg-paper shadow-[4px_4px_0_#0c0c0c]">
                {filteredProducts.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addLine(p)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-acid/30"
                  >
                    <span className="font-bold">{p.name}</span>
                    <span className="text-mute text-xs">Остаток: {p.stock} шт.</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Таблица позиций */}
        {lines.length > 0 && (
          <div className="mt-4 overflow-x-auto border-2 border-ink">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="border-b-2 border-ink bg-ink text-paper">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.14em]">Товар</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-center">Кол-во (шт.)</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-center">Цена закупки (сум/шт.)</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-center">Сумма</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={line.product_id} className="border-b border-ink/15">
                    <td className="px-4 py-3 font-bold">{line.name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={line.qty}
                        onChange={(e) => updateLine(i, "qty", Math.max(1, Number(e.target.value)))}
                        className="w-20 border-2 border-ink px-2 py-1 text-center tabular-nums outline-none focus:bg-acid/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        placeholder="—"
                        value={line.cost_each ?? ""}
                        onChange={(e) =>
                          updateLine(i, "cost_each", e.target.value === "" ? null : Number(e.target.value))
                        }
                        className="w-32 border-2 border-ink px-2 py-1 text-center tabular-nums outline-none focus:bg-acid/20"
                      />
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums font-bold">
                      {line.cost_each
                        ? `${(line.cost_each * line.qty).toLocaleString("ru-RU")} сум`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        className="text-signal hover:text-ink font-bold text-lg leading-none"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-ink bg-paper">
                <tr>
                  <td className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-mute">Итого</td>
                  <td className="px-4 py-3 text-center font-black">{totalUnits} шт.</td>
                  <td></td>
                  <td className="px-4 py-3 text-center font-black tabular-nums">
                    {totalCost > 0 ? `${totalCost.toLocaleString("ru-RU")} сум` : "—"}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {lines.length === 0 && (
          <div className="mt-4 border-2 border-dashed border-ink/30 py-12 text-center text-mute">
            <p className="text-sm">Начни вводить название товара выше, чтобы добавить позицию</p>
          </div>
        )}
      </div>

      {error && (
        <p className="border-2 border-signal bg-signal/10 px-4 py-3 text-sm font-bold text-signal">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || lines.length === 0}
        data-cursor="hover"
        className="w-full border-2 border-ink bg-acid py-4 font-[family-name:var(--font-display)] text-sm font-black uppercase tracking-[0.14em] text-ink shadow-[4px_4px_0_#0c0c0c] hover:bg-signal hover:border-signal hover:text-paper disabled:opacity-50 sm:w-auto sm:px-10"
      >
        {isPending ? "Оприходование…" : `Оприходовать${lines.length > 0 ? ` (${lines.length} поз.)` : ""}`}
      </button>
    </form>
  );
}
