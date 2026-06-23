import "server-only";
import { cacheKeys } from "@/lib/cache/keys";
import { invalidate } from "@/lib/cache/server";
import { prisma } from "@/lib/db";
import type { NavigationInput } from "@/lib/validation/navigation";

export async function getNavigationEditor(id: string) {
  return prisma.navigationItem.findUnique({
    where: { id },
    select: {
      id: true,
      location: true,
      url: true,
      external: true,
      visible: true,
      order: true,
      parentId: true,
      translations: {
        select: { locale: true, label: true },
        orderBy: { locale: "asc" },
      },
    },
  });
}

export async function updateNavigationItem(
  id: string,
  actorId: string,
  input: NavigationInput,
) {
  await prisma.$transaction(async (tx) => {
    await tx.navigationItem.update({
      where: { id },
      data: {
        location: input.location,
        url: input.url,
        external: input.external,
        visible: input.visible,
        order: input.order,
        parentId: input.parentId,
      },
    });
    await Promise.all(
      (
        [
          ["ID", input.labelId],
          ["EN", input.labelEn],
        ] as const
      ).map(([locale, label]) =>
        tx.navigationItemTranslation.upsert({
          where: { itemId_locale: { itemId: id, locale } },
          create: { itemId: id, locale, label },
          update: { label },
        }),
      ),
    );
    await tx.auditLog.create({
      data: {
        actorId,
        action: "NAVIGATION_UPDATED",
        entity: "NavigationItem",
        entityId: id,
      },
    });
  });
  await invalidate([cacheKeys.navigation("ID"), cacheKeys.navigation("EN")]);
}
