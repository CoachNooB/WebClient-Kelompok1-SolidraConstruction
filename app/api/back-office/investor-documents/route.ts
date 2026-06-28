import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { publicInvestorPaths } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
import { removePublicAsset } from "@/lib/storage/supabase";
import { completeDirectUpload } from "@/lib/storage/complete-upload";
import { investorDocumentMetadataSchema } from "@/lib/validation/investor-document";
import { z } from "zod";
const schema = investorDocumentMetadataSchema.extend({
  upload: z.object({
    ticket: z.string().min(1),
    path: z.string().min(1),
    fileName: z.string().min(1).max(255),
  }),
});
export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Invalid document",
        fields: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  let uploaded: { path: string } | undefined;
  try {
    const stored = await completeDirectUpload({
      ...parsed.data.upload,
      purpose: "investor-document-create",
      subject: session.user.id,
    });
    uploaded = stored;
    const document = await prisma.$transaction(async (tx) => {
      const created = await tx.investorDocument.create({
        data: {
          storagePath: stored.path,
          year: parsed.data.year,
          category: parsed.data.category,
          mimeType: stored.mimeType,
          size: stored.size,
          translations: {
            create: [
              {
                locale: "ID",
                title: parsed.data.titleId,
                description: parsed.data.descriptionId,
              },
              {
                locale: "EN",
                title: parsed.data.titleEn,
                description: parsed.data.descriptionEn,
              },
            ],
          },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "INVESTOR_DOCUMENT_CREATED",
          entity: "InvestorDocument",
          entityId: created.id,
        },
      });
      return created;
    });
    for (const path of publicInvestorPaths()) revalidatePath(path);
    return NextResponse.json({ id: document.id }, { status: 201 });
  } catch (error) {
    if (uploaded)
      await removePublicAsset(uploaded.path, "document").catch(() => undefined);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
