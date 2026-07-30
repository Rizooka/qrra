"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/track";

export function CheckoutStartTracker() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track({ event: "checkout_start", page_path: "/checkout" });
  }, []);
  return null;
}

export function trackOrderComplete(orderId: string, total: number) {
  track({
    event: "order_complete",
    page_path: "/checkout",
    metadata: { order_id: orderId, total },
  });
}
