import {
  products as staticProducts,
  type ColorGroup,
  type Product,
} from "@/data/products";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  sale_price?: number | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  cost_price?: number | null;
  color: string;
  lens: string;
  vibe: string;
  description: string;
  accent: string;
  frame: string;
  tags: string[] | null;
  color_group: string;
  fit: string;
  fit_note: string;
  specs: Product["specs"] | null;
  care: string;
  is_active: boolean;
  stock?: number;
  images?: string[] | null;
};

function parseImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.length > 0);
}

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    sale_price: row.sale_price ?? null,
    sale_starts_at: row.sale_starts_at ?? null,
    sale_ends_at: row.sale_ends_at ?? null,
    cost_price: row.cost_price ?? null,
    color: row.color,
    lens: row.lens,
    vibe: row.vibe,
    description: row.description,
    accent: row.accent,
    frame: row.frame,
    tags: row.tags ?? [],
    colorGroup: row.color_group as ColorGroup,
    fit: row.fit as Product["fit"],
    fitNote: row.fit_note,
    specs: row.specs ?? {
      material: "—",
      weight: "—",
      uv: "UV400",
      warranty: "Lifetime",
    },
    care: row.care,
    isActive: row.is_active,
    stock: row.stock ?? 10,
    images: parseImages(row.images),
  };
}

export async function fetchProducts(opts?: {
  activeOnly?: boolean;
}): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from(QRRA.products).select("*").order("name");
    if (opts?.activeOnly !== false) {
      query = query.eq("is_active", true);
    }
    const { data, error } = await query;
    if (error || !data?.length) return staticProducts;
    return (data as DbProduct[]).map(mapProduct);
  } catch {
    return staticProducts;
  }
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(QRRA.products)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) {
      return staticProducts.find((p) => p.slug === slug) ?? null;
    }
    return mapProduct(data as DbProduct);
  } catch {
    return staticProducts.find((p) => p.slug === slug) ?? null;
  }
}

export async function fetchRelated(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const all = await fetchProducts({ activeOnly: true });
  const scored = all
    .filter((p) => p.id !== product.id && p.slug !== product.slug)
    .map((p) => {
      const shared = p.tags.filter((t) => product.tags.includes(t)).length;
      const sameGroup = p.colorGroup === product.colorGroup ? 2 : 0;
      return { p, score: shared + sameGroup };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}
