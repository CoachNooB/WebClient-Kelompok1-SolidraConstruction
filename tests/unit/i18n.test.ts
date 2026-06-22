import { describe, expect, it } from "vitest";
import { isLocale, localizePath } from "@/lib/i18n";

describe("i18n", () => {
  it("only accepts supported locales", () => {
    expect(isLocale("id")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("retains the page when switching locale", () => {
    expect(localizePath("/id/careers/site-engineer", "en")).toBe("/en/careers/site-engineer");
  });
});
