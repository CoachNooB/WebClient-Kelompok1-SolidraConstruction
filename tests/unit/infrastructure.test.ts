import { describe, expect, it } from "vitest";
import { cacheKey } from "@/lib/cache/keys";
import { isVacancyEligible } from "@/lib/repositories/vacancies";
import { validateUpload } from "@/lib/storage/validation";

describe("infrastructure rules", () => {
  it("builds versioned locale-aware cache keys", () => {
    expect(cacheKey("page", "ID", "home")).toBe("solidra:v1:page:id:home");
  });

  it("only accepts open, published, unexpired vacancies", () => {
    const now = new Date("2026-06-22T00:00:00Z");
    expect(isVacancyEligible({ status: "OPEN", publishedAt: now, closingDate: new Date("2026-06-23") }, now)).toBe(true);
    expect(isVacancyEligible({ status: "DRAFT", publishedAt: null, closingDate: new Date("2026-06-23") }, now)).toBe(false);
    expect(isVacancyEligible({ status: "OPEN", publishedAt: now, closingDate: new Date("2026-06-21") }, now)).toBe(false);
  });

  it("checks file signature in addition to declared MIME", async () => {
    const valid = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], "cv.pdf", { type: "application/pdf" });
    await expect(validateUpload(valid, "cv")).resolves.toEqual(expect.objectContaining({ extension: "pdf" }));
    const spoofed = new File(["not a pdf"], "cv.pdf", { type: "application/pdf" });
    await expect(validateUpload(spoofed, "cv")).rejects.toThrow("signature");
  });
});
