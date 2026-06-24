// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadOnlyBoundary } from "@/components/back-office/read-only-boundary";

describe("ReadOnlyBoundary", () => {
  it("keeps filter controls enabled while disabling edit controls", async () => {
    render(
      <ReadOnlyBoundary>
        <form data-read-only-allowed="true">
          <input aria-label="Search" disabled />
          <button disabled>Filter</button>
        </form>
        <form>
          <input aria-label="Title" />
          <button>Save</button>
        </form>
      </ReadOnlyBoundary>,
    );

    await waitFor(() =>
      expect(
        (screen.getByLabelText("Title") as HTMLInputElement).disabled,
      ).toBe(true),
    );
    expect(
      (screen.getByRole("button", { name: "Save" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect((screen.getByLabelText("Search") as HTMLInputElement).disabled).toBe(
      false,
    );
    expect(
      (screen.getByRole("button", { name: "Filter" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });
});
