import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const invalidate = vi.fn();
const requireBackOfficePermission = vi.fn();
const vacancyCreate = vi.fn();
const vacancyUpdate = vi.fn();
const auditLogCreate = vi.fn();
const transaction = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));

vi.mock("@/lib/auth/api", () => ({
  isAuthResponse: () => false,
  requireBackOfficePermission,
}));

vi.mock("@/lib/cache/server", () => ({ invalidate }));

vi.mock("@/lib/db", () => ({
  prisma: {
    vacancy: {
      create: vacancyCreate,
      update: vacancyUpdate,
    },
    auditLog: {
      create: auditLogCreate,
    },
    $transaction: transaction,
  },
}));

const createBody = {
  department: "Operations",
  location: "Jakarta",
  employmentType: "FULL_TIME",
  closingDate: "2026-12-31",
  translations: [
    {
      locale: "ID",
      slug: "site-engineer-id",
      title: "Site Engineer",
      summary: "Ringkasan posisi site engineer",
      responsibilities: ["Koordinasi lapangan"],
      requirements: ["Sarjana teknik"],
    },
    {
      locale: "EN",
      slug: "site-engineer-en",
      title: "Site Engineer",
      summary: "Site engineer position summary",
      responsibilities: ["Coordinate field work"],
      requirements: ["Engineering degree"],
    },
  ],
};

describe("vacancy route public revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireBackOfficePermission.mockResolvedValue({
      user: { id: "admin", role: "SUPER_ADMIN", active: true },
    });
    vacancyCreate.mockResolvedValue({ id: "vacancy-1" });
    vacancyUpdate.mockResolvedValue({ id: "vacancy-1" });
    auditLogCreate.mockResolvedValue({});
    transaction.mockImplementation(async (input) => {
      if (typeof input === "function") {
        return input({
          vacancy: { create: vacancyCreate },
          auditLog: { create: auditLogCreate },
        });
      }
      return Promise.all(input);
    });
  });

  it("revalidates public careers pages after creating a vacancy", async () => {
    const { POST } = await import("@/app/api/back-office/vacancies/route");

    const response = await POST(
      new Request("https://solidra.test/api/back-office/vacancies", {
        method: "POST",
        headers: { origin: "https://solidra.test" },
        body: JSON.stringify(createBody),
      }),
    );

    expect(response.status).toBe(201);
    expect(revalidatePath).toHaveBeenCalledWith("/id/careers");
    expect(revalidatePath).toHaveBeenCalledWith("/en/careers");
  });

  it("revalidates public careers pages after opening a vacancy", async () => {
    const { PATCH } = await import("@/app/api/back-office/vacancies/[id]/route");

    const response = await PATCH(
      new Request("https://solidra.test/api/back-office/vacancies/vacancy-1", {
        method: "PATCH",
        headers: { origin: "https://solidra.test" },
        body: JSON.stringify({ status: "OPEN" }),
      }),
      { params: Promise.resolve({ id: "vacancy-1" }) },
    );

    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/id/careers");
    expect(revalidatePath).toHaveBeenCalledWith("/en/careers");
  });
});
