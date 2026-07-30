"use client";

import { useEffect, useState } from "react";

/** Static film grain — no animation, desktop-only. */
export function SiteGrain() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setShow(fine.matches && !motion.matches);
    sync();
    fine.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  if (!show) return null;
  return <div className="site-grain" aria-hidden />;
}
