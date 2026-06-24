import { describe, expect, it } from "vitest";
import { validateSeedAdminPassword } from "@/prisma/seed-validation";

describe("validateSeedAdminPassword", () => {
  it("rejects missing passwords", () => {
    expect(() => validateSeedAdminPassword(undefined)).toThrow(
      /at least 12 characters/,
    );
  });

  it("rejects passwords shorter than 12 characters", () => {
    expect(() => validateSeedAdminPassword("12345678901")).toThrow(
      /at least 12 characters/,
    );
  });

  it("accepts passwords with at least 12 characters", () => {
    expect(validateSeedAdminPassword("123456789012")).toBe("123456789012");
  });
});
