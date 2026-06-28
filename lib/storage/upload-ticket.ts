import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { UploadKind } from "@/lib/storage/validation";

export type UploadPurpose =
  | "career-application"
  | "media-create"
  | "investor-document-create"
  | "investor-document-replace"
  | "section-card-create"
  | "section-card-update";

export type UploadTicketPayload = {
  bucket: string;
  path: string;
  kind: UploadKind;
  mimeType: string;
  size: number;
  purpose: UploadPurpose;
  subject: string;
  expiresAt: number;
};

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createUploadTicket(
  payload: UploadTicketPayload,
  secret: string,
): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded, secret)}`;
}

export function parseUploadTicket(
  ticket: string,
  secret: string,
): UploadTicketPayload {
  const [encoded, supplied, extra] = ticket.split(".");
  if (!encoded || !supplied || extra) throw new Error("Invalid upload ticket");
  const expected = signature(encoded, secret);
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  if (
    suppliedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(suppliedBytes, expectedBytes)
  )
    throw new Error("Invalid upload ticket");

  let payload: UploadTicketPayload;
  try {
    payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as UploadTicketPayload;
  } catch {
    throw new Error("Invalid upload ticket");
  }
  if (payload.expiresAt <= Date.now()) throw new Error("Upload ticket expired");
  return payload;
}

export function verifyUploadTicket(
  ticket: string,
  expected: Pick<UploadTicketPayload, "purpose" | "subject">,
  secret: string,
): UploadTicketPayload {
  const payload = parseUploadTicket(ticket, secret);
  if (
    payload.purpose !== expected.purpose ||
    payload.subject !== expected.subject
  )
    throw new Error("Upload ticket does not match request");
  return payload;
}
