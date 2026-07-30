import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/admin/order-status";

export async function sendOrderStatusEmail(input: {
  to: string;
  orderId: string;
  status: OrderStatus;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false as const, skipped: true };

  const from = process.env.RESEND_FROM?.trim() || "QRRA <onboarding@resend.dev>";
  const label = ORDER_STATUS_LABEL[input.status];
  const shortId = input.orderId.slice(0, 8);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: `QRRA — заказ ${shortId}: ${label}`,
      html: `<p>Статус заказа обновлён: <strong>${label}</strong>.</p><p>Если есть вопросы — напиши нам в WhatsApp или Telegram с сайта.</p><p style="color:#888;font-size:12px">QRRA</p>`,
    }),
  });

  if (!res.ok) return { ok: false as const, skipped: false };
  return { ok: true as const, skipped: false };
}
