"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastMessage } from "@/components/back-office/toast";

export function MediaEditorForm({
  id,
  altId,
  altEn,
}: {
  id: string;
  altId: string;
  altEn: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/back-office/media/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        altId: form.get("altId"),
        altEn: form.get("altEn"),
      }),
    });
    const body = await response.json();
    setMessage(
      response.ok
        ? { text: "Media alt text saved", tone: "success" }
        : { text: body.error ?? "Unable to save alt text", tone: "error" },
    );
    if (response.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="card mt-8 grid gap-4">
      <h2 className="text-xl font-bold">Alt text</h2>
      <label>
        ID alt text
        <Input name="altId" defaultValue={altId} />
      </label>
      <label>
        EN alt text
        <Input name="altEn" defaultValue={altEn} />
      </label>
      {message && <ToastMessage message={message.text} tone={message.tone} />}
      <Button>Save alt text</Button>
    </form>
  );
}
