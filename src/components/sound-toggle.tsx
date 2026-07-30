"use client";

import { useSound } from "@/components/sound-provider";

export function SoundToggle() {
  const { enabled, toggle, radioPlaying, toggleRadio } = useSound();

  return (
    <div className="fixed bottom-5 left-5 z-[10000] flex items-center gap-2 sm:bottom-6 sm:left-6">
      <button
        type="button"
        onClick={toggle}
        className={`border-2 border-ink px-3 py-2 font-[family-name:var(--font-display)] text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_#0c0c0c] transition-all hover:bg-acid ${
          enabled ? "bg-acid" : "bg-paper"
        }`}
        aria-pressed={enabled}
        data-cursor="hover"
      >
        {enabled ? "🔊 Звук: Вкл" : "🔈 Звук: Выкл"}
      </button>

      <button
        type="button"
        onClick={toggleRadio}
        className={`border-2 border-ink px-3 py-2 font-[family-name:var(--font-display)] text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_#0c0c0c] transition-all hover:bg-signal hover:text-paper ${
          radioPlaying ? "bg-signal text-paper animate-pulse" : "bg-paper"
        }`}
        aria-pressed={radioPlaying}
        data-cursor="hover"
      >
        {radioPlaying ? "📻 Radio: ON" : "📻 QRRA Radio"}
      </button>
    </div>
  );
}
