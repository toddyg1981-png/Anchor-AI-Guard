import { redis } from './redis';

// ---------------------------------------------------------------------------
// Key prefixes – keep short to save memory in Redis
// ---------------------------------------------------------------------------

const CSRF_PREFIX = 'csrf:';
const BLOCKED_IP_PREFIX = 'blocked_ip:';
const VIOLATION_PREFIX = 'violation:';
const AUDIT_KEY = 'audit_log';

const MAX_AUDIT_ENTRIES = 10_000;

// ---------------------------------------------------------------------------
// CSRF Token operations
// ---------------------------------------------------------------------------

/**
 * Store a CSRF token for a specific user with an automatic TTL.
 * Default TTL is 1 hour.
 */
export async function storeCSRFToken(
  token: string,
  userId: string,
  ttlSeconds: number = 3600,
): Promise<void> {
  const payload = JSON.stringify({ userId, createdAt: Date.now() });
  await redis.setex(`${CSRF_PREFIX}${token}`, ttlSeconds, payload);
}

/**
 * Retrieve a stored CSRF token. Returns null if the token does not exist or
 * has expired (Redis handles expiry automatically).
 */
export async function getCSRFToken(
  token: string,
): Promise<{ userId: string; createdAt: number } | null> {
  const raw = await redis.get(`${CSRF_PREFIX}${token}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { userId: string; createdAt: number };
  } catch {
    return null;
  }
}

/**
 * Delete a CSRF token (e.g. after successful validation to prevent replay).
 */
export async function deleteCSRFToken(token: string): Promise<void> {
  await redis.del(`${CSRF_PREFIX}${token}`);
}

// ---------------------------------------------------------------------------
// IP Blocking operations
// ---------------------------------------------------------------------------

/**
 * Block an IP address for a given duration (in seconds).
 * The block data is auto-expired by Redis.
 */
export async function blockIP(
  ip: string,
  reason: string,
  durationSeconds: number,
): Promise<void> {
  const now = Date.now();
  const payload = JSON.stringify({
    reason,
    blockedAt: now,
    expiresAt: now + durationSeconds * 1000,
  });
  await redis.setex(`${BLOCKED_IP_PREFIX}${ip}`, durationSeconds, payload);
}

/**
 * Check whether an IP is currently blocked.
 * Returns the block metadata or null if not blocked / expired.
 */
export async function isIPBlocked(
  ip: string,
): Promise<{ reason: string; blockedAt: number; expiresAt: number } | null> {
  const raw = await redis.get(`${BLOCKED_IP_PREFIX}${ip}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as {
      reason: string;
      blockedAt: number;
      expiresAt: number;
    };
  } catch {
    return null;
  }
}

/**
 * Manually unblock an IP address before its TTL expires.
 */
export async function unblockIP(ip: string): Promise<void> {
  await redis.del(`${BLOCKED_IP_PREFIX}${ip}`);
}

// ---------------------------------------------------------------------------
// Violation tracking
// ---------------------------------------------------------------------------

/**
 * Record a security violation for a given IP. Increments a counter and sets
 * (or resets) a sliding window TTL. Returns the new violation count.
 */
export async function recordViolation(
  ip: string,
  windowSeconds: number = 3600,
): Promise<number> {
  const key = `${VIOLATION_PREFIX}${ip}`;
  const count = await redis.incr(key);
  // Reset the TTL on every violation so the window slides
  await redis.expire(key, windowSeconds);
  return count;
}

/**
 * Retrieve the current violation count for an IP within its active window.
 * Returns 0 if no violations recorded or window has expired.
 */
export async function getViolationCount(ip: string): Promise<number> {
  const raw = await redis.get(`${VIOLATION_PREFIX}${ip}`);
  if (!raw) return 0;
  return parseInt(raw, 10) || 0;
}

/**
 * Clear violation records for an IP (e.g. after manual review).
 */
export async function clearViolations(ip: string): Promise<void> {
  await redis.del(`${VIOLATION_PREFIX}${ip}`);
}

// ---------------------------------------------------------------------------
// Audit log (capped Redis list — newest entries first)
// ---------------------------------------------------------------------------

/**
 * Push an audit log entry. The list is automatically trimmed to
 * MAX_AUDIT_ENTRIES so it doesn't grow unbounded.
 */
export async function pushAuditLog(entry: object): Promise<void> {
  const serialized = JSON.stringify({
    ...entry,
    timestamp: (entry as Record<string, unknown>).timestamp ?? Date.now(),
  });
  await redis.lpush(AUDIT_KEY, serialized);
  // Keep only the most recent entries
  await redis.ltrim(AUDIT_KEY, 0, MAX_AUDIT_ENTRIES - 1);
}

/**
 * Retrieve recent audit log entries (newest first).
 * @param limit  Number of entries to return (default 100, max 10 000).
 */
export async function getAuditLog(limit: number = 100): Promise<object[]> {
  const capped = Math.min(Math.max(1, limit), MAX_AUDIT_ENTRIES);
  const raw = await redis.lrange(AUDIT_KEY, 0, capped - 1);
  return raw.map((item) => {
    try {
      return JSON.parse(item) as object;
    } catch {
      return { raw: item };
    }
  });
}

/**
 * Get the total number of entries currently in the audit log.
 */
export async function getAuditLogLength(): Promise<number> {
  return redis.llen(AUDIT_KEY);
}
