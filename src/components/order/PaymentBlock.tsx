"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { formatDate, formatPrice } from "@/lib/format";
import type { PaymentInfo } from "@/lib/payment";
import { CopyButton } from "@/components/CopyButton";

export function PaymentBlock({ payment, qrSvg }: { payment: PaymentInfo; qrSvg?: string }) {
  const [svg, setSvg] = useState(qrSvg);

  useEffect(() => {
    if (qrSvg) return;
    QRCode.toString(payment.spayd, { type: "svg", margin: 0, errorCorrectionLevel: "M" }).then(setSvg);
  }, [payment.spayd, qrSvg]);

  const rows: { label: string; value: string; copy?: string; strong?: boolean }[] = [
    { label: "Částka", value: formatPrice(payment.amount), copy: String(payment.amount), strong: true },
    { label: "Číslo účtu", value: payment.accountNumber, copy: payment.accountNumber },
    { label: "IBAN", value: payment.ibanFormatted, copy: payment.iban },
    { label: "Variabilní symbol", value: payment.variableSymbol, copy: payment.variableSymbol, strong: true },
    { label: "Splatnost", value: formatDate(payment.dueDate) },
  ];

  return (
    <section aria-labelledby="payment-title" className="rounded-sm border border-line bg-white p-5 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <h2 id="payment-title" className="text-2xl">
            Platba převodem
          </h2>
          <p className="mt-2 text-[0.9375rem] text-muted">
            Naskenujte QR kód v aplikaci své banky, nebo zadejte platbu ručně. Výrobu zahájíme po připsání platby.
          </p>
        </div>
        <figure className="mx-auto w-44 shrink-0 text-center sm:mx-0">
          <div
            className="aspect-square w-full bg-white [&_svg]:h-full [&_svg]:w-full"
            role="img"
            aria-label={`QR kód pro platbu ${formatPrice(payment.amount)}, variabilní symbol ${payment.variableSymbol}`}
            data-testid="payment-qr"
            data-spayd={payment.spayd}
            dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
          />
          <figcaption className="mt-2 text-sm text-muted">QR Platba</figcaption>
        </figure>
      </div>
      <dl className="mt-6 divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[10rem_1fr_auto]">
            <dt className="col-span-2 text-sm text-muted sm:col-span-1 sm:text-[0.9375rem]">{row.label}</dt>
            <dd className={`min-w-0 break-words tabular-nums ${row.strong ? "text-lg font-medium" : ""}`}>{row.value}</dd>
            {row.copy ? <CopyButton value={row.copy} label={row.label} /> : <span />}
          </div>
        ))}
      </dl>
    </section>
  );
}
