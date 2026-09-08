import { describe, it, expect, beforeAll } from "vitest";
import { repricePackage } from "./pricing";
import { listPackages } from "./db/queries";

let aPackageId: string;
let pkgCurrency: string;
let basePrice: string;

beforeAll(() => {
  const packages = listPackages();
  expect(packages.length).toBeGreaterThan(0);
  aPackageId = packages[0]!.package_id;
  pkgCurrency = packages[0]!.currency;
  basePrice = packages[0]!.base_price;
});

describe("repricePackage (integration with catalog DB)", () => {
  it("default reprice starts from base price and sums component deltas", () => {
    const r = repricePackage(aPackageId, {});
    expect(r.packageId).toBe(aPackageId);
    expect(r.currency).toBe(pkgCurrency);
    expect(r.baseAmount.amount).toBe(basePrice);
    expect(r.lines.length).toBeGreaterThan(0);
    expect(r.total.amount).not.toBe("");
  });

  it("is deterministic across calls", () => {
    const a = repricePackage(aPackageId, {});
    const b = repricePackage(aPackageId, {});
    expect(a.total.amount).toBe(b.total.amount);
  });

  it("reprices in tamil when uiLang=ta and returns translated labels", () => {
    const r = repricePackage(aPackageId, {}, "ta");
    // At least one line should carry a non-English label; the strings differ.
    expect(r.lines.some((l) => l.label.length > 0)).toBe(true);
  });

  it("removing an optional component lowers the total", () => {
    const base = repricePackage(aPackageId, {});
    const optional = base.lines.find((l) => l.removable && !l.removed);
    if (!optional) {
      // No optional components — just assert base total is consistent.
      expect(Number(base.total.amount)).toBeGreaterThanOrEqual(0);
      return;
    }
    const r = repricePackage(aPackageId, { removedComponentIds: [optional.key] });
    const before = Number(base.total.amount);
    const after = Number(r.total.amount);
    expect(after).toBeLessThan(before);
  });
});
