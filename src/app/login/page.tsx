import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Вход — QRRA",
};

export default function LoginPage() {
  return (
    <section className="bg-paper pt-24">
      <div className="mx-auto max-w-[420px] px-4 pb-24">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
          Доступ
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight">
          Вход
        </h1>
        <Suspense fallback={<p className="mt-8 text-mute">Загрузка…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
