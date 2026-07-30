"use client";

import { useRouter } from "next/navigation";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";

export function ToggleActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      data-cursor="hover"
      className={`border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
        isActive ? "bg-acid" : "bg-paper text-mute"
      }`}
      onClick={async () => {
        const supabase = createClient();
        await supabase
          .from(QRRA.products)
          .update({
            is_active: !isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        router.refresh();
      }}
    >
      {isActive ? "На витрине" : "Скрыт"}
    </button>
  );
}
