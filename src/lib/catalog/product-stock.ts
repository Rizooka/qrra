import type { Product } from "@/data/products";
import { isUuid } from "@/lib/uuid";

export const PRODUCT_PHOTOS_BUCKET = "qrra-products";

export function productStock(product: Product): number {
  if (isUuid(product.id)) return product.stock ?? 0;
  return product.stock ?? 10;
}

export function isInStock(product: Product): boolean {
  return productStock(product) > 0;
}

export function stockLabel(product: Product): string {
  const n = productStock(product);
  if (n <= 0) return "Нет в наличии";
  if (n <= 3) return `Мало — ${n} шт.`;
  return "В наличии";
}

export function productImages(product: Product): string[] {
  if (!product.images?.length) return [];
  return product.images.filter((u) => typeof u === "string" && u.startsWith("http"));
}

export function primaryProductImage(product: Product): string | null {
  const imgs = productImages(product);
  return imgs[0] ?? null;
}
