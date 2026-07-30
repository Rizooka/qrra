"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RealtimeOrdersNotifier } from "@/components/admin/realtime-orders-notifier";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { AdminCommandPalette } from "@/components/admin/admin-command-palette";

const nav = [
  { href: "/admin", label: "Обзор", exact: true },
  { href: "/admin/analytics", label: "Аналитика" },
  { href: "/admin/feedback", label: "Пожелания" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/promo", label: "Промокоды" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/stock", label: "Склад" },
  { href: "/admin/stock/receipts", label: "Поступления" },
  { href: "/admin/customers", label: "Клиенты" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[100svh] bg-paper lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar / Header */}
      <aside className="border-b-2 border-ink bg-ink text-paper lg:border-b-0 lg:border-r-2">
        <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-5">
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-black tracking-tight">
              QRRA
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/50">
              Управление
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              data-cursor="hover"
              className="text-[10px] font-bold uppercase tracking-wider text-acid hover:underline"
            >
              Сайт ↗
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="border border-paper/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider lg:hidden"
            >
              {mobileMenuOpen ? "Закрыть" : "Меню"}
            </button>
          </div>
        </div>

        {/* Command palette search trigger button */}
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
              window.dispatchEvent(event);
            }}
            className="flex w-full items-center justify-between border border-paper/20 bg-paper/5 px-3 py-1.5 text-left text-xs font-bold text-paper/70 hover:bg-paper/10 hover:text-paper"
          >
            <span>Поиск...</span>
            <kbd className="border border-paper/30 px-1 py-0.5 text-[9px] font-mono text-paper/50">Cmd+K</kbd>
          </button>
        </div>

        {/* Navigation links */}
        <nav
          className={`px-2 pb-4 lg:block lg:px-3 lg:pb-8 ${
            mobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  data-cursor="hover"
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors rounded-sm ${
                    active
                      ? "bg-acid text-ink"
                      : "text-paper/80 hover:bg-paper/10 hover:text-paper"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
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

      {/* Main Content Area */}
      <div className="min-w-0">
        <AdminBreadcrumbs />
        {children}
        <RealtimeOrdersNotifier />
        <AdminCommandPalette />
      </div>
    </div>
  );
}
