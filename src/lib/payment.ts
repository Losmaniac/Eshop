import { buildSpayd, normalizeIban } from "@/lib/spayd";

export type BankAccount = {
  iban: string;
  /** Local Czech format, e.g. 123456789/0800. */
  accountNumber: string;
  recipientName: string;
};

export type PaymentInfo = {
  amount: number;
  iban: string;
  ibanFormatted: string;
  accountNumber: string;
  variableSymbol: string;
  dueDate: string;
  message: string;
  spayd: string;
};

export function formatIban(iban: string): string {
  return normalizeIban(iban).replace(/(.{4})/g, "$1 ").trim();
}

export function dueDateFrom(createdAt: Date, dueDays: number): Date {
  const due = new Date(createdAt);
  due.setDate(due.getDate() + dueDays);
  return due;
}

export function buildPaymentInfo(args: {
  bank: BankAccount;
  amount: number;
  orderNumber: string;
  dueDate: Date;
  shopName: string;
}): PaymentInfo {
  const message = `Objednavka ${args.orderNumber} ${args.shopName}`;
  return {
    amount: args.amount,
    iban: normalizeIban(args.bank.iban),
    ibanFormatted: formatIban(args.bank.iban),
    accountNumber: args.bank.accountNumber,
    variableSymbol: args.orderNumber,
    dueDate: args.dueDate.toISOString(),
    message,
    spayd: buildSpayd({
      iban: args.bank.iban,
      amount: args.amount,
      variableSymbol: args.orderNumber,
      message,
      recipientName: args.bank.recipientName,
      dueDate: args.dueDate,
    }),
  };
}
