import "server-only";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { validateUpload } from "@/lib/storage/validation";
import type { UploadKind } from "@/lib/storage/validation";

function storage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Storage is not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage;
}

function bucketFor(kind: UploadKind) {
  if (kind === "cv")
    return process.env.SUPABASE_CV_BUCKET ?? "solidra-cvs";
  if (kind === "document")
    return process.env.SUPABASE_DOCUMENT_BUCKET ?? "solidra-documents";
  return process.env.SUPABASE_PUBLIC_BUCKET ?? "solidra-public";
}

export async function createDirectUpload(
  kind: UploadKind,
  extension: string,
): Promise<{ bucket: string; path: string; token: string }> {
  const bucket = bucketFor(kind);
  const path = `pending/${kind}/${randomUUID()}.${extension}`;
  const { data, error } = await storage()
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error) throw new Error("Unable to authorize upload");
  return { bucket, path, token: data.token };
}

export async function validateDirectUpload(args: {
  bucket: string;
  path: string;
  kind: UploadKind;
  fileName: string;
}): Promise<{ path: string; mimeType: string; size: number }> {
  if (args.bucket !== bucketFor(args.kind))
    throw new Error("Upload bucket mismatch");
  const container = storage().from(args.bucket);
  const { data, error } = await container.download(args.path);
  if (error || !data) throw new Error("Uploaded file not found");
  const file = new File([data], args.fileName, {
    type: data.type || "application/octet-stream",
  });
  try {
    const validated = await validateUpload(file, args.kind);
    const finalPath = `${args.kind}s/${new Date().getUTCFullYear()}/${randomUUID()}.${validated.extension}`;
    const { error: moveError } = await container.move(args.path, finalPath);
    if (moveError) throw new Error("Unable to finalize upload");
    return {
      path: finalPath,
      mimeType: validated.mimeType,
      size: validated.size,
    };
  } catch (validationError) {
    await container.remove([args.path]).catch(() => undefined);
    throw validationError;
  }
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
): Promise<{ path: string }> {
  const validated = await validateUpload(file, kind);
  const bucket =
    kind === "image"
      ? (process.env.SUPABASE_PUBLIC_BUCKET ?? "solidra-public")
      : (process.env.SUPABASE_DOCUMENT_BUCKET ?? "solidra-documents");
  const path = `${kind}s/${new Date().getUTCFullYear()}/${randomUUID()}.${validated.extension}`;
  const { error } = await storage()
    .from(bucket)
    .upload(path, file, { contentType: validated.mimeType, upsert: false });
  if (error) throw new Error("Asset upload failed");
  return { path };
}

export async function createPublicAssetDownloadUrl(
  path: string,
  kind: "image" | "document",
): Promise<string> {
  const bucket =
    kind === "image"
      ? (process.env.SUPABASE_PUBLIC_BUCKET ?? "solidra-public")
      : (process.env.SUPABASE_DOCUMENT_BUCKET ?? "solidra-documents");
  const { data, error } = await storage()
    .from(bucket)
    .createSignedUrl(path, 600);
  if (error) throw new Error("Unable to authorize asset download");
  return data.signedUrl;
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
