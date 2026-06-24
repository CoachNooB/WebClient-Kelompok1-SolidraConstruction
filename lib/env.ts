import { z } from "zod";

const httpsUrl = z.url().refine((value) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}, "Use an HTTPS URL");

const productionEnvironment = z.object({
  NODE_ENV: z.literal("production"),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: httpsUrl,
  NEXT_PUBLIC_SITE_URL: httpsUrl,
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

export type Environment = Record<string, string | undefined>;

export function parseEnvironment(environment: Environment) {
  if (environment.NODE_ENV !== "production") {
    return { integrationsEnabled: false as const };
  }

  return {
    ...productionEnvironment.parse(environment),
    integrationsEnabled: true as const,
  };
}

export const env = parseEnvironment(process.env);
