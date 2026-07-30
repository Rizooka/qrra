import { Marquee } from "@/components/marquee";
import { LookbookGrid } from "@/components/lookbook-grid";
import { products } from "@/data/products";

export const metadata = {
  title: "Lookbook — QRRA",
  description: "Editorial кадры QRRA. Взгляд как система.",
};

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
        <LookbookGrid products={products} />
      </section>
    </>
  );
}
