"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Ошибка конфигурации.");
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=/account`;

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="mt-10 text-sm font-bold">
        Письмо отправлено. Открой ссылку из почты и задай новый пароль.
      </p>
    );
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
      {error ? <p className="text-sm font-bold text-signal">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        data-cursor="hover"
        className="w-full border-2 border-ink bg-signal px-6 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-ink disabled:opacity-60"
      >
        {loading ? "…" : "Отправить ссылку"}
      </button>
      <p className="text-sm text-mute">
        <Link
          href="/login"
          data-cursor="hover"
          className="font-bold text-ink underline underline-offset-4"
        >
          ← Вход
        </Link>
      </p>
    </form>
  );
}
