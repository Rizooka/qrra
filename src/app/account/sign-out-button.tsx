"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      data-cursor="hover"
      className="border-2 border-ink px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] hover:bg-ink hover:text-paper"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/");
        router.refresh();
      }}
    >
      Выйти
    </button>
  );
}
