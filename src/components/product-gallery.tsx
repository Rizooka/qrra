"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/data/products";

export function ProductGallery({
  product,
  images,
}: {
  product: Product;
  images: string[];
}) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];

  return (
    <div className="relative min-h-[420px] border-2 border-ink bg-ink lg:min-h-full">
      <div className="relative aspect-[4/5] min-h-[420px] w-full lg:min-h-[calc(100svh-4rem)]">
        <Image
          src={current}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 border-t-2 border-ink bg-paper p-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              data-cursor="hover"
              onClick={() => setIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden border-2 ${
                i === index ? "border-signal" : "border-ink/30"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
