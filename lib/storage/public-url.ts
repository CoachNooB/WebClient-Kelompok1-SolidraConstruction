export function publicAssetUrl(path: string, kind: "image" | "document") {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;
  const bucket =
    kind === "image"
      ? (process.env.SUPABASE_PUBLIC_BUCKET ?? "solidra-public")
      : (process.env.SUPABASE_DOCUMENT_BUCKET ?? "solidra-documents");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
