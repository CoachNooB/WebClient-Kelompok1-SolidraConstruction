import "server-only";
import { createHash } from "node:crypto";
import { claimOnce } from "@/lib/redis";
import { validateDirectUpload } from "@/lib/storage/supabase";
import {
  verifyUploadTicket,
  type UploadPurpose,
} from "@/lib/storage/upload-ticket";

export async function completeDirectUpload(args: {
  ticket: string;
  path: string;
  fileName: string;
  purpose: UploadPurpose;
  subject: string;
}) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("Upload signing is not configured");
  const payload = verifyUploadTicket(
    args.ticket,
    { purpose: args.purpose, subject: args.subject },
    secret,
  );
  if (payload.path !== args.path)
    throw new Error("Upload ticket does not match request");
  const digest = createHash("sha256").update(args.ticket).digest("hex");
  if (!(await claimOnce("upload-ticket", digest, 15 * 60)))
    throw new Error("Upload ticket already used");
  return validateDirectUpload({
    bucket: payload.bucket,
    path: payload.path,
    kind: payload.kind,
    fileName: args.fileName,
    expectedMimeType: payload.mimeType,
    expectedSize: payload.size,
  });
}
