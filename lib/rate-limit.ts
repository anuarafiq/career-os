// Minimal in-memory fixed-window rate limiter.
//
// Per-instance only: the backing Map lives in the module scope of whichever
// runtime instance handles the request, so limits are NOT shared across
// serverless/edge instances. Good enough to blunt abuse at this stage; swap for
// Upstash/Redis if durable, cross-instance limiting is needed.

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

export type RateLimitResult = { ok: boolean; retryAfter: number };

/**
 * @param key      Unique bucket key (e.g. `demo:1.2.3.4`).
 * @param limit    Max requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now >= existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true, retryAfter: 0 };
}
