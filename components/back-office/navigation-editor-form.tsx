"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastMessage } from "@/components/back-office/toast";

type NavigationEditorValue = {
  id: string;
  location: "HEADER" | "FOOTER";
  url: string;
  external: boolean;
  visible: boolean;
  order: number;
  parentId: string | null;
  translations: Array<{ locale: "ID" | "EN"; label: string }>;
};

export function NavigationEditorForm({
  item,
}: {
  item: NavigationEditorValue;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/back-office/navigation/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        location: form.get("location"),
        url: form.get("url"),
        external: form.get("external") === "true",
        visible: form.get("visible") === "true",
        order: Number(form.get("order")),
        parentId: form.get("parentId"),
        labelId: form.get("labelId"),
        labelEn: form.get("labelEn"),
      }),
    });
    const body = await response.json();
    setMessage(
      response.ok
        ? { text: "Navigation item saved", tone: "success" }
        : {
            text: body.error ?? "Unable to save navigation item",
            tone: "error",
          },
    );
    if (response.ok) router.refresh();
  }
  const idLabel =
    item.translations.find((translation) => translation.locale === "ID")
      ?.label ?? "";
  const enLabel =
    item.translations.find((translation) => translation.locale === "EN")
      ?.label ?? "";
  return (
    <form onSubmit={submit} className="card mt-8 grid gap-4">
      <h2 className="text-xl font-bold">Navigation item</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          Location
          <select
            name="location"
            defaultValue={item.location}
            className="mt-1 min-h-11 w-full rounded border px-3"
          >
            <option>HEADER</option>
            <option>FOOTER</option>
          </select>
        </label>
        <label>
          Order
          <Input
            name="order"
            type="number"
            min={0}
            max={1000}
            defaultValue={item.order}
          />
        </label>
        <label>
          URL
          <Input name="url" defaultValue={item.url} />
        </label>
        <label>
          Parent ID
          <Input name="parentId" defaultValue={item.parentId ?? ""} />
        </label>
      </div>
      <label>
        <input
          name="external"
          type="checkbox"
          value="true"
          defaultChecked={item.external}
        />{" "}
        External HTTPS link
      </label>
      <label>
        <input
          name="visible"
          type="checkbox"
          value="true"
          defaultChecked={item.visible}
        />{" "}
        Visible
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          ID label
          <Input name="labelId" defaultValue={idLabel} />
        </label>
        <label>
          EN label
          <Input name="labelEn" defaultValue={enLabel} />
        </label>
      </div>
      {message && <ToastMessage message={message.text} tone={message.tone} />}
      <Button>Save navigation item</Button>
    </form>
  );
}
