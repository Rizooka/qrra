"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart-provider";
import {
  CheckoutStartTracker,
  trackOrderComplete,
} from "@/components/checkout-tracker";
import { formatPrice } from "@/data/products";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";
import { isUuid } from "@/lib/uuid";

export default function CheckoutPage() {
  const { items, total, clear, ready } = useCart();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Ташкент");
  const [line, setLine] = useState("");
  const [delivery, setDelivery] = useState<"courier" | "pickup">("courier");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!ready) {
    return (
      <section className="bg-paper pt-24">
        <div className="mx-auto max-w-[720px] px-4 pb-20">
          <p className="text-mute">Загрузка…</p>
        </div>
      </section>
    );
  }

  if (items.length === 0 && !done) {
    return (
      <section className="bg-paper pt-24">
        <div className="mx-auto max-w-[720px] px-4 pb-20 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">
            Корзина пуста
          </h1>
          <Link
            href="/shop"
            data-cursor="hover"
            className="mt-6 inline-block border-2 border-ink bg-signal px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-paper"
          >
            В магазин
          </Link>
        </div>
      </section>
    );
  }

  if (done) {
    return (
      <section className="bg-ink pt-24 text-paper">
        <div className="mx-auto max-w-[720px] px-4 py-24 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-acid">
            Система
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight sm:text-5xl">
            Заявка принята.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-paper/70">
            Система зафиксировала взгляд. Свяжемся для подтверждения доставки.
          </p>
          <Link
            href="/account"
            data-cursor="hover"
            className="mt-10 inline-block border-2 border-acid bg-acid px-8 py-3 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-ink hover:bg-signal hover:border-signal hover:text-paper"
          >
            В кабинет
          </Link>
        </div>
      </section>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/login?next=/checkout");
      return;
    }

    const { data: order, error: orderErr } = await supabase
      .from(QRRA.orders)
      .insert({
        user_id: user.id,
        status: "new",
        total,
        shipping: {
          name,
          phone,
          city,
          line: delivery === "pickup" ? "Самовывоз" : line,
          delivery,
        },
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      setLoading(false);
      setError(orderErr?.message || "Не удалось создать заказ");
      return;
    }

    const rows = items.map(({ product, qty }) => ({
      order_id: order.id,
      product_id: isUuid(product.id) ? product.id : null,
      product_name: product.name,
      product_slug: product.slug,
      qty,
      price: product.price,
    }));

    const { error: itemsErr } = await supabase
      .from(QRRA.order_items)
      .insert(rows);
    setLoading(false);
    if (itemsErr) {
      setError(itemsErr.message);
      return;
    }

    clear();
    trackOrderComplete(order.id, total);
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <section className="bg-paper pt-24">
      <CheckoutStartTracker />
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
            Оформление
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight">
            Фиксация
          </h1>
          <p className="mt-2 text-sm text-mute">
            Контакт и город. Дальше — доставка.
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-mute">
                Имя
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-mute">
                Телефон
              </span>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
                placeholder="+998 …"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-mute">
                Город
              </span>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
              />
            </label>
            {delivery === "courier" ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-mute">
                  Адрес
                </span>
                <input
                  required
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                  className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 outline-none focus:bg-acid/20"
                />
              </label>
            ) : null}

            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wider text-mute">
                Доставка
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => setDelivery("courier")}
                  className={`border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                    delivery === "courier" ? "bg-ink text-paper" : "bg-paper"
                  }`}
                >
                  Курьер
                </button>
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => setDelivery("pickup")}
                  className={`border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                    delivery === "pickup" ? "bg-ink text-paper" : "bg-paper"
                  }`}
                >
                  Самовывоз
                </button>
              </div>
            </fieldset>

            {error ? (
              <p className="text-sm font-bold text-signal">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              data-cursor="hover"
              className="w-full border-2 border-ink bg-signal px-6 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-ink disabled:opacity-60 sm:w-auto"
            >
              {loading ? "…" : "Зафиксировать"}
            </button>
          </form>
        </div>

        <aside className="h-fit border-2 border-ink bg-ink p-6 text-paper">
          <p className="text-xs uppercase tracking-wider text-paper/50">Итог</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-black tabular-nums">
            {formatPrice(total)}
          </p>
          <ul className="mt-6 space-y-3 border-t border-paper/20 pt-4 text-sm">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex justify-between gap-3">
                <span>
                  {product.name} × {qty}
                </span>
                <span className="tabular-nums opacity-80">
                  {formatPrice(product.price * qty)}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            data-cursor="hover"
            onClick={() => router.push("/cart")}
            className="mt-6 text-xs font-bold uppercase tracking-wider text-acid underline underline-offset-4"
          >
            ← К корзине
          </button>
        </aside>
      </div>
    </section>
  );
}
