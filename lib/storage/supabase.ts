import "server-only";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { validateUpload } from "@/lib/storage/validation";

function storage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Storage is not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage;
}

export async function uploadCv(file: File): Promise<string> {
  const validated = await validateUpload(file, "cv");
  const path = `applications/${new Date().getUTCFullYear()}/${randomUUID()}.${validated.extension}`;
  const bucket = process.env.SUPABASE_CV_BUCKET ?? "solidra-cvs";
  const { error } = await storage()
    .from(bucket)
    .upload(path, file, { contentType: validated.mimeType, upsert: false });
  if (error) throw new Error("CV upload failed");
  return path;
}

export async function removeCv(path: string): Promise<void> {
  await storage()
    .from(process.env.SUPABASE_CV_BUCKET ?? "solidra-cvs")
    .remove([path]);
}

export async function createCvDownloadUrl(path: string): Promise<string> {
  const { data, error } = await storage()
    .from(process.env.SUPABASE_CV_BUCKET ?? "solidra-cvs")
    .createSignedUrl(path, 60);
  if (error) throw new Error("Unable to authorize CV download");
  return data.signedUrl;
}

export async function uploadPublicAsset(
  file: File,
  kind: "image" | "document",
): Promise<{ path: string; publicUrl: string }> {
  const validated = await validateUpload(file, kind);
  const bucket =
    kind === "image"
      ? (process.env.SUPABASE_PUBLIC_BUCKET ?? "solidra-public")
      : (process.env.SUPABASE_DOCUMENT_BUCKET ?? "solidra-documents");
  const path = `${kind}s/${new Date().getUTCFullYear()}/${randomUUID()}.${validated.extension}`;
  const connection = storage();
  const { error } = await connection
    .from(bucket)
    .upload(path, file, { contentType: validated.mimeType, upsert: false });
  if (error) throw new Error("Asset upload failed");
  return {
    path,
    publicUrl: connection.from(bucket).getPublicUrl(path).data.publicUrl,
  };
}

export async function removePublicAsset(
  path: string,
  kind: "image" | "document",
): Promise<void> {
  const bucket =
    kind === "image"
      ? (process.env.SUPABASE_PUBLIC_BUCKET ?? "solidra-public")
      : (process.env.SUPABASE_DOCUMENT_BUCKET ?? "solidra-documents");
  const { error } = await storage().from(bucket).remove([path]);
  if (error) throw new Error("Asset deletion failed");
}
