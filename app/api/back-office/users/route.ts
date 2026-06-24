import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { createStaffAccountErrorResponse } from "@/lib/auth/staff-create";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
const inputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  password: z.string().min(12).max(128),
  role: z.enum(["SUPER_ADMIN", "EDITOR", "REVIEWER"]),
});
export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("users:manage");
  if (isAuthResponse(session)) return session;
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Invalid staff account",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          emailVerified: true,
          role: parsed.data.role,
        },
      });
      await tx.account.create({
        data: {
          accountId: created.id,
          providerId: "credential",
          userId: created.id,
          password: await hashPassword(parsed.data.password),
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "USER_CREATED",
          entity: "User",
          entityId: created.id,
          metadata: { role: created.role },
        },
      });
      return created;
    });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    const response = createStaffAccountErrorResponse(error);
    return NextResponse.json(
      { error: response.error },
      { status: response.status },
    );
  }
}
