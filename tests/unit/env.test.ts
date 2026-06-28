import { describe, expect, it } from "vitest";
import { parseEnvironment } from "@/lib/env";

describe("parseEnvironment", () => {
  it("allows an integration-free local environment", () => {
    expect(
      parseEnvironment({ NODE_ENV: "development" }).integrationsEnabled,
    ).toBe(false);
  });

  it("keeps Vercel previews integration-free despite production NODE_ENV", () => {
    expect(
      parseEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
      }),
    ).toEqual({ integrationsEnabled: false });
  });

  it("requires a direct migration URL in Vercel production", () => {
    expect(() =>
      parseEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        DATABASE_URL: "postgresql://user:pass@pooler:6543/solidra",
      }),
    ).toThrow(/DIRECT_DATABASE_URL/);
  });

  it("requires every production integration credential", () => {
    expect(() => parseEnvironment({ NODE_ENV: "production" })).toThrow(
      /DATABASE_URL/,
    );
  });

  it("accepts complete production credentials", () => {
    const result = parseEnvironment({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
      DIRECT_DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
      BETTER_AUTH_SECRET: "a-secure-secret-with-at-least-32-characters",
      BETTER_AUTH_URL: "https://solidra.example.com",
      NEXT_PUBLIC_SITE_URL: "https://solidra.example.com",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      UPSTASH_REDIS_REST_URL: "https://redis.example.com",
      UPSTASH_REDIS_REST_TOKEN: "redis-token",
      CRON_SECRET: "a-secure-cron-secret-with-32-characters",
    });

    expect(result.integrationsEnabled).toBe(true);
  });

  it("rejects production auth secrets shorter than 32 characters", () => {
    expect(() =>
      parseEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
        DIRECT_DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
        BETTER_AUTH_SECRET: "short",
        BETTER_AUTH_URL: "https://solidra.example.com",
        NEXT_PUBLIC_SITE_URL: "https://solidra.example.com",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        UPSTASH_REDIS_REST_URL: "https://redis.example.com",
        UPSTASH_REDIS_REST_TOKEN: "redis-token",
        CRON_SECRET: "a-secure-cron-secret-with-32-characters",
      }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it("rejects production database URLs that are not PostgreSQL", () => {
    expect(() =>
      parseEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        DATABASE_URL: "mysql://user:pass@localhost:3306/solidra",
        DIRECT_DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
        BETTER_AUTH_SECRET: "a-secure-secret-with-at-least-32-characters",
        BETTER_AUTH_URL: "https://solidra.example.com",
        NEXT_PUBLIC_SITE_URL: "https://solidra.example.com",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        UPSTASH_REDIS_REST_URL: "https://redis.example.com",
        UPSTASH_REDIS_REST_TOKEN: "redis-token",
        CRON_SECRET: "a-secure-cron-secret-with-32-characters",
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it("requires production public site URL", () => {
    expect(() =>
      parseEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
        DIRECT_DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
        BETTER_AUTH_SECRET: "a-secure-secret-with-at-least-32-characters",
        BETTER_AUTH_URL: "https://solidra.example.com",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        UPSTASH_REDIS_REST_URL: "https://redis.example.com",
        UPSTASH_REDIS_REST_TOKEN: "redis-token",
        CRON_SECRET: "a-secure-cron-secret-with-32-characters",
      }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects HTTP production auth and public URLs", () => {
    expect(() =>
      parseEnvironment({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
        DIRECT_DATABASE_URL: "postgresql://user:pass@localhost:5432/solidra",
        BETTER_AUTH_SECRET: "a-secure-secret-with-at-least-32-characters",
        BETTER_AUTH_URL: "http://solidra.example.com",
        NEXT_PUBLIC_SITE_URL: "http://solidra.example.com",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        UPSTASH_REDIS_REST_URL: "https://redis.example.com",
        UPSTASH_REDIS_REST_TOKEN: "redis-token",
        CRON_SECRET: "a-secure-cron-secret-with-32-characters",
      }),
    ).toThrow(/HTTPS/);
  });
});
