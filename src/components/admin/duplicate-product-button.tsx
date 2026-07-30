"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QRRA } from "@/lib/db/tables";

export function DuplicateProductButton({
  product,
}: {
  product: {
    slug: string;
    name: string;
    price: number;
    cost_price: number | null;
    sale_price: number | null;
    sale_starts_at: string | null;
    sale_ends_at: string | null;
    low_stock_threshold: number | null;
    color: string;
    lens: string;
    vibe: string;
    description: string;
    accent: string;
    frame: string;
    tags: string[];
    color_group: string;
    fit: string;
    fit_note: string;
    specs: Record<string, string>;
    care: string;
    images: string[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const duplicate = () => {
    startTransition(async () => {
      const supabase = createClient();
      const newSlug = `${product.slug}-copy-${Date.now().toString(36)}`;

      const { data, error: err } = await supabase
        .from(QRRA.products)
        .insert({
          slug: newSlug,
          name: `${product.name} (копия)`,
          price: product.price,
          cost_price: product.cost_price,
          sale_price: null,
          sale_starts_at: null,
          sale_ends_at: null,
          low_stock_threshold: product.low_stock_threshold ?? 3,
          color: product.color,
          lens: product.lens,
          vibe: product.vibe,
          description: product.description,
          accent: product.accent,
          frame: product.frame,
          tags: product.tags,
          color_group: product.color_group,
          fit: product.fit,
          fit_note: product.fit_note,
          specs: product.specs,
          care: product.care,
          images: product.images,
          is_active: false, // копия создаётся скрытой
          stock: 0,
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (err || !data) {
        setError(err?.message ?? "Не удалось дублировать");
        return;
      }

      router.push(`/admin/products/${data.id}`);
      router.refresh();
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={duplicate}
        disabled={isPending}
        data-cursor="hover"
        className="border-2 border-ink px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-acid disabled:opacity-60"
      >
        {isPending ? "Копирую…" : "Дублировать"}
      </button>
      {error && <p className="mt-1 text-xs text-signal">{error}</p>}
    </div>
  );
}
