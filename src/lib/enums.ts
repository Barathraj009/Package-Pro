/**
 * Loads data/enums.json (the single source of truth for legal enum values,
 * per rule R5) and exposes typed guards. Never hardcode enum value guesses
 * elsewhere in the app — import from here.
 */
import fs from "node:fs";
import path from "node:path";

interface EnumsFile {
  version: string;
  enums: Record<string, string[]>;
  id_prefixes: string[];
}

let cached: EnumsFile | null = null;

function loadEnumsFile(): EnumsFile {
  if (cached) return cached;
  const enumsPath = process.env.ENUMS_JSON_PATH ?? path.join(process.cwd(), "data", "enums.json");
  const raw = fs.readFileSync(enumsPath, "utf-8");
  cached = JSON.parse(raw) as EnumsFile;
  return cached;
}

export function legalValues(enumName: string): string[] {
  const file = loadEnumsFile();
  const values = file.enums[enumName];
  if (!values) {
    throw new Error(`Unknown enum "${enumName}" — not present in enums.json`);
  }
  return values;
}

export function isLegal(enumName: string, value: string | null | undefined): boolean {
  if (value == null) return false;
  return legalValues(enumName).includes(value);
}

export function assertLegal(enumName: string, value: string | null | undefined): string {
  if (!isLegal(enumName, value)) {
    throw new Error(`Illegal value "${value}" for enum "${enumName}" — see data/enums.json`);
  }
  return value as string;
}

// Convenience typed constants for enums this app touches directly.
export const PACKAGE_THEMES = [
  "adventure",
  "honeymoon",
  "pilgrimage",
  "family",
  "heritage",
  "wellness",
  "wildlife",
  "food_trail",
] as const;
export type PackageTheme = (typeof PACKAGE_THEMES)[number];

export const PACKAGE_TIERS = ["standard", "deluxe", "premium"] as const;
export type PackageTier = (typeof PACKAGE_TIERS)[number];

export const COMPONENT_TYPES = [
  "hotel",
  "flight",
  "poi",
  "transfer",
  "guide",
  "meal",
  "insurance",
  "entry_ticket",
] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

export const GUIDE_SPECIALISATIONS = [
  "heritage",
  "food",
  "trekking",
  "wildlife",
  "photography",
  "religious",
  "shopping",
  "accessibility",
] as const;
export type GuideSpecialisation = (typeof GUIDE_SPECIALISATIONS)[number];
