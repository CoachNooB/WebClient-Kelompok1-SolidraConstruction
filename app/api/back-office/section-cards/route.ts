import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { publicManagedContentPaths } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
import { removePublicAsset } from "@/lib/storage/supabase";
import { completeDirectUpload } from "@/lib/storage/complete-upload";
import { sectionCardMetadataSchema } from "@/lib/validation/section-card";
import { z } from "zod";

const schema = sectionCardMetadataSchema.extend({
  upload: z
    .object({
      ticket: z.string().min(1),
      path: z.string().min(1),
      fileName: z.string().min(1).max(255),
    })
    .optional(),
});

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid card", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );

  let uploaded: { path: string } | undefined;
  try {
    let imageId: string | undefined;
    if (parsed.data.upload) {
      const completed = await completeDirectUpload({
        ...parsed.data.upload,
        purpose: "section-card-create",
        subject: session.user.id,
      });
      uploaded = completed;
      const media = await prisma.mediaAsset.create({
        data: {
          storagePath: completed.path,
          fileName: parsed.data.upload.fileName,
          mimeType: completed.mimeType,
          size: completed.size,
          altId: parsed.data.altId || parsed.data.titleId,
          altEn: parsed.data.altEn || parsed.data.titleEn,
          ownerId: session.user.id,
        },
        select: { id: true },
      });
      imageId = media.id;
    }

    const card = await prisma.$transaction(async (tx) => {
      const created = await tx.sectionCard.create({
        data: {
          sectionType: parsed.data.sectionType,
          order: parsed.data.order,
          value: parsed.data.value || null,
          url: parsed.data.url || null,
          imageId,
          translations: {
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
          action: "SECTION_CARD_CREATED",
          entity: "SectionCard",
          entityId: created.id,
        },
      });
      return created;
    });
    for (const path of publicManagedContentPaths()) revalidatePath(path);
    return NextResponse.json({ id: card.id }, { status: 201 });
  } catch (error) {
    if (uploaded)
      await removePublicAsset(uploaded.path, "image").catch(() => undefined);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create card" },
      { status: 500 },
    );
  }
}
