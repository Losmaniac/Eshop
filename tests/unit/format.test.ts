import { describe, expect, it } from "vitest";
import { formatPrice, formatWeight, formatWorkingDays } from "@/lib/format";

const NBSP = " ";

describe("Czech formatting", () => {
  it("formats prices with a space as thousands separator and the currency", () => {
    expect(formatPrice(1000)).toBe(`1${NBSP}000${NBSP}Kč`);
    expect(formatPrice(12900)).toBe(`12${NBSP}900${NBSP}Kč`);
    expect(formatPrice(990)).toBe(`990${NBSP}Kč`);
  });

  it("uses a decimal comma for non-integer amounts", () => {
    expect(formatPrice(1234.5)).toBe(`1${NBSP}234,50${NBSP}Kč`);
    expect(formatWeight(23.7)).toBe(`23,7${NBSP}kg`);
  });

  it("declines working days", () => {
    expect(formatWorkingDays(1)).toBe(`1${NBSP}pracovní den`);
    expect(formatWorkingDays(3)).toBe(`3${NBSP}pracovní dny`);
    expect(formatWorkingDays(10)).toBe(`10${NBSP}pracovních dnů`);
  });
});
