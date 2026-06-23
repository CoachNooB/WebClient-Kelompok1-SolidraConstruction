"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ApiError = { error?: string };

export function ResourceCreatePanel({ section }: { section: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  if (!["investor-documents", "media", "vacancies", "users"].includes(section))
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
