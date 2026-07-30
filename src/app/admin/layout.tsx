import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getProfile } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/customers", label: "Клиенты" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/account");

  return (
    <div>
      <div className="border-b-2 border-ink bg-ink pt-16 text-paper">
        <div className="mx-auto flex max-w-[1100px] flex-wrap gap-4 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] sm:px-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-cursor="hover"
              className="hover:text-acid"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/account" data-cursor="hover" className="ml-auto hover:text-acid">
            ← Кабинет
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
