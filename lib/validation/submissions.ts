import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+]+$/, "Phone can only contain numbers and +");

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^[0-9+]+$/.test(value),
    "Phone can only contain numbers and +",
  )
  .pipe(z.string().max(30));

export const contactSchema = z.object({
  locale: z.enum(["id", "en"]),
  idempotencyKey: z.uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: optionalPhoneSchema.optional(),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(5000),
  consent: z.literal(true),
  website: z.literal("").default(""),
});

const cvSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, "Maximum file size is 5 MB")
  .refine(
    (file) =>
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.type),
    "CV must be PDF, DOC, or DOCX",
  );

export const applicationMetadataSchema = z.object({
  locale: z.enum(["id", "en"]),
  idempotencyKey: z.uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: phoneSchema.pipe(z.string().min(8).max(30)),
  coverLetter: z.string().trim().min(20).max(5000),
  consent: z.literal(true),
});

export const applicationSchema = applicationMetadataSchema.extend({
  cv: cvSchema,
});
