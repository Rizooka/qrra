"use client";

import { useRouter } from "next/navigation";
import { createClient, qrra } from "@/lib/supabase/client";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      data-cursor="hover"
      className="border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-signal hover:text-paper"
      onClick={async () => {
        if (!confirm("Удалить товар?")) return;
        const supabase = createClient();
        await qrra(supabase).from("products").delete().eq("id", id);
        router.refresh();
      }}
    >
      Del
    </button>
  );
}
