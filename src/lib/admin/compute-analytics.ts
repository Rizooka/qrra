export type AnalyticsOrder = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  user_id: string;
  shipping?: Record<string, unknown> | null;
};

export type AnalyticsOrderItem = {
  order_id: string;
  product_name: string;
  product_slug: string;
  qty: number;
  price: number;
};

export type AnalyticsProfile = {
  id: string;
  created_at: string;
};

export type DayBucket = {
  date: string;
  label: string;
  orders: number;
  revenue: number;
};

export type ProductLeader = {
  name: string;
  slug: string;
  units: number;
  revenue: number;
};

export type CityLeader = {
  city: string;
  orders: number;
  revenue: number;
};

export type CustomerSegment = {
  label: string;
  count: number;
  description: string;
};

export type AnalyticsSnapshot = {
  revenueAll: number;
  revenue7d: number;
  revenue30d: number;
  orders7d: number;
  orders30d: number;
  aov: number;
  aov7d: number;
  newProfiles7d: number;
  newProfiles30d: number;
  buyersCount: number;
  repeatBuyers: number;
  repeatRatePct: number;
  conversionPct: number;
  daily14: DayBucket[];
  topProducts: ProductLeader[];
  topCities: CityLeader[];
  byDelivery: { pickup: number; delivery: number; other: number };
  byStatusRevenue: { status: string; revenue: number; count: number }[];
  segments: CustomerSegment[];
};

function parseTs(s: string) {
  return new Date(s).getTime();
}

function dayKey(s: string) {
  const d = new Date(s);
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(key: string) {
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function computeAnalytics(
  orders: AnalyticsOrder[],
  items: AnalyticsOrderItem[],
  profiles: AnalyticsProfile[],
): AnalyticsSnapshot {
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;

function inWindow(ts: string, ms: number) {
  return Date.now() - parseTs(ts) <= ms;
}

  const paidLike = orders.filter((o) => o.status !== "cancelled");
  const revenueAll = paidLike.reduce((s, o) => s + o.total, 0);

  const orders7 = orders.filter((o) => inWindow(o.created_at, ms7));
  const orders30 = orders.filter((o) => inWindow(o.created_at, ms30));
  const paid7 = orders7.filter((o) => o.status !== "cancelled");
  const paid30 = orders30.filter((o) => o.status !== "cancelled");

  const revenue7d = paid7.reduce((s, o) => s + o.total, 0);
  const revenue30d = paid30.reduce((s, o) => s + o.total, 0);

  const aov = paidLike.length ? revenueAll / paidLike.length : 0;
  const aov7d = paid7.length ? revenue7d / paid7.length : 0;

  const newProfiles7d = profiles.filter((p) => inWindow(p.created_at, ms7)).length;
  const newProfiles30d = profiles.filter((p) => inWindow(p.created_at, ms30)).length;

  const orderCountByUser = new Map<string, number>();
  for (const o of paidLike) {
    orderCountByUser.set(o.user_id, (orderCountByUser.get(o.user_id) ?? 0) + 1);
  }
  const buyersCount = orderCountByUser.size;
  const repeatBuyers = [...orderCountByUser.values()].filter((n) => n >= 2).length;
  const repeatRatePct =
    buyersCount ? Math.round((repeatBuyers / buyersCount) * 100) : 0;

  const conversionPct =
    profiles.length
      ? Math.round((buyersCount / profiles.length) * 100)
      : 0;

  const daily14: DayBucket[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => dayKey(o.created_at) === key);
    const dayPaid = dayOrders.filter((o) => o.status !== "cancelled");
    daily14.push({
      date: key,
      label: formatDayLabel(key),
      orders: dayOrders.length,
      revenue: dayPaid.reduce((s, o) => s + o.total, 0),
    });
  }

  const productMap = new Map<string, ProductLeader>();
  for (const it of items) {
    const key = it.product_slug || it.product_name;
    const row = productMap.get(key) ?? {
      name: it.product_name,
      slug: it.product_slug,
      units: 0,
      revenue: 0,
    };
    row.units += it.qty;
    row.revenue += it.qty * it.price;
    productMap.set(key, row);
  }
  const topProducts = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const cityMap = new Map<string, CityLeader>();
  for (const o of paidLike) {
    const ship = o.shipping ?? {};
    const city =
      typeof ship.city === "string" && ship.city.trim()
        ? ship.city.trim()
        : "Не указан";
    const row = cityMap.get(city) ?? { city, orders: 0, revenue: 0 };
    row.orders += 1;
    row.revenue += o.total;
    cityMap.set(city, row);
  }
  const topCities = [...cityMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  let pickup = 0;
  let delivery = 0;
  let other = 0;
  for (const o of paidLike) {
    const ship = o.shipping ?? {};
    const mode = ship.delivery;
    if (mode === "pickup") pickup += 1;
    else if (mode === "delivery") delivery += 1;
    else other += 1;
  }

  const statusMap = new Map<string, { revenue: number; count: number }>();
  for (const o of orders) {
    const row = statusMap.get(o.status) ?? { revenue: 0, count: 0 };
    row.count += 1;
    if (o.status !== "cancelled") row.revenue += o.total;
    statusMap.set(o.status, row);
  }
  const byStatusRevenue = [...statusMap.entries()].map(([status, v]) => ({
    status,
    revenue: v.revenue,
    count: v.count,
  }));

  const oneTime = [...orderCountByUser.values()].filter((n) => n === 1).length;
  const loyal = [...orderCountByUser.values()].filter((n) => n >= 3).length;

  const segments: CustomerSegment[] = [
    {
      label: "Зарегистрированы",
      count: profiles.length,
      description: "Все профили QRRA",
    },
    {
      label: "Купили хотя бы раз",
      count: buyersCount,
      description: "Уникальные покупатели",
    },
    {
      label: "Один заказ",
      count: oneTime,
      description: "Потенциал для второй покупки",
    },
    {
      label: "Возвратные (2+)",
      count: repeatBuyers,
      description: "Повторные покупатели",
    },
    {
      label: "Лояльные (3+)",
      count: loyal,
      description: "Ядро аудитории",
    },
  ];

  return {
    revenueAll,
    revenue7d,
    revenue30d,
    orders7d: orders7.length,
    orders30d: orders30.length,
    aov,
    aov7d,
    newProfiles7d,
    newProfiles30d,
    buyersCount,
    repeatBuyers,
    repeatRatePct,
    conversionPct,
    daily14,
    topProducts,
    topCities,
    byDelivery: { pickup, delivery, other },
    byStatusRevenue,
    segments,
  };
}
