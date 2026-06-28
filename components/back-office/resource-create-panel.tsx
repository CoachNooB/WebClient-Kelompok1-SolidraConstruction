"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { directUpload } from "@/lib/storage/direct-upload-client";

type ApiError = { error?: string };

export function ResourceCreatePanel({ section }: { section: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  if (
    !["section-cards", "investor-documents", "media", "vacancies", "users"].includes(
      section,
    )
  )
    return null;

  function toggleOpen() {
    setMessage("");
    setOpen((value) => !value);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setMessage("");

    const form = new FormData(formElement);
    const endpoint = `/api/back-office/${section}`;
    let body: BodyInit = form,
      headers: HeadersInit | undefined;

    if (section === "media" || section === "investor-documents") {
      const file = form.get("file");
      try {
        if (!(file instanceof File)) throw new Error("File required");
        const upload = await directUpload(
          file,
          section === "media"
            ? "media-create"
            : "investor-document-create",
        );
        const value = Object.fromEntries(form);
        delete value.file;
        body = JSON.stringify({ ...value, upload });
        headers = { "content-type": "application/json" };
      } catch (error) {
        setPending(false);
        setMessage(error instanceof Error ? error.message : "Upload failed");
        return;
      }
    }

    if (section === "section-cards") {
      const file = form.get("image");
      try {
        const upload =
          file instanceof File && file.size > 0
            ? await directUpload(file, "section-card-create")
            : undefined;
        const value = Object.fromEntries(form);
        delete value.image;
        body = JSON.stringify({ ...value, upload });
        headers = { "content-type": "application/json" };
      } catch (error) {
        setPending(false);
        setMessage(error instanceof Error ? error.message : "Upload failed");
        return;
      }
    }

    if (section === "users") {
      body = JSON.stringify(Object.fromEntries(form));
      headers = { "content-type": "application/json" };
    }

    if (section === "vacancies") {
      const value = Object.fromEntries(form);
      body = JSON.stringify({
        department: value.department,
        location: value.location,
        employmentType: value.employmentType,
        closingDate: value.closingDate,
        translations: [
          {
            locale: "ID",
            slug: value.slugId,
            title: value.titleId,
            summary: value.summaryId,
            responsibilities: String(value.responsibilitiesId)
              .split("\n")
              .filter(Boolean),
            requirements: String(value.requirementsId)
              .split("\n")
              .filter(Boolean),
          },
          {
            locale: "EN",
            slug: value.slugEn,
            title: value.titleEn,
            summary: value.summaryEn,
            responsibilities: String(value.responsibilitiesEn)
              .split("\n")
              .filter(Boolean),
            requirements: String(value.requirementsEn)
              .split("\n")
              .filter(Boolean),
          },
        ],
      });
      headers = { "content-type": "application/json" };
    }

    const response = await fetch(endpoint, { method: "POST", headers, body });
    setPending(false);

    if (!response.ok) {
      let error: ApiError = {};
      try {
        error = await response.json();
      } catch {}
      setMessage(error.error ?? "Unable to create record");
      return;
    }

    formElement.reset();
    setMessage("");
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <Button type="button" onClick={toggleOpen}>
        {open ? "Close" : "Add new"}
      </Button>
      {open && (
        <form
          onSubmit={submit}
          className="card absolute right-5 z-20 mt-3 grid w-[min(44rem,calc(100vw-2.5rem))] gap-4 shadow-xl"
        >
          {section === "investor-documents" && (
            <>
              <Input
                required
                name="file"
                type="file"
                accept="application/pdf"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Input required name="year" type="number" placeholder="Year" />
                <Input required name="category" placeholder="Category" />
                <Input required name="titleId" placeholder="Judul (ID)" />
                <Input required name="titleEn" placeholder="Title (EN)" />
                <Input name="descriptionId" placeholder="Deskripsi (ID)" />
                <Input name="descriptionEn" placeholder="Description (EN)" />
              </div>
            </>
          )}
          {section === "section-cards" && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  required
                  name="sectionType"
                  className="min-h-11 rounded border px-3"
                >
                  <option>SERVICES</option>
                  <option>PROJECTS</option>
                  <option>TIMELINE</option>
                  <option>VALUES</option>
                  <option>LEADERSHIP</option>
                  <option>CERTIFICATIONS</option>
                  <option>FINANCIALS</option>
                  <option>GOVERNANCE</option>
                  <option>OFFICES</option>
                  <option>BENEFITS</option>
                  <option>PROCESS</option>
                  <option>VACANCIES</option>
                </select>
                <Input required name="order" type="number" placeholder="Order" />
                <Input name="value" placeholder="Value / metric" />
                <Input name="url" placeholder="Link URL" />
                <Input required name="titleId" placeholder="Judul (ID)" />
                <Input required name="titleEn" placeholder="Title (EN)" />
                <Input name="descriptionId" placeholder="Deskripsi (ID)" />
                <Input name="descriptionEn" placeholder="Description (EN)" />
                <Input name="altId" placeholder="Alt gambar (ID)" />
                <Input name="altEn" placeholder="Image alt (EN)" />
              </div>
              <Input
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
              />
            </>
          )}
          {section === "media" && (
            <>
              <Input
                required
                name="file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
              />
              <Input required name="altId" placeholder="Alt text (ID)" />
              <Input required name="altEn" placeholder="Alt text (EN)" />
            </>
          )}
          {section === "users" && (
            <>
              <Input required name="name" placeholder="Full name" />
              <Input required name="email" type="email" placeholder="Email" />
              <Input
                required
                name="password"
                type="password"
                minLength={12}
                placeholder="Temporary password"
              />
              <select name="role" className="min-h-11 rounded border px-3">
                <option>EDITOR</option>
                <option>REVIEWER</option>
                <option>SUPER_ADMIN</option>
              </select>
            </>
          )}
          {section === "vacancies" && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Input required name="department" placeholder="Department" />
                <Input required name="location" placeholder="Location" />
                <select
                  name="employmentType"
                  className="min-h-11 rounded border px-3"
                >
                  <option>FULL_TIME</option>
                  <option>CONTRACT</option>
                  <option>PART_TIME</option>
                  <option>INTERNSHIP</option>
                </select>
                <Input required name="closingDate" type="date" />
                <Input required name="slugId" placeholder="Slug ID" />
                <Input required name="slugEn" placeholder="Slug EN" />
                <Input required name="titleId" placeholder="Judul (ID)" />
                <Input required name="titleEn" placeholder="Title (EN)" />
              </div>
              {[
                ["summaryId", "Ringkasan (ID)"],
                ["responsibilitiesId", "Tanggung jawab, satu per baris"],
                ["requirementsId", "Persyaratan, satu per baris"],
                ["summaryEn", "Summary (EN)"],
                ["responsibilitiesEn", "Responsibilities, one per line"],
                ["requirementsEn", "Requirements, one per line"],
              ].map(([name, label]) => (
                <textarea
                  required
                  key={name}
                  name={name}
                  placeholder={label}
                  className="rounded border p-3"
                  rows={3}
                />
              ))}
            </>
          )}
          {message && <p role="status">{message}</p>}
          <Button disabled={pending}>
            {pending ? "Creating..." : "Create"}
          </Button>
        </form>
      )}
    </div>
  );
}
