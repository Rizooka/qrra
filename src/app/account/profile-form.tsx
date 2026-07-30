"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

export function AccountProfileForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [tel, setTel] = useState(phone);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(fullName);
    setTel(phone);
  }, [fullName, phone]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setMsg("Нет сессии");
      return;
    }
    const { error } = await supabase
      .from(QRRA.profiles)
      .update({
        full_name: name,
        phone: tel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg("Сохранено");
    router.refresh();
  }

  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">
        Профиль
      </h2>
      <p className="mt-2 text-sm text-mute">
        Контакты для заказов. При регистрации они уже здесь — меняй только если
        нужно.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-mute">
            Имя
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-mute">
            Телефон
          </span>
          <input
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
          />
        </label>
        <div className="sm:col-span-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            data-cursor="hover"
            className="border-2 border-ink bg-ink px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-signal disabled:opacity-60"
          >
            Сохранить
          </button>
          {msg ? <p className="text-sm text-mute">{msg}</p> : null}
        </div>
      </form>
    </div>
  );
}
