"use client";

import { useRouter } from "next/navigation";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      data-cursor="hover"
      className="border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-signal hover:text-paper"
      onClick={async () => {
        if (!confirm("Удалить товар без возврата?")) return;
        const supabase = createClient();
        await supabase.from(QRRA.products).delete().eq("id", id);
        router.push("/admin/products");
      }}
    >
      Del
    </button>
  );
}
