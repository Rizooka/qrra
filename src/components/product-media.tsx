import { ProductHeroVisual } from "@/components/product-actions";
import { ProductGallery } from "@/components/product-gallery";
import type { Product } from "@/data/products";
import { productImages } from "@/lib/catalog/product-stock";

export function ProductMedia({ product }: { product: Product }) {
  const images = productImages(product);
  if (images.length > 0) {
    return <ProductGallery product={product} images={images} />;
  }
  return <ProductHeroVisual product={product} />;
}
