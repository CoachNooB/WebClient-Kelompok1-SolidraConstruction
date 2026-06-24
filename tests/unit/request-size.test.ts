import { describe, expect, it } from "vitest";
import {
  assertContentLength,
  MB,
  uploadRequestLimits,
} from "@/lib/security/request-size";

describe("request size guard", () => {
  it("rejects requests without Content-Length", async () => {
    const response = assertContentLength(
      new Request("https://solidra.test"),
      MB,
    );

    expect(response?.status).toBe(411);
    await expect(response?.json()).resolves.toEqual({
      error: "Content-Length required",
    });
  });

  it("rejects malformed Content-Length", async () => {
    const response = assertContentLength(
      new Request("https://solidra.test", {
        headers: { "content-length": "not-a-number" },
      }),
      MB,
    );

    expect(response?.status).toBe(400);
    await expect(response?.json()).resolves.toEqual({
      error: "Invalid content length",
    });
  });

  it("rejects requests above the configured limit", async () => {
    const response = assertContentLength(
      new Request("https://solidra.test", {
        headers: { "content-length": String(uploadRequestLimits.cv + 1) },
      }),
      uploadRequestLimits.cv,
    );

    expect(response?.status).toBe(413);
    await expect(response?.json()).resolves.toEqual({
      error: "Request body too large",
    });
  });
});
