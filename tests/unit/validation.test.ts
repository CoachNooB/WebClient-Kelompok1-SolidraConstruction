import { describe, expect, it } from "vitest";
import { applicationSchema, contactSchema } from "@/lib/validation/submissions";

describe("contactSchema", () => {
  it("accepts a valid contact message", () => {
    expect(
      contactSchema.safeParse({
        locale: "id",
        idempotencyKey: "123e4567-e89b-42d3-a456-426614174000",
        name: "Arico",
        email: "a@example.com",
        subject: "Project inquiry",
        message: "Please contact me about our new project.",
        consent: true,
        website: "",
      }).success,
    ).toBe(true);
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
  it("rejects oversized CV files", () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "cv.pdf", {
      type: "application/pdf",
    });
    expect(
      applicationSchema.safeParse({
        name: "Applicant",
        email: "applicant@example.com",
        phone: "+628123456789",
        coverLetter:
          "I have relevant construction experience and would like to apply.",
        consent: true,
        cv: file,
      }).success,
    ).toBe(false);
  });
});
