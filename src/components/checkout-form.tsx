"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/components/cart-provider";
import { DeliverySummary } from "@/components/delivery-summary";
import { DigitalPassport } from "@/components/digital-passport";
import {
  CheckoutStartTracker,
  trackOrderComplete,
} from "@/components/checkout-tracker";
import { formatPrice } from "@/data/products";
import { calcDiscount, validatePromoCode } from "@/lib/catalog/promo";
import { SERVICE_UNAVAILABLE } from "@/lib/auth-user-messages";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";
import { validateCartStock } from "@/lib/catalog/validate-cart-stock";
import { isUuid } from "@/lib/uuid";

type SavedAddress = {
  id: string;
  label: string | null;
  city: string;
  line: string;
  is_default: boolean | null;
};

export function CheckoutForm() {
  const { items, total, clear, ready } = useCart();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [wasGuest, setWasGuest] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Ташкент");
  const [line, setLine] = useState("");
  const [delivery, setDelivery] = useState<"courier" | "pickup">("courier");
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [promoInput, setPromoInput] = useState("");
  const [promoPercent, setPromoPercent] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");

  const { discount: discountAmount, finalTotal } = calcDiscount(total, promoPercent);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) {
          setBooting(false);
          return;
        }
        setLoggedIn(true);
        const [{ data: profile }, { data: addr }] = await Promise.all([
          supabase
            .from(QRRA.profiles)
            .select("full_name, phone")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from(QRRA.addresses)
            .select("id, label, city, line, is_default")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false }),
        ]);
        if (cancelled) return;
        if (profile?.full_name) setName(profile.full_name);
        if (profile?.phone) setPhone(profile.phone);
        const list = (addr ?? []) as SavedAddress[];
        setAddresses(list);
        const def = list.find((a) => a.is_default) ?? list[0];
        if (def) {
          setSelectedAddressId(def.id);
          setCity(def.city);
          setLine(def.line);
        }
      } catch {
        /* guest flow still works */
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyAddress = (id: string) => {
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setSelectedAddressId(id);
    setCity(a.city);
    setLine(a.line);
  };

  if (!ready || booting) {
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
      <section className="bg-ink min-h-[100svh] pt-24 text-paper relative overflow-hidden">
        <div className="absolute inset-0 noise opacity-10" />
        <div className="mx-auto max-w-[720px] px-4 py-16 text-center relative z-10">
          <p className="animate-rise font-mono text-xs font-bold uppercase tracking-[0.28em] text-acid">
            SYSTEM // ORDER ACCEPTED
          </p>
          <h1 className="animate-rise-delay mt-4 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight sm:text-6xl text-paper">
            ЗАКАЗ ПРИНЯТ
          </h1>
          <p className="animate-rise-delay-2 mx-auto mt-4 max-w-md text-sm leading-relaxed text-paper/70">
            Данные отправлены на склад. Мы свяжемся для подтверждения доставки.
          </p>

          <DigitalPassport
            orderId={createdOrderId || "QRRA-8888"}
            customerName={name}
            total={finalTotal}
            isGuest={wasGuest}
          />

          <div className="mt-10 flex flex-col items-center gap-3">
            {wasGuest ? (
              <Link
                href="/signup"
                data-cursor="hover"
                className="border-2 border-acid bg-acid px-8 py-3.5 font-[family-name:var(--font-display)] text-xs font-extrabold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-signal hover:border-signal hover:text-paper"
              >
                Создать аккаунт
              </Link>
            ) : (
              <Link
                href="/account"
                data-cursor="hover"
                className="border-2 border-acid bg-acid px-8 py-3.5 font-[family-name:var(--font-display)] text-xs font-extrabold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-signal hover:border-signal hover:text-paper"
              >
                Мои заказы
              </Link>
            )}
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-paper/60 underline underline-offset-4 hover:text-acid transition-colors"
              data-cursor="hover"
            >
              Вернуться в магазин →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setLoading(false);
      setError(SERVICE_UNAVAILABLE);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const stockIssues = await validateCartStock(items);
    if (stockIssues.length > 0) {
      setLoading(false);
      const lines = stockIssues.map((i) => {
        if (i.available <= 0) return `${i.name}: нет в наличии`;
        return `${i.name}: в корзине ${i.requested}, на складе ${i.available}`;
      });
      setError(lines.join(". "));
      return;
    }

    const shipping = {
      name,
      phone,
      city,
      line: delivery === "pickup" ? "Самовывоз" : line,
      delivery,
      subtotal: total,
      discount: discountAmount,
      promo_code: promoCode || null,
    };

    const base = { status: "new" as const, total: finalTotal, shipping };

    const orderResult = user
      ? await supabase
          .from(QRRA.orders)
          .insert({ ...base, user_id: user.id })
          .select("id")
          .single()
      : await supabase
          .from(QRRA.orders)
          .insert({ ...base, user_id: null })
          .select("id")
          .single();

    const { data: order, error: orderErr } = orderResult;

    if (orderErr || !order) {
      setLoading(false);
      setError("Не удалось отправить заказ. Попробуй ещё раз или напиши нам.");
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
      setError("Заказ создан частично. Напиши нам в WhatsApp — поможем.");
      return;
    }

    setWasGuest(!user);
    setCreatedOrderId(order.id);
    clear();
    trackOrderComplete(order.id, finalTotal);
    try {
      await fetch("/api/orders/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, phone }),
      });
    } catch {
      /* уведомление не блокирует заказ */
    }
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
            Заказ
          </h1>
          <p className="mt-2 text-sm text-mute">
            {loggedIn
              ? "Проверь контакты и адрес доставки."
              : "Можно без регистрации — укажи имя и телефон. Аккаунт можно создать после заказа."}
          </p>

          {!loggedIn ? (
            <p className="mt-3 text-sm">
              Уже есть аккаунт?{" "}
              <Link
                href="/login?next=/checkout"
                className="font-bold underline underline-offset-4"
                data-cursor="hover"
              >
                Войти
              </Link>
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {loggedIn && addresses.length > 0 ? (
              <fieldset>
                <legend className="text-xs font-bold uppercase tracking-wider text-mute">
                  Сохранённые адреса
                </legend>
                <div className="mt-3 space-y-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      data-cursor="hover"
                      onClick={() => applyAddress(a.id)}
                      className={`w-full border-2 px-4 py-3 text-left text-sm ${
                        selectedAddressId === a.id
                          ? "border-ink bg-ink text-paper"
                          : "border-ink bg-paper hover:bg-acid/20"
                      }`}
                    >
                      <span className="font-bold">
                        {a.label || "Адрес"}
                      </span>
                      <span className="mt-1 block opacity-80">
                        {a.city}, {a.line}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

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

            <div className="border-2 border-ink p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-mute">
                Промокод
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Например QRRA10"
                  className="min-w-[140px] flex-1 border-2 border-ink bg-paper px-3 py-2 text-sm uppercase outline-none focus:bg-acid/20"
                />
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={async () => {
                    setPromoError("");
                    const res = await validatePromoCode(promoInput);
                    if (!res.ok) {
                      setPromoPercent(0);
                      setPromoCode("");
                      setPromoError(res.error);
                      return;
                    }
                    setPromoPercent(res.discountPercent);
                    setPromoCode(res.code);
                  }}
                  className="border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-acid"
                >
                  Применить
                </button>
              </div>
              {promoCode ? (
                <p className="mt-2 text-xs font-bold text-ink">
                  Скидка {promoPercent}% ({promoCode})
                </p>
              ) : null}
              {promoError ? (
                <p className="mt-2 text-xs font-bold text-signal">{promoError}</p>
              ) : null}
            </div>

            {error ? (
              <p className="text-sm font-bold text-signal">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              data-cursor="hover"
              className="w-full border-2 border-ink bg-signal px-6 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-paper hover:bg-ink disabled:opacity-60 sm:w-auto"
            >
              {loading ? "…" : "Отправить заказ"}
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="border-2 border-ink bg-ink p-6 text-paper">
            <p className="text-xs uppercase tracking-wider text-paper/50">Итог</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-black tabular-nums">
              {formatPrice(finalTotal)}
            </p>
            {discountAmount > 0 ? (
              <p className="text-xs text-paper/60">
                Без скидки {formatPrice(total)} · −{formatPrice(discountAmount)}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-paper/50">
              Доставка — отдельно, при подтверждении
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
          </div>
          <DeliverySummary compact />
        </aside>
      </div>
    </section>
  );
}
