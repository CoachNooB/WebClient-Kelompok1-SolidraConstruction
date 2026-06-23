import { describe, expect, it } from "vitest";
import { getFallbackPage } from "@/lib/content/fallback-pages";

describe("fallback public pages", () => {
  it.each(["ID", "EN"] as const)("renders home for %s when database content is missing", (locale) => {
    const page = getFallbackPage("home", locale);
    expect(page?.key).toBe("home");
    expect(page?.sections.some((section) => section.type === "HERO")).toBe(true);
  });

  it("does not invent unknown pages", () => {
    expect(getFallbackPage("missing", "ID")).toBeNull();
  });
});
