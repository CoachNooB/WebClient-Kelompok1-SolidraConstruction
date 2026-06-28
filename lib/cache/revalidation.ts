export function publicPagePaths(pageKey: string): string[] {
  const slug = pageKey === "home" ? "" : `/${pageKey}`;
  return [`/id${slug}`, `/en${slug}`];
}

export function publicCareersPaths(): string[] {
  return publicPagePaths("careers");
}

export function publicInvestorPaths(): string[] {
  return publicPagePaths("investors");
}

export function publicManagedContentPaths(): string[] {
  return ["home", "about", "investors", "contact", "careers"].flatMap((key) =>
    publicPagePaths(key),
  );
}
