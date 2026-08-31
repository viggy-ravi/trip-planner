// Interim rate limiter for auth endpoints (login/register): caps attempts
// per IP within a rolling window. Kept in module-level memory — free, no new
// account needed, but NOT durable across Vercel's multiple serverless
// instances, so a determined attacker spreading requests across instances
// can partially get around it. Good enough to stop naive scripted
// brute-forcing; upgrade to a real distributed limiter (e.g. Upstash Redis)
// before this app has a genuinely adversarial audience.
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_ATTEMPTS;
}

// Test-only: clears all buckets so test files with their own request counts
// don't interfere with each other via the shared "unknown" IP key.
export function resetRateLimiter() {
  buckets.clear();
}
