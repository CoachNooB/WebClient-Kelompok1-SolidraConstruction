import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { createCvDownloadUrl } from "@/lib/storage/supabase";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "submissions:read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const application = await prisma.careerApplication.findUnique({
    where: { id },
    select: { cvStoragePath: true },
  });
  if (!application)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = await createCvDownloadUrl(application.cvStoragePath);
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CV_DOWNLOADED",
      entity: "CareerApplication",
      entityId: id,
    },
  });
  return NextResponse.redirect(url);
}
