"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { products as staticProducts } from "@/data/products";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

type Line = {
  product_slug: string;
  product_name: string;
  qty: number;
  price: number;
};

export function OrderRepeatButton({ items }: { items: Line[] }) {
  const { add } = useCart();
  const router = useRouter();

  const onRepeat = async () => {
    for (const line of items) {
      let product =
        staticProducts.find((p) => p.slug === line.product_slug) ?? null;
      if (!product) {
        const supabase = createClient();
        const { data } = await supabase
          .from(QRRA.products)
          .select("id, slug, name, price, color, lens, vibe, description, accent, frame, tags, color_group, fit, fit_note, specs, care")
          .eq("slug", line.product_slug)
          .eq("is_active", true)
          .maybeSingle();
        if (data) {
          product = {
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
            tags: data.tags ?? [],
            colorGroup: (data.color_group as "acid") || "black",
            fit: "one-size",
            fitNote: data.fit_note,
            specs: data.specs ?? {
              material: "",
              weight: "",
              uv: "",
              warranty: "",
            },
            care: data.care,
          };
        }
      }
      if (!product) {
        product = {
          id: line.product_slug,
          slug: line.product_slug,
          name: line.product_name,
          price: line.price,
          color: "",
          lens: "",
          vibe: "",
          description: "",
          accent: "#111111",
          frame: "#111111",
          tags: [],
          colorGroup: "black",
          fit: "one-size",
          fitNote: "",
          specs: {
            material: "",
            weight: "",
            uv: "",
            warranty: "",
          },
          care: "",
        };
      }
      for (let i = 0; i < line.qty; i++) add(product);
    }
    router.push("/cart");
  };

  return (
    <button
      type="button"
      data-cursor="hover"
      onClick={() => onRepeat()}
      className="mt-4 border-2 border-ink px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] hover:bg-acid"
    >
      Купить снова
    </button>
  );
}
