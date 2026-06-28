import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { getEligibleVacancy } from "@/lib/repositories/submissions";
import { assertSameOrigin } from "@/lib/security/csrf";
import { createDirectUpload } from "@/lib/storage/supabase";
import {
  createUploadTicket,
  type UploadPurpose,
} from "@/lib/storage/upload-ticket";
import { validateUploadDeclaration } from "@/lib/storage/validation";

const requestSchema = z.object({
  purpose: z.enum([
    "career-application",
    "media-create",
    "investor-document-create",
    "investor-document-replace",
    "section-card-create",
    "section-card-update",
  ]),
  subject: z.string().min(1).max(200).optional(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(150),
  size: z.number().int().positive(),
});

const kinds: Record<UploadPurpose, "cv" | "image" | "document"> = {
  "career-application": "cv",
  "media-create": "image",
  "investor-document-create": "document",
  "investor-document-replace": "document",
  "section-card-create": "image",
  "section-card-update": "image",
};

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid upload request" }, { status: 422 });

  const { purpose } = parsed.data;
  let subject: string;
  if (purpose === "career-application") {
    subject = parsed.data.subject ?? "";
    if (!subject || !(await getEligibleVacancy(subject)))
      return NextResponse.json({ error: "Vacancy unavailable" }, { status: 404 });
  } else {
    const session = await requireBackOfficePermission("content:write");
    if (isAuthResponse(session)) return session;
    subject =
      purpose.endsWith("-create")
        ? session.user.id
        : (parsed.data.subject ?? "");
    if (!subject)
      return NextResponse.json({ error: "Upload subject required" }, { status: 422 });
  }

  try {
    const kind = kinds[purpose];
    const declaration = validateUploadDeclaration({
      kind,
      mimeType: parsed.data.mimeType,
      size: parsed.data.size,
    });
    const upload = await createDirectUpload(kind, declaration.extension);
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) throw new Error("Upload signing is not configured");
    const ticket = createUploadTicket(
      {
        ...upload,
        kind,
        mimeType: declaration.mimeType,
        size: declaration.size,
        purpose,
        subject,
        expiresAt,
      },
      secret,
    );
    return NextResponse.json({
      ...upload,
      ticket,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to prepare upload" },
      { status: 422 },
    );
  }
}
