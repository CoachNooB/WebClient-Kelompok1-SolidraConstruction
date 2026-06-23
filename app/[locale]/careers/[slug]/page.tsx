import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/forms/application-form";
import { isLocale } from "@/lib/i18n";
import { getVacancyBySlug } from "@/lib/repositories/public-content";
function list(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
export default async function Vacancy({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const vacancy = await getVacancyBySlug(
    locale.toUpperCase() as "ID" | "EN",
    slug,
  );
  const t = vacancy?.translations[0];
  if (!vacancy || !t) notFound();
  const jobJson = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: t.title,
    description: t.summary,
    datePosted: new Date().toISOString(),
    validThrough: vacancy.closingDate.toISOString(),
    employmentType: vacancy.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: "Solidra Construction",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: vacancy.location,
        addressCountry: "ID",
      },
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJson) }}
      />
      <section className="bg-slate-950 py-20 text-white">
        <div className="container">
          <p className="eyebrow">
            {vacancy.department} · {vacancy.location}
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">{t.title}</h1>
          <p className="mt-4 text-slate-300">
            {vacancy.employmentType.replaceAll("_", " ")} ·{" "}
            {vacancy.closingDate.toLocaleDateString(locale)}
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container grid gap-12 md:grid-cols-[1fr_.8fr]">
          <article>
            <p className="leading-8 text-slate-600">{t.summary}</p>
            <h2 className="mt-9 text-2xl font-bold">
              {locale === "id" ? "Tanggung jawab" : "Responsibilities"}
            </h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-600">
              {list(t.responsibilities).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h2 className="mt-9 text-2xl font-bold">
              {locale === "id" ? "Persyaratan" : "Requirements"}
            </h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-600">
              {list(t.requirements).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <ApplicationForm vacancyId={vacancy.id} locale={locale} />
        </div>
      </section>
    </>
  );
}
