import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Регистрация — QRRA",
};

export default function SignupPage() {
  return (
    <section className="bg-paper pt-24">
      <div className="mx-auto max-w-[420px] px-4 pb-24">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
          Аккаунт
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight">
          Регистрация
        </h1>
        <SignupForm />
      </div>
    </section>
  );
}
