import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/submissions";
import { createContactMessage } from "@/lib/repositories/submissions";
import { claimOnce, enforceRateLimit, releaseClaim } from "@/lib/redis";
import { getClientIp } from "@/lib/security/client-ip";

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = contactSchema.safeParse({
    locale: form.get("locale"),
    idempotencyKey: form.get("idempotencyKey"),
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone") ?? "",
    company: form.get("company") ?? "",
    subject: form.get("subject"),
    message: form.get("message"),
    consent: form.get("consent") === "true",
    website: form.get("website") ?? "",
  });
  if (!parsed.success)
    return NextResponse.json(
      {
        error:
          form.get("locale") === "id"
            ? "Data tidak valid"
            : "Invalid submission",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  try {
    await enforceRateLimit("contact", getClientIp(request));
    if (!(await claimOnce("contact", parsed.data.idempotencyKey, 24 * 60 * 60)))
      return NextResponse.json({ ok: true }, { status: 200 });
    await createContactMessage({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      idempotencyKey: parsed.data.idempotencyKey,
      locale: parsed.data.locale.toUpperCase() as "ID" | "EN",
      phone: parsed.data.phone || undefined,
      company: parsed.data.company || undefined,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    await releaseClaim("contact", parsed.data.idempotencyKey);
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
      { error: "Unable to save submission" },
      { status: 500 },
    );
  }
}
