import { describe, expect, it } from "vitest";
import { companySettingsSchema } from "@/lib/settings/schema";
import { defaultCompanySettings } from "@/lib/settings/defaults";
describe("typed company settings", () => {
  it("accepts a complete identity and contact record", () => {
    expect(
      companySettingsSchema.safeParse({
        name: "Solidra",
        email: "info@solidra.co.id",
        phone: "+62215550142",
        defaultLocale: "ID",
        socialLinks: { linkedin: "https://linkedin.com/company/solidra" },
        defaultSeo: { title: "Solidra", description: "Construction" },
      }).success,
    ).toBe(true);
  });
  it("provides a valid fallback for unseeded databases", () => {
    expect(
      companySettingsSchema.safeParse(defaultCompanySettings).success,
    ).toBe(true);
  });
  it("rejects unsafe social links", () => {
    expect(
      companySettingsSchema.safeParse({
        name: "Solidra",
        email: "info@solidra.co.id",
        phone: "123",
        defaultLocale: "ID",
        socialLinks: { linkedin: "javascript:alert(1)" },
        defaultSeo: { title: "Solidra", description: "Construction" },
      }).success,
    ).toBe(false);
  });
});
