import { describe, expect, it } from "vitest";
import { pageDraftSchema } from "@/lib/validation/page-editor";

const baseDraft = {
  translations: [
    {
      locale: "ID",
      title: "Tentang Solidra",
      description: "Profil perusahaan Solidra Construction.",
    },
    {
      locale: "EN",
      title: "About Solidra",
      description: "Solidra Construction company profile.",
    },
  ],
  sections: [
    {
      type: "CTA",
      order: 0,
      visible: true,
      translations: [
        {
          locale: "ID",
          heading: "Hubungi kami",
          body: "Mulai proyek bersama Solidra.",
          ctaLabel: "Kontak",
          ctaUrl: "/contact",
        },
        {
          locale: "EN",
          heading: "Contact us",
          body: "Start a project with Solidra.",
          ctaLabel: "Contact",
          ctaUrl: "/contact",
        },
      ],
    },
  ],
} as const;

describe("page editor validation", () => {
  it.each(["/projects", "https://example.com/report.pdf"])(
    "accepts safe CTA URL %s",
    (ctaUrl) => {
      expect(
        pageDraftSchema.safeParse({
          ...baseDraft,
          sections: [
            {
              ...baseDraft.sections[0],
              translations: baseDraft.sections[0].translations.map((item) => ({
                ...item,
                ctaUrl,
              })),
            },
          ],
        }).success,
      ).toBe(true);
    },
  );

  it.each(["//evil.example", "javascript:alert(1)", "data:text/html,test", "http://example.com"])(
    "rejects unsafe CTA URL %s",
    (ctaUrl) => {
      expect(
        pageDraftSchema.safeParse({
          ...baseDraft,
          sections: [
            {
              ...baseDraft.sections[0],
              translations: baseDraft.sections[0].translations.map((item) => ({
                ...item,
                ctaUrl,
              })),
            },
          ],
        }).success,
      ).toBe(false);
    },
  );
});
