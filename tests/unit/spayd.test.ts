import { describe, expect, it } from "vitest";
import { DEMO_BANK } from "@/lib/demo";
import { formatIban } from "@/lib/payment";
import { buildSpayd, sanitizeSpaydText } from "@/lib/spayd";

function ibanIsValid(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const digits = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  return BigInt(digits) % BigInt(97) === BigInt(1);
}

describe("SPAYD (QR Platba)", () => {
  it("builds the string with a dot decimal separator", () => {
    expect(
      buildSpayd({ iban: "CZ65 0800 0000 1920 0014 5399", amount: 4900, variableSymbol: "2610041234", message: "Objednavka 2610041234" }),
    ).toBe("SPD*1.0*ACC:CZ6508000000192000145399*AM:4900.00*CC:CZK*X-VS:2610041234*MSG:Objednavka 2610041234");
  });

  it("formats decimal amounts with two decimals", () => {
    expect(buildSpayd({ iban: DEMO_BANK.iban, amount: 1234.5, variableSymbol: "1" })).toContain("*AM:1234.50*");
  });

  it("adds the due date and recipient", () => {
    const spayd = buildSpayd({
      iban: DEMO_BANK.iban,
      amount: 100,
      variableSymbol: "42",
      dueDate: new Date(2026, 9, 11),
      recipientName: "Ocel & Laser",
    });
    expect(spayd).toContain("*DT:20261011*");
    expect(spayd).toContain("*RN:Ocel & Laser");
  });

  it("strips diacritics and asterisks from text and limits length", () => {
    expect(sanitizeSpaydText("Žluťoučký kůň * úpěl", 60)).toBe("Zlutoucky kun upel");
    expect(sanitizeSpaydText("x".repeat(80), 60)).toHaveLength(60);
  });

  it("rejects invalid input", () => {
    expect(() => buildSpayd({ iban: "nonsense", amount: 1, variableSymbol: "1" })).toThrow();
    expect(() => buildSpayd({ iban: DEMO_BANK.iban, amount: 0, variableSymbol: "1" })).toThrow();
    expect(() => buildSpayd({ iban: DEMO_BANK.iban, amount: 1, variableSymbol: "12345678901" })).toThrow();
  });

  it("uses a valid demo IBAN", () => {
    expect(ibanIsValid(DEMO_BANK.iban)).toBe(true);
    expect(formatIban(DEMO_BANK.iban)).toBe("CZ65 0800 0000 1920 0014 5399");
  });
});
