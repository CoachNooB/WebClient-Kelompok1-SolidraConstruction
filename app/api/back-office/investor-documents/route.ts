import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { removePublicAsset, uploadPublicAsset } from "@/lib/storage/supabase";
import { investorDocumentMetadataSchema } from "@/lib/validation/investor-document";
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "content:write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
