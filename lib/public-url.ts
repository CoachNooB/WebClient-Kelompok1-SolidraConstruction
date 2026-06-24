import { isSafeCmsUrl } from "@/lib/validation/url";

export function localizedHref(locale: "id" | "en", url: string): string {
  if (!isSafeCmsUrl(url)) return `/${locale}`;

  return url.startsWith("/") ? `/${locale}${url}` : url;
}
