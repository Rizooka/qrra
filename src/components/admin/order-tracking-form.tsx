"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

export function OrderTrackingForm({
  orderId,
  initialTracking,
  initialCarrier,
}: {
  orderId: string;
  initialTracking: string;
  initialCarrier: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tracking, setTracking] = useState(initialTracking);
  const [carrier, setCarrier] = useState(initialCarrier);
  const [saved, setSaved] = useState(false);

  const carriers = [
    "Uzpost",
    "Express24",
    "SDEK",
    "Yandex Доставка",
    "Курьер",
    "Самовывоз",
    "Другое",
  ];

  const save = () => {
    startTransition(async () => {
      const supabase = createClient();
      const { data: current } = await supabase
        .from(QRRA.orders)
        .select("shipping")
        .eq("id", orderId)
        .single();

      const shipping = (current?.shipping ?? {}) as Record<string, string>;
      const updated = {
        ...shipping,
        tracking_number: tracking.trim(),
        carrier: carrier.trim(),
      };

      await supabase
        .from(QRRA.orders)
        .update({ shipping: updated, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  };

  return (
    <section className="border-2 border-ink p-5 lg:col-span-2">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
        Доставка и трек-номер
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mute">
            Трек-номер
          </label>
          <input
            className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2 font-mono text-sm outline-none focus:bg-acid/20"
            placeholder="RU123456789UZ"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mute">
            Служба
          </label>
          <select
            className="mt-2 w-full border-2 border-ink bg-paper px-3 py-2 text-sm outline-none"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
          >
            <option value="">— выбрать —</option>
            {carriers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className={`mt-2 border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-60 ${
              saved ? "border-acid bg-acid" : "bg-paper hover:bg-acid"
            }`}
          >
            {isPending ? "…" : saved ? "✓ Сохранено" : "Сохранить"}
          </button>
        </div>
      </div>
      {tracking && (
        <p className="mt-3 text-xs text-mute">
          Клиент увидит трек-номер в своём личном кабинете.
        </p>
      )}
    </section>
  );
}
