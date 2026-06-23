import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { updateNavigationItem } from "@/lib/repositories/navigation-editor";
import { navigationEditorSchema } from "@/lib/validation/navigation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "settings:manage"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
