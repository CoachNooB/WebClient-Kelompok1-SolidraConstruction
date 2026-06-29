// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/public/site-header";

let pathname = "/en/careers/site-engineer";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

const items = [
  { id: "home", label: "Home", url: "/", external: false, children: [] },
  {
    id: "careers",
    label: "Careers",
    url: "/careers",
    external: false,
    children: [],
  },
  {
    id: "external",
    label: "Partner",
    url: "https://example.com",
    external: true,
    children: [],
  },
];

describe("SiteHeader", () => {
  afterEach(cleanup);

  beforeEach(() => {
    pathname = "/en/careers/site-engineer";
  });

  it("marks an internal parent active in desktop and mobile navigation", () => {
    render(<SiteHeader locale="en" items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle menu" }));

    const links = screen.getAllByRole("link", { name: "Careers" });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("aria-current", "page");
      expect(link).toHaveClass("text-blue-600");
    }
  });

  it("does not mark external links active", () => {
    pathname = "https://example.com";
    render(<SiteHeader locale="en" items={items} />);

    for (const link of screen.getAllByRole("link", { name: "Partner" })) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("marks Home active only on the locale root", () => {
    pathname = "/en";
    const { rerender } = render(<SiteHeader locale="en" items={items} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    pathname = "/en/about";
    rerender(<SiteHeader locale="en" items={items} />);
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
