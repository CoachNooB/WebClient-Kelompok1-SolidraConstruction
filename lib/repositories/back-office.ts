import "server-only";
import { prisma } from "@/lib/db";

export type BackOfficeRow = {
  id: string;
  title: string;
  meta: string;
  status: string;
};
export async function listBackOfficeRows(
  section: string,
): Promise<BackOfficeRow[]> {
  if (section === "pages")
    return (
      await prisma.page.findMany({
        orderBy: { updatedAt: "desc" },
        select: { id: true, key: true, status: true, updatedAt: true },
      })
    ).map((x) => ({
      id: x.id,
      title: x.key,
      meta: `Updated ${x.updatedAt.toLocaleDateString()}`,
      status: x.status,
    }));
  if (section === "investor-documents")
    return (
      await prisma.investorDocument.findMany({
        orderBy: [{ year: "desc" }],
        select: {
          id: true,
          year: true,
          category: true,
          status: true,
          translations: { where: { locale: "ID" }, select: { title: true } },
        },
      })
    ).map((x) => ({
      id: x.id,
      title: x.translations[0]?.title ?? x.category,
      meta: `${x.category} · ${x.year}`,
      status: x.status,
    }));
  if (section === "section-cards")
    return (
      await prisma.sectionCard.findMany({
        orderBy: [{ sectionType: "asc" }, { order: "asc" }],
        select: {
          id: true,
          sectionType: true,
          order: true,
          status: true,
          translations: { where: { locale: "ID" }, select: { title: true } },
        },
      })
    ).map((x) => ({
      id: x.id,
      title: x.translations[0]?.title ?? x.sectionType,
      meta: `${x.sectionType} · Order ${x.order}`,
      status: x.status,
    }));
  if (section === "vacancies")
    return (
      await prisma.vacancy.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          department: true,
          location: true,
          status: true,
          applications: { select: { id: true } },
          translations: { where: { locale: "ID" }, select: { title: true } },
        },
      })
    ).map((x) => ({
      id: x.id,
      title: x.translations[0]?.title ?? x.department,
      meta: `${x.location} · ${x.applications.length} applications`,
      status: x.status,
    }));
  if (section === "applications")
    return (
      await prisma.careerApplication.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
        },
      })
    ).map((x) => ({
      id: x.id,
      title: x.name,
      meta: `${x.email} · ${x.createdAt.toLocaleDateString()}`,
      status: x.status,
    }));
  if (section === "messages")
    return (
      await prisma.contactMessage.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          status: true,
        },
      })
    ).map((x) => ({
      id: x.id,
      title: x.subject,
      meta: `${x.name} · ${x.email}`,
      status: x.status,
    }));
  if (section === "media")
    return (
      await prisma.mediaAsset.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          visibility: true,
          sections: { select: { id: true } },
          revisionSections: { select: { id: true } },
          projects: { select: { id: true } },
        },
      })
    ).map((x) => ({
      id: x.id,
      title: x.fileName,
      meta: `${x.mimeType} · ${x.sections.length + x.revisionSections.length + x.projects.length} references`,
      status: x.visibility,
    }));
  if (section === "navigation")
    return (
      await prisma.navigationItem.findMany({
        orderBy: { order: "asc" },
        select: {
          id: true,
          url: true,
          visible: true,
          location: true,
          translations: { where: { locale: "ID" }, select: { label: true } },
        },
      })
    ).map((x) => ({
      id: x.id,
      title: x.translations[0]?.label ?? x.url,
      meta: x.url,
      status: x.visible ? "VISIBLE" : "HIDDEN",
    }));
  if (section === "footer")
    return (
      await prisma.footerGroup.findMany({
        orderBy: { order: "asc" },
        select: {
          id: true,
          visible: true,
          links: { select: { id: true } },
          translations: { where: { locale: "ID" }, select: { title: true } },
        },
      })
    ).map((x) => ({
      id: x.id,
      title: x.translations[0]?.title ?? "Footer group",
      meta: `${x.links.length} links`,
      status: x.visible ? "VISIBLE" : "HIDDEN",
    }));
  if (section === "settings")
    return (
      await prisma.siteSetting.findMany({
        orderBy: { key: "asc" },
        select: { id: true, key: true, updatedAt: true },
      })
    ).map((x) => ({
      id: x.id,
      title: x.key,
      meta: `Updated ${x.updatedAt.toLocaleDateString()}`,
      status: "CONFIGURED",
    }));
  if (section === "users")
    return (
      await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, active: true },
      })
    ).map((x) => ({
      id: x.id,
      title: x.name,
      meta: x.email,
      status: x.active ? x.role : "INACTIVE",
    }));
  return [];
}
