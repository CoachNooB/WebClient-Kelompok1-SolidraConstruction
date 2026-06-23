import { describe, expect, it } from "vitest";
import { can, type StaffRole } from "@/lib/auth/permissions";

describe("back-office permissions", () => {
  it.each<[StaffRole, string, boolean]>([
    ["SUPER_ADMIN", "users:manage", true],
    ["EDITOR", "content:write", true],
    ["EDITOR", "users:manage", false],
    ["REVIEWER", "content:publish", false],
    ["REVIEWER", "submissions:write", true],
  ])("grants %s %s = %s", (role, permission, expected) => {
    expect(can(role, permission)).toBe(expected);
  });
});
