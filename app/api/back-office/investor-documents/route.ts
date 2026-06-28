import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { publicInvestorPaths } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
import {
  assertContentLength,
  uploadRequestLimits,
} from "@/lib/security/request-size";
import { removePublicAsset, uploadPublicAsset } from "@/lib/storage/supabase";
import { investorDocumentMetadataSchema } from "@/lib/validation/investor-document";
export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const tooLarge = assertContentLength(request, uploadRequestLimits.document);
  if (tooLarge) return tooLarge;
  const form = await request.formData();
  const parsed = investorDocumentMetadataSchema.safeParse(
    Object.fromEntries(form),
  );
  const file = form.get("file");
  if (!parsed.success || !(file instanceof File))
    return NextResponse.json(
      {
        error: "Invalid document",
        fields: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  let uploaded: { path: string } | undefined;
  try {
    const stored = await uploadPublicAsset(file, "document");
    uploaded = stored;
    const document = await prisma.$transaction(async (tx) => {
      const created = await tx.investorDocument.create({
        data: {
          storagePath: stored.path,
          year: parsed.data.year,
          category: parsed.data.category,
          mimeType: file.type,
          size: file.size,
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
