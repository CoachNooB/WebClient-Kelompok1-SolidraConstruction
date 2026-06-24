import "server-only";
import type { Locale } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { cached } from "@/lib/cache/server";
import { cacheKeys } from "@/lib/cache/keys";
import { getFallbackPage } from "@/lib/content/fallback-pages";
import { time } from "@/lib/observability/timing";
import { createPublicAssetDownloadUrl } from "@/lib/storage/supabase";
import {
  defaultCompanySettings,
  type CompanySettings,
} from "@/lib/settings/defaults";

export type SectionDto = {
  id: string;
  type: string;
  order: number;
  config: unknown;
  items?: CardItemDto[];
  heading: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};
export type CardItemDto = {
  title?: string;
  value?: string;
  description?: string;
  label?: string;
  url?: string;
  image?: string;
  imageUrl?: string;
  alt?: string;
};
export type PageDto = {
  key: string;
  slug: string;
  title: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: SectionDto[];
};

export async function getPublishedPage(
  key: string,
  locale: Locale,
): Promise<PageDto | null> {
  const page = await time(`page:${locale}:${key}`, () =>
    prisma.page.findFirst({
      where: { key, status: "PUBLISHED", publishedRevisionId: { not: null } },
      select: {
        key: true,
        slug: true,
        publishedRevision: {
          select: {
            translations: {
              where: { locale },
              select: {
                title: true,
                description: true,
                seoTitle: true,
                seoDescription: true,
              },
            },
            sections: {
              where: { visible: true },
              orderBy: { order: "asc" },
              select: {
                id: true,
                type: true,
                order: true,
                config: true,
                translations: {
                  where: { locale },
                  select: {
                    heading: true,
                    body: true,
                    ctaLabel: true,
                    ctaUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  );
  const translation = page?.publishedRevision?.translations[0];
  if (!page || !translation || !page.publishedRevision)
    return getFallbackPage(key, locale);
  const managedItems = await getManagedSectionItems(
    page.publishedRevision.sections.map((section) => section.type),
    key,
    locale,
  );
  return {
    key: page.key,
    slug: page.slug,
    ...translation,
    sections: page.publishedRevision.sections.map((section) => ({
      id: section.id,
      type: section.type,
      order: section.order,
      config: section.config,
      items: managedItems.get(section.type),
      heading: section.translations[0]?.heading ?? null,
      body: section.translations[0]?.body ?? null,
      ctaLabel: section.translations[0]?.ctaLabel ?? null,
      ctaUrl: section.translations[0]?.ctaUrl ?? null,
    })),
  };
}

const managedCardSectionTypes = [
  "SERVICES",
  "PROJECTS",
  "TIMELINE",
  "VALUES",
  "LEADERSHIP",
  "CERTIFICATIONS",
  "FINANCIALS",
  "GOVERNANCE",
  "OFFICES",
  "BENEFITS",
  "PROCESS",
  "VACANCIES",
] as const;

async function getManagedSectionItems(
  sectionTypes: string[],
  pageKey: string,
  locale: Locale,
) {
  const result = new Map<string, CardItemDto[]>();
  const cardTypes = managedCardSectionTypes.filter((type) =>
    sectionTypes.includes(type),
  );
  if (cardTypes.length > 0) {
    const cards = await prisma.sectionCard.findMany({
      where: {
        sectionType: { in: cardTypes },
        status: "PUBLISHED",
        publishedAt: { not: null },
      },
      orderBy: [{ sectionType: "asc" }, { order: "asc" }],
      select: {
        sectionType: true,
        value: true,
        url: true,
        image: { select: { storagePath: true } },
        translations: {
          where: { locale },
          select: { title: true, description: true, alt: true },
        },
      },
    });
    for (const card of cards) {
      const translation = card.translations[0];
      if (!translation) continue;
      const items = result.get(card.sectionType) ?? [];
      items.push({
        title: translation.title,
        value: card.value ?? undefined,
        description: translation.description ?? undefined,
        url: card.url ?? undefined,
        image: card.image?.storagePath
          ? await createPublicAssetDownloadUrl(card.image.storagePath, "image")
          : undefined,
        alt: translation.alt ?? translation.title,
      });
      result.set(card.sectionType, items);
    }
  }
  if (pageKey === "investors" && sectionTypes.includes("DOCUMENTS")) {
    const documents = await getInvestorDocuments(locale);
    const items: CardItemDto[] = [];
    for (const document of documents) {
      const translation = document.translations[0];
      if (!translation) continue;
      items.push({
        title: translation.title,
        value: String(document.year),
        description: translation.description ?? document.category,
        url: await createPublicAssetDownloadUrl(
          document.storagePath,
          "document",
        ),
      });
    }
    result.set("DOCUMENTS", items);
  }
  return result;
}

export async function getVacancies(locale: Locale) {
  return cached(cacheKeys.vacancies(locale), 300, () =>
    prisma.vacancy.findMany({
      where: {
        status: "OPEN",
        publishedAt: { not: null },
        closingDate: { gte: new Date() },
      },
      orderBy: { closingDate: "asc" },
      select: {
        id: true,
        department: true,
        location: true,
        employmentType: true,
        closingDate: true,
        translations: {
          where: { locale },
          select: {
            slug: true,
            title: true,
            summary: true,
            responsibilities: true,
            requirements: true,
          },
        },
      },
    }),
  );
}

export async function getVacancyBySlug(locale: Locale, slug: string) {
  return prisma.vacancy.findFirst({
    where: {
      status: "OPEN",
      publishedAt: { not: null },
      closingDate: { gte: new Date() },
      translations: { some: { locale, slug } },
    },
    select: {
      id: true,
      department: true,
      location: true,
      employmentType: true,
      closingDate: true,
      translations: {
        where: { locale },
        select: {
          slug: true,
          title: true,
          summary: true,
          responsibilities: true,
          requirements: true,
        },
      },
    },
  });
}

export async function getInvestorDocuments(locale: Locale) {
  return cached(cacheKeys.reports(locale), 300, () =>
    prisma.investorDocument.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: [{ year: "desc" }, { publishedAt: "desc" }],
      select: {
        id: true,
        storagePath: true,
        year: true,
        category: true,
        translations: {
          where: { locale },
          select: { title: true, description: true },
        },
      },
    }),
  );
}

export async function getOffices(locale: Locale) {
  return prisma.office.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      address: true,
      city: true,
      phone: true,
      email: true,
      latitude: true,
      longitude: true,
      hours: true,
      translations: {
        where: { locale },
        select: { name: true, addressLabel: true },
      },
    },
  });
}

export async function getDashboardStats() {
  const [messages, applications, vacancies, pages] = await prisma.$transaction([
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.careerApplication.count({ where: { status: "NEW" } }),
    prisma.vacancy.count({ where: { status: "OPEN" } }),
    prisma.page.count({ where: { status: "PUBLISHED" } }),
  ]);
  return {
    newMessages: messages,
    newApplications: applications,
    openVacancies: vacancies,
    publishedPages: pages,
  };
}

export type NavigationDto = {
  id: string;
  label: string;
  url: string;
  external: boolean;
  children: NavigationDto[];
};
export async function getNavigation(locale: Locale): Promise<NavigationDto[]> {
  return cached(cacheKeys.navigation(locale), 300, async () => {
    const items = await time(`navigation:${locale}`, () =>
      prisma.navigationItem.findMany({
        where: { location: "HEADER", visible: true, parentId: null },
        orderBy: { order: "asc" },
        select: {
          id: true,
          url: true,
          external: true,
          translations: { where: { locale }, select: { label: true } },
          children: {
            where: { visible: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              url: true,
              external: true,
              translations: { where: { locale }, select: { label: true } },
            },
          },
        },
      }),
    );
    return items.map((item) => ({
      id: item.id,
      label: item.translations[0]?.label ?? item.url,
      url: item.url,
      external: item.external,
      children: item.children.map((child) => ({
        id: child.id,
        label: child.translations[0]?.label ?? child.url,
        url: child.url,
        external: child.external,
        children: [],
      })),
    }));
  });
}

export type FooterGroupDto = {
  id: string;
  title: string;
  links: Array<{ id: string; label: string; url: string; external: boolean }>;
};
export async function getFooter(locale: Locale): Promise<FooterGroupDto[]> {
  return cached(cacheKeys.footer(locale), 300, async () => {
    const groups = await time(`footer:${locale}`, () =>
      prisma.footerGroup.findMany({
        where: { visible: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          translations: { where: { locale }, select: { title: true } },
          links: {
            where: { visible: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              url: true,
              external: true,
              translations: { where: { locale }, select: { label: true } },
            },
          },
        },
      }),
    );
    return groups.map((group) => ({
      id: group.id,
      title: group.translations[0]?.title ?? "",
      links: group.links.map((link) => ({
        id: link.id,
        label: link.translations[0]?.label ?? link.url,
        url: link.url,
        external: link.external,
      })),
    }));
  });
}

export type { CompanySettings };
export async function getCompanySettings(): Promise<CompanySettings> {
  return cached(cacheKeys.settings(), 300, async () => {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "company" },
      select: { value: true },
    });
    const value = setting?.value;
    if (!value || typeof value !== "object" || Array.isArray(value))
      return defaultCompanySettings;
    return {
      ...defaultCompanySettings,
      ...(value as Partial<CompanySettings>),
    };
  });
}
