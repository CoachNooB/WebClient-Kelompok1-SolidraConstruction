import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { deleteUnusedMedia } from "@/lib/repositories/media";
import { updateMediaAltText } from "@/lib/repositories/media-editor";
import { mediaAltTextSchema } from "@/lib/validation/media";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "content:write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "content:write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
