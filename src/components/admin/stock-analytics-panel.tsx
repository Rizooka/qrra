import Link from "next/link";
import type { StockAnalytics } from "@/lib/admin/compute-stock-analytics";
import { formatPrice } from "@/data/products";

export function StockAnalyticsPanel({ data }: { data: StockAnalytics }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
          Склад
        </h2>
        <Link
          href="/admin/stock"
          className="text-xs font-bold uppercase tracking-wider underline hover:text-signal"
        >
          Управление складом →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Остаток (шт.)" value={String(data.totalUnitsOnHand)} />
        <Stat
          label="Стоимость остатка"
          value={formatPrice(data.totalStockValue)}
        />
        <Stat label="Нет в наличии" value={String(data.outOfStockCount)} />
        <Stat label="Мало на складе" value={String(data.lowStockCount)} />
      </div>

      {data.restockPriority.length > 0 ? (
        <section>
          <h3 className="text-sm font-extrabold uppercase tracking-wider">
            Пополнить в первую очередь
          </h3>
          <table className="mt-3 w-full border-2 border-ink text-sm">
            <thead className="bg-ink text-paper">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">
                  Модель
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase">
                  Остаток
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase">
                  Продано
                </th>
              </tr>
            </thead>
            <tbody>
              {data.restockPriority.map((row) => (
                <tr key={row.id} className="border-t border-ink/20">
                  <td className="px-3 py-2 font-bold">{row.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.stock}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.soldUnits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-ink px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-black tabular-nums">
        {value}
      </p>
    </div>
  );
}
