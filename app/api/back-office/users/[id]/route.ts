import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { prisma } from "@/lib/db";
import { validateStaffUpdate } from "@/lib/auth/user-policy";
import { assertSameOrigin } from "@/lib/security/csrf";
const inputSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "EDITOR", "REVIEWER"]),
  active: z.boolean(),
});
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("users:manage");
  if (isAuthResponse(session)) return session;
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid user update" }, { status: 422 });
  const { id } = await params;
  const [target, activeSuperAdmins] = await Promise.all([
    prisma.user.findUnique({ where: { id }, select: { role: true } }),
    prisma.user.count({ where: { role: "SUPER_ADMIN", active: true } }),
  ]);
  if (!target)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    validateStaffUpdate({
      actorId: session.user.id,
      targetId: id,
      currentRole: target.role,
      nextRole: parsed.data.role,
      nextActive: parsed.data.active,
      activeSuperAdmins,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid update" },
      { status: 409 },
    );
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: parsed.data });

    if (!parsed.data.active) {
      await tx.session.deleteMany({ where: { userId: id } });
    }

    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "USER_UPDATED",
        entity: "User",
        entityId: id,
        metadata: parsed.data,
      },
    });
  });
  return NextResponse.json({ ok: true });
}
