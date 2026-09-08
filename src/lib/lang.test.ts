import { describe, it, expect } from "vitest";
import {
  parseLangList,
  languagesOverlap,
  overlapCount,
  packageLanguageScore,
  guideLanguageScore,
} from "./lang";

describe("parseLangList", () => {
  it("parses a CSV list", () => {
    expect(parseLangList("en-IN, hi , ta")).toEqual(["en-IN", "hi", "ta"]);
  });
  it("handles null/undefined/empty", () => {
    expect(parseLangList(null)).toEqual([]);
    expect(parseLangList("")).toEqual([]);
    expect(parseLangList("  ,  ")).toEqual([]);
  });
});

describe("languagesOverlap", () => {
  it("matches base tags (en vs en-IN)", () => {
    expect(languagesOverlap(["en-IN"], ["en"])).toBe(true);
    expect(languagesOverlap(["ta"], ["hi"])).toBe(false);
  });
});

describe("overlapCount", () => {
  it("counts distinct matching preferred tags", () => {
    expect(overlapCount(["ta", "hi", "en"], ["ta", "en-IN"])).toBe(2);
  });
});

describe("packageLanguageScore", () => {
  it("gives full 2 for exact match, 1 for base-tag match", () => {
    expect(packageLanguageScore(["ta"], ["ta"])).toBe(2);
    expect(packageLanguageScore(["en"], ["en-IN"])).toBe(1);
    expect(packageLanguageScore(["fr"], ["en"])).toBe(0);
  });
  it("returns 0 when no preferences", () => {
    expect(packageLanguageScore([], ["en"])).toBe(0);
  });
});

describe("guideLanguageScore", () => {
  it("2 for exact, 1 for base match, 0 for none", () => {
    expect(guideLanguageScore("ta", ["ta", "en"])).toBe(2);
    expect(guideLanguageScore("en", ["en-IN"])).toBe(1);
    expect(guideLanguageScore("hi", ["ta"])).toBe(0);
    expect(guideLanguageScore(null, ["ta"])).toBe(0);
  });
});
