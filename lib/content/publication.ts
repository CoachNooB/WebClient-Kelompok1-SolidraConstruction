export type DraftRevision = {
  immutable: boolean;
  translations: Array<{
    locale: "ID" | "EN";
    title: string;
    description: string;
  }>;
  sections: Array<{ translations?: Array<{ locale: "ID" | "EN" }> }>;
};

export function validateDraftRevision(revision: DraftRevision): void {
  if (revision.immutable) throw new Error("Published revisions are immutable");
  const locales = new Set(
    revision.translations
      .filter((item) => item.title.trim() && item.description.trim())
      .map((item) => item.locale),
  );
  if (!locales.has("ID") || !locales.has("EN"))
    throw new Error("A page requires both locales before publication");
  for (const section of revision.sections) {
    const sectionLocales = new Set(
      section.translations?.map((item) => item.locale),
    );
    if (!sectionLocales.has("ID") || !sectionLocales.has("EN"))
      throw new Error("Every section requires both locales");
  }
}
