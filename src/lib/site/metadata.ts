import type { Metadata } from "next";

export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv?.startsWith("http")) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "https://qrra.vercel.app";
}

export function absoluteUrl(path: string) {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function productOpenGraph(
  name: string,
  description: string,
  imageUrl: string | null,
  slug: string,
): Metadata["openGraph"] {
  return {
    title: name,
    description,
    url: absoluteUrl(`/shop/${slug}`),
    type: "website",
    images: imageUrl
      ? [{ url: imageUrl, width: 1200, height: 1200, alt: name }]
      : undefined,
  };
}
