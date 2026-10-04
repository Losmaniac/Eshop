import { settings } from "@/content/settings";
import type { BankAccount } from "@/lib/payment";

// Server-side configuration from environment variables. See .env.example.

function env(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

export const config = {
  siteUrl: env("SITE_URL", "http://localhost:3000").replace(/\/$/, ""),
  ownerEmail: env("OWNER_EMAIL"),
  emailFrom: env("EMAIL_FROM", `${settings.shopName} <onboarding@resend.dev>`),
  resendApiKey: env("RESEND_API_KEY"),
  databaseUrl: env("DATABASE_URL", "file:data/shop.db"),
  databaseAuthToken: env("DATABASE_AUTH_TOKEN"),
  paymentDueDays: Number(env("PAYMENT_DUE_DAYS")) || settings.paymentDueDays,
  bank: {
    iban: env("BANK_IBAN"),
    accountNumber: env("BANK_ACCOUNT"),
    recipientName: env("BANK_RECIPIENT", settings.shopName),
  } satisfies BankAccount,
};

export function assertBankConfigured(): BankAccount {
  if (!config.bank.iban || !config.bank.accountNumber) {
    throw new Error("BANK_IBAN and BANK_ACCOUNT must be set to accept orders.");
  }
  return config.bank;
}
