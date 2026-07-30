"use client";

import { useSound } from "@/components/sound-provider";

export function SoundToggle() {
  const { enabled, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-5 left-5 z-[10000] border-2 border-ink bg-paper px-3 py-2 font-[family-name:var(--font-display)] text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_#0c0c0c] transition-colors hover:bg-acid sm:bottom-6 sm:left-6"
      aria-pressed={enabled}
      data-cursor="hover"
    >
      {enabled ? "Звук вкл" : "Звук выкл"}
    </button>
  );
}
