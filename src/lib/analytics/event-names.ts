export const ANALYTICS_EVENTS = [
  "page_view",
  "product_view",
  "product_click",
  "add_to_cart",
  "remove_from_cart",
  "cart_view",
  "checkout_start",
  "order_complete",
  "wish_open",
  "wish_submit",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export const FEEDBACK_KINDS = ["wish", "product_idea", "recommendation"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export const FEEDBACK_KIND_LABEL: Record<FeedbackKind, string> = {
  wish: "Пожелание",
  product_idea: "Идея товара",
  recommendation: "Совет",
};
