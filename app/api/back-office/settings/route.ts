import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
import { companySettingsSchema } from "@/lib/settings/schema";
import { invalidate } from "@/lib/cache/server";
import { cacheKeys } from "@/lib/cache/keys";
export async function PUT(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("settings:manage");
  if (isAuthResponse(session)) return session;
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
