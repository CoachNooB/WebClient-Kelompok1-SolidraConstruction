import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { pageDraftSchema } from "@/lib/validation/page-editor";
import { savePageDraft } from "@/lib/repositories/page-editor";
import { assertSameOrigin } from "@/lib/security/csrf";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const parsed = pageDraftSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid page draft", fields: parsed.error.flatten() },
      { status: 422 },
    );
  try {
    return NextResponse.json(
      await savePageDraft((await params).id, session.user.id, parsed.data),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save draft",
      },
      { status: 409 },
    );
  }
}
