import { describe, expect, it } from "vitest";
import { validateDraftRevision } from "@/lib/content/publication";

describe("revision publication", () => {
  it("requires complete Indonesian and English translations", () => {
    expect(() =>
      validateDraftRevision({
        immutable: false,
        translations: [
          { locale: "ID", title: "Beranda", description: "Deskripsi" },
        ],
        sections: [],
      }),
    ).toThrow("both locales");
  });

  it("accepts a mutable bilingual draft", () => {
    expect(() =>
      validateDraftRevision({
        immutable: false,
        translations: [
          { locale: "ID", title: "Beranda", description: "Deskripsi" },
          { locale: "EN", title: "Home", description: "Description" },
        ],
        sections: [],
      }),
    ).not.toThrow();
  });

  it("rejects editing an immutable revision", () => {
    expect(() =>
      validateDraftRevision({
        immutable: true,
        translations: [],
        sections: [],
      }),
    ).toThrow("immutable");
  });
});
