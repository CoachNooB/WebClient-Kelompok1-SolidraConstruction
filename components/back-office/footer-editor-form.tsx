"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastMessage } from "@/components/back-office/toast";

type FooterLinkValue = {
  id?: string;
  order: number;
  url: string;
  external: boolean;
  visible: boolean;
  translations: Array<{ locale: "ID" | "EN"; label: string }>;
};
type FooterEditorValue = {
  id: string;
  order: number;
  visible: boolean;
  translations: Array<{ locale: "ID" | "EN"; title: string }>;
  links: FooterLinkValue[];
};

function label(link: FooterLinkValue, locale: "ID" | "EN") {
  return (
    link.translations.find((translation) => translation.locale === locale)
      ?.label ?? ""
  );
}

export function FooterEditorForm({ group }: { group: FooterEditorValue }) {
  const router = useRouter();
  const [links, setLinks] = useState(group.links);
  const [message, setMessage] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      visible: form.get("visible") === "true",
      order: Number(form.get("order")),
      titleId: form.get("titleId"),
      titleEn: form.get("titleEn"),
      links: links.map((link, index) => ({
        id: link.id,
        order: Number(form.get(`link-${index}-order`)),
        url: form.get(`link-${index}-url`),
        external: form.get(`link-${index}-external`) === "true",
        visible: form.get(`link-${index}-visible`) === "true",
        labelId: form.get(`link-${index}-labelId`),
        labelEn: form.get(`link-${index}-labelEn`),
      })),
    };
    const response = await fetch(`/api/back-office/footer/${group.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    setMessage(
      response.ok
        ? { text: "Footer group saved", tone: "success" }
        : { text: body.error ?? "Unable to save footer group", tone: "error" },
    );
    if (response.ok) router.refresh();
  }
  const titleId =
    group.translations.find((translation) => translation.locale === "ID")
      ?.title ?? "";
  const titleEn =
    group.translations.find((translation) => translation.locale === "EN")
      ?.title ?? "";
  return (
    <form onSubmit={submit} className="card mt-8 grid gap-5">
      <h2 className="text-xl font-bold">Footer group</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          Order
          <Input name="order" type="number" defaultValue={group.order} />
        </label>
        <label className="pt-8">
          <input
            name="visible"
            type="checkbox"
            value="true"
            defaultChecked={group.visible}
          />{" "}
          Visible
        </label>
        <label>
          ID title
          <Input name="titleId" defaultValue={titleId} />
        </label>
        <label>
          EN title
          <Input name="titleEn" defaultValue={titleEn} />
        </label>
      </div>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Links</h3>
          <Button
            type="button"
            className="bg-white text-slate-900 ring-1 ring-slate-300"
            onClick={() =>
              setLinks([
                ...links,
                {
                  order: links.length,
                  url: "/",
                  external: false,
                  visible: true,
                  translations: [],
                },
              ])
            }
          >
            Add link
          </Button>
        </div>
        {links.map((link, index) => (
          <div className="rounded border p-4" key={link.id ?? index}>
            <div className="grid gap-3 md:grid-cols-2">
              <label>
                Order
                <Input
                  name={`link-${index}-order`}
                  type="number"
                  defaultValue={link.order}
                />
              </label>
              <label>
                URL
                <Input name={`link-${index}-url`} defaultValue={link.url} />
              </label>
              <label>
                ID label
                <Input
                  name={`link-${index}-labelId`}
                  defaultValue={label(link, "ID")}
                />
              </label>
              <label>
                EN label
                <Input
                  name={`link-${index}-labelEn`}
                  defaultValue={label(link, "EN")}
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              <label>
                <input
                  name={`link-${index}-external`}
                  type="checkbox"
                  value="true"
                  defaultChecked={link.external}
                />{" "}
                External
              </label>
              <label>
                <input
                  name={`link-${index}-visible`}
                  type="checkbox"
                  value="true"
                  defaultChecked={link.visible}
                />{" "}
                Visible
              </label>
              <button
                type="button"
                className="font-semibold text-red-700"
                onClick={() =>
                  setLinks(links.filter((_, linkIndex) => linkIndex !== index))
                }
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {message && <ToastMessage message={message.text} tone={message.tone} />}
      <Button>Save footer group</Button>
    </form>
  );
}
