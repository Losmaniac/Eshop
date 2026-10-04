import QRCode from "qrcode";
import { priceCart, PricingError } from "@/lib/pricing";
import { checkoutSchema, zodErrors } from "@/lib/validation";
import { config } from "@/server/config";
import { sendEmail } from "@/server/email";
import { newOrderOwnerEmail, orderConfirmationEmail, QR_CONTENT_ID } from "@/server/email-templates";
import { createOrder, setOrderStatus } from "@/server/orders";
import { clientIp, rateLimit } from "@/server/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`order:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
    return Response.json({ error: "Příliš mnoho pokusů. Zkuste to prosím za pár minut." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ fieldErrors: zodErrors(parsed.error.issues) }, { status: 400 });
  }
  const input = parsed.data;
  if (input.website) {
    // Honeypot filled in: pretend nothing happened.
    return Response.json({ error: "Objednávku se nepodařilo odeslat." }, { status: 400 });
  }

  // Prices come from the catalog only, never from the request.
  let priced;
  try {
    priced = priceCart(input.items, input.deliveryMethod);
  } catch (error) {
    if (error instanceof PricingError) return Response.json({ error: error.message }, { status: 400 });
    throw error;
  }

  const order = await createOrder(input, priced);

  try {
    const qrPng = await QRCode.toBuffer(order.payment.spayd, { type: "png", width: 320, margin: 1 });
    const customer = orderConfirmationEmail(order, config.siteUrl);
    const sent = await sendEmail({
      to: order.customer.email,
      replyTo: config.ownerEmail || undefined,
      ...customer,
      attachments: [{ filename: "qr-platba.png", content: qrPng.toString("base64"), contentId: QR_CONTENT_ID }],
    });
    if (sent) await setOrderStatus(order.orderNumber, "awaiting_payment");
    if (config.ownerEmail) {
      await sendEmail({ to: config.ownerEmail, replyTo: order.customer.email, ...newOrderOwnerEmail(order, config.siteUrl) });
    }
  } catch (error) {
    // The order is stored; a failed email must not fail the checkout.
    console.error("[orders] email failed", error);
  }

  return Response.json({ token: order.token, orderNumber: order.orderNumber });
}
