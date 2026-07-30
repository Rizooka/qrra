import { AdminPageHeader } from "@/components/admin/page-header";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { EventAnalyticsPanel } from "@/components/admin/event-analytics-panel";
import { StockAnalyticsPanel } from "@/components/admin/stock-analytics-panel";
import { computeAnalytics } from "@/lib/admin/compute-analytics";
import { computeEventAnalytics } from "@/lib/admin/compute-event-analytics";
import { computeStockAnalytics } from "@/lib/admin/compute-stock-analytics";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Аналитика — QRRA" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [
    { data: orders },
    { data: items },
    { data: profiles },
    { data: events },
    { data: products },
  ] = await Promise.all([
    supabase
      .from(QRRA.orders)
      .select("id, status, total, created_at, user_id, shipping"),
    supabase
      .from(QRRA.order_items)
      .select("order_id, product_name, product_slug, qty, price"),
    supabase.from(QRRA.profiles).select("id, created_at"),
    supabase
      .from(QRRA.events)
      .select(
        "event_name, visitor_id, session_id, product_slug, created_at, metadata",
      )
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(15000),
    supabase
      .from(QRRA.products)
      .select("id, slug, name, price, stock, is_active"),
  ]);

  const snapshot = computeAnalytics(
    orders ?? [],
    items ?? [],
    profiles ?? [],
  );
  const eventSnapshot = computeEventAnalytics(events ?? []);
  const stockSnapshot = computeStockAnalytics(
    products ?? [],
    items ?? [],
    orders ?? [],
  );

  return (
    <div>
      <AdminPageHeader
        title="Аналитика"
        description="Заказы, поведение на сайте, воронка и пожелания клиентов."
      />
      <div className="px-4 sm:px-8 space-y-16">
        <AnalyticsDashboard data={snapshot} />
        <StockAnalyticsPanel data={stockSnapshot} />
        <EventAnalyticsPanel data={eventSnapshot} />
      </div>
    </div>
  );
}
