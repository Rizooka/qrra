"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  mapSignupError,
  SERVICE_UNAVAILABLE,
} from "@/lib/auth-user-messages";
import { createClient } from "@/lib/supabase/client";
import { syncSignupProfile } from "@/lib/sync-signup-profile";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    let supabase;
    try {
      supabase = createClient();
    } catch (e) {
      setLoading(false);
      setError(SERVICE_UNAVAILABLE);
      return;
    }
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        data: {
          full_name: fullName,
          phone,
        },
      },
    });
    setLoading(false);
    if (err) {
      setError(mapSignupError(err.message, err.code));
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await syncSignupProfile(supabase, userId, fullName, phone, email);
    }

    if (data.session) {
      router.replace("/account");
      router.refresh();
      return;
    }
    if (data.user) {
      setInfo(
        "Аккаунт создан. Если нужно — подтверди email по ссылке из письма, затем войди.",
      );
      return;
    }
    setInfo("Проверь почту или попробуй вход.");
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
      {info ? <p className="text-sm font-bold text-ink">{info}</p> : null}
      <button
        type="submit"
        disabled={loading}
        data-cursor="hover"
        className="w-full border-2 border-ink bg-ink px-6 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-signal disabled:opacity-60"
      >
        {loading ? "…" : "Создать аккаунт"}
      </button>
      <p className="text-sm text-mute">
        Уже есть аккаунт?{" "}
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
