import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
const inputSchema = z.object({
  status: z.string(),
  note: z.string().trim().max(2000).optional(),
});
const messageStatuses = ["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"] as const;
const applicationStatuses = [
  "NEW",
  "REVIEWING",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
] as const;
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("submissions:write");
  if (isAuthResponse(session)) return session;
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid update" }, { status: 422 });
  const { kind, id } = await params;
  if (kind !== "messages" && kind !== "applications")
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    kind === "messages" &&
    !messageStatuses.includes(
      parsed.data.status as (typeof messageStatuses)[number],
    )
  )
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  if (
    kind === "applications" &&
    !applicationStatuses.includes(
      parsed.data.status as (typeof applicationStatuses)[number],
    )
  )
    return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  await prisma.$transaction(async (tx) => {
    if (kind === "messages")
      await tx.contactMessage.update({
        where: { id },
        data: {
          status: parsed.data.status as (typeof messageStatuses)[number],
        },
      });
    else
      await tx.careerApplication.update({
        where: { id },
        data: {
          status: parsed.data.status as (typeof applicationStatuses)[number],
        },
      });
    if (parsed.data.note)
      await tx.submissionNote.create({
        data: {
          body: parsed.data.note,
          authorId: session.user.id,
          ...(kind === "messages"
            ? { contactMessageId: id }
            : { careerApplicationId: id }),
        },
      });
    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SUBMISSION_UPDATED",
        entity: kind === "messages" ? "ContactMessage" : "CareerApplication",
        entityId: id,
        metadata: { status: parsed.data.status },
      },
    });
  });
  return NextResponse.json({ ok: true });
}
