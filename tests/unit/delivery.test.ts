import { describe, expect, it } from "vitest";
import { addWorkingDays, estimatedDispatch } from "@/lib/delivery";

describe("delivery estimate", () => {
  it("skips weekends", () => {
    const friday = new Date(2026, 9, 2);
    expect(addWorkingDays(friday, 1).getDate()).toBe(5); // Monday
    expect(addWorkingDays(friday, 5).getDate()).toBe(9); // next Friday
  });

  it("adds one day for the payment", () => {
    const monday = new Date(2026, 9, 5);
    expect(estimatedDispatch(10, monday).toDateString()).toBe(new Date(2026, 9, 20).toDateString());
  });
});
