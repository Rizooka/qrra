"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

export function OrderNotesForm({
  orderId,
  initialNotes,
}: {
  orderId: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );

  const onSave = async () => {
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase
      .from(QRRA.orders)
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) {
      setStatus("err");
      return;
    }
    setStatus("ok");
    router.refresh();
    window.setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <section className="border-2 border-ink p-5 lg:col-span-2">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold">
        Заметки
      </h2>
      <p className="mt-1 text-xs text-mute">
        Внутренние — клиент не видит.
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="mt-4 w-full border-2 border-ink bg-paper px-3 py-2 text-sm outline-none focus:bg-acid/20"
        placeholder="Позвонить, адрес уточнить, скидка…"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          data-cursor="hover"
          onClick={onSave}
          disabled={status === "loading"}
          className="border-2 border-ink bg-ink px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-paper hover:bg-signal disabled:opacity-60"
        >
          {status === "loading" ? "…" : "Сохранить"}
        </button>
        {status === "ok" ? (
          <span className="text-xs font-bold text-ink">Сохранено</span>
        ) : null}
        {status === "err" ? (
          <span className="text-xs font-bold text-signal">Ошибка</span>
        ) : null}
      </div>
    </section>
  );
}
