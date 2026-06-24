import { describe, expect, it } from "vitest";
import {
  canAccessBackOfficeSection,
  isBackOfficeSection,
} from "@/lib/auth/back-office-sections";

describe("back-office section permissions", () => {
  it("recognizes configured CMS sections", () => {
    expect(isBackOfficeSection("pages")).toBe(true);
    expect(isBackOfficeSection("section-cards")).toBe(true);
    expect(isBackOfficeSection("not-authorized")).toBe(false);
  });

  it("hides user management from non-super-admins", () => {
    expect(canAccessBackOfficeSection("SUPER_ADMIN", "users")).toBe(true);
    expect(canAccessBackOfficeSection("EDITOR", "users")).toBe(false);
    expect(canAccessBackOfficeSection("REVIEWER", "users")).toBe(false);
  });

  it("allows reviewers to read content and submissions but not settings", () => {
    expect(canAccessBackOfficeSection("REVIEWER", "pages")).toBe(true);
    expect(canAccessBackOfficeSection("REVIEWER", "section-cards")).toBe(true);
    expect(canAccessBackOfficeSection("REVIEWER", "messages")).toBe(true);
    expect(canAccessBackOfficeSection("REVIEWER", "settings")).toBe(false);
  });

  it("keeps reviewer access read-only at the permission layer", () => {
    expect(canAccessBackOfficeSection("REVIEWER", "applications")).toBe(true);
    expect(canAccessBackOfficeSection("REVIEWER", "users")).toBe(false);
  });
});
