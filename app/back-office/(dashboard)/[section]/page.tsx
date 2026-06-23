import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/back-office/data-table";
import { Pagination } from "@/components/back-office/pagination";
import { ResourceCreatePanel } from "@/components/back-office/resource-create-panel";
import { SettingsForm } from "@/components/back-office/settings-form";
import { TableFilters } from "@/components/back-office/table-filters";
import { auth } from "@/lib/auth";
import { listBackOfficeRows } from "@/lib/repositories/back-office";
import { getCompanySettings } from "@/lib/repositories/public-content";

const sections = [
  "pages",
  "investor-documents",
  "vacancies",
  "applications",
  "messages",
  "media",
  "navigation",
  "footer",
  "settings",
  "users",
];
export const dynamic = "force-dynamic";
export default async function Section({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) notFound();
  if (section === "users" && session.user.role !== "SUPER_ADMIN") notFound();
  const title = section
    .split("-")
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(" ");
  if (section === "settings")
    return (
      <>
        <nav className="mb-2 text-sm text-slate-500">Dashboard / Settings</nav>
        <h1 className="text-3xl font-black">Settings</h1>
        <SettingsForm value={await getCompanySettings()} />
      </>
    );
  const allRows = await listBackOfficeRows(section);
  const query = await searchParams;
  const q = query.q?.trim().toLowerCase() ?? "";
  const filtered = allRows.filter(
    (row) =>
      (!q || `${row.title} ${row.meta}`.toLowerCase().includes(q)) &&
      (!query.status || row.status === query.status),
  );
  const page = Math.max(1, Number(query.page) || 1),
    perPage = 20,
    totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const hasDetail = [
    "pages",
    "applications",
    "messages",
    "investor-documents",
    "vacancies",
    "users",
    "media",
    "navigation",
    "footer",
  ].includes(section);
  const rows = filtered
    .slice((page - 1) * perPage, page * perPage)
    .map((row) => ({
      ...row,
      href: hasDetail ? `/back-office/${section}/${row.id}` : undefined,
    }));
  const statuses = [...new Set(allRows.map((row) => row.status))];
  const pageUrl = (next: number) =>
    `/back-office/${section}?${new URLSearchParams({ ...(query.q ? { q: query.q } : {}), ...(query.status ? { status: query.status } : {}), page: String(next) })}`;
  return (
    <>
      <nav className="mb-2 text-sm text-slate-500">Dashboard / {title}</nav>
      <div className="relative flex items-center justify-between">
        <h1 className="text-3xl font-black">{title}</h1>
        <ResourceCreatePanel section={section} />
      </div>
      <TableFilters q={query.q} status={query.status} statuses={statuses} />
      <DataTable rows={rows} emptyLabel="No records found." />
      <Pagination page={page} totalPages={totalPages} pageUrl={pageUrl} />
    </>
  );
}
