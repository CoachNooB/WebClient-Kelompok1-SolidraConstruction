import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { companySettingsSchema } from "@/lib/settings/schema";
import { invalidate } from "@/lib/cache/server";
import { cacheKeys } from "@/lib/cache/keys";
export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "settings:manage"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = companySettingsSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid settings", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "company" },
      create: { key: "company", value: parsed.data },
      update: { value: parsed.data },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SETTINGS_UPDATED",
        entity: "SiteSetting",
        entityId: "company",
      },
    }),
  ]);
  await invalidate([cacheKeys.settings()]);
  return NextResponse.json({ ok: true });
}
