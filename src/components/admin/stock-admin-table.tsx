"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/data/products";
import type { StockLine } from "@/lib/admin/compute-stock-analytics";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

function statusBadge(status: StockLine["status"]) {
  if (status === "out") return "bg-signal text-paper";
  if (status === "low") return "bg-acid text-ink";
  return "bg-ink text-paper";
}

function statusText(status: StockLine["status"]) {
  if (status === "out") return "Нет";
  if (status === "low") return "Мало";
  return "ОК";
}

type HistoryEntry = {
  id: string;
  delta: number;
  reason: string;
  note: string | null;
  created_at: string;
};

const REASON_LABEL: Record<string, string> = {
  order: "Продажа",
  manual_add: "Ручной приход",
  manual_remove: "Ручное списание",
  receipt: "Поступление",
  adjustment: "Корректировка",
  return: "Возврат",
  write_off: "Списание брака",
};

export function StockAdminTable({ lines }: { lines: StockLine[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "out" | "low" | "ok">("all");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkValues, setBulkValues] = useState<Record<string, number>>({});
  const [savingBulk, setSavingBulk] = useState(false);
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const filtered = lines.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q);
  });

  const adjust = async (id: string, delta: number, reason = "manual_add") => {
    const supabase = createClient();
    await supabase.rpc("qrra_adjust_stock", {
      p_product_id: id,
      p_delta: delta,
      p_reason: delta > 0 ? "manual_add" : "manual_remove",
    });
    router.refresh();
  };

  const setStockDirect = async (id: string, newStock: number) => {
    const row = lines.find((l) => l.id === id);
    if (!row) return;
    const delta = newStock - row.stock;
    if (delta === 0) return;
    const supabase = createClient();
    await supabase.rpc("qrra_adjust_stock", {
      p_product_id: id,
      p_delta: delta,
      p_reason: "adjustment",
      p_note: "Прямая установка остатка в Admin",
    });
    router.refresh();
  };

  const saveBulk = async () => {
    setSavingBulk(true);
    const supabase = createClient();
    for (const [id, newStock] of Object.entries(bulkValues)) {
      const row = lines.find((l) => l.id === id);
      if (!row) continue;
      const delta = newStock - row.stock;
      if (delta === 0) continue;
      await supabase.rpc("qrra_adjust_stock", {
        p_product_id: id,
        p_delta: delta,
        p_reason: "adjustment",
        p_note: "Массовое обновление остатков",
      });
    }
    setSavingBulk(false);
    setBulkMode(false);
    setBulkValues({});
    router.refresh();
  };

  const loadHistory = async (productId: string) => {
    if (historyProductId === productId) {
      setHistoryProductId(null);
      return;
    }
    setHistoryProductId(productId);
    setHistoryLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from(QRRA.stock_movements)
      .select("id, delta, reason, note, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(30);
    setHistoryData((data as HistoryEntry[]) ?? []);
    setHistoryLoading(false);
  };

  return (
    <div className="px-4 pb-12 sm:px-8">
      {/* Controls */}
      <div className="flex flex-col gap-3 border-2 border-ink bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск модели…"
          className="w-full border-2 border-ink px-3 py-2 text-sm outline-none focus:bg-acid/20 sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "out", "low", "ok"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`border-2 border-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                filter === f ? "bg-ink text-paper" : "bg-paper"
              }`}
            >
              {f === "all" ? "Все" : f === "out" ? "Нет" : f === "low" ? "Мало" : "В наличии"}
            </button>
          ))}
          <Link
            href="/admin/stock/receipts"
            className="border-2 border-acid bg-acid px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-ink hover:bg-signal hover:border-signal hover:text-paper"
          >
            + Поступление
          </Link>
          <button
            type="button"
            onClick={() => { setBulkMode(!bulkMode); setBulkValues({}); }}
            className={`border-2 border-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
              bulkMode ? "bg-ink text-paper" : "bg-paper hover:bg-acid/30"
            }`}
          >
            {bulkMode ? "Отмена" : "Массовое ред."}
          </button>
          {bulkMode && Object.keys(bulkValues).length > 0 && (
            <button
              type="button"
              onClick={saveBulk}
              disabled={savingBulk}
              className="border-2 border-acid bg-acid px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-ink disabled:opacity-60"
            >
              {savingBulk ? "Сохр…" : "Сохранить всё"}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto border-2 border-ink">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b-2 border-ink bg-ink text-paper">
            <tr>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Модель</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Статус</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Остаток</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Продано</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Выручка</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Стоимость склада</th>
              <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em]">Управление</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <>
                <tr key={row.id} className={`border-b border-ink/15 ${historyProductId === row.id ? "bg-acid/10" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-bold">{row.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Link href={`/admin/products/${row.id}`} className="text-xs text-mute underline">{row.slug}</Link>
                      <button
                        type="button"
                        onClick={() => loadHistory(row.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-ink/30 ${
                          historyProductId === row.id ? "bg-ink text-paper" : "hover:bg-acid/30"
                        }`}
                      >
                        {historyProductId === row.id ? "Скрыть" : "История"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge(row.status)}`}>
                      {statusText(row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-black tabular-nums text-lg">
                    {bulkMode ? (
                      <input
                        type="number"
                        min={0}
                        value={bulkValues[row.id] ?? row.stock}
                        onChange={(e) => setBulkValues((prev) => ({ ...prev, [row.id]: Number(e.target.value) }))}
                        className={`w-20 border-2 border-ink px-2 py-1 text-center tabular-nums outline-none ${
                          bulkValues[row.id] !== undefined && bulkValues[row.id] !== row.stock
                            ? "bg-acid/30 border-acid"
                            : "bg-paper"
                        }`}
                      />
                    ) : (
                      row.stock
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row.soldUnits}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(row.soldRevenue)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(row.stockValue)}</td>
                  <td className="px-4 py-3">
                    {!bulkMode && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button type="button" className="h-8 w-8 border-2 border-ink font-bold hover:bg-signal hover:text-paper" onClick={() => adjust(row.id, -1, "manual_remove")}>−</button>
                        <input
                          type="number"
                          min={0}
                          defaultValue={row.stock}
                          key={`${row.id}-${row.stock}`}
                          onBlur={(e) => setStockDirect(row.id, Math.max(0, Number(e.target.value)))}
                          className="w-16 border-2 border-ink px-2 py-1 text-center text-sm tabular-nums outline-none focus:bg-acid/20"
                        />
                        <button type="button" className="h-8 w-8 border-2 border-ink font-bold hover:bg-acid" onClick={() => adjust(row.id, 1)}>+</button>
                        <button type="button" className="border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase hover:bg-acid" onClick={() => adjust(row.id, 5)}>+5</button>
                        <button type="button" className="border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase hover:bg-acid" onClick={() => adjust(row.id, 10)}>+10</button>
                      </div>
                    )}
                  </td>
                </tr>

                {/* History row */}
                {historyProductId === row.id && (
                  <tr className="bg-ink/5">
                    <td colSpan={7} className="px-6 pb-4 pt-2">
                      {historyLoading ? (
                        <p className="text-xs text-mute">Загрузка истории…</p>
                      ) : historyData.length === 0 ? (
                        <p className="text-xs text-mute">История движений пуста.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-ink/20">
                                <th className="pb-2 text-left font-bold uppercase tracking-wider text-mute">Дата</th>
                                <th className="pb-2 text-left font-bold uppercase tracking-wider text-mute">Изменение</th>
                                <th className="pb-2 text-left font-bold uppercase tracking-wider text-mute">Причина</th>
                                <th className="pb-2 text-left font-bold uppercase tracking-wider text-mute">Примечание</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/10">
                              {historyData.map((h) => (
                                <tr key={h.id}>
                                  <td className="py-1.5 tabular-nums text-mute">
                                    {new Date(h.created_at).toLocaleString("ru-RU")}
                                  </td>
                                  <td className={`py-1.5 font-black tabular-nums ${h.delta > 0 ? "text-ink" : "text-signal"}`}>
                                    {h.delta > 0 ? `+${h.delta}` : h.delta}
                                  </td>
                                  <td className="py-1.5 font-bold">{REASON_LABEL[h.reason] ?? h.reason}</td>
                                  <td className="py-1.5 text-mute">{h.note ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-mute">Ничего не найдено.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-mute">
        При остатке 0 клиенты видят «Нет в наличии». После заказа остаток уменьшается автоматически.
        Кнопка <strong>«История»</strong> показывает журнал всех движений по товару.
      </p>
    </div>
  );
}
