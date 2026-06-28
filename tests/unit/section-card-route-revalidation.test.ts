import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const requireBackOfficePermission = vi.fn();
const sectionCardUpdate = vi.fn();
const auditLogCreate = vi.fn();
const transaction = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));

vi.mock("@/lib/auth/api", () => ({
  isAuthResponse: () => false,
  requireBackOfficePermission,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    sectionCard: {
      update: sectionCardUpdate,
    },
    auditLog: {
      create: auditLogCreate,
    },
    $transaction: transaction,
  },
}));

describe("section card route public revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireBackOfficePermission.mockResolvedValue({
      user: { id: "admin", role: "SUPER_ADMIN", active: true },
    });
    sectionCardUpdate.mockResolvedValue({ id: "card-1", sectionType: "OFFICES" });
    auditLogCreate.mockResolvedValue({});
    transaction.mockImplementation(async (input) => Promise.all(input));
  });

  it("revalidates all public pages after publishing an OFFICE card", async () => {
    const { PATCH } = await import(
      "@/app/api/back-office/section-cards/[id]/route"
    );

    const response = await PATCH(
      new Request("https://solidra.test/api/back-office/section-cards/card-1", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          origin: "https://solidra.test",
        },
        body: JSON.stringify({ status: "PUBLISHED" }),
      }),
      { params: Promise.resolve({ id: "card-1" }) },
    );

    expect(response.status).toBe(200);
    for (const path of [
      "/id",
      "/en",
      "/id/about",
      "/en/about",
      "/id/investors",
      "/en/investors",
      "/id/contact",
      "/en/contact",
      "/id/careers",
      "/en/careers",
    ]) {
      expect(revalidatePath).toHaveBeenCalledWith(path);
    }
  });
});
