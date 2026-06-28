"use client";

import { createClient } from "@supabase/supabase-js";
import type { UploadPurpose } from "@/lib/storage/upload-ticket";

export type CompletedDirectUpload = {
  ticket: string;
  path: string;
  fileName: string;
};

export async function directUpload(
  file: File,
  purpose: UploadPurpose,
  subject?: string,
): Promise<CompletedDirectUpload> {
  const prepared = await fetch("/api/uploads/prepare", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      purpose,
      subject,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    }),
  });
  const body = (await prepared.json()) as {
    error?: string;
    bucket?: string;
    path?: string;
    token?: string;
    ticket?: string;
  };
  if (
    !prepared.ok ||
    !body.bucket ||
    !body.path ||
    !body.token ||
    !body.ticket
  )
    throw new Error(body.error ?? "Unable to prepare upload");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Browser storage is not configured");
  const { error } = await createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage.from(body.bucket).uploadToSignedUrl(body.path, body.token, file, {
    contentType: file.type,
  });
  if (error) throw new Error("File upload failed");
  return { ticket: body.ticket, path: body.path, fileName: file.name };
}
