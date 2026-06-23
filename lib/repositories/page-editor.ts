import "server-only";
import { prisma } from "@/lib/db";
import type { PageDraftInput } from "@/lib/validation/page-editor";
export async function getPageEditor(id: string) {
  return prisma.page.findUnique({
    where: { id },
    select: {
      id: true,
      key: true,
      status: true,
      revisions: {
        orderBy: { version: "desc" },
        take: 1,
        select: {
          id: true,
          version: true,
          immutable: true,
          translations: {
            select: {
              locale: true,
              title: true,
              description: true,
              seoTitle: true,
              seoDescription: true,
            },
          },
          sections: {
            orderBy: { order: "asc" },
            select: {
              type: true,
              order: true,
              visible: true,
              config: true,
              mediaId: true,
              translations: {
                select: {
                  locale: true,
                  heading: true,
                  body: true,
                  ctaLabel: true,
                  ctaUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
export async function savePageDraft(
  pageId: string,
  authorId: string,
  input: PageDraftInput,
) {
  return prisma.$transaction(async (tx) => {
    const page = await tx.page.findUnique({
      where: { id: pageId },
      select: {
        revisions: {
          orderBy: { version: "desc" },
          take: 1,
          select: { id: true, version: true, immutable: true },
        },
      },
    });
    if (!page) throw new Error("Page not found");
    const latest = page.revisions[0];
    const data = {
      translations: {
        create: input.translations.map((t) => ({
          ...t,
          seoTitle: t.seoTitle || null,
          seoDescription: t.seoDescription || null,
        })),
      },
      sections: {
        create: input.sections.map((s) => ({
          type: s.type,
          order: s.order,
          visible: s.visible,
          config: s.config ?? undefined,
          mediaId: s.mediaId ?? null,
          translations: {
            create: s.translations.map((t) => ({
              ...t,
              heading: t.heading || null,
              body: t.body || null,
              ctaLabel: t.ctaLabel || null,
              ctaUrl: t.ctaUrl || null,
            })),
          },
        })),
      },
    };
    let revisionId: string;
    if (latest && !latest.immutable) {
      await tx.pageRevisionTranslation.deleteMany({
        where: { revisionId: latest.id },
      });
      await tx.pageSectionRevision.deleteMany({
        where: { revisionId: latest.id },
      });
      await tx.pageRevision.update({ where: { id: latest.id }, data });
      revisionId = latest.id;
    } else {
      const created = await tx.pageRevision.create({
        data: {
          pageId,
          version: (latest?.version ?? 0) + 1,
          authorId,
          ...data,
        },
      });
      revisionId = created.id;
    }
    await tx.auditLog.create({
      data: {
        actorId: authorId,
        action: "PAGE_DRAFT_SAVED",
        entity: "PageRevision",
        entityId: revisionId,
        metadata: { pageId },
      },
    });
    return { revisionId };
  });
}
