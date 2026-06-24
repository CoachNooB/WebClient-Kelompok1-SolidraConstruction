import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { removePublicAsset, uploadPublicAsset } from "@/lib/storage/supabase";
import {
  sectionCardMetadataSchema,
  sectionCardStatusSchema,
} from "@/lib/validation/section-card";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    if (!can(session.user.role as StaffRole, "content:publish"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const parsed = sectionCardStatusSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid status" }, { status: 422 });
    await prisma.$transaction([
      prisma.sectionCard.update({
        where: { id },
        data: {
          status: parsed.data.status,
          publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "SECTION_CARD_STATUS_CHANGED",
          entity: "SectionCard",
          entityId: id,
          metadata: parsed.data,
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (!can(session.user.role as StaffRole, "content:write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData();
  const parsed = sectionCardMetadataSchema.safeParse(
    Object.fromEntries(form),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid card", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );

  const file = form.get("image");
  let uploaded: { path: string } | undefined;
  try {
    let imageId: string | undefined;
    if (file instanceof File && file.size > 0) {
      uploaded = await uploadPublicAsset(file, "image");
      const media = await prisma.mediaAsset.create({
        data: {
          storagePath: uploaded.path,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          altId: parsed.data.altId || parsed.data.titleId,
          altEn: parsed.data.altEn || parsed.data.titleEn,
          ownerId: session.user.id,
        },
        select: { id: true },
      });
      imageId = media.id;
    }

    await prisma.$transaction(async (tx) => {
      await tx.sectionCard.update({
        where: { id },
        data: {
          sectionType: parsed.data.sectionType,
          order: parsed.data.order,
          value: parsed.data.value || null,
          url: parsed.data.url || null,
          ...(imageId ? { imageId } : {}),
          status: "DRAFT",
          publishedAt: null,
          translations: {
            deleteMany: {},
            create: [
              {
                locale: "ID",
                title: parsed.data.titleId,
                description: parsed.data.descriptionId || null,
                alt: parsed.data.altId || null,
              },
              {
                locale: "EN",
                title: parsed.data.titleEn,
                description: parsed.data.descriptionEn || null,
                alt: parsed.data.altEn || null,
              },
            ],
          },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "SECTION_CARD_UPDATED",
          entity: "SectionCard",
          entityId: id,
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (uploaded)
      await removePublicAsset(uploaded.path, "image").catch(() => undefined);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update card" },
      { status: 500 },
    );
  }
}
