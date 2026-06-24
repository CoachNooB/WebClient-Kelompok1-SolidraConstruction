import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { publicPagePaths } from "@/lib/cache/revalidation";
import { getPageEditor } from "@/lib/repositories/page-editor";
import { publishRevision } from "@/lib/repositories/publication";
import { assertSameOrigin } from "@/lib/security/csrf";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:publish");
  if (isAuthResponse(session)) return session;
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
