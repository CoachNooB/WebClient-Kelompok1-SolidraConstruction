export function publicPagePaths(pageKey: string): string[] {
  const slug = pageKey === "home" ? "" : `/${pageKey}`;
  return [`/id${slug}`, `/en${slug}`];
}
