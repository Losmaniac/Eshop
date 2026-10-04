// Static demo (GitHub Pages): orders are created in the browser and kept in
// localStorage only. Nothing is sent anywhere.
import { settings } from "@/content/settings";
import { generateOrderNumber, generateToken } from "@/lib/order-number";
import { buildPaymentInfo, dueDateFrom, type BankAccount } from "@/lib/payment";
import { priceCart, type CartLineInput } from "@/lib/pricing";
import type { OrderView } from "@/lib/order-types";
import type { CheckoutInput } from "@/lib/validation";

// Sample account from the Czech QR payment specification. Demo only.
export const DEMO_BANK: BankAccount = {
  iban: "CZ6508000000192000145399",
  accountNumber: "19-2000145399/0800",
  recipientName: settings.shopName,
};

const STORAGE_KEY = "eshop-demo-order";

export function createDemoOrder(input: CheckoutInput): OrderView {
  const priced = priceCart(input.items as CartLineInput[], input.deliveryMethod);
  const createdAt = new Date();
  const orderNumber = generateOrderNumber(createdAt);
  const order: OrderView = {
    orderNumber,
    token: generateToken(),
    status: "awaiting_payment",
    createdAt: createdAt.toISOString(),
    customer: { name: input.name, email: input.email, phone: input.phone, company: input.company },
    address: input.deliveryMethod === "courier" ? { street: input.street, city: input.city, zip: input.zip } : undefined,
    note: input.note,
    priced,
    payment: buildPaymentInfo({
      bank: DEMO_BANK,
      amount: priced.total,
      orderNumber,
      dueDate: dueDateFrom(createdAt, settings.paymentDueDays),
      shopName: settings.shopName,
    }),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // Storage unavailable (private mode): the confirmation page shows a notice.
  }
  return order;
}

export function loadDemoOrder(): OrderView | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OrderView) : null;
  } catch {
    return null;
  }
}
