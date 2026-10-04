// Czech QR payment ("QR Platba") in the SPAYD format:
// SPD*1.0*ACC:<IBAN>*AM:<amount>*CC:CZK*X-VS:<vs>*MSG:<text>
// SPAYD requires a dot as the decimal separator. This is the only place in
// the app where a dot is used in an amount.

export type SpaydInput = {
  iban: string;
  amount: number;
  variableSymbol: string;
  message?: string;
  recipientName?: string;
  dueDate?: Date;
};

/** Remove diacritics and characters that break the format, limit length. */
export function sanitizeSpaydText(text: string, maxLength: number): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[*]/g, " ")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
    .trim();
}

export function normalizeIban(iban: string): string {
  return iban.replace(/\s+/g, "").toUpperCase();
}

function formatSpaydDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function buildSpayd(input: SpaydInput): string {
  const iban = normalizeIban(input.iban);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) throw new Error("Invalid IBAN");
  if (!(input.amount > 0) || input.amount > 9_999_999.99) throw new Error("Invalid amount");
  if (!/^\d{1,10}$/.test(input.variableSymbol)) throw new Error("Invalid variable symbol");

  const parts = [
    "SPD",
    "1.0",
    `ACC:${iban}`,
    `AM:${input.amount.toFixed(2)}`,
    "CC:CZK",
  ];
  if (input.dueDate) parts.push(`DT:${formatSpaydDate(input.dueDate)}`);
  parts.push(`X-VS:${input.variableSymbol}`);
  if (input.recipientName) {
    const rn = sanitizeSpaydText(input.recipientName, 35);
    if (rn) parts.push(`RN:${rn}`);
  }
  if (input.message) {
    const msg = sanitizeSpaydText(input.message, 60);
    if (msg) parts.push(`MSG:${msg}`);
  }
  return parts.join("*");
}
