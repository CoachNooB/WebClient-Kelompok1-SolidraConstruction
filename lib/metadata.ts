import type { Metadata } from "next";
import type { Locale } from "@/generated/prisma/client";
import { isLocale } from "@/lib/i18n";
import { getPublishedPage } from "@/lib/repositories/public-content";

const siteName = "Solidra Construction";

export function formatMetadataTitle(title: string) {
  return title === siteName ? siteName : `${title} | ${siteName}`;
}

export async function pageMetadata(
  pageKey: string,
  locale: string,
): Promise<Metadata> {
  if (!isLocale(locale)) return {};
  const page = await getPublishedPage(
    pageKey,
    locale.toUpperCase() as Locale,
  );
  if (!page) return {};
  const title = page.seoTitle || page.title;
  const description = page.seoDescription || page.description;
  return {
    title: formatMetadataTitle(title),
    description,
    openGraph: {
      title: formatMetadataTitle(title),
      description,
    },
  };
}
