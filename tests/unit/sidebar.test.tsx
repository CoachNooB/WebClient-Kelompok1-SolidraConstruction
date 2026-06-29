// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/back-office/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/back-office/pages/page-1",
}));

describe("Sidebar", () => {
  it("marks the parent item active on a nested route", () => {
    render(<Sidebar role="SUPER_ADMIN" />);

    expect(screen.getByRole("link", { name: "Pages" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
