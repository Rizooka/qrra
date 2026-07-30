"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export function ProductViewTracker({
  slug,
  id,
}: {
  slug: string;
  id: string;
}) {
  useEffect(() => {
    track({
      event: "product_view",
      page_path: `/shop/${slug}`,
      product_slug: slug,
      product_id: id,
    });
  }, [slug, id]);

  return null;
}
