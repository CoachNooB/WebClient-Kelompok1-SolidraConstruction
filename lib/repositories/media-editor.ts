import "server-only";
import { prisma } from "@/lib/db";
import type { MediaAltTextInput } from "@/lib/validation/media";

export async function updateMediaAltText(
  id: string,
  actorId: string,
  input: MediaAltTextInput,
) {
  await prisma.$transaction([
    prisma.mediaAsset.update({
      where: { id },
      data: { altId: input.altId, altEn: input.altEn },
    }),
    prisma.auditLog.create({
      data: {
        actorId,
        action: "MEDIA_ALT_TEXT_UPDATED",
        entity: "MediaAsset",
        entityId: id,
      },
    }),
  ]);
}
