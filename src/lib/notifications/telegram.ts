export async function sendTelegramOrderAlert(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return { ok: false as const, skipped: true };

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 4000),
        disable_web_page_preview: true,
      }),
    },
  );

  if (!res.ok) return { ok: false as const, skipped: false };
  return { ok: true as const, skipped: false };
}

export async function sendTelegramLowStockAlert(
  productName: string,
  currentStock: number,
  threshold: number,
) {
  const text = [
    "⚠️ QRRA: Низкий остаток товара!",
    `Товар: ${productName}`,
    `Остаток: ${currentStock} шт. (порог: ${threshold} шт.)`,
    "Рекомендуется пополнить склад.",
  ].join("\n");

  return sendTelegramOrderAlert(text);
}
