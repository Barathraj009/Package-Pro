/**
 * Money engine — enforces data rule R3.
 *
 * Every money value in this app is a `Money` pair: a Decimal amount (2dp)
 * plus an ISO-4217 currency code. Never a bare number, never a float, not
 * even briefly in a computation. `PS-04.db` stores money as TEXT for this
 * exact reason — cast only for display.
 *
 * Import Decimal from here (not directly from "decimal.js") so the whole
 * app shares one configured instance.
 */
import Decimal from "decimal.js";

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type CurrencyCode = string; // ISO-4217, e.g. "INR", "NPR", "USD"

export interface Money {
  amount: Decimal;
  currency: CurrencyCode;
}

/** Parse a DB/JSON money string into a Money. Never use `Number()`/`parseFloat()` on money. */
export function money(amount: string | number | Decimal, currency: CurrencyCode): Money {
  return { amount: new Decimal(amount), currency };
}

export function zero(currency: CurrencyCode): Money {
  return { amount: new Decimal(0), currency };
}

function assertSameCurrency(a: Money, b: Money) {
  if (a.currency !== b.currency) {
    throw new Error(
      `Currency mismatch: cannot combine ${a.currency} and ${b.currency} directly — convert first.`
    );
  }
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount.plus(b.amount), currency: a.currency };
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount.minus(b.amount), currency: a.currency };
}

export function sum(items: Money[], currency: CurrencyCode): Money {
  return items.reduce((acc, m) => add(acc, m), zero(currency));
}

export function multiply(a: Money, factor: Decimal | number | string): Money {
  return { amount: a.amount.times(factor), currency: a.currency };
}

/** Round to the currency's minor-unit exponent (2dp for INR, 0 for JPY, etc.), half-up. */
export function roundToMinorUnit(a: Money, minorUnitExponent = 2): Money {
  return { amount: a.amount.toDecimalPlaces(minorUnitExponent, Decimal.ROUND_HALF_UP), currency: a.currency };
}

/**
 * Largest-remainder allocation: split `total` into `n` parts that sum
 * EXACTLY to `total`, e.g. ₹1000.00 / 3 = [333.34, 333.33, 333.33].
 * Never divide-and-round each part independently — that loses or gains
 * a paisa/cent versus the total.
 */
export function allocateLargestRemainder(total: Money, n: number, minorUnitExponent = 2): Money[] {
  if (n <= 0) return [];
  const scale = new Decimal(10).pow(minorUnitExponent);
  const totalMinorUnits = total.amount.times(scale).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

  const baseShare = totalMinorUnits.dividedToIntegerBy(n);
  let remainder = totalMinorUnits.minus(baseShare.times(n)).toNumber();

  const parts: Decimal[] = new Array(n).fill(baseShare);
  // Distribute the leftover minor units one-by-one to the first `remainder` parts.
  for (let i = 0; i < n && remainder > 0; i++, remainder--) {
    parts[i] = parts[i]!.plus(1);
  }

  return parts.map((minorUnits) => ({
    amount: minorUnits.dividedBy(scale),
    currency: total.currency,
  }));
}

/** Format for display only — never parse this string back into arithmetic. */
export function formatMoney(m: Money, opts?: { symbol?: string; locale?: string }): string {
  const amountStr = m.amount.toFixed(2);
  if (opts?.symbol) return `${opts.symbol}${amountStr}`;
  return `${amountStr} ${m.currency}`;
}

export function toApiString(m: Money): { amount: string; currency: CurrencyCode } {
  return { amount: m.amount.toFixed(2), currency: m.currency };
}

export function isZero(m: Money): boolean {
  return m.amount.isZero();
}

export function isNegative(m: Money): boolean {
  return m.amount.isNegative();
}

export { Decimal };
