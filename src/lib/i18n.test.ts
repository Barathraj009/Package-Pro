import { describe, it, expect } from "vitest";
import { t, tf, tLabel, resolveUiLanguage } from "./i18n";

describe("t", () => {
  it("returns a known key for en", () => {
    expect(t("nav.packages", "en")).toBe("Packages");
  });
  it("base-tags enriched locales", () => {
    expect(t("nav.packages", "en-IN")).toBe("Packages");
  });
  it("falls back to the key for unknown", () => {
    expect(t("no.such.key", "en")).toBe("no.such.key");
  });
  it("falls back to English for unsupported language", () => {
    expect(t("nav.packages", "fr")).toBe("Packages");
  });
});

describe("tf", () => {
  it("interpolates placeholders", () => {
    expect(tf("packages.duration", "en", { d: 3, n: 2 })).toBe("3d / 2n");
  });
});

describe("tLabel", () => {
  it("returns translated value when key exists", () => {
    const v = tLabel("theme", "adventure", "en");
    expect(v).not.toBe("theme.adventure");
  });
  it("returns raw value when key missing", () => {
    expect(tLabel("theme", "flying-carpet", "en")).toBe("flying-carpet");
  });
});

describe("resolveUiLanguage", () => {
  it("prefers first supported language", () => {
    expect(resolveUiLanguage(["ta", "en"])).toBe("ta");
    expect(resolveUiLanguage(["en-IN"])).toBe("en");
    expect(resolveUiLanguage(["de"])).toBe("en");
    expect(resolveUiLanguage([])).toBe("en");
  });
});
