import "server-only";
import { cacheKeys } from "@/lib/cache/keys";
import { invalidate } from "@/lib/cache/server";
import { prisma } from "@/lib/db";
import type { FooterEditorInput } from "@/lib/validation/footer";

export async function getFooterEditor(id: string) {
  return prisma.footerGroup.findUnique({
    where: { id },
    select: {
      id: true,
      order: true,
      visible: true,
      translations: {
        select: { locale: true, title: true },
        orderBy: { locale: "asc" },
      },
      links: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          url: true,
          external: true,
          visible: true,
          translations: {
            select: { locale: true, label: true },
            orderBy: { locale: "asc" },
          },
        },
      },
    },
  });
}

export async function updateFooterGroup(
  id: string,
  actorId: string,
  input: FooterEditorInput,
) {
  await prisma.$transaction(async (tx) => {
    await tx.footerGroup.update({
      where: { id },
      data: { visible: input.visible, order: input.order },
    });
    await Promise.all(
      (
        [
          ["ID", input.titleId],
          ["EN", input.titleEn],
        ] as const
      ).map(([locale, title]) =>
        tx.footerGroupTranslation.upsert({
          where: { groupId_locale: { groupId: id, locale } },
          create: { groupId: id, locale, title },
          update: { title },
        }),
      ),
    );
    await tx.footerLink.deleteMany({ where: { groupId: id } });
    for (const link of input.links) {
      await tx.footerLink.create({
        data: {
          groupId: id,
          order: link.order,
          url: link.url,
          external: link.external,
          visible: link.visible,
          translations: {
            create: [
              { locale: "ID", label: link.labelId },
              { locale: "EN", label: link.labelEn },
            ],
          },
        },
      });
    }
    await tx.auditLog.create({
      data: {
        actorId,
        action: "FOOTER_UPDATED",
        entity: "FooterGroup",
        entityId: id,
      },
    });
  });
  await invalidate([cacheKeys.footer("ID"), cacheKeys.footer("EN")]);
}
