// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageEditorForm } from "@/components/back-office/page-editor-form";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

afterEach(() => {
  vi.restoreAllMocks();
  refresh.mockReset();
});

describe("PageEditorForm", () => {
  it("edits and saves section config JSON", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));

    render(
      <PageEditorForm
        pageId="page-about"
        canPublish={false}
        translations={[
          {
            locale: "ID",
            title: "Tentang Solidra",
            description: "Tentang Solidra Construction",
            seoTitle: null,
            seoDescription: null,
          },
          {
            locale: "EN",
            title: "About Solidra",
            description: "About Solidra Construction",
            seoTitle: null,
            seoDescription: null,
          },
        ]}
        initialSections={[
          {
            type: "LEADERSHIP",
            order: 0,
            visible: true,
            config: {
              items: [
                {
                  title: "Existing Director",
                  description: "President Director",
                },
              ],
            },
            mediaId: null,
            translations: [
              {
                locale: "ID",
                heading: "Kepemimpinan",
                body: "Pemimpin",
                ctaLabel: null,
                ctaUrl: null,
              },
              {
                locale: "EN",
                heading: "Leadership",
                body: "Leaders",
                ctaLabel: null,
                ctaUrl: null,
              },
            ],
          },
        ]}
      />,
    );

    const configInput = screen.getByLabelText(
      "Config JSON",
    ) as HTMLTextAreaElement;
    expect(configInput.value).toContain("Existing Director");

    fireEvent.change(configInput, {
      target: {
        value:
          '{"items":[{"title":"Jane Santoso","description":"President Director"}]}',
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, request] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String((request as RequestInit).body));
    expect(payload.sections[0].config).toEqual({
      items: [{ title: "Jane Santoso", description: "President Director" }],
    });
  });
});
