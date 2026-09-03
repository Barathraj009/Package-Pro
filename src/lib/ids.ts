/**
 * Opaque prefixed ID generator for anything PackagePro creates itself —
 * matches the shape of the catalog's own IDs (rule R2: opaque prefixed
 * strings, never integers) so app-created rows look and behave the same
 * way as seeded ones.
 */
import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdef";
const nano = customAlphabet(alphabet, 8);

export function newId(prefix: string): string {
  return `${prefix}_${nano()}`;
}

export const ID_PREFIXES = {
  session: "ses",
  customization: "cus",
  shareLink: "shr",
  booking: "bkg",
} as const;
