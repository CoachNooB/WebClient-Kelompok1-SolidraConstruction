import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthResponse, requireBackOfficePermission } from "@/lib/auth/api";
import { publicInvestorPaths } from "@/lib/cache/revalidation";
import { replaceInvestorDocumentFile } from "@/lib/repositories/investor-document-editor";
import { assertSameOrigin } from "@/lib/security/csrf";
import { completeDirectUpload } from "@/lib/storage/complete-upload";
import { z } from "zod";

const schema = z.object({
  upload: z.object({
    ticket: z.string().min(1),
    path: z.string().min(1),
    fileName: z.string().min(1).max(255),
  }),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;
  const session = await requireBackOfficePermission("content:write");
  if (isAuthResponse(session)) return session;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Invalid document file",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  const id = (await params).id;
  const uploaded = await completeDirectUpload({
    ...parsed.data.upload,
    purpose: "investor-document-replace",
    subject: id,
  });
  const result = await replaceInvestorDocumentFile({
    id,
    actorId: session.user.id,
    ...uploaded,
  });
  for (const path of publicInvestorPaths()) revalidatePath(path);
  return NextResponse.json(result);
}
