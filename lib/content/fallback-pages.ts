import type { Locale } from "@/generated/prisma/client";

type SectionSeed = {
  type: string;
  idHeading: string;
  enHeading: string;
  idBody: string;
  enBody: string;
  config?: object;
  idCta?: string;
  enCta?: string;
  url?: string;
};

export type FallbackSectionDto = {
  id: string;
  type: string;
  order: number;
  config: unknown;
  heading: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

export type FallbackPageDto = {
  key: string;
  slug: string;
  title: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: FallbackSectionDto[];
};

const pages = {
  home: { slug: "", idTitle: "Beranda", enTitle: "Home" },
  about: {
    slug: "about",
    idTitle: "Tentang Solidra",
    enTitle: "About Solidra",
  },
  investors: {
    slug: "investors",
    idTitle: "Hubungan Investor",
    enTitle: "Investor Relations",
  },
  contact: { slug: "contact", idTitle: "Hubungi Kami", enTitle: "Contact Us" },
  careers: { slug: "careers", idTitle: "Karier", enTitle: "Careers" },
} as const;

const sections: Record<keyof typeof pages, SectionSeed[]> = {
  home: [
    {
      type: "HERO",
      idHeading: "Konstruksi andal untuk masa depan berkelanjutan",
      enHeading: "Reliable construction for a sustainable future",
      idBody: "Solusi konstruksi terpadu dengan standar keselamatan tinggi.",
      enBody: "Integrated construction with uncompromising safety and quality.",
    },
    {
      type: "METRICS",
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
      type: "SERVICES",
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
      type: "PROJECTS",
      idHeading: "Proyek pilihan",
      enHeading: "Selected projects",
      idBody: "Karya yang memberikan dampak nyata.",
      enBody: "Work that creates lasting impact.",
    },
    {
      type: "RICH_TEXT",
      idHeading: "Keselamatan tanpa kompromi",
      enHeading: "Safety without compromise",
      idBody: "Setiap orang berhak pulang dengan selamat.",
      enBody: "Everyone deserves to return home safely.",
    },
    {
      type: "FINANCIALS",
      idHeading: "Sorotan investor",
      enHeading: "Investor highlight",
      idBody: "Pertumbuhan disiplin dan nilai jangka panjang.",
      enBody: "Disciplined growth and long-term value.",
      idCta: "Informasi investor",
      enCta: "Investor information",
      url: "/investors",
    },
    {
      type: "CTA",
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
      type: "HERO",
      idHeading: "Membangun kepercayaan sejak 1998",
      enHeading: "Building trust since 1998",
      idBody: "Pengalaman, teknologi, dan tata kelola kuat.",
      enBody: "Experience, technology, and strong governance.",
    },
    {
      type: "RICH_TEXT",
      idHeading: "Visi",
      enHeading: "Vision",
      idBody: "Menjadi mitra konstruksi paling tepercaya di Indonesia.",
      enBody: "To be Indonesia's most trusted construction partner.",
    },
    {
      type: "RICH_TEXT",
      idHeading: "Misi",
      enHeading: "Mission",
      idBody: "Menghasilkan karya aman, berkualitas, dan berkelanjutan.",
      enBody: "Deliver safe, high-quality, sustainable work.",
    },
    {
      type: "TIMELINE",
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
      type: "VALUES",
      idHeading: "Nilai kami",
      enHeading: "Our values",
      idBody: "Integritas, keselamatan, dan keunggulan.",
      enBody: "Integrity, safety, and excellence.",
    },
    {
      type: "LEADERSHIP",
      idHeading: "Kepemimpinan",
      enHeading: "Leadership",
      idBody: "Pemimpin berpengalaman dengan akuntabilitas kuat.",
      enBody: "Experienced leaders with clear accountability.",
    },
    {
      type: "CERTIFICATIONS",
      idHeading: "Sertifikasi",
      enHeading: "Certifications",
      idBody: "Standar internasional untuk mutu dan keselamatan.",
      enBody: "International quality and safety standards.",
    },
    {
      type: "CTA",
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
      type: "HERO",
      idHeading: "Pertumbuhan disiplin. Nilai jangka panjang.",
      enHeading: "Disciplined growth. Long-term value.",
      idBody: "Informasi kinerja dan arah strategis Solidra.",
      enBody: "Solidra performance and strategic information.",
    },
    {
      type: "FINANCIALS",
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
      type: "DOCUMENTS",
      idHeading: "Laporan dan dokumen",
      enHeading: "Reports and documents",
      idBody: "Unduh publikasi resmi Solidra.",
      enBody: "Download official Solidra publications.",
    },
    {
      type: "GOVERNANCE",
      idHeading: "Tata kelola",
      enHeading: "Governance",
      idBody: "Transparansi dan akuntabilitas dalam setiap keputusan.",
      enBody: "Transparency and accountability in every decision.",
    },
    {
      type: "RICH_TEXT",
      idHeading: "Kontak investor",
      enHeading: "Investor contact",
      idBody: "investors@solidra.co.id",
      enBody: "investors@solidra.co.id",
    },
  ],
  contact: [
    {
      type: "HERO",
      idHeading: "Mari membangun sesuatu yang berarti",
      enHeading: "Let's build something meaningful",
      idBody: "Diskusikan proyek dan kemitraan bersama kami.",
      enBody: "Discuss projects and partnerships with us.",
    },
    {
      type: "OFFICES",
      idHeading: "Kantor kami",
      enHeading: "Our offices",
      idBody: "Senin–Jumat, 08.00–17.00 WIB.",
      enBody: "Monday–Friday, 08:00–17:00 WIB.",
    },
    {
      type: "CONTACT_FORM",
      idHeading: "Kirim pesan",
      enHeading: "Send a message",
      idBody: "Kami akan segera menanggapi.",
      enBody: "We will respond shortly.",
    },
  ],
  careers: [
    {
      type: "HERO",
      idHeading: "Bangun karier. Bentuk masa depan.",
      enHeading: "Build your career. Shape the future.",
      idBody: "Berkarya bersama talenta terbaik.",
      enBody: "Work alongside exceptional people.",
    },
    {
      type: "RICH_TEXT",
      idHeading: "Tumbuh bersama Solidra",
      enHeading: "Grow with Solidra",
      idBody:
        "Pekerjaan bermakna, pembelajaran berkelanjutan, dan budaya keselamatan.",
      enBody:
        "Meaningful work, continuous learning, and a safety-first culture.",
    },
    {
      type: "BENEFITS",
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
      type: "PROCESS",
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
      type: "VACANCIES",
      idHeading: "Posisi tersedia",
      enHeading: "Open positions",
      idBody: "Temukan peran yang tepat.",
      enBody: "Find the right role.",
    },
  ],
};

export function getFallbackPage(
  key: string,
  locale: Locale,
): FallbackPageDto | null {
  if (!(key in pages)) return null;
  const page = pages[key as keyof typeof pages];
  const title = locale === "ID" ? page.idTitle : page.enTitle;
  return {
    key,
    slug: page.slug,
    title,
    description: `${title} — Solidra Construction`,
    seoTitle: title,
    seoDescription: `${title} — Solidra Construction`,
    sections: sections[key as keyof typeof pages].map((section, order) => ({
      id: `fallback-${key}-${order}`,
      type: section.type,
      order,
      config: section.config ?? {},
      heading: locale === "ID" ? section.idHeading : section.enHeading,
      body: locale === "ID" ? section.idBody : section.enBody,
      ctaLabel:
        locale === "ID" ? (section.idCta ?? null) : (section.enCta ?? null),
      ctaUrl: section.url ?? null,
    })),
  };
}
