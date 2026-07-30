"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/admin", label: "Обзор", exact: true },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/customers", label: "Клиенты" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[100svh] bg-paper lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b-2 border-ink bg-ink text-paper lg:border-b-0 lg:border-r-2">
        <div className="flex items-center justify-between gap-4 px-4 py-5 lg:px-5">
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-black tracking-tight">
              QRRA
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/50">
              Admin
            </p>
          </div>
          <Link
            href="/shop"
            data-cursor="hover"
            className="text-[10px] font-bold uppercase tracking-wider text-acid hover:underline"
          >
            Сайт
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:gap-0 lg:px-3 lg:pb-8">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-cursor="hover"
                className={`shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors lg:rounded-sm ${
                  active
                    ? "bg-acid text-ink"
                    : "text-paper/80 hover:bg-paper/10 hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-paper/10 px-5 py-4 lg:block">
          <Link
            href="/account"
            data-cursor="hover"
            className="text-xs font-bold uppercase tracking-wider text-paper/60 hover:text-acid"
          >
            ← Личный кабинет
          </Link>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
