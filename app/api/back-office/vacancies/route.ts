import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "content:write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  return NextResponse.json({ id: vacancy.id }, { status: 201 });
}
