import { expect, it } from "vitest";
import { publishRevision } from "@/lib/repositories/publication";
import { savePageDraft } from "@/lib/repositories/page-editor";
import { describeIntegration, prisma } from "./helpers";

describeIntegration("cms workflows", () => {
  it("saves draft revisions and publishes them with audit logs", async () => {
    const [page, user] = await Promise.all([prisma.page.findFirst({ select: { id: true, publishedRevisionId: true } }), prisma.user.findFirst({ select: { id: true } })]);
    if (!page || !user) return;

    const originalPublishedRevisionId = page.publishedRevisionId;
    const draft = await savePageDraft(page.id, user.id, {
      translations: [
        { locale: "ID", title: "Halaman Uji", description: "Deskripsi halaman uji" },
        { locale: "EN", title: "Test Page", description: "Test page description" },
      ],
      sections: [
        { type: "RICH_TEXT", order: 1, visible: true, config: null, mediaId: null, translations: [{ locale: "ID", heading: "Konten", body: "Isi konten" }, { locale: "EN", heading: "Content", body: "Content body" }] },
      ],
    });
    await expect(prisma.page.findUnique({ where: { id: page.id }, select: { publishedRevisionId: true } })).resolves.toEqual({ publishedRevisionId: originalPublishedRevisionId });

    await publishRevision(draft.revisionId, user.id);
    await expect(prisma.page.findUnique({ where: { id: page.id }, select: { publishedRevisionId: true } })).resolves.toEqual({ publishedRevisionId: draft.revisionId });
    await expect(prisma.auditLog.findFirst({ where: { action: "PAGE_PUBLISHED", entityId: draft.revisionId } })).resolves.toBeTruthy();
  });
});
