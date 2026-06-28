"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ToastMessage } from "@/components/back-office/toast";
import { directUpload } from "@/lib/storage/direct-upload-client";

export function InvestorDocumentReplaceForm({ id }: { id: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    let response: Response;
    try {
      if (!(file instanceof File)) throw new Error("PDF file required");
      const upload = await directUpload(
        file,
        "investor-document-replace",
        id,
      );
      response = await fetch(
        `/api/back-office/investor-documents/${id}/replace`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ upload }),
        },
      );
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "Upload failed",
        tone: "error",
      });
      return;
    }
    const body = await response.json();
    setMessage(
      response.ok
        ? { text: "Document replaced and moved to draft", tone: "success" }
        : { text: body.error ?? "Unable to replace document", tone: "error" },
    );
    if (response.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="card mt-8 grid gap-4">
      <h2 className="text-xl font-bold">Replace file</h2>
      <input
        name="file"
        type="file"
        accept=".pdf,application/pdf"
        required
        className="min-h-11 rounded border p-2"
      />
      {message && <ToastMessage message={message.text} tone={message.tone} />}
      <Button>Replace document</Button>
    </form>
  );
}
