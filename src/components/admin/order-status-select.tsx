"use client";

import { useRouter } from "next/navigation";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
} from "@/lib/admin/order-status";

export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  return (
    <select
      value={status}
      data-cursor="hover"
      className="border-2 border-ink bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider outline-none"
      onChange={async (e) => {
        const next = e.target.value;
        const previousStatus = status;
        const res = await fetch("/api/admin/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: id,
            status: next,
            previousStatus,
          }),
        });
        if (!res.ok) {
          e.target.value = status;
          return;
        }
        router.refresh();
      }}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
