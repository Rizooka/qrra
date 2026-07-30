"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { CartViewTracker } from "@/components/cart-view-tracker";
import { GlassesVisual } from "@/components/glasses-visual";
import { formatPrice } from "@/data/products";
import { track } from "@/lib/analytics/track";

export default function CartPage() {
  const { items, total, setQty, remove, clear, ready } = useCart();

  if (!ready) {
    return (
      <section className="bg-paper pt-24">
        <div className="mx-auto max-w-[900px] px-4 pb-20 sm:px-6">
          <p className="text-mute">Загрузка корзины…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper pt-24">
      <CartViewTracker />
      <div className="mx-auto max-w-[900px] px-4 pb-20 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
          Корзина
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight sm:text-5xl">
          Твой удар
        </h1>

        {items.length === 0 ? (
          <div className="mt-12 border-2 border-ink p-10 text-center">
            <p className="text-mute">Пока пусто. Взгляд ещё не выбран.</p>
            <Link
              href="/shop"
              data-cursor="hover"
              className="mt-6 inline-block border-2 border-ink bg-signal px-6 py-3 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-ink"
            >
              В магазин
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-10 divide-y-2 divide-ink border-2 border-ink">
              {items.map(({ product, qty }) => (
                <li
                  key={product.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <div
                    className="flex h-24 w-full items-center justify-center sm:w-36"
                    style={{ backgroundColor: `${product.accent}33` }}
                  >
                    <GlassesVisual
                      frame={product.frame}
                      accent={product.accent}
                      className="w-28"
                    />
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/shop/${product.slug}`}
                      data-cursor="hover"
                      className="font-[family-name:var(--font-display)] text-lg font-extrabold hover:text-signal"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-mute">{product.color}</p>
                    <p className="mt-1 font-bold tabular-nums">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Меньше"
                      data-cursor="hover"
                      onClick={() => {
                        if (qty <= 1) {
                          track({
                            event: "remove_from_cart",
                            product_slug: product.slug,
                            product_id: product.id,
                          });
                        }
                        setQty(product.id, qty - 1);
                      }}
                      className="h-9 w-9 border-2 border-ink font-bold hover:bg-ink hover:text-paper"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Больше"
                      data-cursor="hover"
                      onClick={() => {
                        track({
                          event: "add_to_cart",
                          product_slug: product.slug,
                          product_id: product.id,
                          metadata: { qty: qty + 1 },
                        });
                        setQty(product.id, qty + 1);
                      }}
                      className="h-9 w-9 border-2 border-ink font-bold hover:bg-ink hover:text-paper"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      data-cursor="hover"
                      onClick={() => {
                        track({
                          event: "remove_from_cart",
                          product_slug: product.slug,
                          product_id: product.id,
                        });
                        remove(product.id);
                      }}
                      className="ml-2 text-xs font-bold uppercase tracking-wider text-mute underline hover:text-signal"
                    >
                      Убрать
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4 border-2 border-ink bg-ink p-6 text-paper sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-paper/60">
                  Итого
                </p>
                <p className="font-[family-name:var(--font-display)] text-3xl font-black tabular-nums">
                  {formatPrice(total)}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={clear}
                  className="border-2 border-paper/30 px-5 py-3 text-xs font-bold uppercase tracking-wider hover:border-paper"
                >
                  Очистить
                </button>
                <Link
                  href="/checkout"
                  data-cursor="hover"
                  className="border-2 border-acid bg-acid px-6 py-3 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-ink hover:bg-signal hover:border-signal hover:text-paper"
                >
                  Оформить
                </Link>
              </div>
            </div>
            <p className="mt-3 text-xs text-mute">
              Доставка по Узбекистану · 30 дней на возврат.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
