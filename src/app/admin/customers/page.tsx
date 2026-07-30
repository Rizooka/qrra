import { createClient, qrra } from "@/lib/supabase/server";

export const metadata = { title: "Клиенты — Admin QRRA" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await qrra(supabase)
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="bg-paper pt-10">
      <div className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-black tracking-tight">
          Клиенты
        </h1>
        <ul className="mt-8 divide-y-2 divide-ink border-2 border-ink">
          {(customers ?? []).map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-bold">{c.full_name || "Без имени"}</p>
                <p className="text-xs text-mute">
                  {c.phone || "—"} · {c.id.slice(0, 8)}…
                </p>
              </div>
              <span
                className={`border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  c.role === "admin" ? "bg-acid" : "bg-paper"
                }`}
              >
                {c.role}
              </span>
            </li>
          ))}
          {(customers ?? []).length === 0 ? (
            <li className="px-4 py-6 text-sm text-mute">Пока пусто.</li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
