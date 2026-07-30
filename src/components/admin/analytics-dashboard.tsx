import Link from "next/link";
import type { AnalyticsSnapshot } from "@/lib/admin/compute-analytics";
import { formatPrice } from "@/data/products";
import { ORDER_STATUS_LABEL } from "@/lib/admin/order-status";

function BarChart({
  rows,
  valueKey,
  max,
  formatValue,
}: {
  rows: { label: string; orders: number; revenue: number }[];
  valueKey: "orders" | "revenue";
  max: number;
  formatValue: (n: number) => string;
}) {
  return (
    <div className="flex items-end gap-1 sm:gap-2" style={{ minHeight: 120 }}>
      {rows.map((row) => {
        const v = row[valueKey];
        const pct = max ? Math.max(4, Math.round((v / max) * 100)) : 4;
        return (
          <div
            key={row.label}
            className="group flex flex-1 flex-col items-center gap-1"
          >
            <span
              className="hidden text-[9px] font-bold tabular-nums text-mute group-hover:block sm:text-[10px]"
              title={formatValue(v)}
            >
              {valueKey === "revenue" ? formatPrice(v) : v}
            </span>
            <div
              className="w-full rounded-t bg-signal transition-all group-hover:bg-acid"
              style={{ height: `${pct}%`, minHeight: 4 }}
            />
            <span className="text-[8px] font-bold uppercase tracking-tight text-mute sm:text-[9px]">
              {row.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsSnapshot }) {
  const maxOrders = Math.max(...data.daily14.map((d) => d.orders), 1);
  const maxRevenue = Math.max(...data.daily14.map((d) => d.revenue), 1);

  const kpi = [
    { label: "Выручка 7 дней", value: formatPrice(data.revenue7d) },
    { label: "Прибыль 7 дней", value: formatPrice(data.grossProfit7d), highlight: true },
    { label: "Выручка 30 дней", value: formatPrice(data.revenue30d) },
    { label: "Прибыль 30 дней", value: formatPrice(data.grossProfit30d), highlight: true },
    { label: "Заказы 7 дней", value: String(data.orders7d) },
    { label: "Средний чек", value: formatPrice(Math.round(data.aov)) },
    { label: "Конверсия в покупку", value: `${data.conversionPct}%` },
    { label: "Повторные клиенты", value: `${data.repeatRatePct}%` },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map((k) => (
          <div
            key={k.label}
            className={`border-2 border-ink px-4 py-3 ${
              "highlight" in k && k.highlight ? "bg-acid/30 border-ink font-bold" : "bg-paper"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
              {k.label}
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-black tabular-nums">
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
          Заказы по дням (14 дней)
        </h2>
        <div className="mt-4 border-2 border-ink bg-paper p-4">
          <BarChart
            rows={data.daily14}
            valueKey="orders"
            max={maxOrders}
            formatValue={(n) => String(n)}
          />
        </div>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
          Выручка по дням (14 дней)
        </h2>
        <div className="mt-4 border-2 border-ink bg-paper p-4">
          <BarChart
            rows={data.daily14}
            valueKey="revenue"
            max={maxRevenue}
            formatValue={(n) => formatPrice(n)}
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Топ товаров
          </h2>
          <table className="mt-4 w-full border-2 border-ink text-sm">
            <thead className="bg-ink text-paper">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider">
                  Товар
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider">
                  Шт.
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider">
                  Выручка
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p) => (
                <tr key={p.slug} className="border-t border-ink/20">
                  <td className="px-3 py-2 font-bold">{p.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.units}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatPrice(p.revenue)}
                  </td>
                </tr>
              ))}
              {data.topProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-mute">
                    Нет позиций в заказах.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Города доставки
          </h2>
          <table className="mt-4 w-full border-2 border-ink text-sm">
            <thead className="bg-ink text-paper">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider">
                  Город
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider">
                  Заказы
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider">
                  Выручка
                </th>
              </tr>
            </thead>
            <tbody>
              {data.topCities.map((c) => (
                <tr key={c.city} className="border-t border-ink/20">
                  <td className="px-3 py-2 font-bold">{c.city}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.orders}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatPrice(c.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Сегменты клиентов
          </h2>
          <ul className="mt-4 divide-y-2 divide-ink border-2 border-ink">
            {data.segments.map((s) => (
              <li
                key={s.label}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
              >
                <div>
                  <p className="font-bold">{s.label}</p>
                  <p className="text-xs text-mute">{s.description}</p>
                </div>
                <span className="font-[family-name:var(--font-display)] text-2xl font-black tabular-nums">
                  {s.count}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-mute">
            Покупатели с 2+ заказами: {data.repeatBuyers} из {data.buyersCount}.
            Новые регистрации за 30 дней: {data.newProfiles30d}.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Доставка и статусы
          </h2>
          <div className="mt-4 space-y-4">
            <div className="border-2 border-ink p-4 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mute">
                Тип доставки
              </p>
              <ul className="mt-2 space-y-1 font-bold">
                <li>Самовывоз: {data.byDelivery.pickup}</li>
                <li>Доставка: {data.byDelivery.delivery}</li>
                <li>Другое / не указано: {data.byDelivery.other}</li>
              </ul>
            </div>
            <div className="border-2 border-ink p-4 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-mute">
                Выручка по статусу
              </p>
              <ul className="mt-2 space-y-1">
                {data.byStatusRevenue.map((row) => (
                  <li
                    key={row.status}
                    className="flex justify-between gap-2 font-bold"
                  >
                    <span>
                      {ORDER_STATUS_LABEL[row.status as keyof typeof ORDER_STATUS_LABEL] ??
                        row.status}
                      <span className="text-mute"> ({row.count})</span>
                    </span>
                    <span className="tabular-nums">{formatPrice(row.revenue)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section className="border-2 border-dashed border-mute/40 bg-acid/10 p-4 text-sm">
        <p className="font-bold">Следующие шаги для роста продаж</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-mute">
          <li>Воронка и события — ниже на этой странице</li>
          <li>
            <Link href="/admin/feedback" className="font-bold text-signal underline">
              Пожелания клиентов
            </Link>
            — идеи для каталога
          </li>
          <li>Экспорт CSV, Telegram на новый заказ, заметки к заказу</li>
          <li>Фото в Storage, остатки, поиск заказов по телефону</li>
        </ul>
        <Link
          href="/admin/customers"
          className="mt-3 inline-block font-bold text-signal underline"
        >
          Открыть клиентов →
        </Link>
      </section>
    </div>
  );
}
