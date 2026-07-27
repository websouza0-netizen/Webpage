import { describe, expect, it } from "vitest";
import { formatEUR, PLANS, priceForInterval } from "./pricing";

describe("priceForInterval", () => {
  it("returns the monthly price for a monthly interval", () => {
    const plan = PLANS.find((p) => p.id === "static")!;
    expect(priceForInterval(plan, "monthly")).toBe(plan.monthlyPrice);
  });

  it("returns the annual price for an annual interval", () => {
    const plan = PLANS.find((p) => p.id === "ecommerce")!;
    expect(priceForInterval(plan, "annual")).toBe(plan.annualPrice);
  });
});

describe("formatEUR", () => {
  it("formats a whole number without decimals", () => {
    expect(formatEUR(29)).toBe("€29");
  });

  it("formats a fractional amount with up to 2 decimals", () => {
    expect(formatEUR(2.5)).toBe("€2.5");
  });
});
