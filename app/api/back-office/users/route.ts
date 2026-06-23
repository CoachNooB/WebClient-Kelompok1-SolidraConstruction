import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { auth } from "@/lib/auth";
import { createStaffAccountErrorResponse } from "@/lib/auth/staff-create";
import { prisma } from "@/lib/db";
const inputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  password: z.string().min(12).max(128),
  role: z.enum(["SUPER_ADMIN", "EDITOR", "REVIEWER"]),
});
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
