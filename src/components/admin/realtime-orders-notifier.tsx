"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QRRA } from "@/lib/db/tables";

type RealtimeOrder = {
  id: string;
  total: number;
  created_at: string;
};

// Play audio chime using Web Audio API
function playOrderChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.5);
  } catch {
    // Audio context may be blocked before user interaction
  }
}

export function RealtimeOrdersNotifier() {
  const router = useRouter();
  const [newOrders, setNewOrders] = useState<RealtimeOrder[]>([]);
  const [activeToast, setActiveToast] = useState<RealtimeOrder | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: QRRA.orders,
        },
        (payload) => {
          const newOrder = payload.new as RealtimeOrder;
          playOrderChime();
          setNewOrders((prev) => [newOrder, ...prev]);
          setActiveToast(newOrder);
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <>
      {/* Toast Notification overlay */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm border-2 border-ink bg-acid p-4 shadow-[6px_6px_0_#0c0c0c]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-ink">
                ⚡ Новый заказ!
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-extrabold text-ink">
                {activeToast.total.toLocaleString("ru-RU")} сум
              </p>
              <p className="text-xs text-ink/70">
                № {activeToast.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-ink font-extrabold hover:text-signal text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/admin/orders/${activeToast.id}`}
              onClick={() => setActiveToast(null)}
              className="border-2 border-ink bg-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-paper hover:bg-signal"
            >
              Открыть заказ →
            </Link>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="border-2 border-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-paper"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}
