import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { OrderConfirmation } from "@/components/order/OrderConfirmation";
import { getOrderByToken } from "@/server/orders";

// Only routed in the full (server) build, see next.config.ts.

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Objednávka", robots: { index: false, follow: false } };

export default async function OrderPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const order = await getOrderByToken(token);
  if (!order) notFound();
  const qrSvg = await QRCode.toString(order.payment.spayd, { type: "svg", margin: 0, errorCorrectionLevel: "M" });
  return <OrderConfirmation order={order} qrSvg={qrSvg} />;
}
