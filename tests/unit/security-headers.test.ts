import { describe, expect, it, vi } from "vitest";
import nextConfig from "@/next.config";

describe("security headers", () => {
  it("sets baseline browser security headers for all routes", async () => {
    const headers = await nextConfig.headers?.();

    expect(headers).toEqual([
      expect.objectContaining({
        source: "/(.*)",
        headers: expect.arrayContaining([
          expect.objectContaining({ key: "Content-Security-Policy" }),
          expect.objectContaining({
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          }),
          expect.objectContaining({
            key: "X-Content-Type-Options",
            value: "nosniff",
          }),
          expect.objectContaining({
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          }),
        ]),
      }),
    ]);
  });

  it("blocks framing through CSP frame-ancestors", async () => {
    const headers = await nextConfig.headers?.();
    const csp = headers?.[0]?.headers.find(
      (header) => header.key === "Content-Security-Policy",
    )?.value;

    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("removes unsafe-eval from production CSP", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");

    const { default: config } = await import("@/next.config");
    const headers = await config.headers?.();
    const csp = headers?.[0]?.headers.find(
      (header) => header.key === "Content-Security-Policy",
    )?.value;

    expect(csp).not.toContain("'unsafe-eval'");

    vi.unstubAllEnvs();
  });

  it("keeps unsafe-eval only outside production for Next development tooling", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");

    const { default: config } = await import("@/next.config");
    const headers = await config.headers?.();
    const csp = headers?.[0]?.headers.find(
      (header) => header.key === "Content-Security-Policy",
    )?.value;

    expect(csp).toContain("'unsafe-eval'");

    vi.unstubAllEnvs();
  });
});
