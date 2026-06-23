import { z } from "zod";

export const investorDocumentMetadataSchema = z.object({
  year: z.coerce.number().int().min(1990).max(2100),
  category: z.string().trim().min(2).max(80),
  titleId: z.string().trim().min(2).max(200),
  titleEn: z.string().trim().min(2).max(200),
  descriptionId: z.string().trim().max(1000).optional(),
  descriptionEn: z.string().trim().max(1000).optional(),
});

export const investorDocumentReplaceSchema = z
  .object({
    file: z.instanceof(File),
  })
  .refine((data) => data.file.type === "application/pdf", {
    path: ["file"],
    message: "PDF file required",
  });
