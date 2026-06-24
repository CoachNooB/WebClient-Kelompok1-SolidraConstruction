import { afterEach, describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/security/client-ip";

describe("trusted client IP extraction", () => {
  afterEach(() => {
    delete process.env.TRUSTED_CLIENT_IP_HEADER;
  });

  it("uses x-real-ip by default", () => {
    const request = new Request("https://solidra.test", {
      headers: {
        "x-forwarded-for": "198.51.100.10",
        "x-real-ip": "203.0.113.4",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.4");
  });

  it("uses only the configured trusted header", () => {
    process.env.TRUSTED_CLIENT_IP_HEADER = "x-vercel-forwarded-for";
    const request = new Request("https://solidra.test", {
      headers: {
        "x-real-ip": "203.0.113.4",
        "x-vercel-forwarded-for": "198.51.100.10, 198.51.100.11",
      },
    });

    expect(getClientIp(request)).toBe("198.51.100.10");
  });

  it("returns unknown when the trusted header is absent", () => {
    expect(getClientIp(new Request("https://solidra.test"))).toBe("unknown");
  });
});
