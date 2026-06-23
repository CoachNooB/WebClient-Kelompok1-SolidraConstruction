import { describe, expect, it } from "vitest";
import { investorDocumentMetadataSchema, investorDocumentReplaceSchema } from "@/lib/validation/investor-document";

describe("investor document validation", () => {
  it("accepts valid metadata", () => {
    expect(investorDocumentMetadataSchema.safeParse({ year: "2026", category: "Annual Report", titleId: "Laporan Tahunan", titleEn: "Annual Report" }).success).toBe(true);
  });

  it("requires PDF replacement file", () => {
    const file = new File(["%PDF"], "report.pdf", { type: "application/pdf" });
    expect(investorDocumentReplaceSchema.safeParse({ file }).success).toBe(true);
    expect(investorDocumentReplaceSchema.safeParse({ file: new File(["x"], "x.txt", { type: "text/plain" }) }).success).toBe(false);
  });
});
