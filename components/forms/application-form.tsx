"use client";
import { useState } from "react";
import { directUpload } from "@/lib/storage/direct-upload-client";

type Toast = {
  tone: "success" | "error";
  text: string;
};

export function ApplicationForm({
  vacancyId,
  locale,
}: {
  vacancyId: string;
  locale: string;
}) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [pending, setPending] = useState(false);
  const [key, setKey] = useState(() => crypto.randomUUID());

  function cleanPhone(event: React.FormEvent<HTMLInputElement>) {
    event.currentTarget.value = event.currentTarget.value.replace(
      /[^0-9+]/g,
      "",
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setToast(null);
    const form = e.currentTarget;
    const values = new FormData(form);
    const cv = values.get("cv");
    let res: Response;
    try {
      if (!(cv instanceof File)) throw new Error("CV file required");
      const upload = await directUpload(cv, "career-application", vacancyId);
      res = await fetch(`/api/careers/${vacancyId}/apply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale: values.get("locale"),
          idempotencyKey: values.get("idempotencyKey"),
          name: values.get("name"),
          email: values.get("email"),
          phone: values.get("phone"),
          coverLetter: values.get("coverLetter"),
          consent: values.get("consent") === "true",
          upload,
        }),
      });
    } catch (error) {
      setPending(false);
      setToast({
        tone: "error",
        text: error instanceof Error ? error.message : "File upload failed",
      });
      return;
    }
    setPending(false);
    if (res.ok) {
      form.reset();
      setKey(crypto.randomUUID());
      setToast({
        tone: "success",
        text: "Application received. Thank you for applying.",
      });
      return;
    }
    const body = (await res.json().catch(() => null)) as {
      error?: string;
      fields?: Record<string, string[]>;
    } | null;
    const fieldError = body?.fields
      ? Object.values(body.fields).flat().find(Boolean)
      : undefined;
    setToast({
      tone: "error",
      text: fieldError ?? body?.error ?? "Application could not be submitted.",
    });
  }
  return (
    <form onSubmit={submit} className="card grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="idempotencyKey" value={key} />
      {[
        ["name", "Full name", "text"],
        ["email", "Email", "email"],
        ["phone", "Phone", "tel"],
      ].map((x) => (
        <label className="grid gap-2 font-semibold" key={x[0]}>
          {x[1]}
          <input
            required
            name={x[0]}
            type={x[2]}
            pattern={x[0] === "phone" ? "[0-9+]+" : undefined}
            inputMode={x[0] === "phone" ? "tel" : undefined}
            onInput={x[0] === "phone" ? cleanPhone : undefined}
            className="min-h-11 rounded border px-3 font-normal"
          />
        </label>
      ))}
      <label className="grid gap-2 font-semibold">
        Cover letter
        <textarea
          required
          minLength={20}
          name="coverLetter"
          rows={5}
          className="rounded border p-3 font-normal"
        />
      </label>
      <label className="grid gap-2 font-semibold">
        CV (PDF, DOC, DOCX · max 5 MB)
        <input
          required
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx"
          className="min-h-11 rounded border p-2 font-normal"
        />
      </label>
      <label className="flex gap-3 text-sm">
        <input required name="consent" value="true" type="checkbox" />I consent
        to the processing of my application data.
      </label>
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
      <button disabled={pending} className="btn btn-primary">
        {pending ? "Sending..." : "Submit application"}
      </button>
    </form>
  );
}
