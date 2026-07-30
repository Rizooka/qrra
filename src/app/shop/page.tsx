import { Marquee } from "@/components/marquee";
import { ShopGrid } from "@/components/shop-grid";
import { fetchProducts } from "@/lib/products";

export const metadata = {
  title: "Магазин — QRRA",
  description: "Вся коллекция очков QRRA. Смотри первым.",
};

export default async function ShopPage() {
  const products = await fetchProducts({ activeOnly: true });

  return (
    <>
      <section className="border-b-2 border-ink bg-paper pt-24">
        <div className="mx-auto max-w-[1600px] px-4 pb-12 sm:px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
            Коллекция
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.9] tracking-tight">
            Магазин
          </h1>
          <p className="mt-4 max-w-lg text-mute">
            Выбери оправу. Надень. Не объясняй.
          </p>
        </div>
      </section>

      <Marquee tone="acid" />

      <section className="bg-paper">
        <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-10">
          <ShopGrid products={products} />
        </div>
      </section>
    </>
  );
}
