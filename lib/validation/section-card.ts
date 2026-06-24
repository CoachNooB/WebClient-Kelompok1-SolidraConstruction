import { z } from "zod";
import { safeCmsUrlSchema } from "@/lib/validation/url";

export const managedCardSectionTypes = [
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

export const sectionCardMetadataSchema = z.object({
  sectionType: z.enum(managedCardSectionTypes),
  order: z.coerce.number().int().min(0).default(0),
  value: z.string().trim().max(80).optional(),
  url: safeCmsUrlSchema.optional(),
  titleId: z.string().trim().min(2).max(120),
  titleEn: z.string().trim().min(2).max(120),
  descriptionId: z.string().trim().max(500).optional(),
  descriptionEn: z.string().trim().max(500).optional(),
  altId: z.string().trim().max(160).optional(),
  altEn: z.string().trim().max(160).optional(),
});

export const sectionCardStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});
