"use client";

import { useMemo, useState } from "react";
import { ProductTile } from "@/components/product-tile";
import {
  filterGroups,
  type ColorGroup,
  type Product,
} from "@/data/products";

export function ShopGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<ColorGroup | "all">("all");

  const list = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.colorGroup === filter);
  }, [filter, products]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterGroups.map((g) => {
            const active = filter === g.id;
            return (
              <button
                key={g.id}
                type="button"
                data-cursor="hover"
                onClick={() => setFilter(g.id)}
                className={`border-2 border-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink hover:bg-acid"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-mute">
          {list.length}{" "}
          {list.length === 1
            ? "модель"
            : list.length < 5
              ? "модели"
              : "моделей"}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="border-2 border-ink p-12 text-center">
          <p className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Пусто.
          </p>
          <p className="mt-2 text-sm text-mute">
            Этот фильтр ничего не поймал. Сбрось систему.
          </p>
          <button
            type="button"
            data-cursor="hover"
            onClick={() => setFilter("all")}
            className="mt-6 border-2 border-ink bg-signal px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-ink"
          >
            Показать все
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((product, i) => (
            <ProductTile
              key={product.id}
              product={product}
              index={i}
              liquid
            />
          ))}
        </div>
      )}
    </div>
  );
}
