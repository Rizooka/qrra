"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { GlassesVisual } from "@/components/glasses-visual";
import { products, formatPrice } from "@/data/products";
import { useSound } from "@/components/sound-provider";

export function XRayDrop() {
  const featured = products.slice(0, 4);
  const sectionRef = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 40 });
  const { playHover } = useSound();
  const lastHover = useRef<string | null>(null);

  const onMove = (e: MouseEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section
      id="drop"
      ref={sectionRef}
      onMouseMove={onMove}
      className="relative overflow-hidden border-b-2 border-ink bg-ink select-none"
    >
      <div className="relative z-0 mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-acid">
              Дроп 01 · X-Ray
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-signal sm:text-5xl">
              Не для фоток в зеркале.
            </h2>
            <p className="mt-3 max-w-md text-sm text-acid/70">
              Оправы из темноты. Кислота и сигнал — без смягчения.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-bold uppercase tracking-wider text-acid underline decoration-2 underline-offset-4 hover:text-signal"
            data-cursor="hover"
          >
            Вся коллекция →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              data-cursor="hover"
              onMouseEnter={() => {
                if (lastHover.current !== product.id) {
                  lastHover.current = product.id;
                  playHover();
                }
              }}
              onMouseLeave={() => {
                lastHover.current = null;
              }}
              className="group relative block overflow-hidden border-2 border-acid"
            >
              <div
                className="relative flex aspect-[4/3] items-center justify-center"
                style={{
                  background: `linear-gradient(145deg, ${product.accent} 0%, #B8FF00 55%, #FF3B00 100%)`,
                }}
              >
                <GlassesVisual
                  frame="#0c0c0c"
                  accent="#0c0c0c"
                  className="w-[78%]"
                />
                <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-acid">
                  {product.vibe}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3 border-t-2 border-ink bg-signal p-4 text-ink">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-tight sm:text-xl">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-wide opacity-70">
                    {product.color}
                  </p>
                </div>
                <p className="shrink-0 font-bold tabular-nums">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Black veil with flashlight hole — reveals acid/orange underneath */}
      <div
        className="pointer-events-none absolute inset-0 z-10 hidden md:block"
        style={{
          background: `radial-gradient(circle 200px at ${pos.x}% ${pos.y}%, transparent 0%, transparent 28%, rgba(12,12,12,0.55) 48%, #0c0c0c 72%)`,
        }}
      />

      {/* Difference spotlight ring for x-ray bite */}
      <div
        className="pointer-events-none absolute z-20 hidden h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-difference md:block"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
        }}
      />

      <p className="relative z-30 px-4 pb-6 text-center text-[10px] uppercase tracking-[0.2em] text-paper/40 md:hidden">
        Дроп 01 · X-Ray
      </p>
    </section>
  );
}
