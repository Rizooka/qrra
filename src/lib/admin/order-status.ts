export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  shipped: "В пути",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-signal text-paper",
  confirmed: "bg-ink text-paper",
  shipped: "bg-acid text-ink",
  delivered: "bg-paper text-ink border-2 border-ink",
  cancelled: "bg-paper text-mute border-2 border-ink/30",
};
