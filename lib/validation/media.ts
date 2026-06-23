import { z } from "zod";

const altText = z
  .string()
  .trim()
  .max(160)
  .refine((value) => !/<script/i.test(value), "Script tags are not allowed");

export const mediaAltTextSchema = z.object({
  altId: altText,
  altEn: altText,
});

export type MediaAltTextInput = z.infer<typeof mediaAltTextSchema>;
