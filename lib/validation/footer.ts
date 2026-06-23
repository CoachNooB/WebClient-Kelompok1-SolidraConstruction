import { z } from "zod";

const internalUrl = /^\/(?!\/).*/;
const linkSchema = z
  .object({
    id: z.string().optional(),
    order: z.coerce.number().int().min(0).max(1000),
    url: z.string().trim().max(500),
    external: z.boolean(),
    visible: z.boolean(),
    labelId: z.string().trim().min(1).max(80),
    labelEn: z.string().trim().min(1).max(80),
  })
  .refine(
    (data) =>
      data.external
        ? data.url.startsWith("https://")
        : internalUrl.test(data.url),
    { path: ["url"], message: "Invalid link" },
  );

export const footerEditorSchema = z
  .object({
    visible: z.boolean(),
    order: z.coerce.number().int().min(0).max(1000),
    titleId: z.string().trim().min(1).max(80),
    titleEn: z.string().trim().min(1).max(80),
    links: z.array(linkSchema).max(12),
  })
  .refine(
    (data) =>
      new Set(data.links.map((link) => link.order)).size === data.links.length,
    { path: ["links"], message: "Link order must be unique" },
  );

export type FooterEditorInput = z.infer<typeof footerEditorSchema>;
