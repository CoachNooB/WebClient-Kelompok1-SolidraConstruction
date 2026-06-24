import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getVacancies } from "@/lib/repositories/public-content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.integrationsEnabled
    ? env.NEXT_PUBLIC_SITE_URL
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pages = ["", "/about", "/investors", "/contact", "/careers"];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of ["id", "en"] as const) {
    entries.push(
      ...pages.map((path) => ({
        url: `${base}/${locale}${path}`,
        alternates: {
          languages: { id: `${base}/id${path}`, en: `${base}/en${path}` },
        },
      })),
    );
    const vacancies = await getVacancies(locale.toUpperCase() as "ID" | "EN");
    entries.push(
      ...vacancies.flatMap((v) =>
        v.translations[0]
          ? [
              {
                url: `${base}/${locale}/careers/${v.translations[0].slug}`,
                lastModified: v.closingDate,
              },
            ]
          : [],
      ),
    );
  }
  return entries;
}
