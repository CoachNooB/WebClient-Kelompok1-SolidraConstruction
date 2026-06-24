import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const authBaseUrl = env.integrationsEnabled
  ? env.BETTER_AUTH_URL
  : process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

const authSecret = env.integrationsEnabled
  ? env.BETTER_AUTH_SECRET
  : process.env.BETTER_AUTH_SECRET ?? "development-only-secret-change-me-now";

export const auth = betterAuth({
  baseURL: authBaseUrl,
  secret: authSecret,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30 },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "EDITOR",
        input: false,
      },
      active: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { active: true },
          });
          if (!user?.active) return false;
          return { data: session };
        },
        after: async (session) => {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: session.userId },
              data: { lastLoginAt: new Date() },
            }),
            prisma.auditLog.create({
              data: {
                actorId: session.userId,
                action: "AUTH_LOGIN",
                entity: "User",
                entityId: session.userId,
              },
            }),
          ]);
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
