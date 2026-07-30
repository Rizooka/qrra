"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const SiteGrain = dynamic(
  () => import("@/components/site-grain").then((m) => m.SiteGrain),
  { ssr: false },
);

const CustomCursor = dynamic(
  () => import("@/components/custom-cursor").then((m) => m.CustomCursor),
  { ssr: false },
);

export function ClientEffects() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin ? <CustomCursor /> : null}
      <SiteGrain />
    </>
  );
}
