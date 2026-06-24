import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation/submissions";
import {
  createCareerApplication,
  getEligibleVacancy,
} from "@/lib/repositories/submissions";
import { claimOnce, enforceRateLimit, releaseClaim } from "@/lib/redis";
import { getClientIp } from "@/lib/security/client-ip";
import {
  assertContentLength,
  uploadRequestLimits,
} from "@/lib/security/request-size";
import { removeCv, uploadCv } from "@/lib/storage/supabase";

function fingerprint(vacancyId: string, email: string) {
  return createHash("sha256")
    .update(`${vacancyId}:${email.trim().toLowerCase()}`)
    .digest("hex");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vacancyId: string }> },
) {
  const { vacancyId } = await params;
  const tooLarge = assertContentLength(request, uploadRequestLimits.cv);
  if (tooLarge) return tooLarge;
  const form = await request.formData();
  const parsed = applicationSchema.safeParse({
    locale: form.get("locale"),
    idempotencyKey: form.get("idempotencyKey"),
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    coverLetter: form.get("coverLetter"),
    consent: form.get("consent") === "true",
    cv: form.get("cv"),
  });
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Invalid application",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  if (!(await getEligibleVacancy(vacancyId)))
    return NextResponse.json({ error: "Vacancy unavailable" }, { status: 404 });
  const duplicateKey = fingerprint(vacancyId, parsed.data.email);
  let cvPath: string | undefined;
  try {
    await enforceRateLimit("application", getClientIp(request));
    if (
      !(await claimOnce(
        "application-idempotency",
        parsed.data.idempotencyKey,
        24 * 60 * 60,
      ))
    )
      return NextResponse.json({ ok: true }, { status: 200 });
    if (
      !(await claimOnce(
        "application-duplicate",
        duplicateKey,
        30 * 24 * 60 * 60,
      ))
    )
      return NextResponse.json(
        { error: "Application already submitted" },
        { status: 409 },
      );
    cvPath = await uploadCv(parsed.data.cv);
    await createCareerApplication({
      vacancyId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      coverLetter: parsed.data.coverLetter,
      cvStoragePath: cvPath,
      idempotencyKey: parsed.data.idempotencyKey,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (cvPath) await removeCv(cvPath).catch(() => undefined);
    await Promise.all([
      releaseClaim("application-idempotency", parsed.data.idempotencyKey),
      releaseClaim("application-duplicate", duplicateKey),
    ]);
    const message = error instanceof Error ? error.message : "";
    if (message === "RATE_LIMITED")
      return NextResponse.json(
        { error: "Too many submissions" },
        { status: 429 },
      );
    if (message === "RATE_LIMIT_UNAVAILABLE")
      return NextResponse.json(
        { error: "Submission protection unavailable" },
        { status: 503 },
      );
    return NextResponse.json(
      { error: "Application could not be submitted" },
      { status: 500 },
    );
  }
}
