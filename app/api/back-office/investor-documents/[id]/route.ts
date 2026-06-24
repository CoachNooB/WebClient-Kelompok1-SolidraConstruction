import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
import { invalidate } from "@/lib/cache/server";
import { cacheKeys } from "@/lib/cache/keys";
const schema = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]) });
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:publish");
  if (isAuthResponse(session)) return session;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  const { id } = await params;
  await prisma.$transaction([
    prisma.investorDocument.update({
      where: { id },
      data: {
        status: parsed.data.status,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "INVESTOR_DOCUMENT_STATUS_CHANGED",
        entity: "InvestorDocument",
        entityId: id,
        metadata: parsed.data,
      },
    }),
  ]);
  await invalidate([cacheKeys.reports("ID"), cacheKeys.reports("EN")]);
  return NextResponse.json({ ok: true });
}
