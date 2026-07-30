"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export function CartViewTracker() {
  useEffect(() => {
    track({ event: "cart_view", page_path: "/cart" });
  }, []);

  return null;
}
