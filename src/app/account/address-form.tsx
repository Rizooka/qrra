"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, qrra } from "@/lib/supabase/client";

export function AddressForm() {
  const router = useRouter();
  const [label, setLabel] = useState("Дом");
  const [city, setCity] = useState("Ташкент");
  const [line, setLine] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Нет сессии");
      return;
    }
    const { error: err } = await qrra(supabase).from("addresses").insert({
      user_id: user.id,
      label,
      city,
      line,
      is_default: false,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setLine("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3 sm:grid-cols-3">
      <input
        required
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Метка"
        className="border-2 border-ink bg-paper px-3 py-2 outline-none focus:bg-acid/20"
      />
      <input
        required
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Город"
        className="border-2 border-ink bg-paper px-3 py-2 outline-none focus:bg-acid/20"
      />
      <input
        required
        value={line}
        onChange={(e) => setLine(e.target.value)}
        placeholder="Улица, дом"
        className="border-2 border-ink bg-paper px-3 py-2 outline-none focus:bg-acid/20 sm:col-span-2"
      />
      <button
        type="submit"
        disabled={loading}
        data-cursor="hover"
        className="border-2 border-ink bg-paper px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] hover:bg-acid disabled:opacity-60"
      >
        Добавить
      </button>
      {error ? (
        <p className="sm:col-span-3 text-sm font-bold text-signal">{error}</p>
      ) : null}
    </form>
  );
}
