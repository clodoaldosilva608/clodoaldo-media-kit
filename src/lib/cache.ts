/**
 * Lightweight in-memory cache with TTL.
 *
 * Use case: avoid re-fetching the same data from Supabase/Postgres on every
 * admin page load. Especially useful for:
 *  - /api/admin/stats (aggregate counts that don't change second-by-second)
 *  - /api/admin/data?type=offers (semi-static catalog)
 *  - /api/admin/data?type=testimonials (changes rarely)
 *
 * NOT a replacement for a real Redis instance. Each Vercel serverless
 * instance has its own cache, so cache hits are best-effort. For shared
 * caching, use Vercel KV or Upstash in production.
 *
 * Usage:
 *   const stats = await cached("admin:stats:week", 60_000, async () => {
 *     return await fetchStatsFromDB();
 *   });
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  factory: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && now < hit.expiresAt) {
    return hit.value;
  }
  const value = await factory();
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

/** Invalidate a specific cache key (call after writes). */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/** Invalidate all keys matching a prefix (e.g. "admin:stats:"). */
export function invalidateCachePrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

/** Clear entire cache — useful for tests. */
export function clearCache(): void {
  cache.clear();
}
