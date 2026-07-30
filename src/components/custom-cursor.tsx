"use client";

import { useEffect, useRef, useState } from "react";

const SIZE_DOT = 10;
const SIZE_RING = 26;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const [ready, setReady] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const raf = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    document.documentElement.classList.add("has-custom-cursor");
    setReady(true);

    const applyHoverStyle = (on: boolean) => {
      const el = dotRef.current;
      if (!el) return;
      if (on) {
        el.style.width = `${SIZE_RING}px`;
        el.style.height = `${SIZE_RING}px`;
        el.style.background = "transparent";
        el.style.border = "2px solid #FF3B00";
        el.style.boxShadow = "0 0 0 1px rgba(12,12,12,0.15)";
        el.style.mixBlendMode = "normal";
      } else {
        el.style.width = `${SIZE_DOT}px`;
        el.style.height = `${SIZE_DOT}px`;
        el.style.background = "#FF3B00";
        el.style.border = "none";
        el.style.boxShadow = "0 0 0 2px rgba(255,255,255,0.85)";
        el.style.mixBlendMode = "normal";
      }
    };

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) dotRef.current.style.opacity = "1";
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "a, button, [data-cursor='hover'], label, [role='button']",
      );
      const isField = (e.target as HTMLElement | null)?.closest?.(
        "input, textarea, select",
      );
      const next = Boolean(el) && !isField;
      if (next !== hovering.current) {
        hovering.current = next;
        applyHoverStyle(next);
      }
    };

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.35;
      pos.current.y += (target.current.y - pos.current.y) * 0.35;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (!ready) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[10001]"
      style={{
        width: SIZE_DOT,
        height: SIZE_DOT,
        borderRadius: "50%",
        background: "#FF3B00",
        border: "none",
        mixBlendMode: "normal",
        opacity: 0,
        transition:
          "width 0.15s cubic-bezier(0.22,1,0.36,1), height 0.15s, border 0.15s, background 0.12s, opacity 0.2s, box-shadow 0.12s",
        willChange: "transform",
      }}
    />
  );
}
