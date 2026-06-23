// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResourceCreatePanel } from "@/components/back-office/resource-create-panel";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

afterEach(() => {
  vi.restoreAllMocks();
  refresh.mockReset();
});

describe("ResourceCreatePanel", () => {
  it("closes the vacancy create panel after a successful create", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 201 }));

    const { container } = render(<ResourceCreatePanel section="vacancies" />);
    fireEvent.click(screen.getByRole("button", { name: "Add new" }));

    fireEvent.change(screen.getByPlaceholderText("Department"), {
      target: { value: "Operations" },
    });
    fireEvent.change(screen.getByPlaceholderText("Location"), {
      target: { value: "Jakarta" },
    });
    fireEvent.change(container.querySelector('input[name="closingDate"]')!, {
      target: { value: "2026-12-31" },
    });
    fireEvent.change(screen.getByPlaceholderText("Slug ID"), {
      target: { value: "site-engineer-id" },
    });
    fireEvent.change(screen.getByPlaceholderText("Slug EN"), {
      target: { value: "site-engineer-en" },
    });
    fireEvent.change(screen.getByPlaceholderText("Judul (ID)"), {
      target: { value: "Site Engineer" },
    });
    fireEvent.change(screen.getByPlaceholderText("Title (EN)"), {
      target: { value: "Site Engineer" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ringkasan (ID)"), {
      target: { value: "Ringkasan" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Tanggung jawab, satu per baris"),
      { target: { value: "Koordinasi" } },
    );
    fireEvent.change(
      screen.getByPlaceholderText("Persyaratan, satu per baris"),
      { target: { value: "Sarjana" } },
    );
    fireEvent.change(screen.getByPlaceholderText("Summary (EN)"), {
      target: { value: "Summary" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Responsibilities, one per line"),
      { target: { value: "Coordinate" } },
    );
    fireEvent.change(
      screen.getByPlaceholderText("Requirements, one per line"),
      { target: { value: "Degree" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/back-office/vacancies",
        expect.objectContaining({ method: "POST" }),
      ),
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Create" })).toBeNull();
  });
});
