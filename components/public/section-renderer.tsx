import Link from "next/link";
import { CardCarousel } from "@/components/public/card-carousel";
import { ContentCard, type CardItem } from "@/components/public/content-card";
import type { SectionDto } from "@/lib/repositories/public-content";

function items(config: unknown): CardItem[] {
  if (!config || typeof config !== "object" || Array.isArray(config)) return [];
  const value = (config as { items?: unknown }).items;
  return Array.isArray(value)
    ? value.filter(
        (item): item is CardItem => Boolean(item) && typeof item === "object",
      )
    : [];
}

export function SectionRenderer({
  section,
  locale,
}: {
  section: SectionDto;
  locale: "id" | "en";
}) {
  const cards = items(section.config);
  if (section.type === "HERO") return null;
  if (
    [
      "METRICS",
      "SERVICES",
      "PROJECTS",
      "TIMELINE",
      "VALUES",
      "LEADERSHIP",
      "CERTIFICATIONS",
      "FINANCIALS",
      "DOCUMENTS",
      "GOVERNANCE",
      "OFFICES",
      "BENEFITS",
      "PROCESS",
      "VACANCIES",
    ].includes(section.type)
  )
    return (
      <section className="section">
        <div className="container">
          {section.heading && (
            <h2 className="text-3xl font-black">{section.heading}</h2>
          )}
          {section.body && (
            <p className="mt-4 max-w-3xl leading-8 text-slate-600">
              {section.body}
            </p>
          )}
          {section.type === "LEADERSHIP" && cards.length > 3 ? (
            <CardCarousel items={cards} locale={locale} />
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {cards.map((item, index) => (
                <ContentCard
                  key={`${item.title ?? item.label}-${index}`}
                  item={item}
                  locale={locale}
                  imagePlaceholder={section.type === "LEADERSHIP"}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  if (section.type === "CTA")
    return (
      <section className="bg-blue-600 py-16 text-white">
        <div className="container flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-black">{section.heading}</h2>
            {section.body && <p className="mt-3">{section.body}</p>}
          </div>
          {section.ctaLabel && section.ctaUrl && (
            <Link
              className="btn bg-white text-blue-700"
              href={`/${locale}${section.ctaUrl}`}
            >
              {section.ctaLabel}
            </Link>
          )}
        </div>
      </section>
    );
  return (
    <section className="section">
      <div className="container">
        {section.heading && (
          <h2 className="text-3xl font-black">{section.heading}</h2>
        )}
        {section.body && (
          <div className="mt-4 whitespace-pre-line leading-8 text-slate-600">
            {section.body}
          </div>
        )}
      </div>
    </section>
  );
}
