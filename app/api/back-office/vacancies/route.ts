import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { publicCareersPaths } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
const translation = z.object({
  locale: z.enum(["ID", "EN"]),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(150),
  summary: z.string().min(10).max(1000),
  responsibilities: z.array(z.string().min(2)).min(1),
  requirements: z.array(z.string().min(2)).min(1),
});
const schema = z.object({
  department: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
  closingDate: z.coerce.date(),
  translations: z.array(translation).length(2),
});
export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid vacancy", fields: parsed.error.flatten() },
      { status: 422 },
    );
  const vacancy = await prisma.$transaction(async (tx) => {
    const created = await tx.vacancy.create({
      data: {
        department: parsed.data.department,
        location: parsed.data.location,
        employmentType: parsed.data.employmentType,
        closingDate: parsed.data.closingDate,
        translations: { create: parsed.data.translations },
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "VACANCY_CREATED",
        entity: "Vacancy",
        entityId: created.id,
      },
    });
    return created;
  });
  for (const path of publicCareersPaths()) revalidatePath(path);
  return NextResponse.json({ id: vacancy.id }, { status: 201 });
}
