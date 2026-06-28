import { describe, expect, it } from "vitest";
import { isStaleUpload } from "@/lib/storage/cleanup";

describe("pending upload cleanup", () => {
  it("selects pending objects older than one hour", () => {
    expect(
      isStaleUpload(
        { created_at: "2026-06-28T00:00:00.000Z" },
        new Date("2026-06-28T01:00:00.001Z"),
      ),
    ).toBe(true);
  });

  it("keeps recent and malformed object metadata", () => {
    expect(
      isStaleUpload(
        { created_at: "2026-06-28T00:30:00.000Z" },
        new Date("2026-06-28T01:00:00.000Z"),
      ),
    ).toBe(false);
    expect(isStaleUpload({ created_at: null }, new Date())).toBe(false);
  });
});
