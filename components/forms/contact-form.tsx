"use client";
import { useState } from "react";

type Toast = {
  tone: "success" | "error";
  text: string;
};

export function ContactForm({ locale }: { locale: string }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );

  function cleanPhone(event: React.FormEvent<HTMLInputElement>) {
    event.currentTarget.value = event.currentTarget.value.replace(
      /[^0-9+]/g,
      "",
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setToast(null);
    const formElement = event.currentTarget;
    const response = await fetch("/api/contact", {
      method: "POST",
      body: new FormData(formElement),
    });
    setLoading(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        fields?: Record<string, string[]>;
      } | null;
      const fieldError = body?.fields
        ? Object.values(body.fields).flat().find(Boolean)
        : undefined;
      setToast({
        tone: "error",
        text:
          fieldError ??
          body?.error ??
          (locale === "id"
            ? "Pesan tidak dapat dikirim."
            : "Unable to submit."),
      });
      return;
    }
    formElement.reset();
    setIdempotencyKey(crypto.randomUUID());
    setToast({
      tone: "success",
      text: locale === "id" ? "Pesan telah diterima." : "Message received.",
    });
  }
  return (
    <form onSubmit={submit} className="card grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      {toast && (
        <div
          role={toast.tone === "error" ? "alert" : "status"}
          className={
            toast.tone === "success"
              ? "rounded border border-green-300 bg-green-50 p-3 text-green-900"
              : "rounded border border-red-300 bg-red-50 p-3 text-red-900"
          }
        >
          {toast.text}
        </div>
      )}
      <label className="grid gap-2 font-semibold">
        {locale === "id" ? "Nama" : "Name"}
        <input
          required
          minLength={2}
          maxLength={100}
          name="name"
          className="min-h-11 rounded border px-3 font-normal"
        />
      </label>
      <label className="grid gap-2 font-semibold">
        Email
        <input
          required
          type="email"
          name="email"
          className="min-h-11 rounded border px-3 font-normal"
        />
      </label>
      <label className="grid gap-2 font-semibold">
        {locale === "id" ? "Telepon (opsional)" : "Phone (optional)"}
        <input
          name="phone"
          type="tel"
          maxLength={30}
          pattern="[0-9+]*"
          inputMode="tel"
          onInput={cleanPhone}
          className="min-h-11 rounded border px-3 font-normal"
        />
      </label>
      <label className="grid gap-2 font-semibold">
        {locale === "id" ? "Perusahaan (opsional)" : "Company (optional)"}
        <input
          name="company"
          maxLength={150}
          className="min-h-11 rounded border px-3 font-normal"
        />
      </label>
      <label className="grid gap-2 font-semibold">
        {locale === "id" ? "Subjek" : "Subject"}
        <input
          required
          minLength={3}
          maxLength={150}
          name="subject"
          className="min-h-11 rounded border px-3 font-normal"
        />
      </label>
      <label className="grid gap-2 font-semibold">
        {locale === "id" ? "Pesan" : "Message"}
        <textarea
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          name="message"
          className="rounded border p-3 font-normal"
        />
      </label>
      <input name="website" className="hidden" tabIndex={-1} />
      <label className="flex gap-3 text-sm">
        <input required name="consent" type="checkbox" value="true" />
        {locale === "id"
          ? "Saya menyetujui pemrosesan data."
          : "I consent to data processing."}
      </label>
      <button disabled={loading} className="btn btn-primary">
        {loading
          ? "Sending…"
          : locale === "id"
            ? "Kirim pesan"
            : "Send message"}
      </button>
    </form>
  );
}
