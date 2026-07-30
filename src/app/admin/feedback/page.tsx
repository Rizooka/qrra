import { AdminPageHeader } from "@/components/admin/page-header";
import type { FeedbackKind } from "@/lib/analytics/event-names";
import { FEEDBACK_KIND_LABEL } from "@/lib/analytics/event-names";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Пожелания — Admin QRRA" };

export default async function AdminFeedbackPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from(QRRA.feedback)
    .select("id, kind, message, email, product_slug, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <AdminPageHeader
        title="Пожелания и идеи"
        description="Что просят клиенты — для каталога, дропов и сервиса."
      />
      <ul className="mx-4 divide-y-2 divide-ink border-2 border-ink sm:mx-8">
        {(rows ?? []).map((row) => (
          <li key={row.id} className="px-4 py-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-mute">
              <span className="border border-ink px-2 py-0.5">
                {FEEDBACK_KIND_LABEL[row.kind as FeedbackKind] ?? row.kind}
              </span>
              {row.product_slug ? (
                <span>товар: {row.product_slug}</span>
              ) : null}
              <span>
                {new Date(row.created_at).toLocaleString("ru-RU")}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{row.message}</p>
            {row.email ? (
              <p className="mt-2 text-xs font-bold text-signal">{row.email}</p>
            ) : null}
          </li>
        ))}
        {(rows ?? []).length === 0 ? (
          <li className="px-4 py-12 text-sm text-mute">
            Пока пусто. Форма в футере и на карточках товара.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
