import Link from "next/link";
import { ContactLinks } from "@/components/contact-links";
import { DELIVERY_INFO } from "@/lib/site/delivery";

export const metadata = {
  title: "Доставка и возврат — QRRA",
  description: "Сроки доставки по Узбекистану, самовывоз и возврат очков QRRA.",
};

export default function DeliveryPage() {
  return (
    <section className="bg-paper pt-24">
      <div className="mx-auto max-w-[720px] px-4 pb-24 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
          Сервис
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight sm:text-5xl">
          Доставка и возврат
        </h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              {DELIVERY_INFO.tashkentCourier.label}
            </h2>
            <p className="mt-2 text-mute">
              {DELIVERY_INFO.tashkentCourier.time}.{" "}
              {DELIVERY_INFO.tashkentCourier.priceNote}.
            </p>
          </section>
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              {DELIVERY_INFO.otherCourier.label}
            </h2>
            <p className="mt-2 text-mute">
              {DELIVERY_INFO.otherCourier.time}.{" "}
              {DELIVERY_INFO.otherCourier.priceNote}.
            </p>
          </section>
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              {DELIVERY_INFO.pickup.label}
            </h2>
            <p className="mt-2 text-mute">
              {DELIVERY_INFO.pickup.time}. {DELIVERY_INFO.pickup.priceNote}.{" "}
              {DELIVERY_INFO.pickup.hint}.
            </p>
          </section>
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              Оплата
            </h2>
            <p className="mt-2 text-mute">{DELIVERY_INFO.payment}</p>
          </section>
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
              Возврат
            </h2>
            <p className="mt-2 text-mute">{DELIVERY_INFO.returns}</p>
          </section>
        </div>

        <div className="mt-12 border-2 border-ink p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-mute">
            Вопросы
          </p>
          <ContactLinks variant="inline" message="Здравствуйте! Вопрос по доставке QRRA." />
        </div>

        <p className="mt-8">
          <Link
            href="/shop"
            className="text-sm font-bold uppercase tracking-wider underline underline-offset-4 hover:text-signal"
            data-cursor="hover"
          >
            ← В магазин
          </Link>
        </p>
      </div>
    </section>
  );
}
