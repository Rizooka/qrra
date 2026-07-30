"use client";

import { useEffect, useRef, useState } from "react";

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
      el.style.width = on ? "72px" : "28px";
      el.style.height = on ? "72px" : "28px";
      // White + difference = visible on ink AND paper.
      // Signal orange without blend = always readable on hover.
      el.style.background = on ? "#FF3B00" : "#ffffff";
      el.style.mixBlendMode = on ? "normal" : "difference";
      el.style.boxShadow = on ? "0 0 0 2px #0c0c0c" : "none";
    };

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) dotRef.current.style.opacity = "1";
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "a, button, [data-cursor='hover'], input, label, [role='button']",
      );
      const next = Boolean(el);
      if (next !== hovering.current) {
        hovering.current = next;
        applyHoverStyle(next);
      }
    };

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.28;
      pos.current.y += (target.current.y - pos.current.y) * 0.28;
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
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "#ffffff",
        mixBlendMode: "difference",
        opacity: 0,
        transition:
          "width 0.18s cubic-bezier(0.22,1,0.36,1), height 0.18s cubic-bezier(0.22,1,0.36,1), background 0.15s, opacity 0.2s, box-shadow 0.15s",
        willChange: "transform",
      }}
    />
  );
}
