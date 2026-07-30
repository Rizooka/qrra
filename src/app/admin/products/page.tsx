import Link from "next/link";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/data/products";
import { DeleteProductButton } from "./delete-button";
import { ToggleActiveButton } from "./toggle-active";

export const metadata = { title: "Товары — Admin QRRA" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from(QRRA.products)
    .select("id, slug, name, price, color_group, is_active")
    .order("name");

  return (
    <section className="bg-paper pt-10">
      <div className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black tracking-tight">
            Товары
          </h1>
          <Link
            href="/admin/products/new"
            data-cursor="hover"
            className="border-2 border-ink bg-signal px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-paper"
          >
            Новый
          </Link>
        </div>

        <ul className="mt-8 divide-y-2 divide-ink border-2 border-ink">
          {(products ?? []).map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-mute">
                  {p.slug} · {p.color_group} · {formatPrice(p.price)}
                </p>
              </div>
              <ToggleActiveButton id={p.id} isActive={p.is_active} />
              <Link
                href={`/admin/products/${p.id}`}
                data-cursor="hover"
                className="border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-acid"
              >
                Edit
              </Link>
              <DeleteProductButton id={p.id} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
