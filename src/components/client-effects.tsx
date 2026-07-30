"use client";

import dynamic from "next/dynamic";

const SiteGrain = dynamic(
  () => import("@/components/site-grain").then((m) => m.SiteGrain),
  { ssr: false },
);

const CustomCursor = dynamic(
  () => import("@/components/custom-cursor").then((m) => m.CustomCursor),
  { ssr: false },
);

export function ClientEffects() {
  return (
    <>
      <CustomCursor />
      <SiteGrain />
    </>
  );
}
