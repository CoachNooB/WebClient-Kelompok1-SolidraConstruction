import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { publicInvestorPaths } from "@/lib/cache/revalidation";
import { replaceInvestorDocumentFile } from "@/lib/repositories/investor-document-editor";
import { assertSameOrigin } from "@/lib/security/csrf";
import {
  assertContentLength,
  uploadRequestLimits,
} from "@/lib/security/request-size";
import { investorDocumentReplaceSchema } from "@/lib/validation/investor-document";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const tooLarge = assertContentLength(request, uploadRequestLimits.document);
  if (tooLarge) return tooLarge;
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
  for (const path of publicInvestorPaths()) revalidatePath(path);
  return NextResponse.json(result);
}
