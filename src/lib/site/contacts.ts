/** Public contact links — set in env or defaults below. */
export function getWhatsAppUrl(text?: string) {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    "998901234567";
  const base = `https://wa.me/${raw}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function getTelegramUrl(text?: string) {
  const user =
    process.env.NEXT_PUBLIC_TELEGRAM_USERNAME?.replace("@", "") || "qrra";
  const base = `https://t.me/${user}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@qrra.store";
