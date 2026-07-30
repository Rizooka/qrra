/** QRRA tables in `public` — standard Supabase PostgREST, no custom schema. */
export const QRRA = {
  profiles: "qrra_profiles",
  addresses: "qrra_addresses",
  products: "qrra_products",
  orders: "qrra_orders",
  order_items: "qrra_order_items",
  events: "qrra_events",
  feedback: "qrra_feedback",
  promo_codes: "qrra_promo_codes",
  stock_movements: "qrra_stock_movements",
  stock_receipts: "qrra_stock_receipts",
  stock_receipt_items: "qrra_stock_receipt_items",
} as const;
