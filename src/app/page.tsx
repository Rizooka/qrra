import Link from "next/link";
import { Marquee } from "@/components/marquee";
import { ManifestoScroll } from "@/components/manifesto-scroll";
import { XRayDrop } from "@/components/xray-drop";
import { LookbookTeaser } from "@/components/lookbook-teaser";
import { RulesSection } from "@/components/rules-section";

export default function HomePage() {
  return (
    <>
      <section className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 noise opacity-[0.1]" />
        <div className="absolute inset-0 diagonal-stripes opacity-30" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-3 pt-24 sm:px-5 lg:px-8">
          <h1
            className="animate-rise w-full font-[family-name:var(--font-display)] font-black leading-[0.78] text-signal"
            style={{
              fontSize: "clamp(4.5rem, 28vw, 22rem)",
              letterSpacing: "-0.06em",
              transform: "scaleX(1.08)",
              transformOrigin: "left center",
            }}
          >
            QRRA
          </h1>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-10 lg:pb-14">
          <p className="animate-rise-delay max-w-2xl font-[family-name:var(--font-body)] text-[11px] font-medium uppercase leading-relaxed tracking-[0.14em] text-paper/75 sm:text-xs sm:tracking-[0.18em]">
            QRRA / манифест — мы не пытаемся быть милыми. мы диктуем правила.
            взгляд как жест. очки как оружие. uv400. zero apology. смотри первым
            или не смотри вообще.
          </p>

          <div className="animate-rise-delay-2 mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              data-cursor="hover"
              className="border border-signal bg-signal px-6 py-3 font-[family-name:var(--font-body)] text-[11px] font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-acid hover:border-acid"
            >
              В магазин
            </Link>
            <Link
              href="#drop"
              data-cursor="hover"
              className="border border-paper/35 px-6 py-3 font-[family-name:var(--font-body)] text-[11px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
            >
              X-Ray дроп
            </Link>
          </div>
        </div>
      </section>

      <Marquee tone="acid" />

      <XRayDrop />

      <ManifestoScroll />

      <RulesSection />

      <LookbookTeaser />

      <Marquee tone="ink" />

      <section className="bg-paper">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:px-10">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-5xl">
              Готов смотреть первым?
            </h2>
            <p className="mt-3 max-w-md text-mute">
              Восемь моделей. Одна позиция: смотри первым.
            </p>
          </div>
          <Link
            href="/shop"
            data-cursor="hover"
            className="border-2 border-ink bg-ink px-8 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-signal hover:border-signal"
          >
            Открыть магазин
          </Link>
        </div>
      </section>
    </>
  );
}
