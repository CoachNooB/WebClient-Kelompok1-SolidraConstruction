import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString =
  env.integrationsEnabled
    ? env.DATABASE_URL
    : process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/solidra";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
