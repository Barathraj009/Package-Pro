/**
 * Simple in-memory sliding-window rate limiter for API routes that call
 * external services (e.g. the AI builder's Groq call). Not for
 * production-grade distributed limiting — just enough to prevent accidental
 * spam from the UI.
 */
const buckets = new Map<string, number[]>();
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, timestamps] of buckets) {
    const fresh = timestamps.filter((t) => now - t < 120_000);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key — e.g. IP address or user ID
 * @param maxRequests — allowed requests within the window
 * @param windowMs — sliding window in milliseconds (default: 60s)
 */
export function checkRateLimit(key: string, maxRequests = 6, windowMs = 60_000): boolean {
  cleanup();
  const now = Date.now();
  const timestamps = buckets.get(key) ?? [];
  const fresh = timestamps.filter((t) => now - t < windowMs);
  if (fresh.length >= maxRequests) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return true;
}