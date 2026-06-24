import { describe, expect, it } from "vitest";
import { localizedHref } from "@/lib/public-url";

describe("localizedHref", () => {
  it("prefixes internal CMS paths with locale", () => {
    expect(localizedHref("id", "/contact")).toBe("/id/contact");
  });

  it("renders HTTPS CMS URLs directly", () => {
    expect(localizedHref("en", "https://example.com/report.pdf")).toBe(
      "https://example.com/report.pdf",
    );
  });

  it("falls back for unsafe URLs", () => {
    expect(localizedHref("id", "javascript:alert(1)")).toBe("/id");
  });
});
