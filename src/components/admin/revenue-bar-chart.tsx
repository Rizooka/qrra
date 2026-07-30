"use client";

import { formatPrice } from "@/data/products";
import type { DayBucket } from "@/lib/admin/compute-analytics";

export function RevenueBarChart({ daily }: { daily: DayBucket[] }) {
  const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1000);

  return (
    <div className="border-2 border-ink bg-paper p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
          Динамика выручки (14 дней)
        </h2>
        <span className="text-xs text-mute font-bold uppercase tracking-wider">
          Всего: {formatPrice(daily.reduce((s, d) => s + d.revenue, 0))}
        </span>
      </div>

      <div className="mt-6 flex h-40 items-end justify-between gap-1.5 sm:gap-2">
        {daily.map((day) => {
          const heightPct = Math.round((day.revenue / maxRevenue) * 100);
          return (
            <div
              key={day.date}
              className="group relative flex flex-1 flex-col items-center justify-end h-full"
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded border-2 border-ink bg-ink px-2.5 py-1.5 text-[11px] font-bold text-paper shadow-[3px_3px_0_#0c0c0c] z-20 group-hover:block whitespace-nowrap">
                <p className="text-acid">{day.label}</p>
                <p>{formatPrice(day.revenue)}</p>
                <p className="text-paper/70 font-normal">{day.orders} заказов</p>
              </div>

              {/* Bar */}
              <div
                style={{ height: `${Math.max(heightPct, 4)}%` }}
                className={`w-full border-t-2 border-x-2 border-ink transition-all ${
                  day.revenue > 0
                    ? "bg-acid group-hover:bg-signal"
                    : "bg-ink/5"
                }`}
              />

              {/* Date label */}
              <span className="mt-2 text-[9px] font-bold text-mute uppercase tracking-tight truncate w-full text-center">
                {day.label.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
