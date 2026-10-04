import { settings } from "@/content/settings";
import { formatDate, formatPrice, formatWeight } from "@/lib/format";
import type { OrderView } from "@/lib/order-types";
import type { InquiryInput } from "@/lib/validation";
import type { StoredFile } from "@/server/inquiries";

// Plain, clean HTML emails in Czech. Inline styles only, because email
// clients ignore stylesheets.

export const QR_CONTENT_ID = "qr-platba";

const colors = { ink: "#141414", muted: "#5c5a57", line: "#e2ded8", paper: "#f7f5f2", rust: "#9a4321" };

function esc(value: string | number | undefined | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${colors.paper};font-family:Helvetica,Arial,sans-serif;color:${colors.ink};line-height:1.55">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.paper}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${colors.line}">
<tr><td style="padding:24px 32px;border-bottom:1px solid ${colors.line};font-size:18px;font-weight:bold;letter-spacing:0.02em">${esc(settings.shopName)}</td></tr>
<tr><td style="padding:32px">${body}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid ${colors.line};font-size:12px;color:${colors.muted}">${esc(settings.shopName)}${settings.seller.email ? ` · ${esc(settings.seller.email)}` : ""}${settings.seller.phone ? ` · ${esc(settings.seller.phone)}` : ""}</td></tr>
</table></td></tr></table></body></html>`;
}

function h1(text: string) {
  return `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25">${esc(text)}</h1>`;
}

function p(html: string) {
  return `<p style="margin:0 0 16px">${html}</p>`;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 12px 6px 0;color:${colors.muted};vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;vertical-align:top">${value}</td></tr>`;
}

function itemsTable(order: OrderView): string {
  const rows = order.priced.lines
    .map(
      (l) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid ${colors.line}">${esc(l.name)}<br><span style="color:${colors.muted};font-size:14px">${esc(l.variantLabel)}${l.personalization ? ` · text: „${esc(l.personalization)}“` : ""} · ${l.quantity}&nbsp;ks</span></td>
<td style="padding:10px 0;border-bottom:1px solid ${colors.line};text-align:right;white-space:nowrap">${esc(formatPrice(l.lineTotal))}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;font-size:15px">${rows}
<tr><td style="padding:10px 0;color:${colors.muted}">${esc(order.priced.deliveryLabel)}</td><td style="padding:10px 0;text-align:right">${esc(order.priced.shipping === 0 ? "zdarma" : formatPrice(order.priced.shipping))}</td></tr>
<tr><td style="padding:10px 0;font-weight:bold;border-top:1px solid ${colors.ink}">Celkem</td><td style="padding:10px 0;text-align:right;font-weight:bold;border-top:1px solid ${colors.ink}">${esc(formatPrice(order.priced.total))}</td></tr>
</table>`;
}

function paymentBlock(order: OrderView): string {
  const pay = order.payment;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${colors.line};background:${colors.paper}">
<tr><td style="padding:20px">
<p style="margin:0 0 12px;font-weight:bold">Platba převodem</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">
${row("Částka", `<strong>${esc(formatPrice(pay.amount))}</strong>`)}
${row("Číslo účtu", esc(pay.accountNumber))}
${row("IBAN", esc(pay.ibanFormatted))}
${row("Variabilní symbol", `<strong>${esc(pay.variableSymbol)}</strong>`)}
${row("Splatnost", esc(formatDate(pay.dueDate)))}
</table>
</td><td width="180" style="padding:20px;text-align:center;vertical-align:top">
<img src="cid:${QR_CONTENT_ID}" width="160" height="160" alt="QR platba" style="display:block;margin:0 auto">
<span style="font-size:12px;color:${colors.muted}">QR Platba</span>
</td></tr></table>`;
}

function orderUrl(siteUrl: string, order: OrderView) {
  return `${siteUrl}/objednavka/${order.token}`;
}

export function orderConfirmationEmail(order: OrderView, siteUrl: string) {
  const subject = `Potvrzení objednávky č. ${order.orderNumber}`;
  const html = layout(
    subject,
    `${h1("Děkujeme za objednávku")}
${p(`Dobrý den, objednávku č. <strong>${esc(order.orderNumber)}</strong> jsme přijali. Do výroby ji zařadíme, jakmile nám dorazí platba.`)}
${paymentBlock(order)}
${itemsTable(order)}
${p(`Stav objednávky a platební údaje najdete také na <a href="${esc(orderUrl(siteUrl, order))}" style="color:${colors.rust}">stránce objednávky</a>.`)}
${p("Pokud máte jakýkoli dotaz, stačí odpovědět na tento e-mail.")}`,
  );
  const text = [
    `Děkujeme za objednávku č. ${order.orderNumber}.`,
    "",
    "Platba převodem:",
    `Částka: ${formatPrice(order.payment.amount)}`,
    `Číslo účtu: ${order.payment.accountNumber}`,
    `IBAN: ${order.payment.ibanFormatted}`,
    `Variabilní symbol: ${order.payment.variableSymbol}`,
    `Splatnost: ${formatDate(order.payment.dueDate)}`,
    "",
    ...order.priced.lines.map((l) => `${l.name} (${l.variantLabel}) × ${l.quantity}: ${formatPrice(l.lineTotal)}`),
    `${order.priced.deliveryLabel}: ${formatPrice(order.priced.shipping)}`,
    `Celkem: ${formatPrice(order.priced.total)}`,
    "",
    `Objednávka: ${orderUrl(siteUrl, order)}`,
  ].join("\n");
  return { subject, html, text };
}

export function newOrderOwnerEmail(order: OrderView, siteUrl: string) {
  const subject = `Nová objednávka č. ${order.orderNumber} – ${formatPrice(order.priced.total)}`;
  const address = order.address ? [order.address.street, `${order.address.zip ?? ""} ${order.address.city ?? ""}`].join(", ") : "";
  const html = layout(
    subject,
    `${h1(`Nová objednávka č. ${order.orderNumber}`)}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;font-size:15px">
${row("Zákazník", esc(order.customer.name))}
${order.customer.company ? row("Firma", esc(order.customer.company)) : ""}
${row("E-mail", `<a href="mailto:${esc(order.customer.email)}">${esc(order.customer.email)}</a>`)}
${row("Telefon", esc(order.customer.phone))}
${row("Doručení", esc(order.priced.deliveryLabel))}
${address ? row("Adresa", esc(address)) : ""}
${row("Hmotnost", esc(formatWeight(order.priced.weightKg)))}
${row("VS", esc(order.orderNumber))}
${order.note ? row("Poznámka", esc(order.note)) : ""}
</table>
${itemsTable(order)}
${p(`Objednávka čeká na platbu. <a href="${esc(orderUrl(siteUrl, order))}" style="color:${colors.rust}">Zobrazit objednávku</a>`)}`,
  );
  const text = [
    subject,
    `${order.customer.name}, ${order.customer.email}, ${order.customer.phone}`,
    order.customer.company ?? "",
    `${order.priced.deliveryLabel}${address ? `: ${address}` : ""}`,
    order.note ? `Poznámka: ${order.note}` : "",
    "",
    ...order.priced.lines.map(
      (l) => `${l.name} (${l.variantLabel})${l.personalization ? ` text: "${l.personalization}"` : ""} × ${l.quantity}: ${formatPrice(l.lineTotal)}`,
    ),
    `Celkem: ${formatPrice(order.priced.total)}`,
    orderUrl(siteUrl, order),
  ]
    .filter(Boolean)
    .join("\n");
  return { subject, html, text };
}

export function inquiryConfirmationEmail(input: InquiryInput) {
  const subject = "Děkujeme za poptávku";
  const html = layout(
    subject,
    `${h1("Děkujeme za poptávku")}
${p(`Dobrý den, vaši poptávku „${esc(input.projectType)}“ jsme přijali. Do dvou pracovních dnů se vám ozveme s cenovou nabídkou nebo doplňujícími otázkami.`)}
${p(`<span style="color:${colors.muted}">Shrnutí:</span><br>${esc(input.description).replace(/\n/g, "<br>")}`)}
${p("Pokud chcete něco doplnit, stačí odpovědět na tento e-mail.")}`,
  );
  const text = `Děkujeme za poptávku „${input.projectType}“. Do dvou pracovních dnů se vám ozveme.\n\n${input.description}`;
  return { subject, html, text };
}

export function newInquiryOwnerEmail(input: InquiryInput, files: StoredFile[], siteUrl: string) {
  const subject = `Nová poptávka: ${input.projectType} – ${input.name}`;
  const fileLinks = files.map((f) => ({ name: f.filename, url: `${siteUrl}/api/soubory/${f.token}` }));
  const html = layout(
    subject,
    `${h1("Nová poptávka")}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;font-size:15px">
${row("Jméno", esc(input.name))}
${input.company ? row("Firma", esc(input.company)) : ""}
${row("E-mail", `<a href="mailto:${esc(input.email)}">${esc(input.email)}</a>`)}
${input.phone ? row("Telefon", esc(input.phone)) : ""}
${row("Typ projektu", esc(input.projectType))}
${input.material ? row("Materiál", esc(input.material)) : ""}
${input.dimensions ? row("Rozměry", esc(input.dimensions)) : ""}
${input.deadline ? row("Termín", esc(input.deadline)) : ""}
</table>
${p(esc(input.description).replace(/\n/g, "<br>"))}
${
  fileLinks.length
    ? `<p style="margin:0 0 8px;font-weight:bold">Přiložené soubory</p><ul style="margin:0 0 16px;padding-left:20px">${fileLinks
        .map((f) => `<li><a href="${esc(f.url)}" style="color:${colors.rust}">${esc(f.name)}</a></li>`)
        .join("")}</ul>`
    : ""
}`,
  );
  const text = [
    subject,
    `${input.name}${input.company ? `, ${input.company}` : ""}, ${input.email}${input.phone ? `, ${input.phone}` : ""}`,
    input.material ? `Materiál: ${input.material}` : "",
    input.dimensions ? `Rozměry: ${input.dimensions}` : "",
    input.deadline ? `Termín: ${input.deadline}` : "",
    "",
    input.description,
    "",
    ...fileLinks.map((f) => `${f.name}: ${f.url}`),
  ]
    .filter((line, i) => line !== "" || i > 0)
    .join("\n");
  return { subject, html, text };
}
