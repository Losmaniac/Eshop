import { describe, expect, it } from "vitest";
import { generateOrderNumber, generateToken, isValidVariableSymbol } from "@/lib/order-number";

describe("order number / variable symbol", () => {
  it("is YYMMDD followed by four random digits", () => {
    const date = new Date(2026, 9, 4); // 4 Oct 2026
    expect(generateOrderNumber(date, () => 0.1234)).toBe("2610041234");
    expect(generateOrderNumber(date, () => 0)).toBe("2610040000");
    expect(generateOrderNumber(date, () => 0.99999)).toBe("2610049999");
  });

  it("is always a valid variable symbol of at most 10 digits", () => {
    for (let i = 0; i < 1000; i++) {
      const vs = generateOrderNumber();
      expect(vs).toMatch(/^\d{10}$/);
      expect(isValidVariableSymbol(vs)).toBe(true);
    }
  });

  it("rejects invalid variable symbols", () => {
    expect(isValidVariableSymbol("12345678901")).toBe(false);
    expect(isValidVariableSymbol("12a")).toBe(false);
    expect(isValidVariableSymbol("")).toBe(false);
  });

  it("creates unguessable, URL-safe tokens", () => {
    const tokens = new Set(Array.from({ length: 1000 }, () => generateToken()));
    expect(tokens.size).toBe(1000);
    for (const token of tokens) expect(token).toMatch(/^[A-Za-z0-9_-]{24}$/);
  });
});
