import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+]+$/, "Phone can only contain numbers and +");

const optionalHttpUrl = z
  .union([
    z.literal(""),
    z.url().refine((value) => value.startsWith("https://"), "Use HTTPS"),
  ])
  .optional();
export const companySettingsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: phoneSchema.pipe(z.string().min(3).max(30)),
  defaultLocale: z.enum(["ID", "EN"]),
  descriptionId: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  socialLinks: z.object({
    linkedin: optionalHttpUrl,
    instagram: optionalHttpUrl,
    youtube: optionalHttpUrl,
  }),
  defaultSeo: z.object({
    title: z.string().min(2).max(70),
    description: z.string().min(10).max(160),
  }),
});
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
