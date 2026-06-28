import "server-only";
import { createClient } from "@supabase/supabase-js";

const HOUR_MS = 60 * 60 * 1000;

export function isStaleUpload(
  object: { created_at?: string | null },
  now = new Date(),
) {
  if (!object.created_at) return false;
  const created = new Date(object.created_at).getTime();
  return Number.isFinite(created) && now.getTime() - created > HOUR_MS;
}

export async function cleanupPendingUploads(now = new Date()) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Storage is not configured");
  const storage = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage;
  const targets = [
    [process.env.SUPABASE_CV_BUCKET ?? "solidra-cvs", "cv"],
    [process.env.SUPABASE_PUBLIC_BUCKET ?? "solidra-public", "image"],
    [
      process.env.SUPABASE_DOCUMENT_BUCKET ?? "solidra-documents",
      "document",
    ],
  ] as const;
  let removed = 0;
  for (const [bucket, kind] of targets) {
    const prefix = `pending/${kind}`;
    const { data, error } = await storage
      .from(bucket)
      .list(prefix, { limit: 1000 });
    if (error) throw new Error(`Unable to list pending ${kind} uploads`);
    const paths = (data ?? [])
      .filter((object) => isStaleUpload(object, now))
      .map((object) => `${prefix}/${object.name}`);
    if (paths.length) {
      const { error: removeError } = await storage.from(bucket).remove(paths);
      if (removeError) throw new Error(`Unable to clean pending ${kind} uploads`);
      removed += paths.length;
    }
  }
  return { removed };
}
