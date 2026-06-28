"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastMessage } from "@/components/back-office/toast";
import { managedCardSectionTypes } from "@/lib/validation/section-card";
import { directUpload } from "@/lib/storage/direct-upload-client";

type Translation = {
  locale: "ID" | "EN";
  title: string;
  description: string | null;
  alt: string | null;
};

export function SectionCardEditorForm({
  card,
}: {
  card: {
    id: string;
    sectionType: string;
    order: number;
    value: string | null;
    url: string | null;
    translations: Translation[];
  };
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const image = form.get("image");
    let response: Response;
    try {
      const upload =
        image instanceof File && image.size > 0
          ? await directUpload(image, "section-card-update", card.id)
          : undefined;
      const value = Object.fromEntries(form);
      delete value.image;
      response = await fetch(`/api/back-office/section-cards/${card.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...value, upload }),
      });
    } catch (error) {
      setPending(false);
      setMessage({
        text: error instanceof Error ? error.message : "Upload failed",
        tone: "error",
      });
      return;
    }
    setPending(false);
    setMessage(
      response.ok
        ? { text: "Card saved and moved to draft", tone: "success" }
        : { text: "Unable to save card", tone: "error" },
    );
    if (response.ok) router.refresh();
  }

  const id = card.translations.find((item) => item.locale === "ID");
  const en = card.translations.find((item) => item.locale === "EN");

  return (
    <form onSubmit={submit} className="card mt-8 grid gap-4">
      <h2 className="text-xl font-bold">Card content</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2">
          Section
          <select
            required
            name="sectionType"
            defaultValue={card.sectionType}
            className="min-h-11 rounded border px-3"
          >
            {managedCardSectionTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          Order
          <Input required name="order" type="number" defaultValue={card.order} />
        </label>
        <label className="grid gap-2">
          Value / metric
          <Input name="value" defaultValue={card.value ?? ""} />
        </label>
        <label className="grid gap-2">
          Link URL
          <Input name="url" defaultValue={card.url ?? ""} />
        </label>
        <label className="grid gap-2">
          Judul (ID)
          <Input required name="titleId" defaultValue={id?.title ?? ""} />
        </label>
        <label className="grid gap-2">
          Title (EN)
          <Input required name="titleEn" defaultValue={en?.title ?? ""} />
        </label>
        <label className="grid gap-2">
          Alt gambar (ID)
          <Input name="altId" defaultValue={id?.alt ?? ""} />
        </label>
        <label className="grid gap-2">
          Image alt (EN)
          <Input name="altEn" defaultValue={en?.alt ?? ""} />
        </label>
      </div>
      <label className="grid gap-2">
        Deskripsi (ID)
        <textarea
          className="rounded border p-3"
          name="descriptionId"
          defaultValue={id?.description ?? ""}
        />
      </label>
      <label className="grid gap-2">
        Description (EN)
        <textarea
          className="rounded border p-3"
          name="descriptionEn"
          defaultValue={en?.description ?? ""}
        />
      </label>
      <label className="grid gap-2">
        Replace image
        <Input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
      </label>
      {message && <ToastMessage message={message.text} tone={message.tone} />}
      <Button disabled={pending}>Save card</Button>
    </form>
  );
}
