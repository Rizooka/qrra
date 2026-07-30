/** QRRA tables in `public` — standard Supabase PostgREST, no custom schema. */
export const QRRA = {
  profiles: "qrra_profiles",
  addresses: "qrra_addresses",
  products: "qrra_products",
  orders: "qrra_orders",
  order_items: "qrra_order_items",
} as const;
