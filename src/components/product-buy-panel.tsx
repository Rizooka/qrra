"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
import { AddToCartButton } from "@/components/product-actions";
import Link from "next/link";

export function ProductBuyPanel({ product }: { product: Product }) {
  const [fitSelected, setFitSelected] = useState(true);

  return (
    <div className="mt-8 space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-mute">
          Посадка
        </p>
        <button
          type="button"
          data-cursor="hover"
          onClick={() => setFitSelected(true)}
          className={`mt-3 border-2 px-4 py-3 text-left transition-colors ${
            fitSelected
              ? "border-ink bg-ink text-paper"
              : "border-ink bg-paper hover:bg-acid"
          }`}
        >
          <span className="block font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-wider">
            One Size
          </span>
          <span className="mt-1 block text-xs opacity-70">{product.fitNote}</span>
        </button>
      </div>

      <div className="grid gap-3 border-y-2 border-ink py-6 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-mute">Доставка</p>
          <p className="mt-1 font-bold">По Узбекистану</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-mute">Возврат</p>
          <p className="mt-1 font-bold">30 дней</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-mute">Гарантия</p>
          <p className="mt-1 font-bold">{product.specs.warranty}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-mute">Материал</dt>
          <dd className="mt-1 font-bold">{product.specs.material}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-mute">Вес</dt>
          <dd className="mt-1 font-bold">{product.specs.weight}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-mute">Защита</dt>
          <dd className="mt-1 font-bold">{product.specs.uv}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-mute">Уход</dt>
          <dd className="mt-1 font-bold leading-snug">{product.care}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-4">
        <AddToCartButton product={product} />
        <Link
          href="/shop"
          className="text-sm font-bold uppercase tracking-wider underline decoration-2 underline-offset-4 hover:text-signal"
          data-cursor="hover"
        >
          ← Назад в магазин
        </Link>
      </div>
    </div>
  );
}
