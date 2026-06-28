// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Contact from "@/app/[locale]/contact/page";

const mocks = vi.hoisted(() => ({
  getPublishedPage: vi.fn(),
  getOffices: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not-found");
  },
}));

vi.mock("@/components/forms/contact-form", () => ({
  ContactForm: () => <form aria-label="Contact form" />,
}));

vi.mock("@/lib/repositories/public-content", () => ({
  getPublishedPage: mocks.getPublishedPage,
  getOffices: mocks.getOffices,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Contact page", () => {
  it("renders CMS office section cards", async () => {
    mocks.getPublishedPage.mockResolvedValue({
      key: "contact",
      slug: "contact",
      title: "Contact",
      description: "Reach us",
      seoTitle: null,
      seoDescription: null,
      sections: [
        {
          id: "hero",
          type: "HERO",
          order: 0,
          config: null,
          heading: "Contact",
          body: "Reach us",
          ctaLabel: null,
          ctaUrl: null,
        },
        {
          id: "offices",
          type: "OFFICES",
          order: 1,
          config: null,
          heading: "Our offices",
          body: null,
          ctaLabel: null,
          ctaUrl: null,
          items: [
            {
              title: "Solidra Bandung Office",
              description: "Bandung branch",
            },
          ],
        },
      ],
    });
    mocks.getOffices.mockResolvedValue([]);

    render(await Contact({ params: Promise.resolve({ locale: "en" }) }));

    expect(screen.getByText("Our offices")).toBeTruthy();
    expect(screen.getByText("Solidra Bandung Office")).toBeTruthy();
  });
});
