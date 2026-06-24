import { describe, expect, it } from "vitest";
import { sectionCardMetadataSchema } from "@/lib/validation/section-card";

describe("section card validation", () => {
  it("accepts bilingual managed card metadata", () => {
    expect(
      sectionCardMetadataSchema.safeParse({
        sectionType: "LEADERSHIP",
        order: "2",
        value: "",
        url: "https://example.com/profile",
        titleId: "Jane Santoso",
        titleEn: "Jane Santoso",
        descriptionId: "Direktur Utama",
        descriptionEn: "President Director",
        altId: "Foto Jane Santoso",
        altEn: "Jane Santoso portrait",
      }).success,
    ).toBe(true);
  });

  it("rejects unmanaged section types", () => {
    expect(
      sectionCardMetadataSchema.safeParse({
        sectionType: "DOCUMENTS",
        titleId: "Annual Report",
        titleEn: "Annual Report",
      }).success,
    ).toBe(false);
  });

  it.each(["/projects", "https://example.com/report.pdf"])(
    "accepts safe card URL %s",
    (url) => {
      expect(
        sectionCardMetadataSchema.safeParse({
          sectionType: "PROJECTS",
          titleId: "Proyek",
          titleEn: "Projects",
          url,
        }).success,
      ).toBe(true);
    },
  );

  it.each([
    "//evil.example",
    "javascript:alert(1)",
    "data:text/html,test",
    "http://example.com",
  ])("rejects unsafe card URL %s", (url) => {
    expect(
      sectionCardMetadataSchema.safeParse({
        sectionType: "PROJECTS",
        titleId: "Proyek",
        titleEn: "Projects",
        url,
      }).success,
    ).toBe(false);
  });
});
