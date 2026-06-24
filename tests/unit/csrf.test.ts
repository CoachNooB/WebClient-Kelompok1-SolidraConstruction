import { describe, expect, it } from "vitest";
import { assertSameOrigin } from "@/lib/security/csrf";

describe("CSRF origin guard", () => {
  it("accepts same-origin Origin headers", () => {
    const request = new Request("https://solidra.test/api/back-office/media", {
      headers: { origin: "https://solidra.test" },
    });

    expect(assertSameOrigin(request)).toBeNull();
  });

  it("rejects cross-origin Origin headers", async () => {
    const request = new Request("https://solidra.test/api/back-office/media", {
      headers: { origin: "https://evil.test" },
    });

    const response = assertSameOrigin(request);

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({ error: "Invalid origin" });
  });

  it("accepts same-origin Referer when Origin is missing", () => {
    const request = new Request("https://solidra.test/api/back-office/media", {
      headers: { referer: "https://solidra.test/back-office/media" },
    });

    expect(assertSameOrigin(request)).toBeNull();
  });

  it("rejects missing Origin and Referer", async () => {
    const request = new Request("https://solidra.test/api/back-office/media");

    const response = assertSameOrigin(request);

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({ error: "Missing origin" });
  });
});
