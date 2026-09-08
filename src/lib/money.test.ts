import { describe, it, expect } from "vitest";
import {
  money,
  zero,
  add,
  subtract,
  sum,
  multiply,
  allocateLargestRemainder,
  toApiString,
  isZero,
} from "./money";

describe("money", () => {
  it("creates a Money pair and keeps a string round-trip", () => {
    const m = money("1000.50", "INR");
    expect(toApiString(m)).toEqual({ amount: "1000.50", currency: "INR" });
  });

  it("adds same-currency values", () => {
    const total = add(money("100.25", "INR"), money("200.75", "INR"));
    expect(toApiString(total).amount).toBe("301.00");
  });

  it("throws on cross-currency arithmetic", () => {
    expect(() => add(money("1", "INR"), money("1", "USD"))).toThrow(/currency/i);
  });

  it("sums a list without drifting", () => {
    const total = sum([money("0.1", "INR"), money("0.2", "INR"), money("0.3", "INR")], "INR");
    expect(total.amount.toString()).toBe("0.6");
  });

  it("multiplies with a decimal factor", () => {
    const m = multiply(money("500.00", "INR"), "1.5");
    expect(toApiString(m).amount).toBe("750.00");
  });

  it("checks zero", () => {
    expect(isZero(zero("INR"))).toBe(true);
    expect(isZero(money("0.01", "INR"))).toBe(false);
  });

  it("subtracts", () => {
    const r = subtract(money("300.00", "INR"), money("120.50", "INR"));
    expect(toApiString(r).amount).toBe("179.50");
  });
});

describe("allocateLargestRemainder", () => {
  it("splits 1000.00 into 3 parts summing exactly to 1000.00", () => {
    const parts = allocateLargestRemainder(money("1000.00", "INR"), 3);
    const amounts = parts.map((p) => p.amount.toNumber());
    expect(amounts.sort((a, b) => b - a)).toEqual([333.34, 333.33, 333.33]);
    const total = parts.reduce((acc, part) => acc.plus(part.amount), money(0, "INR").amount);
    expect(total.toString()).toBe("1000");
  });

  it("handles n=0", () => {
    expect(allocateLargestRemainder(money("100", "INR"), 0)).toEqual([]);
  });

  it("exact split stays exact", () => {
    const parts = allocateLargestRemainder(money("300.00", "INR"), 3);
    expect(parts.every((p) => p.amount.toString() === "100")).toBe(true);
  });
});
