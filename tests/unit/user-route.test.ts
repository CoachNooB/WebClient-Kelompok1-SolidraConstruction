import { beforeEach, describe, expect, it, vi } from "vitest";

const requireBackOfficePermission = vi.fn();
const userFindUnique = vi.fn();
const userCount = vi.fn();
const txUserUpdate = vi.fn();
const txSessionDeleteMany = vi.fn();
const txAuditCreate = vi.fn();
const transaction = vi.fn(async (callback) =>
  callback({
    user: { update: txUserUpdate },
    session: { deleteMany: txSessionDeleteMany },
    auditLog: { create: txAuditCreate },
  }),
);

vi.mock("@/lib/auth/api", () => ({
  isAuthResponse: () => false,
  requireBackOfficePermission,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: userFindUnique,
      count: userCount,
    },
    $transaction: transaction,
  },
}));

describe("user update route", () => {
  beforeEach(() => {
    requireBackOfficePermission.mockResolvedValue({
      user: { id: "admin", role: "SUPER_ADMIN", active: true },
    });
    userFindUnique.mockResolvedValue({ role: "EDITOR" });
    userCount.mockResolvedValue(2);
    txUserUpdate.mockResolvedValue({});
    txSessionDeleteMany.mockResolvedValue({ count: 1 });
    txAuditCreate.mockResolvedValue({});
    vi.clearAllMocks();
  });

  it("deletes sessions when deactivating a user", async () => {
    const { PATCH } = await import("@/app/api/back-office/users/[id]/route");
    const response = await PATCH(
      new Request("https://solidra.test/api/back-office/users/u2", {
        method: "PATCH",
        headers: { origin: "https://solidra.test" },
        body: JSON.stringify({ role: "EDITOR", active: false }),
      }),
      { params: Promise.resolve({ id: "u2" }) },
    );

    expect(response.status).toBe(200);
    expect(txSessionDeleteMany).toHaveBeenCalledWith({ where: { userId: "u2" } });
  });

  it("keeps sessions when the user remains active", async () => {
    const { PATCH } = await import("@/app/api/back-office/users/[id]/route");
    const response = await PATCH(
      new Request("https://solidra.test/api/back-office/users/u2", {
        method: "PATCH",
        headers: { origin: "https://solidra.test" },
        body: JSON.stringify({ role: "REVIEWER", active: true }),
      }),
      { params: Promise.resolve({ id: "u2" }) },
    );

    expect(response.status).toBe(200);
    expect(txSessionDeleteMany).not.toHaveBeenCalled();
  });
});
