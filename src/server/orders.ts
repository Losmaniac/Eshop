import { settings } from "@/content/settings";
import { generateOrderNumber, generateToken } from "@/lib/order-number";
import type { OrderStatus, OrderView } from "@/lib/order-types";
import { buildPaymentInfo, dueDateFrom } from "@/lib/payment";
import type { PricedCart } from "@/lib/pricing";
import type { CheckoutInput } from "@/lib/validation";
import { assertBankConfigured, config } from "@/server/config";
import { db } from "@/server/db";

export async function createOrder(input: CheckoutInput, priced: PricedCart): Promise<OrderView> {
  const client = await db();
  const bank = assertBankConfigured();
  const createdAt = new Date();

  for (let attempt = 0; attempt < 10; attempt++) {
    const orderNumber = generateOrderNumber(createdAt);
    const order: OrderView = {
      orderNumber,
      token: generateToken(),
      status: "new",
      createdAt: createdAt.toISOString(),
      customer: { name: input.name, email: input.email, phone: input.phone, company: input.company || undefined },
      address:
        input.deliveryMethod === "courier" ? { street: input.street, city: input.city, zip: input.zip } : undefined,
      note: input.note || undefined,
      priced,
      payment: buildPaymentInfo({
        bank,
        amount: priced.total,
        orderNumber,
        dueDate: dueDateFrom(createdAt, config.paymentDueDays),
        shopName: settings.shopName,
      }),
    };
    try {
      await client.execute({
        sql: `INSERT INTO orders (order_number, token, status, created_at, customer_name, customer_email, total, data)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          order.orderNumber,
          order.token,
          order.status,
          order.createdAt,
          order.customer.name,
          order.customer.email,
          order.priced.total,
          JSON.stringify(order),
        ],
      });
      return order;
    } catch (error) {
      if (String(error).includes("UNIQUE")) continue; // order number taken, try another
      throw error;
    }
  }
  throw new Error("Could not allocate a unique order number");
}

export async function setOrderStatus(orderNumber: string, status: OrderStatus): Promise<void> {
  const client = await db();
  await client.execute({ sql: "UPDATE orders SET status = ? WHERE order_number = ?", args: [status, orderNumber] });
}

export async function getOrderByToken(token: string): Promise<OrderView | null> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  const client = await db();
  const result = await client.execute({ sql: "SELECT status, data FROM orders WHERE token = ?", args: [token] });
  const row = result.rows[0];
  if (!row) return null;
  const order = JSON.parse(String(row.data)) as OrderView;
  return { ...order, status: String(row.status) as OrderStatus };
}
