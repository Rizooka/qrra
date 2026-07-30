import { ForgotPasswordForm } from "./forgot-form";

export const metadata = { title: "Сброс пароля — QRRA" };

export default function ForgotPasswordPage() {
  return (
    <section className="bg-paper pt-24">
      <div className="mx-auto max-w-[420px] px-4 pb-24">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
          Доступ
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight">
          Сброс пароля
        </h1>
        <p className="mt-2 text-sm text-mute">
          Ссылка придёт на почту. Если аккаунт уже был в этом Supabase — пароль
          сбросится для него.
        </p>
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
