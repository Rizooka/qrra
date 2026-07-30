import { notFound } from "next/navigation";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";
import type { ColorGroup } from "@/data/products";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Edit ${id.slice(0, 8)} — Admin QRRA` };
}

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
    <section className="bg-paper pt-10">
      <div className="mx-auto max-w-[800px] px-4 pb-24 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-black tracking-tight">
          {data.name}
        </h1>
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
          }}
        />
      </div>
    </section>
  );
}
