import Link from "next/link";
import { DestroySite } from "@/components/destroy-site";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <p className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight sm:text-5xl">
            QRRA
          </p>
          <p className="mt-4 max-w-sm text-paper/70">
            Очки для тех, кто не ждёт, пока на них посмотрят. Смотри первым.
            Не магазин — взгляд как система.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-acid">
            Навигация
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:text-signal" data-cursor="hover">
                Магазин
              </Link>
            </li>
            <li>
              <Link
                href="/lookbook"
                className="hover:text-signal"
                data-cursor="hover"
              >
                Lookbook
              </Link>
            </li>
            <li>
              <Link
                href="/#manifesto"
                className="hover:text-signal"
                data-cursor="hover"
              >
                Манифест
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-signal" data-cursor="hover">
                Корзина
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-acid">
            Связь
          </p>
          <ul className="mt-4 space-y-2 text-sm text-paper/80">
            <li>hello@qrra.store</li>
            <li>@qrra</li>
            <li>Доставка по Узбекистану · 30 дней на возврат</li>
          </ul>
        </div>
      </div>

      <DestroySite />

      <div className="border-t border-paper/15 px-4 py-4 text-xs text-paper/45 sm:px-6 lg:px-10">
        © {new Date().getFullYear()} QRRA. Не копируй взгляд — купи свой.
      </div>
    </footer>
  );
}
