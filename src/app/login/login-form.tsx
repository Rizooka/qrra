"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";
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
        e instanceof Error ? e.message : "Неверная конфигурация Supabase.",
      );
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5">
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
          autoComplete="current-password"
        />
      </label>
      {error ? <p className="text-sm font-bold text-signal">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        data-cursor="hover"
        className="w-full border-2 border-ink bg-signal px-6 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-ink disabled:opacity-60"
      >
        {loading ? "…" : "Войти"}
      </button>
      <p className="text-sm text-mute">
        Нет доступа?{" "}
        <Link
          href="/signup"
          data-cursor="hover"
          className="font-bold text-ink underline underline-offset-4"
        >
          Регистрация
        </Link>
      </p>
    </form>
  );
}
