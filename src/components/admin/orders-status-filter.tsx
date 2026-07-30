"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/admin/order-status";

export function OrdersStatusFilter() {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = search.get("status") ?? "all";

  const items = [
    { id: "all", label: "Все" },
    ...ORDER_STATUSES.map((s) => ({ id: s, label: ORDER_STATUS_LABEL[s] })),
  ];

  return (
    <div className="flex flex-wrap gap-2 px-4 sm:px-8 pb-6">
      {items.map((item) => {
        const active = current === item.id;
        const href =
          item.id === "all"
            ? pathname
            : `${pathname}?status=${encodeURIComponent(item.id)}`;
        return (
          <Link
            key={item.id}
            href={href}
            data-cursor="hover"
            className={`border-2 border-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
              active ? "bg-ink text-paper" : "bg-paper hover:bg-acid"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
