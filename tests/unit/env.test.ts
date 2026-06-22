import { describe, expect, it } from "vitest";
import { parseEnvironment } from "@/lib/env";

describe("parseEnvironment", () => {
  it("allows an integration-free local environment", () => {
    expect(parseEnvironment({ NODE_ENV: "development" }).integrationsEnabled).toBe(false);
  });

  it("requires every production integration credential", () => {
    expect(() => parseEnvironment({ NODE_ENV: "production" })).toThrow(/DATABASE_URL/);
  });

  it("accepts complete production credentials", () => {
    const result = parseEnvironment({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
      BETTER_AUTH_SECRET: "a-secure-secret-with-at-least-32-characters",
      BETTER_AUTH_URL: "https://solidra.example.com",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      UPSTASH_REDIS_REST_URL: "https://redis.example.com",
      UPSTASH_REDIS_REST_TOKEN: "redis-token",
    });

    expect(result.integrationsEnabled).toBe(true);
  });
});
