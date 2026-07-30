"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { GlassesVisual } from "@/components/glasses-visual";
import { FlashWearer } from "@/components/flash-wearer";
import { formatPrice, type Product } from "@/data/products";
import { track } from "@/lib/analytics/track";
import { isInStock, primaryProductImage, stockLabel } from "@/lib/catalog/product-stock";
import { useSound } from "@/components/sound-provider";
import { useLiteMode } from "@/hooks/use-lite-mode";

const LiquidPortrait = dynamic(
  () =>
    import("@/components/liquid-portrait").then((m) => m.LiquidPortrait),
  { ssr: false },
);

export function ProductTile({
  product,
  index = 0,
  liquid = false,
}: {
  product: Product;
  index?: number;
  liquid?: boolean;
}) {
  const seed = Number(product.id) || 1;
  const { playHover } = useSound();
  const lite = useLiteMode();
  const [active, setActive] = useState(false);
  const hovered = useRef(false);
  const useLiquid = liquid && !lite;
  const photo = primaryProductImage(product);
  const inStock = isInStock(product);

  return (
    <Link
      href={`/shop/${product.slug}`}
      data-cursor="hover"
      className="group relative block min-w-0 overflow-hidden border-2 border-ink bg-paper"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => {
        track({
          event: "product_click",
          product_slug: product.slug,
          product_id: product.id,
        });
      }}
      onMouseEnter={() => {
        setActive(true);
        if (!hovered.current) {
          hovered.current = true;
          playHover();
        }
      }}
      onMouseLeave={() => {
        setActive(false);
        hovered.current = false;
      }}
    >
      <div className="product-tile-media relative aspect-[4/3] overflow-hidden bg-white">
        {photo ? (
          <Image
            src={photo}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : null}
        <div
          className={`tile-default absolute inset-0 flex items-center justify-center bg-white ${
            active || photo ? "invisible" : ""
          }`}
        >
          <div className="absolute inset-0 diagonal-stripes opacity-50" />
          <GlassesVisual
            frame={product.frame}
            accent={product.accent}
            className="relative z-10 w-[78%]"
          />
          <span className="absolute left-3 top-3 z-10 bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-paper">
            {product.vibe}
          </span>
          <span
            className={`absolute right-3 top-3 z-10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
              inStock ? "bg-acid text-ink" : "bg-signal text-paper"
            }`}
          >
            {stockLabel(product)}
          </span>
        </div>

        <div
          className={`tile-flash absolute inset-0 bg-acid p-2.5 ${
            active ? "visible" : "invisible"
          }`}
        >
          <div className="relative h-full w-full overflow-hidden border-2 border-ink bg-ink">
            {active && useLiquid ? (
              <LiquidPortrait accent={product.accent} seed={seed} />
            ) : active ? (
              <FlashWearer
                frame={product.frame}
                accent={product.accent}
                seed={seed}
                className="h-full w-full"
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`flex items-end justify-between gap-3 border-t-2 border-ink p-4 transition-none ${
          active ? "bg-acid" : "bg-paper"
        }`}
      >
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight sm:text-xl">
            {product.name}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wide opacity-60">
            {product.color} · {product.lens}
          </p>
        </div>
        <p className="shrink-0 font-bold tabular-nums">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
