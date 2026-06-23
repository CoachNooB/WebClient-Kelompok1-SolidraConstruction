import { Prisma } from "@/generated/prisma/client";

export type StaffAccountErrorResponse = { error: string; status: 409 };

export function createStaffAccountErrorResponse(
  error: unknown,
): StaffAccountErrorResponse {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = Array.isArray(error.meta?.target) ? error.meta.target : [];
    if (target.includes("email"))
      return {
        error: "A staff account with this email already exists",
        status: 409,
      };
  }
  return { error: "Unable to create staff account", status: 409 };
}
