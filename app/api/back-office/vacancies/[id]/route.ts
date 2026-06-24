import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { prisma } from "@/lib/db";
import { invalidate } from "@/lib/cache/server";
import { cacheKeys } from "@/lib/cache/keys";
import { updateVacancy } from "@/lib/repositories/vacancy-editor";
import { assertSameOrigin } from "@/lib/security/csrf";
import { vacancyEditorSchema } from "@/lib/validation/vacancy-editor";
const schema = z.object({
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "ARCHIVED"]),
});
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const body = await request.json();
  const { id } = await params;
  if (Object.keys(body).length === 1 && "status" in body) {
    const session = await requireBackOfficePermission("content:publish");
    if (isAuthResponse(session)) return session;
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid status" }, { status: 422 });
    await prisma.$transaction([
      prisma.vacancy.update({
        where: { id },
        data: {
          status: parsed.data.status,
          publishedAt: parsed.data.status === "OPEN" ? new Date() : null,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "VACANCY_STATUS_CHANGED",
          entity: "Vacancy",
          entityId: id,
          metadata: parsed.data,
        },
      }),
    ]);
    await invalidate([cacheKeys.vacancies("ID"), cacheKeys.vacancies("EN")]);
    return NextResponse.json({ ok: true });
  }
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const parsed = vacancyEditorSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid vacancy", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  await updateVacancy(id, session.user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
