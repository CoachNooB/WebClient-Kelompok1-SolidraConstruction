import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient, Locale, ContentStatus, VacancyStatus, EmploymentType, UserRole } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to seed the database");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

const pages = [
  ["home", "", "Beranda", "Home"],
  ["about", "about", "Tentang Solidra", "About Solidra"],
  ["investors", "investors", "Hubungan Investor", "Investor Relations"],
  ["contact", "contact", "Hubungi Kami", "Contact Us"],
  ["careers", "careers", "Karier", "Careers"],
] as const;

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@solidra.co.id";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 12) throw new Error("SEED_ADMIN_PASSWORD must contain at least 12 characters");

  const user = await prisma.user.upsert({
    where: { email },
    update: { active: true, role: UserRole.SUPER_ADMIN },
    create: { email, name: "Solidra Administrator", emailVerified: true, role: UserRole.SUPER_ADMIN },
  });
  await prisma.account.upsert({
    where: { providerId_accountId: { providerId: "credential", accountId: user.id } },
    update: { password: await hashPassword(password) },
    create: { providerId: "credential", accountId: user.id, userId: user.id, password: await hashPassword(password) },
  });

  for (const [key, slug, idTitle, enTitle] of pages) {
    await prisma.page.upsert({
      where: { key },
      update: {},
      create: {
        key, slug, status: ContentStatus.PUBLISHED, publishedAt: new Date(), publisherId: user.id,
        translations: { create: [
          { locale: Locale.ID, title: idTitle, description: `${idTitle} — Solidra Construction` },
          { locale: Locale.EN, title: enTitle, description: `${enTitle} — Solidra Construction` },
        ] },
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "company" }, update: {},
    create: { key: "company", value: { name: "Solidra Construction", email: "info@solidra.co.id", phone: "+62 21 555 0142", defaultLocale: "ID" } },
  });

  const vacancy = await prisma.vacancy.findFirst({ where: { translations: { some: { slug: "site-engineer" } } } });
  if (!vacancy) await prisma.vacancy.create({
    data: { department: "Operations", location: "Jakarta", employmentType: EmploymentType.FULL_TIME, closingDate: new Date("2026-12-31"), status: VacancyStatus.OPEN, publishedAt: new Date(), translations: { create: [
      { locale: Locale.ID, slug: "site-engineer", title: "Site Engineer", summary: "Mengelola pelaksanaan teknis proyek.", responsibilities: ["Koordinasi pelaksanaan", "Kontrol mutu"], requirements: ["Sarjana Teknik Sipil", "Pengalaman minimal 2 tahun"] },
      { locale: Locale.EN, slug: "site-engineer", title: "Site Engineer", summary: "Manage technical project delivery.", responsibilities: ["Coordinate delivery", "Control quality"], requirements: ["Civil Engineering degree", "At least 2 years experience"] },
    ] } },
  });
}

main().finally(() => prisma.$disconnect());
