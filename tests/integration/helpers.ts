import { describe } from "vitest";
import { prisma } from "@/lib/db";

export const describeIntegration =
  process.env.RUN_INTEGRATION === "1" && process.env.DATABASE_URL
    ? describe
    : describe.skip;
export { prisma };
