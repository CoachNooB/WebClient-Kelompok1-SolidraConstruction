const MB = 1024 * 1024;
export type UploadKind = "image" | "document" | "cv";

export const uploadRules = {
  image: { max: 8 * MB, types: ["image/jpeg", "image/png", "image/webp"] },
  document: { max: 15 * MB, types: ["application/pdf"] },
  cv: {
    max: 5 * MB,
    types: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
} satisfies Record<UploadKind, { max: number; types: string[] }>;

const signatures = new Map<string, number[][]>([
  ["application/pdf", [[0x25, 0x50, 0x44, 0x46]]],
  ["image/jpeg", [[0xff, 0xd8, 0xff]]],
  ["image/png", [[0x89, 0x50, 0x4e, 0x47]]],
  ["image/webp", [[0x52, 0x49, 0x46, 0x46]]],
  ["application/msword", [[0xd0, 0xcf, 0x11, 0xe0]]],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    [[0x50, 0x4b, 0x03, 0x04]],
  ],
]);

const extensions: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export async function validateUpload(
  file: File,
  kind: UploadKind,
): Promise<{ extension: string; mimeType: string; size: number }> {
  const declared = validateUploadDeclaration({
    kind,
    mimeType: file.type,
    size: file.size,
  });
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const valid = signatures
    .get(file.type)
    ?.some((signature) =>
      signature.every((byte, index) => bytes[index] === byte),
    );
  if (!valid) throw new Error("Invalid file signature");
  return {
    ...declared,
  };
}

export function validateUploadDeclaration({
  kind,
  mimeType,
  size,
}: {
  kind: UploadKind;
  mimeType: string;
  size: number;
}): { extension: string; mimeType: string; size: number } {
  const rule = uploadRules[kind];
  if (!Number.isSafeInteger(size) || size <= 0 || size > rule.max)
    throw new Error("Invalid file size");
  if (!rule.types.includes(mimeType))
    throw new Error("Unsupported MIME type");
  return { extension: extensions[mimeType], mimeType, size };
}
