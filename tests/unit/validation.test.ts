import { describe, expect, it } from "vitest";
import { applicationSchema, contactSchema } from "@/lib/validation/submissions";

describe("contactSchema", () => {
  const validContact = () => ({
    locale: "id",
    idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
    name: "Arico",
    email: "a@example.com",
    subject: "Project inquiry",
    message: "Please contact me about our new project.",
    consent: true,
    website: "",
  });

  it("accepts a valid contact message", () => {
    expect(contactSchema.safeParse(validContact()).success).toBe(true);
  });

  it("accepts and sanitizes optional contact phone numbers", () => {
    const parsed = contactSchema.safeParse({
      ...validContact(),
      phone: "  +62215550142  ",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.phone).toBe("+62215550142");
  });

  it("rejects unsupported contact phone characters", () => {
    expect(
      contactSchema.safeParse({
        ...validContact(),
        phone: "+62 21-5550142",
      }).success,
    ).toBe(false);
  });

  it("rejects bots and missing consent", () => {
    expect(
      contactSchema.safeParse({
        name: "Bot",
        email: "bot@example.com",
        subject: "Spam",
        message: "This is a spam message",
        consent: false,
        website: "filled",
      }).success,
    ).toBe(false);
  });
});

describe("applicationSchema", () => {
  const validApplication = () => ({
    locale: "en",
    idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
    name: "Applicant",
    email: "applicant@example.com",
    phone: "+6281234567890",
    coverLetter:
      "I have relevant construction experience and would like to apply.",
    consent: true,
    cv: new File(["%PDF"], "cv.pdf", { type: "application/pdf" }),
  });

  it("accepts and sanitizes application phone numbers", () => {
    const parsed = applicationSchema.safeParse({
      ...validApplication(),
      phone: "  +6281234567890  ",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.phone).toBe("+6281234567890");
  });

  it("rejects unsupported phone characters", () => {
    expect(
      applicationSchema.safeParse({
        ...validApplication(),
        phone: "+62 812-3456",
      }).success,
    ).toBe(false);
  });

  it("rejects oversized CV files", () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "cv.pdf", {
      type: "application/pdf",
    });
    expect(
      applicationSchema.safeParse({
        ...validApplication(),
        cv: file,
      }).success,
    ).toBe(false);
  });
});
