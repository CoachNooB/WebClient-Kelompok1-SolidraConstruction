import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { publicPagePaths } from "@/lib/cache/revalidation";
import { getPageEditor } from "@/lib/repositories/page-editor";
import { publishRevision } from "@/lib/repositories/publication";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "content:publish"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const page = await getPageEditor((await params).id);
  const revision = page?.revisions[0];
  if (!revision || revision.immutable)
    return NextResponse.json({ error: "No draft revision" }, { status: 409 });
  try {
    const result = await publishRevision(revision.id, session.user.id);
    for (const path of publicPagePaths(page.key)) revalidatePath(path);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to publish" },
      { status: 422 },
    );
  }
}
