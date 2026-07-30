import Link from "next/link";
import { FlashWearer } from "@/components/flash-wearer";
import { GlassesVisual } from "@/components/glasses-visual";
import { Marquee } from "@/components/marquee";
import { products } from "@/data/products";

export const metadata = {
  title: "Lookbook — QRRA",
  description: "Editorial кадры QRRA. Взгляд как система.",
};

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

export default function LookbookPage() {
  return (
    <>
      <section className="border-b-2 border-ink bg-paper pt-24">
        <div className="mx-auto max-w-[1600px] px-4 pb-12 sm:px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
            Editorial
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.9] tracking-tight">
            Lookbook
          </h1>
          <p className="mt-4 max-w-lg text-mute">
            Кадры без студийной вежливости. Взгляд без разрешения.
          </p>
        </div>
      </section>

      <Marquee tone="signal" />

      <section className="bg-paper">
        <div className="mx-auto grid max-w-[1600px] gap-3 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-10 xl:grid-cols-4">
          {products.map((product, i) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              data-cursor="hover"
              className="group relative block overflow-hidden border-2 border-ink bg-ink"
            >
              <div className="aspect-[3/4] overflow-hidden">
                {i % 3 === 1 ? (
                  <div
                    className="flex h-full items-center justify-center p-8"
                    style={{ backgroundColor: `${product.accent}44` }}
                  >
                    <GlassesVisual
                      frame={product.frame}
                      accent={product.accent}
                      className="w-full transition-transform duration-300 group-hover:scale-110"
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
              </div>
              <div className="flex items-end justify-between gap-2 border-t-2 border-ink bg-paper p-3">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-sm font-extrabold">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-mute">
                    {captions[i % captions.length]}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-signal">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
