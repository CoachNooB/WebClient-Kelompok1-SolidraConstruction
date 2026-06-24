import Link from "next/link";
import { notFound } from "next/navigation";
import { FooterEditorForm } from "@/components/back-office/footer-editor-form";
import { InvestorDocumentReplaceForm } from "@/components/back-office/investor-document-replace-form";
import { MediaEditorForm } from "@/components/back-office/media-editor-form";
import { NavigationEditorForm } from "@/components/back-office/navigation-editor-form";
import { PageEditorForm } from "@/components/back-office/page-editor-form";
import {
  DeleteMediaButton,
  ResourceStatusForm,
  UserPolicyForm,
} from "@/components/back-office/resource-action-form";
import { SectionCardEditorForm } from "@/components/back-office/section-card-editor-form";
import { SubmissionWorkflowForm } from "@/components/back-office/submission-workflow-form";
import { VacancyEditorForm } from "@/components/back-office/vacancy-editor-form";
import {
  getBackOfficeSessionOrRedirect,
  redirectIfUnauthorized,
} from "@/lib/auth/back-office";
import { isBackOfficeSection } from "@/lib/auth/back-office-sections";
import type { StaffRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { getFooterEditor } from "@/lib/repositories/footer-editor";
import { getNavigationEditor } from "@/lib/repositories/navigation-editor";
import { getPageEditor } from "@/lib/repositories/page-editor";
import { getVacancyEditor } from "@/lib/repositories/vacancy-editor";
import { createPublicAssetDownloadUrl } from "@/lib/storage/supabase";

const messageStatuses = ["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"];
const applicationStatuses = [
  "NEW",
  "REVIEWING",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
];
export const dynamic = "force-dynamic";

export default async function Detail({
  params,
}: {
  params: Promise<{ section: string; id: string }>;
}) {
  const { section, id } = await params;
  const session = await getBackOfficeSessionOrRedirect();
  if (isBackOfficeSection(section))
    redirectIfUnauthorized(session.user.role as StaffRole, section);

  if (section === "pages") {
    const page = await getPageEditor(id);
    if (!page) notFound();
    const revision = page.revisions[0];
    if (!revision) notFound();
    return (
      <>
        <Link href="/back-office/pages" className="text-sm text-blue-600">
          ← Pages
        </Link>
        <h1 className="mt-4 text-3xl font-black">Edit {page.key}</h1>
        <p className="mt-2 text-slate-600">
          Revision {revision.version} ·{" "}
          {revision.immutable ? "Published immutable revision" : "Draft"}
        </p>
        <PageEditorForm
          pageId={id}
          translations={revision.translations}
          initialSections={revision.sections}
          canPublish={session.user.role !== "REVIEWER"}
        />
      </>
    );
  }
  if (section === "messages") {
    const record = await prisma.contactMessage.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true } } },
        },
      },
    });
    if (!record) notFound();
    return (
      <>
        <Link href="/back-office/messages" className="text-sm text-blue-600">
          ← Messages
        </Link>
        <h1 className="mt-4 text-3xl font-black">{record.subject}</h1>
        <dl className="card mt-8 grid gap-4">
          <div>
            <dt className="text-sm text-slate-500">From</dt>
            <dd>
              {record.name} · {record.email} · {record.phone}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Company</dt>
            <dd>{record.company ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Message</dt>
            <dd className="whitespace-pre-line">{record.message}</dd>
          </div>
        </dl>
        <SubmissionWorkflowForm
          kind="messages"
          id={id}
          status={record.status}
          statuses={messageStatuses}
        />
        {record.notes.length > 0 && (
          <section className="card mt-8">
            <h2 className="font-bold">Internal notes</h2>
            {record.notes.map((note) => (
              <p className="mt-3 border-t pt-3 text-sm" key={note.id}>
                {note.body}
                <br />
                <span className="text-slate-500">{note.author.name}</span>
              </p>
            ))}
          </section>
        )}
      </>
    );
  }
  if (section === "applications") {
    const record = await prisma.careerApplication.findUnique({
      where: { id },
      include: {
        vacancy: { include: { translations: { where: { locale: "ID" } } } },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true } } },
        },
      },
    });
    if (!record) notFound();
    return (
      <>
        <Link
          href="/back-office/applications"
          className="text-sm text-blue-600"
        >
          ← Applications
        </Link>
        <h1 className="mt-4 text-3xl font-black">{record.name}</h1>
        <dl className="card mt-8 grid gap-4">
          <div>
            <dt className="text-sm text-slate-500">Vacancy</dt>
            <dd>
              {record.vacancy.translations[0]?.title ??
                record.vacancy.department}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Contact</dt>
            <dd>
              {record.email} · {record.phone}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Cover letter</dt>
            <dd className="whitespace-pre-line">{record.coverLetter}</dd>
          </div>
          <div>
            <a
              className="font-semibold text-blue-600"
              href={`/api/back-office/applications/${id}/cv`}
            >
              Download CV (authorized link)
            </a>
          </div>
        </dl>
        <SubmissionWorkflowForm
          kind="applications"
          id={id}
          status={record.status}
          statuses={applicationStatuses}
        />
        {record.notes.length > 0 && (
          <section className="card mt-8">
            <h2 className="font-bold">Internal notes</h2>
            {record.notes.map((note) => (
              <p className="mt-3 border-t pt-3 text-sm" key={note.id}>
                {note.body}
                <br />
                <span className="text-slate-500">{note.author.name}</span>
              </p>
            ))}
          </section>
        )}
      </>
    );
  }
  if (section === "investor-documents") {
    const record = await prisma.investorDocument.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!record) notFound();
    return (
      <>
        <Link
          href="/back-office/investor-documents"
          className="text-sm text-blue-600"
        >
          ← Investor documents
        </Link>
        <h1 className="mt-4 text-3xl font-black">
          {record.translations.find((t) => t.locale === "ID")?.title ??
            record.category}
        </h1>
        <p className="mt-2 text-slate-600">
          {record.category} · {record.year} ·{" "}
          {(record.size / 1024 / 1024).toFixed(1)} MB
        </p>
        <InvestorDocumentReplaceForm id={id} />
        <ResourceStatusForm
          endpoint={`/api/back-office/investor-documents/${id}`}
          status={record.status}
          statuses={["DRAFT", "PUBLISHED", "ARCHIVED"]}
        />
      </>
    );
  }
  if (section === "section-cards") {
    const record = await prisma.sectionCard.findUnique({
      where: { id },
      include: { translations: true, image: true },
    });
    if (!record) notFound();
    const imageUrl = record.image
      ? await createPublicAssetDownloadUrl(record.image.storagePath, "image")
      : null;
    return (
      <>
        <Link href="/back-office/section-cards" className="text-sm text-blue-600">
          ← Section cards
        </Link>
        <h1 className="mt-4 text-3xl font-black">
          {record.translations.find((t) => t.locale === "ID")?.title ??
            record.sectionType}
        </h1>
        <p className="mt-2 text-slate-600">
          {record.sectionType} · Order {record.order}
        </p>
        {imageUrl && (
          <a
            className="mt-4 inline-block text-blue-600"
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Current image
          </a>
        )}
        <SectionCardEditorForm card={record} />
        <ResourceStatusForm
          endpoint={`/api/back-office/section-cards/${id}`}
          status={record.status}
          statuses={["DRAFT", "PUBLISHED", "ARCHIVED"]}
        />
      </>
    );
  }
  if (section === "vacancies") {
    const record = await getVacancyEditor(id);
    if (!record) notFound();
    return (
      <>
        <Link href="/back-office/vacancies" className="text-sm text-blue-600">
          ← Vacancies
        </Link>
        <h1 className="mt-4 text-3xl font-black">
          {record.translations.find((t) => t.locale === "ID")?.title ??
            record.department}
        </h1>
        <p className="mt-2 text-slate-600">
          {record.department} · {record.location} · {record._count.applications}{" "}
          applications · closes {record.closingDate.toLocaleDateString()}
        </p>
        <VacancyEditorForm vacancy={record} />
        <ResourceStatusForm
          endpoint={`/api/back-office/vacancies/${id}`}
          status={record.status}
          statuses={["DRAFT", "OPEN", "CLOSED", "ARCHIVED"]}
        />
      </>
    );
  }
  if (section === "users") {
    const record = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        lastLoginAt: true,
      },
    });
    if (!record) notFound();
    return (
      <>
        <Link href="/back-office/users" className="text-sm text-blue-600">
          ← Users
        </Link>
        <h1 className="mt-4 text-3xl font-black">{record.name}</h1>
        <p className="mt-2 text-slate-600">
          {record.email} · Last login{" "}
          {record.lastLoginAt?.toLocaleString() ?? "Never"}
        </p>
        <UserPolicyForm id={id} role={record.role} active={record.active} />
      </>
    );
  }
  if (section === "media") {
    const record = await prisma.mediaAsset.findUnique({
      where: { id },
      include: {
        sections: { select: { id: true } },
        revisionSections: { select: { id: true } },
        projects: { select: { id: true } },
      },
    });
    if (!record) notFound();
    const references =
      record.sections.length +
      record.revisionSections.length +
      record.projects.length;
    const previewUrl = await createPublicAssetDownloadUrl(
      record.storagePath,
      "image",
    );
    return (
      <>
        <Link href="/back-office/media" className="text-sm text-blue-600">
          ← Media
        </Link>
        <h1 className="mt-4 text-3xl font-black">{record.fileName}</h1>
        <dl className="card mt-8 grid gap-3">
          <div>
            <dt className="text-sm text-slate-500">Storage path</dt>
            <dd>{record.storagePath}</dd>
          </div>
          {previewUrl && (
            <div>
              <dt className="text-sm text-slate-500">Preview URL</dt>
              <dd className="break-all">
                <a
                  className="text-blue-600"
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {previewUrl}
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-slate-500">Alt text</dt>
            <dd>
              ID: {record.altId ?? "—"}
              <br />
              EN: {record.altEn ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">References</dt>
            <dd>{references}</dd>
          </div>
        </dl>
        <MediaEditorForm
          id={id}
          altId={record.altId ?? ""}
          altEn={record.altEn ?? ""}
        />
        <DeleteMediaButton id={id} disabled={references > 0} />
      </>
    );
  }
  if (section === "navigation") {
    const item = await getNavigationEditor(id);
    if (!item) notFound();
    return (
      <>
        <Link href="/back-office/navigation" className="text-sm text-blue-600">
          ← Navigation
        </Link>
        <h1 className="mt-4 text-3xl font-black">
          {item.translations.find((t) => t.locale === "ID")?.label ?? item.url}
        </h1>
        <NavigationEditorForm item={item} />
      </>
    );
  }
  if (section === "footer") {
    const group = await getFooterEditor(id);
    if (!group) notFound();
    return (
      <>
        <Link href="/back-office/footer" className="text-sm text-blue-600">
          ← Footer
        </Link>
        <h1 className="mt-4 text-3xl font-black">
          {group.translations.find((t) => t.locale === "ID")?.title ??
            "Footer group"}
        </h1>
        <FooterEditorForm group={group} />
      </>
    );
  }
  notFound();
}
