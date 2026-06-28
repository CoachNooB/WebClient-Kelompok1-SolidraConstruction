import { describe, expect, it } from "vitest";
import {
  createUploadTicket,
  parseUploadTicket,
  verifyUploadTicket,
} from "@/lib/storage/upload-ticket";

describe("upload tickets", () => {
  it("round-trips bound upload details", () => {
    const secret = "a-secure-secret-with-at-least-32-characters";
    const ticket = createUploadTicket(
      {
        bucket: "solidra-cvs",
        path: "pending/cv/one.pdf",
        kind: "cv",
        mimeType: "application/pdf",
        size: 42,
        purpose: "career-application",
        subject: "vacancy-1",
        expiresAt: Date.now() + 60_000,
      },
      secret,
    );

    expect(parseUploadTicket(ticket, secret)).toMatchObject({
      path: "pending/cv/one.pdf",
      purpose: "career-application",
      subject: "vacancy-1",
    });
  });

  it("rejects tampered tickets", () => {
    const secret = "a-secure-secret-with-at-least-32-characters";
    const ticket = createUploadTicket(
      {
        bucket: "solidra-cvs",
        path: "pending/cv/one.pdf",
        kind: "cv",
        mimeType: "application/pdf",
        size: 42,
        purpose: "career-application",
        subject: "vacancy-1",
        expiresAt: Date.now() + 60_000,
      },
      secret,
    );

    expect(() => parseUploadTicket(`${ticket}x`, secret)).toThrow(
      "Invalid upload ticket",
    );
  });

  it("rejects expired tickets", () => {
    const secret = "a-secure-secret-with-at-least-32-characters";
    const ticket = createUploadTicket(
      {
        bucket: "solidra-cvs",
        path: "pending/cv/one.pdf",
        kind: "cv",
        mimeType: "application/pdf",
        size: 42,
        purpose: "career-application",
        subject: "vacancy-1",
        expiresAt: Date.now() - 1,
      },
      secret,
    );

    expect(() => parseUploadTicket(ticket, secret)).toThrow(
      "Upload ticket expired",
    );
  });

  it("rejects a ticket used for another resource", () => {
    const secret = "a-secure-secret-with-at-least-32-characters";
    const ticket = createUploadTicket(
      {
        bucket: "solidra-documents",
        path: "pending/document/one.pdf",
        kind: "document",
        mimeType: "application/pdf",
        size: 42,
        purpose: "investor-document-replace",
        subject: "document-1",
        expiresAt: Date.now() + 60_000,
      },
      secret,
    );

    expect(() =>
      verifyUploadTicket(
        ticket,
        {
          purpose: "investor-document-replace",
          subject: "document-2",
        },
        secret,
      ),
    ).toThrow("Upload ticket does not match request");
  });
});
