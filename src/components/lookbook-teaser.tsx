import Link from "next/link";
import { FlashWearer } from "@/components/flash-wearer";
import { products } from "@/data/products";

export function LookbookTeaser() {
  const shots = products.slice(0, 4);

  return (
    <section className="border-b-2 border-ink bg-paper">
      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
              Lookbook
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-4xl">
              Кадры без вежливости.
            </h2>
          </div>
          <Link
            href="/lookbook"
            data-cursor="hover"
            className="text-sm font-bold uppercase tracking-wider underline decoration-2 underline-offset-4 hover:text-signal"
          >
            Весь lookbook →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shots.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              data-cursor="hover"
              className="group overflow-hidden border-2 border-ink bg-ink"
            >
              <div className="aspect-[4/5]">
                <FlashWearer
                  frame={product.frame}
                  accent={product.accent}
                  seed={Number(product.id)}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="border-t-2 border-ink bg-paper px-3 py-2 font-[family-name:var(--font-display)] text-xs font-extrabold uppercase tracking-wider">
                {product.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
