"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FlashWearer } from "@/components/flash-wearer";
import { GlassesVisual } from "@/components/glasses-visual";
import { useSound } from "@/components/sound-provider";
import { Product, formatPrice } from "@/data/products";
import { useCart } from "@/components/cart-provider";

const captions = [
  "Не для зеркала. Для улицы.",
  "Flash без разрешения.",
  "Оправа занимает кадр.",
  "Холодный свет. Горячий тон.",
  "Система видит первой.",
  "Ноль извинений.",
  "Типографика лица.",
  "Последний кадр смены.",
];

export function LookbookGrid({ products }: { products: Product[] }) {
  const { playHover, playClick, playAdd } = useSound();
  const { add } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<{
    product: Product;
    caption: string;
  } | null>(null);

  return (
    <>
      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-10 xl:grid-cols-4">
        {products.map((product, i) => {
          const caption = captions[i % captions.length];
          return (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.025, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative block overflow-hidden border-2 border-ink bg-ink shadow-[4px_4px_0_#0c0c0c] transition-all hover:shadow-[8px_8px_0_#FF3B00]"
              onMouseEnter={playHover}
            >
              <div
                onClick={() => {
                  playClick();
                  setSelectedProduct({ product, caption });
                }}
                className="cursor-pointer aspect-[3/4] overflow-hidden relative"
              >
                {i % 3 === 1 ? (
                  <div
                    className="flex h-full items-center justify-center p-8 transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundColor: `${product.accent}33` }}
                  >
                    <GlassesVisual
                      frame={product.frame}
                      accent={product.accent}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <FlashWearer
                    frame={product.frame}
                    accent={product.accent}
                    seed={Number(product.id)}
                    className="h-full w-full"
                  />
                )}
                <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="border-2 border-acid bg-acid px-4 py-2 font-[family-name:var(--font-display)] text-xs font-black uppercase text-ink tracking-widest shadow-[4px_4px_0_#0c0c0c]">
                    Откадровать ⚡
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 border-t-2 border-ink bg-paper p-3.5">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-sm font-black text-ink">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-mute font-medium">
                    {caption}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setSelectedProduct({ product, caption });
                  }}
                  className="border border-ink bg-paper px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-signal hover:bg-signal hover:text-paper"
                >
                  View
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Editorial Modal Lightbox */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden border-4 border-paper bg-ink text-paper shadow-[12px_12px_0_#FF3B00]"
            >
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 z-20 border-2 border-paper bg-paper px-3 py-1 font-mono text-xs font-bold text-ink hover:bg-signal hover:text-paper"
              >
                ESC ✕
              </button>

              <div className="grid gap-0 sm:grid-cols-2">
                <div className="aspect-[3/4] border-b-2 border-paper/20 sm:border-b-0 sm:border-r-2 bg-ink/80 flex items-center justify-center">
                  <FlashWearer
                    frame={selectedProduct.product.frame}
                    accent={selectedProduct.product.accent}
                    seed={Number(selectedProduct.product.id)}
                    className="h-full w-full"
                  />
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-8">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-acid">
                      EDITORIAL SHOT // #{selectedProduct.product.id}
                    </span>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-black text-paper">
                      {selectedProduct.product.name}
                    </h2>
                    <p className="mt-2 text-xl font-bold text-acid">
                      {formatPrice(selectedProduct.product.price)}
                    </p>
                    <p className="mt-4 text-xs font-medium uppercase tracking-wider text-paper/70 leading-relaxed italic border-l-2 border-signal pl-3">
                      "{selectedProduct.caption}"
                    </p>
                    <p className="mt-4 text-xs text-paper/60 leading-relaxed">
                      {selectedProduct.product.description}
                    </p>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        playAdd();
                        add(selectedProduct.product);
                      }}
                      className="w-full border-2 border-acid bg-acid py-3.5 font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.18em] text-ink hover:bg-signal hover:border-signal hover:text-paper shadow-[4px_4px_0_#FF3B00]"
                    >
                      В корзину ⚡
                    </button>
                    <Link
                      href={`/shop/${selectedProduct.product.slug}`}
                      className="block w-full border-2 border-paper/40 py-3 text-center text-xs font-bold uppercase tracking-wider text-paper hover:border-paper hover:bg-paper hover:text-ink"
                    >
                      Открыть карточку товара →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
