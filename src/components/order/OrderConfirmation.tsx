import { formatDate, formatPrice } from "@/lib/format";
import type { OrderView } from "@/lib/order-types";
import { Steps } from "@/components/Steps";
import { PaymentBlock } from "./PaymentBlock";

export function OrderConfirmation({ order, qrSvg, demo }: { order: OrderView; qrSvg?: string; demo?: boolean }) {
  const paid = !["new", "awaiting_payment", "cancelled"].includes(order.status);
  const progress = { new: 1, awaiting_payment: 1, paid: 2, in_production: 2, shipped: 3, done: 4, cancelled: 0 }[order.status];
  return (
    <div className="container-page py-12 md:py-16">
      <p className="eyebrow">Objednávka č. {order.orderNumber}</p>
      <h1 className="mt-3 text-display">Děkujeme za objednávku</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {demo
          ? "Toto je ukázka. V ostrém provozu by vám teď přišel potvrzovací e-mail s platebními údaji."
          : `Platební údaje najdete níže a posíláme je také na ${order.customer.email}.`}
      </p>

      {order.status !== "cancelled" && (
        <div className="mt-8">
          <Steps steps={["Přijato", "Platba", "Výroba", "Odesláno"]} current={progress} label="Stav objednávky" />
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {paid ? (
            <p className="rounded-sm border border-line bg-white p-6">Platbu jsme přijali, děkujeme.</p>
          ) : order.status === "cancelled" ? (
            <p className="rounded-sm border border-line bg-white p-6">Objednávka byla zrušena.</p>
          ) : (
            <PaymentBlock payment={order.payment} qrSvg={qrSvg} />
          )}
        </div>

        <aside className="lg:col-span-5" aria-labelledby="summary-title">
          <h2 id="summary-title" className="text-2xl">
            Shrnutí
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {order.priced.lines.map((line) => (
              <li key={`${line.slug}-${line.variantId}-${line.personalization ?? ""}`} className="flex justify-between gap-4 py-3">
                <div>
                  <p>{line.name}</p>
                  <p className="text-sm text-muted">
                    {line.variantLabel} · {line.quantity} ks
                    {line.personalization && <> · text „{line.personalization}“</>}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums">{formatPrice(line.lineTotal)}</p>
              </li>
            ))}
            <li className="flex justify-between gap-4 py-3 text-[0.9375rem]">
              <span className="text-muted">{order.priced.deliveryLabel}</span>
              <span className="tabular-nums">
                {order.priced.shipping === 0 ? "zdarma" : formatPrice(order.priced.shipping)}
              </span>
            </li>
            <li className="flex justify-between gap-4 py-3 text-lg font-medium">
              <span>Celkem</span>
              <span className="tabular-nums">{formatPrice(order.priced.total)}</span>
            </li>
          </ul>
          <dl className="mt-6 space-y-1 text-[0.9375rem]">
            <div className="flex gap-2">
              <dt className="text-muted">Datum:</dt>
              <dd>{formatDate(order.createdAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted">Jméno:</dt>
              <dd>{order.customer.name}</dd>
            </div>
            {order.address && (
              <div className="flex gap-2">
                <dt className="text-muted">Adresa:</dt>
                <dd>
                  {order.address.street}, {order.address.zip} {order.address.city}
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
