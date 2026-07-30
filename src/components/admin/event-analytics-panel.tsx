import type { EventAnalytics } from "@/lib/admin/compute-event-analytics";

export function EventAnalyticsPanel({ data }: { data: EventAnalytics }) {
  return (
    <div className="space-y-10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Действия на сайте 7д" value={String(data.events7d)} />
        <Stat label="Посетители 7д" value={String(data.uniqueVisitors7d)} />
        <Stat
          label="Не завершили заказ 7д"
          value={String(data.sessionsWithCheckoutNoOrder7d)}
          hint="Начали оформление, но не купили"
        />
        <Stat label="Пожелания 7д" value={String(data.wishSubmits7d)} />
      </div>

      <FunnelTable title="Воронка 7 дней" steps={data.funnel7d} />
      <FunnelTable title="Воронка 30 дней" steps={data.funnel30d} />

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductTable
          title="Интерес к товарам (30д)"
          rows={data.topIntent}
          empty="По товарам ещё нет данных."
        />
        <ProductTable
          title="Узкие места: много смотрят, мало в корзину"
          rows={data.leakyProducts}
          empty="Пока нет явных провалов — или мало данных."
          leaky
        />
      </div>


    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border-2 border-ink px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-black tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-mute">{hint}</p> : null}
    </div>
  );
}

function FunnelTable({
  title,
  steps,
}: {
  title: string;
  steps: EventAnalytics["funnel7d"];
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
        {title}
      </h2>
      <table className="mt-4 w-full border-2 border-ink text-sm">
        <thead className="bg-ink text-paper">
          <tr>
            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">
              Шаг
            </th>
            <th className="px-3 py-2 text-right text-[10px] font-bold uppercase">
              Кол-во
            </th>
            <th className="px-3 py-2 text-right text-[10px] font-bold uppercase">
              От пред.
            </th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s) => (
            <tr key={s.key} className="border-t border-ink/20">
              <td className="px-3 py-2 font-bold">{s.label}</td>
              <td className="px-3 py-2 text-right tabular-nums">{s.count}</td>
              <td className="px-3 py-2 text-right tabular-nums text-mute">
                {s.rateFromPrev !== null ? `${s.rateFromPrev}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ProductTable({
  title,
  rows,
  empty,
  leaky,
}: {
  title: string;
  rows: EventAnalytics["topIntent"];
  empty: string;
  leaky?: boolean;
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
        {title}
      </h2>
      <table className="mt-4 w-full border-2 border-ink text-sm">
        <thead className="bg-ink text-paper">
          <tr>
            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">
              Модель
            </th>
            <th className="px-3 py-2 text-right text-[10px] font-bold uppercase">
              Смотрели
            </th>
            <th className="px-3 py-2 text-right text-[10px] font-bold uppercase">
              В корзину
            </th>
            <th className="px-3 py-2 text-right text-[10px] font-bold uppercase">
              {leaky ? "Смотрели→корзина" : "Интерес"}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} className="border-t border-ink/20">
              <td className="px-3 py-2 font-bold">{r.slug}</td>
              <td className="px-3 py-2 text-right tabular-nums">{r.views}</td>
              <td className="px-3 py-2 text-right tabular-nums">
                {r.addToCart}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {leaky ? `${r.viewToCartPct}%` : r.score}
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-mute">{empty}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
