import { notFound } from "next/navigation";
import { DatabasePage } from "@/components/public/database-page";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata("investors", locale);
}

export default async function Investors({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DatabasePage pageKey="investors" locale={locale} />;
}
