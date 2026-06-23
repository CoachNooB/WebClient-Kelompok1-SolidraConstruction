import "server-only";
import { Redis } from "@upstash/redis";

function redis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

export async function cached<T>(key: string, seconds: number, load: () => Promise<T>): Promise<T> {
  const connection = redis();
  if (connection) {
    try { const hit = await connection.get<T>(key); if (hit !== null) return hit; } catch { /* PostgreSQL fallback. */ }
  }
  const value = await load();
  if (connection) try { await connection.set(key, value, { ex: seconds }); } catch { /* Cache is optional for reads. */ }
  return value;
}

export async function invalidate(keys: string[]): Promise<void> {
  const connection = redis();
  if (!connection || keys.length === 0) return;
  await connection.del(...keys);
}
