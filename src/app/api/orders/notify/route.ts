import { NextResponse } from "next/server";
import { formatPrice } from "@/data/products";
import { decrementStockForOrderItems } from "@/lib/catalog/decrement-stock";
import { sendTelegramOrderAlert } from "@/lib/notifications/telegram";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

function normalizePhone(s: string) {
  return s.replace(/\D/g, "");
}

export async function POST(request: Request) {
  const body = (await request.json()) as { orderId?: string; phone?: string };
  if (!body.orderId || !body.phone) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from(QRRA.orders)
    .select(
      "id, total, status, shipping, created_at, qrra_order_items(product_id, product_name, qty, price)",
    )
    .eq("id", body.orderId)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ship = (order.shipping ?? {}) as { phone?: string; name?: string; city?: string };
  const orderPhone = ship.phone ? normalizePhone(ship.phone) : "";
  const reqPhone = normalizePhone(body.phone);
  if (!orderPhone || orderPhone !== reqPhone) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const created = new Date(order.created_at).getTime();
  if (Date.now() - created > 20 * 60 * 1000) {
    return NextResponse.json({ error: "Expired" }, { status: 403 });
  }

  const items = (order.qrra_order_items ?? []) as {
    product_id: string | null;
    product_name: string;
    qty: number;
    price: number;
  }[];

  await decrementStockForOrderItems(
    items.map((it) => ({ product_id: it.product_id, qty: it.qty })),
  );

  const lines = items.map(
    (it) => `• ${it.product_name} × ${it.qty} — ${formatPrice(it.price * it.qty)}`,
  );
  const text = [
    "🛒 Новый заказ QRRA",
    `${ship.name ?? "Клиент"} · ${ship.phone ?? ""}`,
    `${ship.city ?? ""}`,
    `Итого: ${formatPrice(order.total)}`,
    "",
    lines.join("\n"),
    "",
    `ID: ${order.id.slice(0, 8)}`,
  ].join("\n");

  await sendTelegramOrderAlert(text);

  return NextResponse.json({ ok: true });
}
