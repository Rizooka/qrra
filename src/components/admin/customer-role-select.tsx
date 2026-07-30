"use client";

import { useRouter } from "next/navigation";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

export function CustomerRoleSelect({
  id,
  role,
}: {
  id: string;
  role: string;
}) {
  const router = useRouter();
  return (
    <select
      value={role}
      className="border-2 border-ink bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider outline-none"
      onChange={async (e) => {
        if (
          e.target.value === "admin" &&
          !confirm("Выдать права admin?")
        ) {
          return;
        }
        const supabase = createClient();
        const { error } = await supabase
          .from(QRRA.profiles)
          .update({
            role: e.target.value,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (!error) router.refresh();
      }}
    >
      <option value="customer">customer</option>
      <option value="admin">admin</option>
    </select>
  );
}
