import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const getSession = vi.fn();

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession,
    },
  },
}));

describe("back-office API authorization", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("rejects inactive sessions", async () => {
    const { requireBackOfficePermission } = await import("@/lib/auth/api");
    getSession.mockResolvedValue({
      user: { id: "u1", role: "SUPER_ADMIN", active: false },
    });

    const result = await requireBackOfficePermission("users:manage");

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it("returns active sessions with the requested permission", async () => {
    const { requireBackOfficePermission } = await import("@/lib/auth/api");
    const session = {
      user: { id: "u1", role: "SUPER_ADMIN", active: true },
    };
    getSession.mockResolvedValue(session);

    await expect(requireBackOfficePermission("users:manage")).resolves.toBe(
      session,
    );
  });
});
