import { NextResponse } from "next/server";
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from "@/lib/admin/order-status";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sendOrderStatusEmail } from "@/lib/notifications/email-status";
import { QRRA } from "@/lib/db/tables";

function normalizePhone(s: string) {
  return s.replace(/\D/g, "");
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    orderId?: string;
    status?: string;
    previousStatus?: string;
  };

  if (!body.orderId || !body.status) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!ORDER_STATUSES.includes(body.status as typeof ORDER_STATUSES[number])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const status = body.status as typeof ORDER_STATUSES[number];

  const { error } = await auth.supabase
    .from(QRRA.orders)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", body.orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let emailSent = false;
  if (body.previousStatus !== status) {
    const { data: order } = await auth.supabase
      .from(QRRA.orders)
      .select("id, qrra_profiles(email)")
      .eq("id", body.orderId)
      .maybeSingle();

    const profile = order?.qrra_profiles as
      | { email: string | null }
      | { email: string | null }[]
      | null;
    const email = Array.isArray(profile)
      ? profile[0]?.email
      : profile?.email;

    if (email) {
      const res = await sendOrderStatusEmail({
        to: email,
        orderId: body.orderId,
        status,
      });
      emailSent = res.ok;
    }
  }

  return NextResponse.json({
    ok: true,
    emailSent,
    statusLabel: ORDER_STATUS_LABEL[status],
  });
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: orders } = await auth.supabase
    .from(QRRA.orders)
    .select(
      "id, status, total, shipping, created_at, notes, qrra_profiles(full_name, phone, email), qrra_order_items(product_name, product_slug, qty, price)",
    )
    .order("created_at", { ascending: false });

  const rows = orders ?? [];
  const header = [
    "id",
    "created_at",
    "status",
    "total",
    "name",
    "phone",
    "email",
    "city",
    "delivery",
    "line",
    "promo",
    "discount",
    "items",
    "notes",
  ];

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const lines = [header.join(",")];
  for (const o of rows) {
    const ship = (o.shipping ?? {}) as Record<string, unknown>;
    const profile = o.qrra_profiles as
      | { full_name: string | null; phone: string | null; email: string | null }
      | { full_name: string | null; phone: string | null; email: string | null }[]
      | null;
    const p = Array.isArray(profile) ? profile[0] : profile;
    const items = (o.qrra_order_items ?? []) as {
      product_name: string;
      qty: number;
      price: number;
    }[];
    const itemsStr = items
      .map((it) => `${it.product_name} x${it.qty}`)
      .join("; ");

    lines.push(
      [
        o.id,
        o.created_at,
        o.status,
        String(o.total),
        String(ship.name ?? p?.full_name ?? ""),
        String(ship.phone ?? p?.phone ?? ""),
        String(p?.email ?? ""),
        String(ship.city ?? ""),
        String(ship.delivery ?? ""),
        String(ship.line ?? ""),
        String(ship.promo_code ?? ""),
        String(ship.discount ?? ""),
        itemsStr,
        String(o.notes ?? ""),
      ]
        .map((c) => escape(String(c)))
        .join(","),
    );
  }

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="qrra-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
