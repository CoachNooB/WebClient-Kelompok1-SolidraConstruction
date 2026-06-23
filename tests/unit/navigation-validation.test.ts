import { describe, expect, it } from "vitest";
import { navigationEditorSchema } from "@/lib/validation/navigation";

const base = { location: "HEADER", url: "/about", external: false, visible: true, order: 1, parentId: null, labelId: "Tentang", labelEn: "About" };

describe("navigationEditorSchema", () => {
  it("accepts internal URL", () => {
    expect(navigationEditorSchema.safeParse({ ...base, url: "/about" }).success).toBe(true);
  });

  it("rejects protocol-relative internal URL", () => {
    expect(navigationEditorSchema.safeParse({ ...base, url: "//evil.example" }).success).toBe(false);
  });

  it("accepts external HTTPS URL", () => {
    expect(navigationEditorSchema.safeParse({ ...base, external: true, url: "https://example.com" }).success).toBe(true);
  });

  it("rejects external HTTP URL", () => {
    expect(navigationEditorSchema.safeParse({ ...base, external: true, url: "http://example.com" }).success).toBe(false);
  });

  it("normalizes empty parentId to null", () => {
    expect(navigationEditorSchema.parse({ ...base, parentId: "" }).parentId).toBeNull();
  });
});
