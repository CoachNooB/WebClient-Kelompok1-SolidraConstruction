// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SectionRenderer } from "@/components/public/section-renderer";

afterEach(() => cleanup());

describe("SectionRenderer", () => {
  it("renders managed card items before legacy section config", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "services",
          type: "SERVICES",
          order: 0,
          heading: "Services",
          body: null,
          ctaLabel: null,
          ctaUrl: null,
          config: { items: [{ title: "Legacy service" }] },
          items: [{ title: "Managed service", description: "From CMS form" }],
        }}
      />,
    );

    expect(screen.getByText("Managed service")).toBeTruthy();
    expect(screen.queryByText("Legacy service")).toBeNull();
  });

  it("renders managed investor documents as signed links", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "documents",
          type: "DOCUMENTS",
          order: 0,
          heading: "Reports",
          body: null,
          ctaLabel: null,
          ctaUrl: null,
          config: null,
          items: [
            {
              title: "Annual Report 2025",
              value: "2025",
              description: "Audited annual report",
              url: "https://example.supabase.co/storage/v1/object/sign/solidra-documents/reports/annual-2025.pdf?token=signed",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Annual Report 2025")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Learn more" }).getAttribute("href"),
    ).toBe(
      "https://example.supabase.co/storage/v1/object/sign/solidra-documents/reports/annual-2025.pdf?token=signed",
    );
  });

  it("can render private signed document links", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "documents",
          type: "DOCUMENTS",
          order: 0,
          heading: "Reports",
          body: null,
          ctaLabel: null,
          ctaUrl: null,
          config: null,
          items: [
            {
              title: "Annual Report 2025",
              url: "https://example.supabase.co/storage/v1/object/sign/solidra-documents/documents/2026/file.pdf?token=signed",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Learn more" }).getAttribute("href"),
    ).toContain("/storage/v1/object/sign/solidra-documents/");
  });

  it("renders card images from section config", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "leadership",
          type: "LEADERSHIP",
          order: 0,
          heading: "Board of Directors",
          body: "Experienced leaders.",
          ctaLabel: null,
          ctaUrl: null,
          config: {
            items: [
              {
                title: "Jane Santoso",
                description: "President Director",
                image: "https://example.com/jane.jpg",
              },
            ],
          },
        }}
      />,
    );

    const image = screen.getByRole("img", {
      name: "Jane Santoso",
    }) as HTMLImageElement;
    expect(image.src).toBe("https://example.com/jane.jpg");
  });

  it("shows director initials when no image is configured", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "leadership",
          type: "LEADERSHIP",
          order: 0,
          heading: "Board of Directors",
          body: "Experienced leaders.",
          ctaLabel: null,
          ctaUrl: null,
          config: {
            items: [
              { title: "Jane Santoso", description: "President Director" },
            ],
          },
        }}
      />,
    );

    expect(
      screen.getByLabelText("Jane Santoso photo placeholder").textContent,
    ).toBe("JS");
  });

  it("falls back to director initials when an image fails to load", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "leadership",
          type: "LEADERSHIP",
          order: 0,
          heading: "Board of Directors",
          body: "Experienced leaders.",
          ctaLabel: null,
          ctaUrl: null,
          config: {
            items: [
              {
                title: "Jane Santoso",
                description: "President Director",
                image: "https://example.com/missing.jpg",
              },
            ],
          },
        }}
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Jane Santoso" }));

    expect(
      screen.getByLabelText("Jane Santoso photo placeholder").textContent,
    ).toBe("JS");
  });

  it("keeps leadership as a grid when there are three directors", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "leadership",
          type: "LEADERSHIP",
          order: 0,
          heading: "Board of Directors",
          body: "Experienced leaders.",
          ctaLabel: null,
          ctaUrl: null,
          config: {
            items: ["Ari", "Bima", "Citra"].map((name) => ({
              title: name,
              description: "Director",
            })),
          },
        }}
      />,
    );

    expect(screen.queryByLabelText("Previous directors")).toBeNull();
    expect(screen.queryByLabelText("Next directors")).toBeNull();
  });

  it("uses a carousel when leadership has more than three directors", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "leadership",
          type: "LEADERSHIP",
          order: 0,
          heading: "Board of Directors",
          body: "Experienced leaders.",
          ctaLabel: null,
          ctaUrl: null,
          config: {
            items: ["Ari", "Bima", "Citra", "Dewi"].map((name) => ({
              title: name,
              description: "Director",
            })),
          },
        }}
      />,
    );

    expect(screen.getByText("Ari")).toBeTruthy();
    expect(screen.queryByText("Dewi")).toBeNull();

    fireEvent.click(screen.getByLabelText("Next directors"));

    expect(screen.queryByText("Ari")).toBeNull();
    expect(screen.getByText("Dewi")).toBeTruthy();
  });

  it("does not show image placeholders for non-leadership cards without images", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "services",
          type: "SERVICES",
          order: 0,
          heading: "Services",
          body: null,
          ctaLabel: null,
          ctaUrl: null,
          config: { items: [{ title: "Construction", description: "Build" }] },
        }}
      />,
    );

    expect(
      screen.queryByLabelText("Construction photo placeholder"),
    ).toBeNull();
  });

  it("prefixes internal CTA paths with locale", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "cta",
          type: "CTA",
          order: 0,
          heading: "Start a project",
          body: null,
          ctaLabel: "Contact",
          ctaUrl: "/contact",
          config: null,
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Contact" }).getAttribute("href"),
    ).toBe("/en/contact");
  });

  it("renders HTTPS CTA URLs directly", () => {
    render(
      <SectionRenderer
        locale="en"
        section={{
          id: "cta",
          type: "CTA",
          order: 0,
          heading: "Download report",
          body: null,
          ctaLabel: "Report",
          ctaUrl: "https://example.com/report.pdf",
          config: null,
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Report" }).getAttribute("href"),
    ).toBe("https://example.com/report.pdf");
  });
});
