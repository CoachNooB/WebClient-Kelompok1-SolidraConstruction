import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { updateNavigationItem } from "@/lib/repositories/navigation-editor";
import { assertSameOrigin } from "@/lib/security/csrf";
import { navigationEditorSchema } from "@/lib/validation/navigation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("settings:manage");
  if (isAuthResponse(session)) return session;
  const parsed = navigationEditorSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Invalid navigation item",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  await updateNavigationItem((await params).id, session.user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
