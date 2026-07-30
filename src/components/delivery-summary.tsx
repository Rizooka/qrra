import Link from "next/link";
import { DELIVERY_INFO } from "@/lib/site/delivery";

export function DeliverySummary({ compact }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "border-2 border-ink bg-paper p-4 text-sm"
          : "border-2 border-ink bg-acid/15 p-5 text-sm"
      }
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-mute">
        Доставка
      </p>
      <ul className="mt-2 space-y-2">
        <li>
          <span className="font-bold">{DELIVERY_INFO.tashkentCourier.label}</span>
          <span className="text-mute"> — {DELIVERY_INFO.tashkentCourier.time}</span>
        </li>
        <li>
          <span className="font-bold">{DELIVERY_INFO.otherCourier.label}</span>
          <span className="text-mute"> — {DELIVERY_INFO.otherCourier.time}</span>
        </li>
        <li>
          <span className="font-bold">{DELIVERY_INFO.pickup.label}</span>
          <span className="text-mute"> — {DELIVERY_INFO.pickup.priceNote}</span>
        </li>
      </ul>
      {!compact ? (
        <p className="mt-3 text-mute">{DELIVERY_INFO.payment}</p>
      ) : null}
      <Link
        href="/delivery"
        className="mt-3 inline-block text-xs font-bold uppercase tracking-wider underline underline-offset-4 hover:text-signal"
        data-cursor="hover"
      >
        Подробнее о доставке и возврате
      </Link>
    </div>
  );
}
