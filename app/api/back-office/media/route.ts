import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
import { removePublicAsset } from "@/lib/storage/supabase";
import { completeDirectUpload } from "@/lib/storage/complete-upload";
import { z } from "zod";

const schema = z.object({
  altId: z.string().trim().min(1).max(500),
  altEn: z.string().trim().min(1).max(500),
  upload: z.object({
    ticket: z.string().min(1),
    path: z.string().min(1),
    fileName: z.string().min(1).max(255),
  }),
});
export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid media" }, { status: 422 });
  let uploaded:
    | { path: string; mimeType: string; size: number }
    | undefined;
  try {
    uploaded = await completeDirectUpload({
      ...parsed.data.upload,
      purpose: "media-create",
      subject: session.user.id,
    });
    const media = await prisma.mediaAsset.create({
      data: {
        storagePath: uploaded.path,
        fileName: parsed.data.upload.fileName,
        mimeType: uploaded.mimeType,
        size: uploaded.size,
        altId: parsed.data.altId,
        altEn: parsed.data.altEn,
        ownerId: session.user.id,
      },
      select: { id: true },
    });
    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    if (uploaded)
      await removePublicAsset(uploaded.path, "image").catch(() => undefined);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
