"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-provider";

const links = [
  { href: "/shop", label: "Магазин" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/#manifesto", label: "Манифест" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();
  const onHero = pathname === "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 ${
        onHero ? "mix-blend-difference text-paper" : "text-ink"
      }`}
    >
      <div
        className={`mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10 ${
          onHero ? "" : "border-b border-ink/10 bg-paper/90 backdrop-blur-md"
        }`}
      >
        <nav className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide sm:gap-5 sm:text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor="hover"
              className="transition-opacity hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          data-cursor="hover"
          className="absolute left-1/2 -translate-x-1/2 font-[family-name:var(--font-display)] text-lg font-black tracking-tight sm:text-xl"
        >
          QRRA
        </Link>

        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide sm:gap-5 sm:text-sm">
          <Link
            href="/account"
            data-cursor="hover"
            className="transition-opacity hover:opacity-60"
          >
            Кабинет
          </Link>
          <Link
            href="/cart"
            data-cursor="hover"
            className="transition-opacity hover:opacity-60"
          >
            Корзина{count > 0 ? ` (${count})` : ""}
          </Link>
        </div>
      </div>
    </header>
  );
}
