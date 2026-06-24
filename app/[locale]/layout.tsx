import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import {
  getCompanySettings,
  getFooter,
  getNavigation,
} from "@/lib/repositories/public-content";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    metadataBase: new URL(base),
    alternates: {
      canonical: `/${locale}`,
      languages: { id: "/id", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: "Solidra Construction",
      locale: locale === "id" ? "id_ID" : "en_US",
    },
  };
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dbLocale = locale.toUpperCase() as "ID" | "EN";
  const [navigation, footer, company] = await Promise.all([
    getNavigation(dbLocale),
    getFooter(dbLocale),
    getCompanySettings(),
  ]);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    email: company.email,
    telephone: company.phone,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <SiteHeader locale={locale} items={navigation} />
      <main>{children}</main>
      <SiteFooter locale={locale} groups={footer} company={company} />
    </>
  );
}
