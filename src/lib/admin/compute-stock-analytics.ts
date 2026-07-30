export type StockProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
};

export type StockOrderItem = {
  product_slug: string;
  qty: number;
  price: number;
  order_id: string;
};

export type StockOrderMeta = {
  id: string;
  status: string;
};

export type StockLineStatus = "out" | "low" | "ok";

export type StockLine = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  soldUnits: number;
  soldRevenue: number;
  stockValue: number;
  status: StockLineStatus;
};

export type StockAnalytics = {
  totalUnitsOnHand: number;
  totalStockValue: number;
  outOfStockCount: number;
  lowStockCount: number;
  activeSkuCount: number;
  lines: StockLine[];
  restockPriority: StockLine[];
};

const LOW_THRESHOLD = 3;

export function computeStockAnalytics(
  products: StockProductRow[],
  items: StockOrderItem[],
  orders: StockOrderMeta[],
): StockAnalytics {
  const cancelled = new Set(
    orders.filter((o) => o.status === "cancelled").map((o) => o.id),
  );

  const soldBySlug = new Map<string, { units: number; revenue: number }>();
  for (const it of items) {
    if (cancelled.has(it.order_id)) continue;
    const key = it.product_slug;
    const row = soldBySlug.get(key) ?? { units: 0, revenue: 0 };
    row.units += it.qty;
    row.revenue += it.qty * it.price;
    soldBySlug.set(key, row);
  }

  const lines: StockLine[] = products.map((p) => {
    const sold = soldBySlug.get(p.slug) ?? { units: 0, revenue: 0 };
    const stock = Math.max(0, p.stock);
    let status: StockLineStatus = "ok";
    if (stock <= 0) status = "out";
    else if (stock <= LOW_THRESHOLD) status = "low";

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      stock,
      soldUnits: sold.units,
      soldRevenue: sold.revenue,
      stockValue: stock * p.price,
      status,
    };
  });

  const active = lines.filter((l) =>
    products.find((p) => p.id === l.id)?.is_active,
  );

  const totalUnitsOnHand = lines.reduce((s, l) => s + l.stock, 0);
  const totalStockValue = lines.reduce((s, l) => s + l.stockValue, 0);
  const outOfStockCount = active.filter((l) => l.status === "out").length;
  const lowStockCount = active.filter((l) => l.status === "low").length;

  const restockPriority = [...lines]
    .filter((l) => l.status === "out" || l.status === "low")
    .sort((a, b) => b.soldUnits - a.soldUnits)
    .slice(0, 8);

  return {
    totalUnitsOnHand,
    totalStockValue,
    outOfStockCount,
    lowStockCount,
    activeSkuCount: active.length,
    lines: lines.sort((a, b) => a.name.localeCompare(b.name)),
    restockPriority,
  };
}
