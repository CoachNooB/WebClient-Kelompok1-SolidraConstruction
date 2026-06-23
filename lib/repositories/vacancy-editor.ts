import "server-only";
import { cacheKeys } from "@/lib/cache/keys";
import { invalidate } from "@/lib/cache/server";
import { prisma } from "@/lib/db";
import type { VacancyEditorInput } from "@/lib/validation/vacancy-editor";

export async function getVacancyEditor(id: string) {
  return prisma.vacancy.findUnique({
    where: { id },
    include: {
      translations: { orderBy: { locale: "asc" } },
      _count: { select: { applications: true } },
    },
  });
}

export async function updateVacancy(
  id: string,
  actorId: string,
  input: VacancyEditorInput,
) {
  await prisma.$transaction(async (tx) => {
    await tx.vacancy.update({
      where: { id },
      data: {
        department: input.department,
        location: input.location,
        employmentType: input.employmentType,
        closingDate: new Date(input.closingDate),
      },
    });
    for (const translation of input.translations) {
      await tx.vacancyTranslation.upsert({
        where: {
          vacancyId_locale: { vacancyId: id, locale: translation.locale },
        },
        create: { vacancyId: id, ...translation },
        update: {
          slug: translation.slug,
          title: translation.title,
          summary: translation.summary,
          responsibilities: translation.responsibilities,
          requirements: translation.requirements,
        },
      });
    }
    await tx.auditLog.create({
      data: {
        actorId,
        action: "VACANCY_UPDATED",
        entity: "Vacancy",
        entityId: id,
      },
    });
  });
  await invalidate([cacheKeys.vacancies("ID"), cacheKeys.vacancies("EN")]);
}
