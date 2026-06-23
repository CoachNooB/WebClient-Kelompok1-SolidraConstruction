import { describe, expect, it } from "vitest";
import { validateStaffUpdate } from "@/lib/auth/user-policy";
describe("staff account safety", () => {
  it("prevents self-demotion", () =>
    expect(() =>
      validateStaffUpdate({
        actorId: "u1",
        targetId: "u1",
        currentRole: "SUPER_ADMIN",
        nextRole: "EDITOR",
        nextActive: true,
        activeSuperAdmins: 2,
      }),
    ).toThrow(/self-demotion/i));
  it("preserves an active super administrator", () =>
    expect(() =>
      validateStaffUpdate({
        actorId: "u2",
        targetId: "u1",
        currentRole: "SUPER_ADMIN",
        nextRole: "EDITOR",
        nextActive: true,
        activeSuperAdmins: 1,
      }),
    ).toThrow(/at least one/i));
  it("allows changes when another super administrator remains", () =>
    expect(() =>
      validateStaffUpdate({
        actorId: "u2",
        targetId: "u1",
        currentRole: "SUPER_ADMIN",
        nextRole: "EDITOR",
        nextActive: true,
        activeSuperAdmins: 2,
      }),
    ).not.toThrow());
});
