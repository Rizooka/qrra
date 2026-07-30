"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSound } from "@/components/sound-provider";

const DestroyPhysics = dynamic(
  () => import("@/components/destroy-physics").then((m) => m.DestroyPhysics),
  { ssr: false },
);

export function DestroySite() {
  const [broken, setBroken] = useState(false);
  const { playBreak, playClick } = useSound();

  return (
    <>
      <div className="border-t border-paper/15 px-4 py-10 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => {
            playBreak();
            setBroken(true);
            document.documentElement.classList.add("site-broken");
          }}
          data-cursor="hover"
          className="w-full border-2 border-signal bg-signal py-6 font-[family-name:var(--font-display)] text-[clamp(1.4rem,5vw,3rem)] font-black uppercase tracking-[0.08em] text-ink transition-colors hover:bg-acid hover:border-acid sm:py-8"
        >
          Не нажимать · Сломать сайт
        </button>
        <p className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-paper/40">
          QRRA / warning — система нестабильна. не жди разрешения.
        </p>
      </div>

      {broken && (
        <DestroyPhysics
          onReboot={() => {
            playClick();
            setBroken(false);
            document.documentElement.classList.remove("site-broken");
          }}
        />
      )}
    </>
  );
}
