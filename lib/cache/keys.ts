const PREFIX = process.env.REDIS_KEY_PREFIX ?? "solidra:v1";

export function cacheKey(
  namespace: string,
  ...parts: Array<string | number>
): string {
  return [PREFIX, namespace, ...parts]
    .map((part) => String(part).trim().toLowerCase())
    .join(":");
}

export const cacheKeys = {
  page: (locale: string, key: string) => cacheKey("page", locale, key),
  navigation: (locale: string) => cacheKey("navigation", locale),
  footer: (locale: string) => cacheKey("footer", locale),
  settings: () => cacheKey("settings"),
  vacancies: (locale: string) => cacheKey("vacancies", locale),
  reports: (locale: string) => cacheKey("reports", locale),
};
