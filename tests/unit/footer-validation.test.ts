import { describe, expect, it } from "vitest";
import { footerEditorSchema } from "@/lib/validation/footer";

const link = { order: 1, url: "/about", external: false, visible: true, labelId: "Tentang", labelEn: "About" };
const base = { visible: true, order: 1, titleId: "Perusahaan", titleEn: "Company", links: [link] };

describe("footerEditorSchema", () => {
  it("accepts one valid internal link", () => {
    expect(footerEditorSchema.safeParse(base).success).toBe(true);
  });

  it("accepts one valid external HTTPS link", () => {
    expect(footerEditorSchema.safeParse({ ...base, links: [{ ...link, external: true, url: "https://example.com" }] }).success).toBe(true);
  });

  it("rejects duplicate link order", () => {
    expect(footerEditorSchema.safeParse({ ...base, links: [link, { ...link, url: "/careers" }] }).success).toBe(false);
  });

  it("rejects unsafe external URL", () => {
    expect(footerEditorSchema.safeParse({ ...base, links: [{ ...link, external: true, url: "http://example.com" }] }).success).toBe(false);
  });

  it("rejects protocol-relative URL", () => {
    expect(footerEditorSchema.safeParse({ ...base, links: [{ ...link, url: "//evil.example" }] }).success).toBe(false);
  });
});
