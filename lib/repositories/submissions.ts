import "server-only";
import type { Locale } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export async function createContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  locale: Locale;
  idempotencyKey: string;
}) {
  const record = await prisma.contactMessage.create({
    data: input,
    select: { id: true, createdAt: true },
  });
  return record;
}

export async function createCareerApplication(input: {
  vacancyId: string;
  name: string;
  email: string;
  phone: string;
  coverLetter: string;
  cvStoragePath: string;
  idempotencyKey: string;
}) {
  return prisma.careerApplication.create({
    data: input,
    select: { id: true, createdAt: true },
  });
}

export async function getEligibleVacancy(id: string) {
  return prisma.vacancy.findFirst({
    where: {
      id,
      status: "OPEN",
      publishedAt: { not: null },
      closingDate: { gte: new Date() },
    },
    select: { id: true, status: true, closingDate: true },
  });
}
