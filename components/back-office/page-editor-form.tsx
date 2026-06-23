"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Translation = {
  locale: "ID" | "EN";
  title: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
};
type SectionTranslation = {
  locale: "ID" | "EN";
  heading: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};
type Section = {
  type: string;
  order: number;
  visible: boolean;
  config: unknown;
  mediaId: string | null;
  translations: SectionTranslation[];
};

const configurableSections = new Set([
  "METRICS",
  "SERVICES",
  "PROJECTS",
  "TIMELINE",
  "VALUES",
  "LEADERSHIP",
  "CERTIFICATIONS",
  "FINANCIALS",
  "DOCUMENTS",
  "GOVERNANCE",
  "OFFICES",
  "BENEFITS",
  "PROCESS",
  "VACANCIES",
]);

function stringifyConfig(config: unknown) {
  if (config === null || config === undefined) return "";
  return JSON.stringify(config, null, 2);
}

function parseConfig(value: FormDataEntryValue | null, sectionType: string) {
  if (!configurableSections.has(sectionType)) return undefined;
  const text = String(value ?? "").trim();
  if (!text) return undefined;
  return JSON.parse(text) as unknown;
}

export function PageEditorForm({
  pageId,
  translations,
  initialSections,
  canPublish,
}: {
  pageId: string;
  translations: Translation[];
  initialSections: Section[];
  canPublish: boolean;
}) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next.map((section, order) => ({ ...section, order })));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);

    let sectionPayload;
    try {
      sectionPayload = sections.map((section, index) => ({
        ...section,
        order: index,
        config: parseConfig(form.get(`section.${index}.config`), section.type),
        translations: (["ID", "EN"] as const).map((locale) => ({
          locale,
          heading: String(form.get(`section.${index}.${locale}.heading`) ?? ""),
          body: String(form.get(`section.${index}.${locale}.body`) ?? ""),
          ctaLabel: String(
            form.get(`section.${index}.${locale}.ctaLabel`) ?? "",
          ),
          ctaUrl: String(form.get(`section.${index}.${locale}.ctaUrl`) ?? ""),
        })),
      }));
    } catch {
      setPending(false);
      setMessage("Section config JSON is invalid");
      return;
    }

    const payload = {
      translations: (["ID", "EN"] as const).map((locale) => ({
        locale,
        title: String(form.get(`${locale}.title`)),
        description: String(form.get(`${locale}.description`)),
        seoTitle: String(form.get(`${locale}.seoTitle`)),
        seoDescription: String(form.get(`${locale}.seoDescription`)),
      })),
      sections: sectionPayload,
    };

    const response = await fetch(`/api/back-office/pages/${pageId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    setMessage(response.ok ? "Draft saved" : "Unable to save draft");
    if (response.ok) router.refresh();
  }

  async function publish() {
    setPending(true);
    const response = await fetch(`/api/back-office/pages/${pageId}/publish`, {
      method: "POST",
    });
    setPending(false);
    setMessage(response.ok ? "Published" : "Publish failed");
    if (response.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="mt-8 grid gap-8">
      {(["ID", "EN"] as const).map((locale) => {
        const value = translations.find((t) => t.locale === locale);
        return (
          <fieldset className="card grid gap-4" key={locale}>
            <legend className="px-2 font-bold">
              {locale === "ID" ? "Bahasa Indonesia" : "English"}
            </legend>
            <label className="grid gap-2">
              Title
              <Input name={`${locale}.title`} defaultValue={value?.title} />
            </label>
            <label className="grid gap-2">
              Description
              <textarea
                className="rounded border p-3"
                name={`${locale}.description`}
                defaultValue={value?.description}
              />
            </label>
            <label className="grid gap-2">
              SEO title
              <Input
                name={`${locale}.seoTitle`}
                defaultValue={value?.seoTitle ?? ""}
              />
            </label>
            <label className="grid gap-2">
              SEO description
              <textarea
                className="rounded border p-3"
                name={`${locale}.seoDescription`}
                defaultValue={value?.seoDescription ?? ""}
              />
            </label>
          </fieldset>
        );
      })}

      <section>
        <h2 className="text-2xl font-bold">Sections</h2>
        <div className="mt-4 grid gap-5">
          {sections.map((section, index) => (
            <fieldset className="card" key={`${section.type}-${index}`}>
              <div className="flex items-center justify-between">
                <legend className="font-bold">
                  {index + 1}. {section.type}
                </legend>
                <div className="flex gap-2">
                  <button type="button" onClick={() => move(index, -1)}>
                    ↑
                  </button>
                  <button type="button" onClick={() => move(index, 1)}>
                    ↓
                  </button>
                  <label className="text-sm">
                    <input
                      type="checkbox"
                      checked={section.visible}
                      onChange={(event) =>
                        setSections((current) =>
                          current.map((value, i) =>
                            i === index
                              ? { ...value, visible: event.target.checked }
                              : value,
                          ),
                        )
                      }
                    />{" "}
                    Visible
                  </label>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {(["ID", "EN"] as const).map((locale) => {
                  const value = section.translations.find(
                    (t) => t.locale === locale,
                  );
                  return (
                    <div className="grid gap-3" key={locale}>
                      <b>{locale}</b>
                      <Input
                        name={`section.${index}.${locale}.heading`}
                        defaultValue={value?.heading ?? ""}
                        placeholder="Heading"
                      />
                      <textarea
                        className="rounded border p-3"
                        rows={5}
                        name={`section.${index}.${locale}.body`}
                        defaultValue={value?.body ?? ""}
                        placeholder="Body"
                      />
                      <Input
                        name={`section.${index}.${locale}.ctaLabel`}
                        defaultValue={value?.ctaLabel ?? ""}
                        placeholder="CTA label"
                      />
                      <Input
                        name={`section.${index}.${locale}.ctaUrl`}
                        defaultValue={value?.ctaUrl ?? ""}
                        placeholder="CTA URL"
                      />
                    </div>
                  );
                })}
              </div>

              {configurableSections.has(section.type) && (
                <label className="mt-4 grid gap-2">
                  Config JSON
                  <textarea
                    className="min-h-40 rounded border p-3 font-mono text-sm"
                    name={`section.${index}.config`}
                    defaultValue={stringifyConfig(section.config)}
                    spellCheck={false}
                  />
                </label>
              )}
            </fieldset>
          ))}
        </div>
      </section>

      {message && <p role="status">{message}</p>}
      <div className="flex gap-3">
        <Button disabled={pending}>Save draft</Button>
        {canPublish && (
          <Button
            type="button"
            className="bg-green-700"
            disabled={pending}
            onClick={publish}
          >
            Publish draft
          </Button>
        )}
      </div>
    </form>
  );
}
