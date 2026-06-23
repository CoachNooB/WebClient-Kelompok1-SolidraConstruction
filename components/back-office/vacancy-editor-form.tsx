"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastMessage } from "@/components/back-office/toast";

type VacancyValue = { id: string; department: string; location: string; employmentType: string; closingDate: Date; translations: Array<{ locale: "ID" | "EN"; slug: string; title: string; summary: string; responsibilities: unknown; requirements: unknown }> };

function lines(value: unknown) {
  return Array.isArray(value) ? value.map(String).join("\n") : "";
}

export function VacancyEditorForm({ vacancy }: { vacancy: VacancyValue }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; tone: "success" | "error" } | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const translations = (["ID", "EN"] as const).map((locale) => ({ locale, slug: String(form.get(`${locale}-slug`) ?? ""), title: String(form.get(`${locale}-title`) ?? ""), summary: String(form.get(`${locale}-summary`) ?? ""), responsibilities: String(form.get(`${locale}-responsibilities`) ?? "").split("\n").map((line) => line.trim()).filter(Boolean), requirements: String(form.get(`${locale}-requirements`) ?? "").split("\n").map((line) => line.trim()).filter(Boolean) }));
    const response = await fetch(`/api/back-office/vacancies/${vacancy.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ department: form.get("department"), location: form.get("location"), employmentType: form.get("employmentType"), closingDate: form.get("closingDate"), translations }) });
    const body = await response.json();
    setMessage(response.ok ? { text: "Vacancy saved", tone: "success" } : { text: body.error ?? "Unable to save vacancy", tone: "error" });
    if (response.ok) router.refresh();
  }
  const byLocale = (locale: "ID" | "EN") => vacancy.translations.find((translation) => translation.locale === locale);
  return <form onSubmit={submit} className="card mt-8 grid gap-4">
    <h2 className="text-xl font-bold">Vacancy details</h2>
    <div className="grid gap-4 md:grid-cols-2"><label>Department<Input name="department" defaultValue={vacancy.department}/></label><label>Location<Input name="location" defaultValue={vacancy.location}/></label><label>Employment type<select name="employmentType" defaultValue={vacancy.employmentType} className="mt-1 min-h-11 w-full rounded border px-3"><option>FULL_TIME</option><option>PART_TIME</option><option>CONTRACT</option><option>INTERNSHIP</option></select></label><label>Closing date<Input name="closingDate" type="date" defaultValue={vacancy.closingDate.toISOString().slice(0, 10)}/></label></div>
    {(["ID", "EN"] as const).map((locale) => { const translation = byLocale(locale); return <section className="grid gap-3 rounded border p-4" key={locale}><h3 className="font-bold">{locale} content</h3><label>Slug<Input name={`${locale}-slug`} defaultValue={translation?.slug}/></label><label>Title<Input name={`${locale}-title`} defaultValue={translation?.title}/></label><label>Summary<textarea name={`${locale}-summary`} defaultValue={translation?.summary} className="mt-1 w-full rounded border p-3"/></label><label>Responsibilities<textarea name={`${locale}-responsibilities`} defaultValue={lines(translation?.responsibilities)} className="mt-1 min-h-32 w-full rounded border p-3"/></label><label>Requirements<textarea name={`${locale}-requirements`} defaultValue={lines(translation?.requirements)} className="mt-1 min-h-32 w-full rounded border p-3"/></label></section>; })}
    {message && <ToastMessage message={message.text} tone={message.tone}/>}
    <Button>Save vacancy</Button>
  </form>;
}
