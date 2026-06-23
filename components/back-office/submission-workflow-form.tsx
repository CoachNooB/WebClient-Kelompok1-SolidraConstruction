"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function SubmissionWorkflowForm({
  kind,
  id,
  status,
  statuses,
}: {
  kind: "messages" | "applications";
  id: string;
  status: string;
  statuses: string[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/back-office/submissions/${kind}/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: data.get("status"),
        note: data.get("note"),
      }),
    });
    setPending(false);
    setMessage(response.ok ? "Saved" : "Unable to save");
    if (response.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="card mt-8 grid gap-4">
      <h2 className="text-xl font-bold">Workflow</h2>
      <label className="grid gap-2 font-semibold">
        Status
        <select
          name="status"
          defaultValue={status}
          className="min-h-11 rounded border px-3"
        >
          {statuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 font-semibold">
        Internal note
        <textarea
          name="note"
          maxLength={2000}
          rows={4}
          className="rounded border p-3"
        />
      </label>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      <Button disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
