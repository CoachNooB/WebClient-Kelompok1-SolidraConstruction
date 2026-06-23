import "server-only";
import { prisma } from "@/lib/db";
import { removePublicAsset, uploadPublicAsset } from "@/lib/storage/supabase";

export async function replaceInvestorDocumentFile(args: {
  id: string;
  actorId: string;
  file: File;
}): Promise<{ id: string }> {
  const current = await prisma.investorDocument.findUniqueOrThrow({
    where: { id: args.id },
  });
  const uploaded = await uploadPublicAsset(args.file, "document");
  try {
    await prisma.$transaction(async (tx) => {
      await tx.investorDocument.update({
        where: { id: args.id },
        data: {
          storagePath: uploaded.path,
          mimeType: args.file.type,
          size: args.file.size,
          status: "DRAFT",
          publishedAt: null,
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: args.actorId,
          action: "INVESTOR_DOCUMENT_FILE_REPLACED",
          entity: "InvestorDocument",
          entityId: args.id,
        },
      });
    });
  } catch (error) {
    await removePublicAsset(uploaded.path, "document").catch(() => undefined);
    throw error;
  }
  try {
    await removePublicAsset(current.storagePath, "document");
  } catch {
    await prisma.auditLog
      .create({
        data: {
          actorId: args.actorId,
          action: "INVESTOR_DOCUMENT_FILE_REPLACED_CLEANUP_FAILED",
          entity: "InvestorDocument",
          entityId: args.id,
          metadata: {
            oldStorageCleanupFailed: true,
            oldStoragePath: current.storagePath,
          },
        },
      })
      .catch(() => undefined);
  }
  return { id: args.id };
}
