import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { deleteUnusedMedia } from "@/lib/repositories/media";
import { updateMediaAltText } from "@/lib/repositories/media-editor";
import { assertSameOrigin } from "@/lib/security/csrf";
import { mediaAltTextSchema } from "@/lib/validation/media";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const parsed = mediaAltTextSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid alt text", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  await updateMediaAltText((await params).id, session.user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  try {
    await deleteUnusedMedia((await params).id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete" },
      { status: 409 },
    );
  }
}
