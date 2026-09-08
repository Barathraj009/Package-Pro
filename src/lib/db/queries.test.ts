import { describe, it, expect } from "vitest";
import {
  listPackages,
  getPackage,
  getPackageComponents,
  listLanguages,
  getLanguage,
  listDemoUsers,
} from "./queries";

describe("catalog data integrity (rules)", () => {
  it("has active packages", () => {
    const pkgs = listPackages();
    expect(pkgs.length).toBeGreaterThan(0);
  });

  it("every package has a valid currency", () => {
    for (const p of listPackages()) {
      expect(p.currency).toMatch(/^[A-Z]{3}$/);
    }
  });

  it("every package component belongs to an existing package", () => {
    const pkgIds = new Set(listPackages().map((p) => p.package_id));
    for (const p of listPackages()) {
      for (const c of getPackageComponents(p.package_id)) {
        expect(pkgIds.has(c.package_id)).toBe(true);
      }
    }
  });

  it("languages have valid BCP-47 tags", () => {
    const langs = listLanguages();
    expect(langs.length).toBeGreaterThan(0);
    for (const l of langs) {
      expect(l.bcp47).toMatch(/^[a-z]{2,3}(-[A-Z]{2})?$/);
      expect(getLanguage(l.bcp47)?.bcp47).toBe(l.bcp47);
    }
  });

  it("previously known language set (en, hi, ta) is present", () => {
    const tags = listLanguages().map((l) => l.bcp47);
    expect(tags).toContain("en-IN");
    expect(tags).toContain("hi");
    expect(tags).toContain("ta");
  });

  it("has demo users with IDs", () => {
    const users = listDemoUsers(5);
    expect(users.length).toBeGreaterThan(0);
    for (const u of users) {
      expect(u.user_id).toBeTruthy();
    }
  });
});
