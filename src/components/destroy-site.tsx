"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSound } from "@/components/sound-provider";
import type { ElementBlock } from "@/components/destroy-physics";

const DestroyPhysics = dynamic(
  () => import("@/components/destroy-physics").then((m) => m.DestroyPhysics),
  { ssr: false },
);

export function DestroySite() {
  const [broken, setBroken] = useState(false);
  const [blocks, setBlocks] = useState<ElementBlock[]>([]);
  const { playBreak, playClick } = useSound();

  const handleBreak = () => {
    playBreak();

    // Snapshot visible DOM elements BEFORE adding site-broken class
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const selectors = [
      "h1", "h2", "h3", "button", "a.border", "a[data-cursor]",
      ".product-tile", "p.font-bold", "span.font-black", ".marquee-item"
    ];

    const elements = Array.from(document.querySelectorAll(selectors.join(",")));
    const captured: ElementBlock[] = [];
    const seen = new Set<string>();

    elements.forEach((el, i) => {
      if (captured.length >= 18) return;
      const htmlEl = el as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();

      if (
        rect.top >= -50 &&
        rect.top <= viewH &&
        rect.width >= 30 &&
        rect.height >= 18 &&
        rect.width <= viewW * 0.95 &&
        rect.height <= viewH * 0.8
      ) {
        const text = (htmlEl.innerText || htmlEl.getAttribute("aria-label") || "")
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 22);

        if (!text || seen.has(text)) return;
        seen.add(text);

        const computed = window.getComputedStyle(htmlEl);
        let bg = computed.backgroundColor;
        if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
          bg = i % 3 === 0 ? "#FF3B00" : i % 3 === 1 ? "#B8FF00" : "#f4f2ee";
        }

        captured.push({
          id: i + 1,
          label: text.toUpperCase(),
          bgColor: bg,
          textColor: "#0c0c0c",
          borderColor: "#0c0c0c",
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          w: Math.max(90, Math.min(rect.width, 360)),
          h: Math.max(38, Math.min(rect.height, 100)),
        });
      }
    });

    setBlocks(captured);
    setBroken(true);
    document.documentElement.classList.add("site-broken");
  };

  return (
    <>
      <div className="border-t border-paper/15 px-4 py-10 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={handleBreak}
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
          initialBlocks={blocks}
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
