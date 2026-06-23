import { z } from "zod";

const internalUrl = /^\/(?!\/).*/;
const uuid = z.uuid();

export const navigationEditorSchema = z.object({
  location: z.enum(["HEADER", "FOOTER"]),
  url: z.string().trim().max(500),
  external: z.boolean(),
  visible: z.boolean(),
  order: z.coerce.number().int().min(0).max(1000),
  parentId: z.preprocess((value) => value === "" ? null : value, z.union([uuid, z.null()]).optional()).transform((value) => value ?? null),
  labelId: z.string().trim().min(1).max(80),
  labelEn: z.string().trim().min(1).max(80),
}).refine((data) => data.external ? data.url.startsWith("https://") : internalUrl.test(data.url), { path: ["url"], message: "Invalid link" });

export type NavigationInput = z.infer<typeof navigationEditorSchema>;
