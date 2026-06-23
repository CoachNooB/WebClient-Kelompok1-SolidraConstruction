"use client";
import { useState } from "react";

export function ContactForm({ locale }: { locale: string }) {
  const [state, setState] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading");
    const formElement = event.currentTarget;
    const response = await fetch("/api/contact", { method: "POST", body: new FormData(formElement) });
    if (!response.ok) return setState("error");
    formElement.reset(); setIdempotencyKey(crypto.randomUUID()); setState("success");
  }
  return <form onSubmit={submit} className="card grid gap-5">
    <input type="hidden" name="locale" value={locale}/><input type="hidden" name="idempotencyKey" value={idempotencyKey}/>
    {state === "success" && <div role="status" className="rounded border border-green-300 bg-green-50 p-3 text-green-900">{locale === "id" ? "Pesan telah diterima." : "Message received."}</div>}
    <label className="grid gap-2 font-semibold">{locale === "id" ? "Nama" : "Name"}<input required minLength={2} name="name" className="min-h-11 rounded border px-3 font-normal"/></label>
    <label className="grid gap-2 font-semibold">Email<input required type="email" name="email" className="min-h-11 rounded border px-3 font-normal"/></label>
    <label className="grid gap-2 font-semibold">{locale === "id" ? "Telepon (opsional)" : "Phone (optional)"}<input name="phone" type="tel" className="min-h-11 rounded border px-3 font-normal"/></label>
    <label className="grid gap-2 font-semibold">{locale === "id" ? "Perusahaan (opsional)" : "Company (optional)"}<input name="company" className="min-h-11 rounded border px-3 font-normal"/></label>
    <label className="grid gap-2 font-semibold">{locale === "id" ? "Subjek" : "Subject"}<input required minLength={3} name="subject" className="min-h-11 rounded border px-3 font-normal"/></label>
    <label className="grid gap-2 font-semibold">{locale === "id" ? "Pesan" : "Message"}<textarea required minLength={10} rows={6} name="message" className="rounded border p-3 font-normal"/></label>
    <input name="website" className="hidden" tabIndex={-1}/><label className="flex gap-3 text-sm"><input required name="consent" type="checkbox" value="true"/>{locale === "id" ? "Saya menyetujui pemrosesan data." : "I consent to data processing."}</label>
    {state === "error" && <p role="alert" className="text-red-600">{locale === "id" ? "Pesan tidak dapat dikirim." : "Unable to submit."}</p>}
    <button disabled={state === "loading"} className="btn btn-primary">{state === "loading" ? "Sending…" : locale === "id" ? "Kirim pesan" : "Send message"}</button>
  </form>;
}
