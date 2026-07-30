import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  type OrderStatus,
} from "@/lib/admin/order-status";

export function OrderStatusBadge({ status }: { status: string }) {
  const key = status as OrderStatus;
  const label = ORDER_STATUS_LABEL[key] ?? status;
  const style = ORDER_STATUS_STYLE[key] ?? "bg-paper border-2 border-ink text-ink";

  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${style}`}
    >
      {label}
    </span>
  );
}
