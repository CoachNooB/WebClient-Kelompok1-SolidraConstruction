import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { replaceInvestorDocumentFile } from "@/lib/repositories/investor-document-editor";
import { investorDocumentReplaceSchema } from "@/lib/validation/investor-document";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !can(session.user.role as StaffRole, "content:write"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData();
  const parsed = investorDocumentReplaceSchema.safeParse({
    file: form.get("file"),
  });
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Invalid document file",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  const result = await replaceInvestorDocumentFile({
    id: (await params).id,
    actorId: session.user.id,
    file: parsed.data.file,
  });
  return NextResponse.json(result);
}
