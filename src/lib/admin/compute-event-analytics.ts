export type RawEvent = {
  event_name: string;
  visitor_id: string;
  session_id: string;
  product_slug: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
};

export type FunnelStep = {
  key: string;
  label: string;
  count: number;
  rateFromPrev: number | null;
};

export type ProductIntent = {
  slug: string;
  views: number;
  clicks: number;
  addToCart: number;
  viewToCartPct: number;
  score: number;
};

export type EventAnalytics = {
  funnel7d: FunnelStep[];
  funnel30d: FunnelStep[];
  topIntent: ProductIntent[];
  leakyProducts: ProductIntent[];
  sessionsWithCheckoutNoOrder7d: number;
  events7d: number;
  uniqueVisitors7d: number;
  wishSubmits7d: number;
};

const FUNNEL: { key: string; label: string; events: string[] }[] = [
  { key: "views", label: "Просмотры страниц", events: ["page_view"] },
  { key: "product", label: "Карточки товаров", events: ["product_view"] },
  { key: "cart", label: "Добавления в корзину", events: ["add_to_cart"] },
  { key: "checkout", label: "Начали checkout", events: ["checkout_start"] },
  { key: "order", label: "Заказы", events: ["order_complete"] },
];

function inDays(ts: string, days: number) {
  const ms = days * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(ts).getTime() <= ms;
}

function countEvents(events: RawEvent[], names: string[], days: number) {
  return events.filter(
    (e) => names.includes(e.event_name) && inDays(e.created_at, days),
  ).length;
}

function buildFunnel(events: RawEvent[], days: number): FunnelStep[] {
  const counts = FUNNEL.map((step) =>
    countEvents(events, step.events, days),
  );
  return FUNNEL.map((step, i) => {
    const count = counts[i];
    const prev = i > 0 ? counts[i - 1] : null;
    const rateFromPrev =
      prev !== null && prev > 0 ? Math.round((count / prev) * 100) : null;
    return { key: step.key, label: step.label, count, rateFromPrev };
  });
}

function productStats(events: RawEvent[], days: number) {
  const map = new Map<string, ProductIntent>();
  const relevant = events.filter((e) => inDays(e.created_at, days));

  for (const e of relevant) {
    const slug = e.product_slug ?? "";
    if (!slug) continue;
    const row = map.get(slug) ?? {
      slug,
      views: 0,
      clicks: 0,
      addToCart: 0,
      viewToCartPct: 0,
      score: 0,
    };
    if (e.event_name === "product_view") row.views += 1;
    if (e.event_name === "product_click") row.clicks += 1;
    if (e.event_name === "add_to_cart") row.addToCart += 1;
    map.set(slug, row);
  }

  return [...map.values()].map((row) => {
    const viewToCartPct =
      row.views > 0 ? Math.round((row.addToCart / row.views) * 100) : 0;
    const score = row.views * 1 + row.clicks * 2 + row.addToCart * 5;
    return { ...row, viewToCartPct, score };
  });
}

export function computeEventAnalytics(events: RawEvent[]): EventAnalytics {
  const events7d = events.filter((e) => inDays(e.created_at, 7));
  const visitors7d = new Set(events7d.map((e) => e.visitor_id)).size;
  const wishSubmits7d = events7d.filter(
    (e) => e.event_name === "wish_submit",
  ).length;

  const sessionsCheckout = new Set(
    events7d
      .filter((e) => e.event_name === "checkout_start")
      .map((e) => e.session_id),
  );
  const sessionsOrder = new Set(
    events7d
      .filter((e) => e.event_name === "order_complete")
      .map((e) => e.session_id),
  );
  let sessionsWithCheckoutNoOrder7d = 0;
  for (const s of sessionsCheckout) {
    if (!sessionsOrder.has(s)) sessionsWithCheckoutNoOrder7d += 1;
  }

  const stats30 = productStats(events, 30);
  const topIntent = [...stats30]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  const leakyProducts = [...stats30]
    .filter((p) => p.views >= 3 && p.viewToCartPct < 15)
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  return {
    funnel7d: buildFunnel(events, 7),
    funnel30d: buildFunnel(events, 30),
    topIntent,
    leakyProducts,
    sessionsWithCheckoutNoOrder7d,
    events7d: events7d.length,
    uniqueVisitors7d: visitors7d,
    wishSubmits7d,
  };
}
