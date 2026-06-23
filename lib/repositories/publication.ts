import "server-only";
import { prisma } from "@/lib/db";
import { validateDraftRevision } from "@/lib/content/publication";
import { invalidate } from "@/lib/cache/server";
import { cacheKeys } from "@/lib/cache/keys";

export async function publishRevision(revisionId: string, publisherId: string): Promise<{ pageId: string; revisionId: string }> {
  const revision = await prisma.pageRevision.findUnique({ where: { id: revisionId }, include: { page:{select:{key:true}},translations: true, sections: { include: { translations: true } } } });
  if (!revision) throw new Error("Revision not found");
  validateDraftRevision(revision);
  const now = new Date();
  await prisma.$transaction(async (transaction) => {
    await transaction.pageRevision.update({ where: { id: revisionId }, data: { immutable: true, publisherId, publishedAt: now } });
    await transaction.page.update({ where: { id: revision.pageId }, data: { publishedRevisionId: revisionId, publisherId, publishedAt: now, status: "PUBLISHED" } });
    await transaction.auditLog.create({ data: { actorId: publisherId, action: "PAGE_PUBLISHED", entity: "PageRevision", entityId: revisionId, metadata: { pageId: revision.pageId } } });
  });
  await invalidate([cacheKeys.page("ID",revision.page.key),cacheKeys.page("EN",revision.page.key),cacheKeys.navigation("ID"),cacheKeys.navigation("EN"),cacheKeys.footer("ID"),cacheKeys.footer("EN")]);
  return { pageId: revision.pageId, revisionId };
}
