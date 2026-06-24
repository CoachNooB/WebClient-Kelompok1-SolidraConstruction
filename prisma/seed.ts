import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import {
  PrismaClient,
  Locale,
  ContentStatus,
  VacancyStatus,
  EmploymentType,
  UserRole,
  SectionType,
} from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL is required to seed the database");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const pages = [
  ["home", "", "Beranda", "Home"],
  ["about", "about", "Tentang Solidra", "About Solidra"],
  ["investors", "investors", "Hubungan Investor", "Investor Relations"],
  ["contact", "contact", "Hubungi Kami", "Contact Us"],
  ["careers", "careers", "Karier", "Careers"],
] as const;

const sectionSeeds: Record<
  string,
  Array<{
    type: SectionType;
    idHeading: string;
    enHeading: string;
    idBody: string;
    enBody: string;
    config?: object;
    idCta?: string;
    enCta?: string;
    url?: string;
  }>
> = {
  home: [
    {
      type: SectionType.HERO,
      idHeading: "Konstruksi andal untuk masa depan berkelanjutan",
      enHeading: "Reliable construction for a sustainable future",
      idBody: "Solusi konstruksi terpadu dengan standar keselamatan tinggi.",
      enBody: "Integrated construction with uncompromising safety and quality.",
    },
    {
      type: SectionType.METRICS,
      idHeading: "Solidra dalam angka",
      enHeading: "Solidra at a glance",
      idBody: "Rekam jejak yang terus bertumbuh.",
      enBody: "A track record that keeps growing.",
      config: {
        items: [
          { value: "25+", title: "Years" },
          { value: "180+", title: "Projects" },
          { value: "4.8M", title: "Safe hours" },
        ],
      },
    },
    {
      type: SectionType.SERVICES,
      idHeading: "Keahlian kami",
      enHeading: "Our expertise",
      idBody: "Layanan dari konsep hingga penyelesaian.",
      enBody: "Services from concept through completion.",
      config: {
        items: [
          { title: "General Construction" },
          { title: "Design & Build" },
          { title: "Infrastructure" },
        ],
      },
    },
    {
      type: SectionType.PROJECTS,
      idHeading: "Proyek pilihan",
      enHeading: "Selected projects",
      idBody: "Karya yang memberikan dampak nyata.",
      enBody: "Work that creates lasting impact.",
    },
    {
      type: SectionType.RICH_TEXT,
      idHeading: "Keselamatan tanpa kompromi",
      enHeading: "Safety without compromise",
      idBody: "Setiap orang berhak pulang dengan selamat.",
      enBody: "Everyone deserves to return home safely.",
    },
    {
      type: SectionType.FINANCIALS,
      idHeading: "Sorotan investor",
      enHeading: "Investor highlight",
      idBody: "Pertumbuhan disiplin dan nilai jangka panjang.",
      enBody: "Disciplined growth and long-term value.",
      idCta: "Informasi investor",
      enCta: "Investor information",
      url: "/investors",
    },
    {
      type: SectionType.CTA,
      idHeading: "Bangun karier bersama Solidra",
      enHeading: "Build your career with Solidra",
      idBody: "Bergabung dengan tim kami.",
      enBody: "Join our team.",
      idCta: "Lihat karier",
      enCta: "View careers",
      url: "/careers",
    },
  ],
  about: [
    {
      type: SectionType.HERO,
      idHeading: "Membangun kepercayaan sejak 1998",
      enHeading: "Building trust since 1998",
      idBody: "Pengalaman, teknologi, dan tata kelola kuat.",
      enBody: "Experience, technology, and strong governance.",
    },
    {
      type: SectionType.RICH_TEXT,
      idHeading: "Visi",
      enHeading: "Vision",
      idBody: "Menjadi mitra konstruksi paling tepercaya di Indonesia.",
      enBody: "To be Indonesia's most trusted construction partner.",
    },
    {
      type: SectionType.RICH_TEXT,
      idHeading: "Misi",
      enHeading: "Mission",
      idBody: "Menghasilkan karya aman, berkualitas, dan berkelanjutan.",
      enBody: "Deliver safe, high-quality, sustainable work.",
    },
    {
      type: SectionType.TIMELINE,
      idHeading: "Perjalanan kami",
      enHeading: "Our journey",
      idBody: "Tonggak pertumbuhan Solidra.",
      enBody: "Solidra growth milestones.",
      config: {
        items: [
          { value: "1998", title: "Founded" },
          { value: "2018", title: "ISO certified" },
          { value: "2025", title: "180 projects" },
        ],
      },
    },
    {
      type: SectionType.VALUES,
      idHeading: "Nilai kami",
      enHeading: "Our values",
      idBody: "Integritas, keselamatan, dan keunggulan.",
      enBody: "Integrity, safety, and excellence.",
    },
    {
      type: SectionType.LEADERSHIP,
      idHeading: "Kepemimpinan",
      enHeading: "Leadership",
      idBody: "Pemimpin berpengalaman dengan akuntabilitas kuat.",
      enBody: "Experienced leaders with clear accountability.",
    },
    {
      type: SectionType.CERTIFICATIONS,
      idHeading: "Sertifikasi",
      enHeading: "Certifications",
      idBody: "Standar internasional untuk mutu dan keselamatan.",
      enBody: "International quality and safety standards.",
    },
    {
      type: SectionType.CTA,
      idHeading: "Mari bekerja bersama",
      enHeading: "Let's work together",
      idBody: "Diskusikan proyek Anda.",
      enBody: "Discuss your project.",
      idCta: "Hubungi kami",
      enCta: "Contact us",
      url: "/contact",
    },
  ],
  investors: [
    {
      type: SectionType.HERO,
      idHeading: "Pertumbuhan disiplin. Nilai jangka panjang.",
      enHeading: "Disciplined growth. Long-term value.",
      idBody: "Informasi kinerja dan arah strategis Solidra.",
      enBody: "Solidra performance and strategic information.",
    },
    {
      type: SectionType.FINANCIALS,
      idHeading: "Sorotan keuangan",
      enHeading: "Financial highlights",
      idBody: "Kinerja utama perusahaan.",
      enBody: "Key company performance.",
      config: {
        items: [
          { value: "Rp 2.4T", title: "Revenue" },
          { value: "18.2%", title: "Growth" },
          { value: "Rp 4.1T", title: "Order book" },
        ],
      },
    },
    {
      type: SectionType.DOCUMENTS,
      idHeading: "Laporan dan dokumen",
      enHeading: "Reports and documents",
      idBody: "Unduh publikasi resmi Solidra.",
      enBody: "Download official Solidra publications.",
    },
    {
      type: SectionType.GOVERNANCE,
      idHeading: "Tata kelola",
      enHeading: "Governance",
      idBody: "Transparansi dan akuntabilitas dalam setiap keputusan.",
      enBody: "Transparency and accountability in every decision.",
    },
    {
      type: SectionType.RICH_TEXT,
      idHeading: "Kontak investor",
      enHeading: "Investor contact",
      idBody: "investors@solidra.co.id",
      enBody: "investors@solidra.co.id",
    },
  ],
  contact: [
    {
      type: SectionType.HERO,
      idHeading: "Mari membangun sesuatu yang berarti",
      enHeading: "Let's build something meaningful",
      idBody: "Diskusikan proyek dan kemitraan bersama kami.",
      enBody: "Discuss projects and partnerships with us.",
    },
    {
      type: SectionType.OFFICES,
      idHeading: "Kantor kami",
      enHeading: "Our offices",
      idBody: "Senin–Jumat, 08.00–17.00 WIB.",
      enBody: "Monday–Friday, 08:00–17:00 WIB.",
    },
    {
      type: SectionType.CONTACT_FORM,
      idHeading: "Kirim pesan",
      enHeading: "Send a message",
      idBody: "Kami akan segera menanggapi.",
      enBody: "We will respond shortly.",
    },
  ],
  careers: [
    {
      type: SectionType.HERO,
      idHeading: "Bangun karier. Bentuk masa depan.",
      enHeading: "Build your career. Shape the future.",
      idBody: "Berkarya bersama talenta terbaik.",
      enBody: "Work alongside exceptional people.",
    },
    {
      type: SectionType.RICH_TEXT,
      idHeading: "Tumbuh bersama Solidra",
      enHeading: "Grow with Solidra",
      idBody:
        "Pekerjaan bermakna, pembelajaran berkelanjutan, dan budaya keselamatan.",
      enBody:
        "Meaningful work, continuous learning, and a safety-first culture.",
    },
    {
      type: SectionType.BENEFITS,
      idHeading: "Benefit",
      enHeading: "Benefits",
      idBody: "Dukungan menyeluruh untuk tim kami.",
      enBody: "Comprehensive support for our people.",
      config: {
        items: [
          { title: "Health" },
          { title: "Learning" },
          { title: "Wellbeing" },
        ],
      },
    },
    {
      type: SectionType.PROCESS,
      idHeading: "Proses rekrutmen",
      enHeading: "Hiring process",
      idBody: "Seleksi transparan dalam empat tahap.",
      enBody: "A transparent four-stage selection process.",
      config: {
        items: [
          { title: "Apply" },
          { title: "Interview" },
          { title: "Assessment" },
          { title: "Offer" },
        ],
      },
    },
    {
      type: SectionType.VACANCIES,
      idHeading: "Posisi tersedia",
      enHeading: "Open positions",
      idBody: "Temukan peran yang tepat.",
      enBody: "Find the right role.",
    },
  ],
};

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@solidra.co.id";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 6)
    throw new Error("SEED_ADMIN_PASSWORD must contain at least 6 characters");

  const user = await prisma.user.upsert({
    where: { email },
    update: { active: true, role: UserRole.SUPER_ADMIN },
    create: {
      email,
      name: "Solidra Administrator",
      emailVerified: true,
      role: UserRole.SUPER_ADMIN,
    },
  });
  await prisma.account.upsert({
    where: {
      providerId_accountId: { providerId: "credential", accountId: user.id },
    },
    update: { password: await hashPassword(password) },
    create: {
      providerId: "credential",
      accountId: user.id,
      userId: user.id,
      password: await hashPassword(password),
    },
  });

  for (const [key, slug, idTitle, enTitle] of pages) {
    const page = await prisma.page.upsert({
      where: { key },
      update: {},
      create: {
        key,
        slug,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        publisherId: user.id,
        translations: {
          create: [
            {
              locale: Locale.ID,
              title: idTitle,
              description: `${idTitle} — Solidra Construction`,
            },
            {
              locale: Locale.EN,
              title: enTitle,
              description: `${enTitle} — Solidra Construction`,
            },
          ],
        },
      },
    });
    if (!page.publishedRevisionId) {
      const revision = await prisma.pageRevision.create({
        data: {
          pageId: page.id,
          version: 1,
          immutable: true,
          authorId: user.id,
          publisherId: user.id,
          publishedAt: new Date(),
          translations: {
            create: [
              {
                locale: Locale.ID,
                title: idTitle,
                description: `${idTitle} — Solidra Construction`,
                seoTitle: idTitle,
              },
              {
                locale: Locale.EN,
                title: enTitle,
                description: `${enTitle} — Solidra Construction`,
                seoTitle: enTitle,
              },
            ],
          },
          sections: {
            create: sectionSeeds[key].map((section, order) => ({
              type: section.type,
              order,
              visible: true,
              config: section.config,
              translations: {
                create: [
                  {
                    locale: Locale.ID,
                    heading: section.idHeading,
                    body: section.idBody,
                    ctaLabel: section.idCta,
                    ctaUrl: section.url,
                  },
                  {
                    locale: Locale.EN,
                    heading: section.enHeading,
                    body: section.enBody,
                    ctaLabel: section.enCta,
                    ctaUrl: section.url,
                  },
                ],
              },
            })),
          },
        },
      });
      await prisma.page.update({
        where: { id: page.id },
        data: { publishedRevisionId: revision.id },
      });
    }
  }

  await prisma.siteSetting.upsert({
    where: { key: "company" },
    update: {},
    create: {
      key: "company",
      value: {
        name: "Solidra Construction",
        email: "info@solidra.co.id",
        phone: "+62215550142",
        defaultLocale: "ID",
      },
    },
  });

  if ((await prisma.navigationItem.count()) === 0) {
    const navigation = [
      ["/", "Beranda", "Home"],
      ["/about", "Tentang", "About"],
      ["/investors", "Investor", "Investors"],
      ["/careers", "Karier", "Careers"],
      ["/contact", "Kontak", "Contact"],
    ] as const;
    for (const [order, [url, idLabel, enLabel]] of navigation.entries())
      await prisma.navigationItem.create({
        data: {
          location: "HEADER",
          order,
          url,
          translations: {
            create: [
              { locale: Locale.ID, label: idLabel },
              { locale: Locale.EN, label: enLabel },
            ],
          },
        },
      });
  }

  if ((await prisma.footerGroup.count()) === 0) {
    await prisma.footerGroup.create({
      data: {
        order: 0,
        translations: {
          create: [
            { locale: Locale.ID, title: "Perusahaan" },
            { locale: Locale.EN, title: "Company" },
          ],
        },
        links: {
          create: [
            {
              order: 0,
              url: "/about",
              translations: {
                create: [
                  { locale: Locale.ID, label: "Tentang" },
                  { locale: Locale.EN, label: "About" },
                ],
              },
            },
            {
              order: 1,
              url: "/investors",
              translations: {
                create: [
                  { locale: Locale.ID, label: "Investor" },
                  { locale: Locale.EN, label: "Investors" },
                ],
              },
            },
            {
              order: 2,
              url: "/careers",
              translations: {
                create: [
                  { locale: Locale.ID, label: "Karier" },
                  { locale: Locale.EN, label: "Careers" },
                ],
              },
            },
          ],
        },
      },
    });
  }

  await prisma.office.upsert({
    where: { key: "head-office" },
    update: {},
    create: {
      key: "head-office",
      address: "Solidra Tower, Jl. Jenderal Sudirman Kav. 48",
      city: "Jakarta 12930, Indonesia",
      phone: "+62215550142",
      email: "info@solidra.co.id",
      hours: { weekdays: "08:00-17:00 WIB" },
      translations: {
        create: [
          { locale: Locale.ID, name: "Kantor Pusat", addressLabel: "Jakarta" },
          { locale: Locale.EN, name: "Head Office", addressLabel: "Jakarta" },
        ],
      },
    },
  });

  const vacancy = await prisma.vacancy.findFirst({
    where: { translations: { some: { slug: "site-engineer" } } },
  });
  if (!vacancy)
    await prisma.vacancy.create({
      data: {
        department: "Operations",
        location: "Jakarta",
        employmentType: EmploymentType.FULL_TIME,
        closingDate: new Date("2026-12-31"),
        status: VacancyStatus.OPEN,
        publishedAt: new Date(),
        translations: {
          create: [
            {
              locale: Locale.ID,
              slug: "site-engineer",
              title: "Site Engineer",
              summary: "Mengelola pelaksanaan teknis proyek.",
              responsibilities: ["Koordinasi pelaksanaan", "Kontrol mutu"],
              requirements: [
                "Sarjana Teknik Sipil",
                "Pengalaman minimal 2 tahun",
              ],
            },
            {
              locale: Locale.EN,
              slug: "site-engineer",
              title: "Site Engineer",
              summary: "Manage technical project delivery.",
              responsibilities: ["Coordinate delivery", "Control quality"],
              requirements: [
                "Civil Engineering degree",
                "At least 2 years experience",
              ],
            },
          ],
        },
      },
    });
}

main().finally(() => prisma.$disconnect());
