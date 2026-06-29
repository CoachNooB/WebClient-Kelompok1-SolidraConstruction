import { describe, expect, it } from "vitest";
import { isActivePath } from "@/lib/navigation";

describe("isActivePath", () => {
  it("matches an exact route", () => {
    expect(isActivePath("/en/careers", "/en/careers")).toBe(true);
  });

  it("matches a nested route", () => {
    expect(isActivePath("/en/careers/site-engineer", "/en/careers")).toBe(true);
  });

  it("does not match an unrelated route with the same prefix", () => {
    expect(isActivePath("/en/careers-old", "/en/careers")).toBe(false);
  });

  it("only matches root targets exactly when requested", () => {
    expect(isActivePath("/back-office/pages", "/back-office", true)).toBe(
      false,
    );
    expect(isActivePath("/back-office", "/back-office", true)).toBe(true);
  });

  it("ignores a trailing slash when comparing exact routes", () => {
    expect(isActivePath("/id", "/id/", true)).toBe(true);
  });
});
