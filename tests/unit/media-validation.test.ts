import { describe, expect, it } from "vitest";
import { mediaAltTextSchema } from "@/lib/validation/media";

describe("mediaAltTextSchema", () => {
  it("accepts empty strings", () => {
    expect(mediaAltTextSchema.safeParse({ altId: "", altEn: "" }).success).toBe(
      true,
    );
  });

  it("accepts normal bilingual alt text", () => {
    expect(
      mediaAltTextSchema.safeParse({
        altId: "Pekerja konstruksi",
        altEn: "Construction worker",
      }).success,
    ).toBe(true);
  });

  it("rejects overlong text", () => {
    expect(
      mediaAltTextSchema.safeParse({ altId: "a".repeat(161), altEn: "" })
        .success,
    ).toBe(false);
  });

  it("rejects script tags", () => {
    expect(
      mediaAltTextSchema.safeParse({
        altId: "<script>alert(1)</script>",
        altEn: "",
      }).success,
    ).toBe(false);
  });
});
