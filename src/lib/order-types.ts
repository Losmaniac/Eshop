import type { PaymentInfo } from "@/lib/payment";
import type { PricedCart } from "@/lib/pricing";

export const ORDER_STATUSES = [
  "new",
  "awaiting_payment",
  "paid",
  "in_production",
  "shipped",
  "done",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: "Nová",
  awaiting_payment: "Čeká na platbu",
  paid: "Zaplaceno",
  in_production: "Ve výrobě",
  shipped: "Odesláno",
  done: "Dokončeno",
  cancelled: "Zrušeno",
};

/** Everything the confirmation page and emails need to show an order. */
export type OrderView = {
  orderNumber: string;
  token: string;
  status: OrderStatus;
  createdAt: string;
  customer: { name: string; email: string; phone: string; company?: string };
  address?: { street?: string; city?: string; zip?: string };
  note?: string;
  priced: PricedCart;
  payment: PaymentInfo;
};
