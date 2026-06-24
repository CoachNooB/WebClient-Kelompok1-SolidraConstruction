import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { updateFooterGroup } from "@/lib/repositories/footer-editor";
import { assertSameOrigin } from "@/lib/security/csrf";
import { footerEditorSchema } from "@/lib/validation/footer";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("settings:manage");
  if (isAuthResponse(session)) return session;
  const parsed = footerEditorSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Invalid footer group",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  await updateFooterGroup((await params).id, session.user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
