import { describe, expect, it } from "vitest";
import { parseEnvironment } from "@/lib/env";

describe("production runtime environment gating", () => {
  it("does not allow production to rely on development auth or database defaults", () => {
    expect(() =>
      parseEnvironment({
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://solidra.example.com",
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it("allows development to omit production-only credentials", () => {
    expect(parseEnvironment({ NODE_ENV: "development" })).toEqual({
      integrationsEnabled: false,
    });
  });
});
