"use client";

import { useEffect, useState } from "react";

/** True when we should skip heavy FX (mobile, reduced motion, Save-Data). */
export function useLiteMode() {
  const [lite, setLite] = useState(true);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const narrow = window.matchMedia("(max-width: 768px)");

    const sync = () => {
      const saveData =
        "connection" in navigator &&
        Boolean(
          (navigator as Navigator & { connection?: { saveData?: boolean } })
            .connection?.saveData,
        );
      setLite(motion.matches || coarse.matches || narrow.matches || saveData);
    };

    sync();
    motion.addEventListener("change", sync);
    coarse.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      coarse.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  return lite;
}
