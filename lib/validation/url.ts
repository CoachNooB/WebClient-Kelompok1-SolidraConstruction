import { z } from "zod";

const internalPath = /^\/(?!\/)[^\s]*$/;

export function isSafeCmsUrl(value: string): boolean {
  const trimmed = value.trim();
  if (internalPath.test(trimmed)) return true;

  try {
    return new URL(trimmed).protocol === "https:";
  } catch {
    return false;
  }
}

export const safeCmsUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === "" || isSafeCmsUrl(value), {
    message: "Use an internal path or HTTPS URL",
  });
