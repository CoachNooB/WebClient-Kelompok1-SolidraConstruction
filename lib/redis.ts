import "server-only";
import { Redis } from "@upstash/redis";
import { cacheKey } from "@/lib/cache/keys";

function client(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis is not configured");
  return new Redis({ url, token });
}

export async function enforceRateLimit(
  scope: "contact" | "application",
  identity: string,
): Promise<void> {
  const limit = scope === "contact" ? 5 : 3;
  const windowSeconds = scope === "contact" ? 15 * 60 : 60 * 60;
  const key = cacheKey("limit", scope, identity);
  try {
    const redis = client();
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    if (count > limit) throw new Error("RATE_LIMITED");
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") throw error;
    throw new Error("RATE_LIMIT_UNAVAILABLE");
  }
}

export async function claimOnce(
  scope: string,
  key: string,
  ttlSeconds: number,
): Promise<boolean> {
  try {
    return (
      (await client().set(cacheKey("claim", scope, key), "1", {
        nx: true,
        ex: ttlSeconds,
      })) === "OK"
    );
  } catch {
    throw new Error("RATE_LIMIT_UNAVAILABLE");
  }
}

export async function releaseClaim(scope: string, key: string): Promise<void> {
  try {
    await client().del(cacheKey("claim", scope, key));
  } catch {
    /* TTL provides safe cleanup. */
  }
}
