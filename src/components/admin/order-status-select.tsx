"use client";

import { useRouter } from "next/navigation";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
} from "@/lib/admin/order-status";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

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
        const supabase = createClient();
        await supabase
          .from(QRRA.orders)
          .update({
            status: e.target.value,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
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
