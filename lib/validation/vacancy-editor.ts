import { z } from "zod";

const translationSchema = z.object({
  locale: z.enum(["ID", "EN"]),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(10).max(500),
  responsibilities: z.array(z.string().trim().min(3).max(200)).min(1).max(20),
  requirements: z.array(z.string().trim().min(3).max(200)).min(1).max(20),
});

export const vacancyEditorSchema = z
  .object({
    department: z.string().trim().min(2).max(100),
    location: z.string().trim().min(2).max(100),
    employmentType: z.enum([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "INTERNSHIP",
    ]),
    closingDate: z
      .string()
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Invalid closing date",
      ),
    translations: z.array(translationSchema).length(2),
  })
  .refine(
    (data) => {
      const locales = data.translations.map(
        (translation) => translation.locale,
      );
      return (
        locales.includes("ID") &&
        locales.includes("EN") &&
        new Set(locales).size === 2
      );
    },
    {
      path: ["translations"],
      message: "Exactly one ID and one EN translation is required",
    },
  );

export type VacancyEditorInput = z.infer<typeof vacancyEditorSchema>;
