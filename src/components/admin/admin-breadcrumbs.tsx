"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  admin: "Обзор",
  analytics: "Аналитика",
  feedback: "Пожелания",
  orders: "Заказы",
  promo: "Промокоды",
  products: "Товары",
  stock: "Склад",
  receipts: "Поступления",
  customers: "Клиенты",
  new: "Новый",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null; // Don't show on root /admin page

  let currentPath = "";

  return (
    <nav className="px-4 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-mute sm:px-8">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/admin" className="hover:text-ink hover:underline">
            Обзор
          </Link>
        </li>
        {segments.slice(1).map((segment, index) => {
          currentPath += `/${segment}`;
          const isLast = index === segments.slice(1).length - 1;
          const fullHref = `/admin${currentPath}`;
          const label = LABELS[segment] ?? (segment.length > 12 ? `#${segment.slice(0, 8).toUpperCase()}` : segment);

          return (
            <li key={fullHref} className="flex items-center gap-1.5">
              <span className="text-ink/30">/</span>
              {isLast ? (
                <span className="text-ink font-black">{label}</span>
              ) : (
                <Link href={fullHref} className="hover:text-ink hover:underline">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
