import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { DeleteProductButton } from "../delete-button";
import { ToggleActiveButton } from "../toggle-active";
import { ProductForm } from "../product-form";
import type { ColorGroup } from "@/data/products";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from(QRRA.products)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const specs = (data.specs ?? {}) as {
    material?: string;
    weight?: string;
    uv?: string;
    warranty?: string;
  };

  return (
    <div>
      <AdminPageHeader
        title={data.name}
        description={data.slug}
        actions={
          <>
            <Link
              href={`/shop/${data.slug}`}
              className="border-2 border-ink px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-acid"
              data-cursor="hover"
            >
              На витрину
            </Link>
            <ToggleActiveButton id={data.id} isActive={data.is_active} />
            <DeleteProductButton id={data.id} />
          </>
        }
      />
      <div className="px-4 pb-16 sm:px-8 max-w-4xl">
        <ProductForm
          initial={{
            id: data.id,
            slug: data.slug,
            name: data.name,
            price: data.price,
            color: data.color,
            lens: data.lens,
            vibe: data.vibe,
            description: data.description,
            accent: data.accent,
            frame: data.frame,
            tags: (data.tags ?? []).join(", "),
            color_group: data.color_group as ColorGroup,
            fit: data.fit,
            fit_note: data.fit_note,
            material: specs.material ?? "",
            weight: specs.weight ?? "",
            uv: specs.uv ?? "UV400",
            warranty: specs.warranty ?? "Lifetime",
            care: data.care,
            is_active: data.is_active,
            stock: data.stock ?? 10,
            images: Array.isArray(data.images)
              ? (data.images as string[])
              : [],
          }}
        />
      </div>
    </div>
  );
}
