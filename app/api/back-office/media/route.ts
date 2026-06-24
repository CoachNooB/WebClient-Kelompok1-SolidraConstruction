import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/csrf";
import {
  assertContentLength,
  uploadRequestLimits,
} from "@/lib/security/request-size";
import { removePublicAsset, uploadPublicAsset } from "@/lib/storage/supabase";
export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const tooLarge = assertContentLength(request, uploadRequestLimits.image);
  if (tooLarge) return tooLarge;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "File required" }, { status: 422 });
  let uploaded: { path: string } | undefined;
  try {
    uploaded = await uploadPublicAsset(file, "image");
    const media = await prisma.mediaAsset.create({
      data: {
        storagePath: uploaded.path,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        altId: String(form.get("altId") ?? ""),
        altEn: String(form.get("altEn") ?? ""),
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
