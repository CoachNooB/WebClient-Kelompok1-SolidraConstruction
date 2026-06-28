import { describe, expect, it } from "vitest";
import {
  uploadRules,
  validateUploadDeclaration,
} from "@/lib/storage/validation";

describe("direct upload declarations", () => {
  it("accepts a supported CV at the configured limit", () => {
    expect(
      validateUploadDeclaration({
        kind: "cv",
        mimeType: "application/pdf",
        size: uploadRules.cv.max,
      }),
    ).toEqual({
      extension: "pdf",
      mimeType: "application/pdf",
      size: uploadRules.cv.max,
    });
  });

  it("rejects oversized direct uploads before issuing a token", () => {
    expect(() =>
      validateUploadDeclaration({
        kind: "document",
        mimeType: "application/pdf",
        size: uploadRules.document.max + 1,
      }),
    ).toThrow("Invalid file size");
  });

  it("rejects MIME types outside the upload kind allowlist", () => {
    expect(() =>
      validateUploadDeclaration({
        kind: "image",
        mimeType: "image/svg+xml",
        size: 100,
      }),
    ).toThrow("Unsupported MIME type");
  });
});
