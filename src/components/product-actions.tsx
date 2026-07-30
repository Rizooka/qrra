"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { FlashWearer } from "@/components/flash-wearer";
import { UvSticker } from "@/components/uv-sticker";
import { useSound } from "@/components/sound-provider";
import { useLiteMode } from "@/hooks/use-lite-mode";
import { track } from "@/lib/analytics/track";
import { formatPrice, type Product } from "@/data/products";

const LiquidPortrait = dynamic(
  () =>
    import("@/components/liquid-portrait").then((m) => m.LiquidPortrait),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-ink text-xs uppercase tracking-widest text-acid">
        Загрузка…
      </div>
    ),
  },
);

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const { playAdd } = useSound();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      data-cursor="hover"
      onClick={() => {
        add(product);
        track({
          event: "add_to_cart",
          product_slug: product.slug,
          product_id: product.id,
          metadata: { price: product.price },
        });
        playAdd();
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      className="w-full border-2 border-ink bg-signal px-6 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink sm:w-auto"
    >
      {added ? "Добавлено" : `В корзину · ${formatPrice(product.price)}`}
    </button>
  );
}

export function ProductHeroVisual({ product }: { product: Product }) {
  const seed = Number(product.id) || 1;
  const lite = useLiteMode();
  const [engaged, setEngaged] = useState(false);

  const showLiquid = !lite && engaged;

  return (
    <div
      className="relative min-h-[420px] overflow-hidden border-2 border-ink bg-ink lg:min-h-full"
      onPointerEnter={() => {
        if (!lite) setEngaged(true);
      }}
    >
      <div className="absolute inset-0">
        {showLiquid ? (
          <LiquidPortrait accent={product.accent} seed={seed} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink p-6">
            <FlashWearer
              frame={product.frame}
              accent={product.accent}
              seed={seed}
              className="h-full w-full max-w-xl"
            />
          </div>
        )}
      </div>
      <UvSticker className="right-[8%] top-[12%] sm:right-[12%] sm:top-[16%]" />
    </div>
  );
}
