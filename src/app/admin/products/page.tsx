import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductsAdminTable } from "@/components/admin/products-admin-table";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Товары — Admin QRRA" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from(QRRA.products)
    .select("id, slug, name, price, color_group, is_active")
    .order("name");

  return (
    <div>
      <AdminPageHeader
        title="Товары"
        description="Каталог витрины: цены, статус, карточки."
        actions={
          <Link
            href="/admin/products/new"
            data-cursor="hover"
            className="border-2 border-ink bg-signal px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-ink"
          >
            + Новый товар
          </Link>
        }
      />
      <ProductsAdminTable products={products ?? []} />
    </div>
  );
}
