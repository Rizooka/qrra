import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductHeroVisual } from "@/components/product-actions";
import { ProductBuyPanel } from "@/components/product-buy-panel";
import { ProductTile } from "@/components/product-tile";
import { ProductViewTracker } from "@/components/product-view-tracker";
import { formatPrice, products as staticProducts } from "@/data/products";
import { fetchProductBySlug, fetchRelated } from "@/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return staticProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "QRRA" };
  return {
    title: `${product.name} — QRRA`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const related = await fetchRelated(product, 4);

  return (
    <>
      <ProductViewTracker slug={product.slug} id={product.id} />
      <section className="border-b-2 border-ink pt-16 lg:grid lg:min-h-[calc(100svh-4rem)] lg:grid-cols-2">
        <ProductHeroVisual product={product} />

        <div className="flex flex-col justify-center border-t-2 border-ink bg-paper px-4 py-12 sm:px-8 lg:border-l-2 lg:border-t-0 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-signal">
            {product.vibe}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-black tracking-tight sm:text-6xl">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-bold tabular-nums">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 max-w-md leading-relaxed text-mute">
            {product.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t-2 border-ink pt-6 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-mute">Цвет</dt>
              <dd className="mt-1 font-bold">{product.color}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-mute">Линзы</dt>
              <dd className="mt-1 font-bold">{product.lens}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-mute">Пол</dt>
              <dd className="mt-1 font-bold">Unisex</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-mute">Гарантия</dt>
              <dd className="mt-1 font-bold">{product.specs.warranty}</dd>
            </div>
          </dl>

          <ProductBuyPanel product={product} />
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight sm:text-3xl">
            Ещё удары
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductTile key={p.id} product={p} index={i} />
            ))}
          </div>
          <p className="mt-8">
            <Link
              href="/lookbook"
              className="text-sm font-bold uppercase tracking-wider underline decoration-2 underline-offset-4 hover:text-signal"
              data-cursor="hover"
            >
              Смотреть lookbook →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
