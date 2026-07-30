"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    let supabase;
    try {
      supabase = createClient();
    } catch (e) {
      setLoading(false);
      setError(
        e instanceof Error
          ? e.message
          : "Неверная конфигурация Supabase на сервере.",
      );
      return;
    }
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });
    setLoading(false);
    if (err) {
      const msg = err.message;
      if (
        msg.includes("Invalid path") ||
        msg.includes("PGRST125") ||
        msg.includes("No host")
      ) {
        setError(
          "Неверный NEXT_PUBLIC_SUPABASE_URL в Vercel. Нужен Project URL: https://xxx.supabase.co (Settings → API), не connection string и не /rest/v1.",
        );
        return;
      }
      setError(msg);
      return;
    }
    router.replace("/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-mute">
          Имя
        </span>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-mute">
          Телефон
        </span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
          placeholder="+998 …"
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-mute">
          Email
        </span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-mute">
          Пароль
        </span>
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
          autoComplete="new-password"
        />
      </label>
      {error ? <p className="text-sm font-bold text-signal">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        data-cursor="hover"
        className="w-full border-2 border-ink bg-ink px-6 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-signal disabled:opacity-60"
      >
        {loading ? "…" : "Создать доступ"}
      </button>
      <p className="text-sm text-mute">
        Уже в системе?{" "}
        <Link
          href="/login"
          data-cursor="hover"
          className="font-bold text-ink underline underline-offset-4"
        >
          Войти
        </Link>
      </p>
    </form>
  );
}
