import { DELIVERY_INFO } from "@/lib/site/delivery";
import { CONTACT_EMAIL, getTelegramUrl, getWhatsAppUrl } from "@/lib/site/contacts";

export function ContactLinks({
  message,
  variant = "footer",
}: {
  message?: string;
  variant?: "footer" | "inline";
}) {
  const wa = getWhatsAppUrl(message);
  const tg = getTelegramUrl(message);

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap gap-3">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          className="border-2 border-ink bg-paper px-4 py-2 text-xs font-extrabold uppercase tracking-wider hover:bg-acid"
        >
          WhatsApp
        </a>
        <a
          href={tg}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          className="border-2 border-ink bg-paper px-4 py-2 text-xs font-extrabold uppercase tracking-wider hover:bg-acid"
        >
          Telegram
        </a>
      </div>
    );
  }

  return (
    <ul className="mt-4 space-y-2 text-sm text-paper/80">
      <li>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-signal">
          {CONTACT_EMAIL}
        </a>
      </li>
      <li className="flex flex-wrap gap-4">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold hover:text-signal"
        >
          WhatsApp
        </a>
        <a
          href={tg}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold hover:text-signal"
        >
          Telegram
        </a>
      </li>
      <li>
        {DELIVERY_INFO.country} · {DELIVERY_INFO.returns.split(".")[0]}.
      </li>
    </ul>
  );
}
