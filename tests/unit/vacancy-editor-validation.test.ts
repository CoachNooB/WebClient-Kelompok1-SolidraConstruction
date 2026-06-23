import { describe, expect, it } from "vitest";
import { vacancyEditorSchema } from "@/lib/validation/vacancy-editor";

const translation = (locale: "ID" | "EN") => ({
  locale,
  slug: locale === "ID" ? "manajer-proyek" : "project-manager",
  title: locale === "ID" ? "Manajer Proyek" : "Project Manager",
  summary: "Lead complex construction delivery across active project sites.",
  responsibilities: ["Coordinate project delivery"],
  requirements: ["Five years experience"],
});
const base = {
  department: "Operations",
  location: "Jakarta",
  employmentType: "FULL_TIME",
  closingDate: "2026-12-31",
  translations: [translation("ID"), translation("EN")],
};

describe("vacancyEditorSchema", () => {
  it("accepts valid bilingual vacancy", () => {
    expect(vacancyEditorSchema.safeParse(base).success).toBe(true);
  });

  it("rejects missing EN translation", () => {
    expect(
      vacancyEditorSchema.safeParse({
        ...base,
        translations: [
          translation("ID"),
          { ...translation("ID"), slug: "site-manager" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects invalid slug", () => {
    expect(
      vacancyEditorSchema.safeParse({
        ...base,
        translations: [
          translation("ID"),
          { ...translation("EN"), slug: "Project Manager" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects empty responsibilities", () => {
    expect(
      vacancyEditorSchema.safeParse({
        ...base,
        translations: [
          translation("ID"),
          { ...translation("EN"), responsibilities: [] },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects invalid closing date", () => {
    expect(
      vacancyEditorSchema.safeParse({ ...base, closingDate: "not-a-date" })
        .success,
    ).toBe(false);
  });
});
