import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { updateFooterGroup } from "@/lib/repositories/footer-editor";
import { footerEditorSchema } from "@/lib/validation/footer";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "settings:manage"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
