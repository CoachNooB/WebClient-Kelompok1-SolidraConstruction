import { describe, expect, it, vi } from "vitest";

const createSignedUrl = vi.fn(
  async (...args: [string, string, number]) => {
    void args;
    return {
      data: {
        signedUrl:
          "https://example.supabase.co/storage/v1/object/sign/solidra-documents/documents/2026/report.pdf?token=signed",
      },
      error: null,
    };
  },
);
const createSignedUploadUrl = vi.fn(async (...args: [string, string]) => {
  void args;
  return {
    data: {
      path: "pending/image/asset.png",
      token: "upload-token",
      signedUrl: "https://example.supabase.co/storage/v1/upload/sign/asset",
    },
    error: null,
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    storage: {
      from: (bucket: string) => ({
        createSignedUrl: (path: string, expiresIn: number) =>
          createSignedUrl(bucket, path, expiresIn),
        createSignedUploadUrl: (path: string) =>
          createSignedUploadUrl(bucket, path),
      }),
    },
  }),
}));

describe("private storage URLs", () => {
  it("creates signed URLs instead of public object URLs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
    vi.stubEnv("SUPABASE_DOCUMENT_BUCKET", "solidra-documents");
    const { createPublicAssetDownloadUrl } = await import(
      "@/lib/storage/supabase"
    );

    const url = await createPublicAssetDownloadUrl(
      "documents/2026/report.pdf",
      "document",
    );

    expect(url).toContain("/storage/v1/object/sign/solidra-documents/");
    expect(url).not.toContain("/storage/v1/object/public/");
    expect(createSignedUrl).toHaveBeenCalledWith(
      "solidra-documents",
      "documents/2026/report.pdf",
      600,
    );
  });

  it("creates a signed token for a private direct upload", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role");
    vi.stubEnv("SUPABASE_PUBLIC_BUCKET", "solidra-public");
    const { createDirectUpload } = await import("@/lib/storage/supabase");

    const result = await createDirectUpload("image", "png");

    expect(result.bucket).toBe("solidra-public");
    expect(result.path).toMatch(/^pending\/image\/.+\.png$/);
    expect(result.token).toBe("upload-token");
    expect(createSignedUploadUrl).toHaveBeenCalledWith(
      "solidra-public",
      result.path,
    );
  });
});
